// productService.js - regras de negocio dos produtos.
// E o service mais completo: um produto tem imagens, opcoes e categorias.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { sequelize, Product, ProductImage, ProductOption, Category } = require('../models');

const PASTA_UPLOADS = path.join(__dirname, '..', '..', 'uploads');

// Tipos de imagem aceitos e suas extensoes. Qualquer outro "type"
// e recusado: nada de salvar script, HTML ou executavel na pasta publica.
const TIPOS_DE_IMAGEM = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

// Primeiros bytes ("assinatura") de cada formato de imagem aceito.
// Conferimos o CONTEUDO do arquivo, nao so o tipo declarado pelo cliente.
const ASSINATURAS = {
  'image/png': [Buffer.from([0x89, 0x50, 0x4E, 0x47])],           // .PNG
  'image/jpeg': [Buffer.from([0xFF, 0xD8, 0xFF])],                 // JFIF
  'image/jpg': [Buffer.from([0xFF, 0xD8, 0xFF])],
  'image/gif': [Buffer.from('GIF8')],                              // GIF8
  'image/webp': [Buffer.from('RIFF')],                             // RIFF....WEBP
};

// Confere se o comeco do arquivo bate com a assinatura do tipo declarado.
function conteudoConfereComTipo(buffer, type) {
  const assinaturas = ASSINATURAS[type] || [];
  return assinaturas.some((assinatura) =>
    buffer.length >= assinatura.length && buffer.subarray(0, assinatura.length).equals(assinatura)
  );
}

// Erro especial para a API responder 400 quando a imagem e invalida.
class ImagemInvalida extends Error {}

// Salva uma imagem enviada em base64 e devolve o caminho publico dela.
// O nome do arquivo e gerado aqui (UUID) com extensao da lista de aceitos.
function salvarImagem(type, content) {
  const extensao = TIPOS_DE_IMAGEM[type];
  if (!extensao || !content) {
    throw new ImagemInvalida('Imagem sem tipo ou conteúdo.');
  }
  // Base64 malformado gera buffer vazio ou corrompido: recusamos.
  if (!/^[A-Za-z0-9+/\s]+={0,2}$/.test(content)) {
    throw new ImagemInvalida('Conteúdo da imagem não é um base64 válido.');
  }
  const buffer = Buffer.from(content, 'base64');
  if (buffer.length === 0 || !conteudoConfereComTipo(buffer, type)) {
    throw new ImagemInvalida('O conteúdo do arquivo não corresponde ao tipo ' + type + '.');
  }
  const nomeArquivo = crypto.randomUUID() + extensao;
  // Cria a pasta uploads/ se ela nao existir (ex.: logo apos o git clone).
  fs.mkdirSync(PASTA_UPLOADS, { recursive: true });
  fs.writeFileSync(path.join(PASTA_UPLOADS, nomeArquivo), buffer);
  return '/uploads/' + nomeArquivo;
}

// Monta o produto no formato de resposta do enunciado:
// category_ids como lista de IDs, images com "content" e options com "values" em lista.
function formatarProduto(product) {
  return {
    id: product.id,
    enabled: product.enabled,
    name: product.name,
    slug: product.slug,
    use_in_menu: product.use_in_menu,
    stock: product.stock,
    description: product.description,
    price: product.price,
    price_with_discount: product.price_with_discount,
    category_ids: (product.categories || []).map((c) => c.id),
    images: (product.images || []).map((img) => ({ id: img.id, content: img.path })),
    options: (product.options || []).map((opt) => ({
      id: opt.id,
      title: opt.title,
      shape: opt.shape,
      radius: opt.radius,
      type: opt.type,
      values: opt.values ? opt.values.split(',') : [],
    })),
  };
}

const INCLUDES_COMPLETOS = [
  { association: 'images' },
  { association: 'options' },
  { association: 'categories', through: { attributes: [] } },
];

// Le os filtros option[45]=GG,PP da query string.
// O Express pode entregar como objeto { option: { 45: 'GG,PP' } }
// ou como chave literal "option[45]", entao tratamos os dois jeitos.
function filtrosDeOpcao(query) {
  const filtros = [];
  if (query.option && typeof query.option === 'object') {
    for (const [id, valores] of Object.entries(query.option)) {
      filtros.push({ id: Number(id), valores: String(valores).split(',') });
    }
  }
  for (const [chave, valor] of Object.entries(query)) {
    const m = chave.match(/^option\[(\d+)\]$/);
    if (m) {
      filtros.push({ id: Number(m[1]), valores: String(valor).split(',') });
    }
  }
  return filtros;
}

// GET /v1/product/search - lista com paginacao e varios filtros.
async function buscar(query) {
  const limit = query.limit === undefined ? 12 : Number(query.limit);
  const page = query.page === undefined ? 1 : Number(query.page);
  if (!Number.isInteger(limit) || !Number.isInteger(page) || limit < -1 || limit === 0 || page < 1) {
    return { erro: 'Parâmetros limit ou page inválidos.' };
  }

  const where = {};

  // match: busca o termo no nome OU na descricao do produto.
  if (query.match) {
    where[Op.or] = [
      { name: { [Op.like]: '%' + query.match + '%' } },
      { description: { [Op.like]: '%' + query.match + '%' } },
    ];
  }

  // price-range=100-200: produtos com preco dentro da janela.
  if (query['price-range']) {
    const partes = String(query['price-range']).split('-').map(Number);
    if (partes.length !== 2 || partes.some(Number.isNaN)) {
      return { erro: 'Parâmetro price-range inválido. Use o formato 100-200.' };
    }
    where.price = { [Op.between]: partes };
  }

  // category_ids=15,24: so produtos que estao nessas categorias.
  if (query.category_ids) {
    const ids = String(query.category_ids).split(',').map(Number);
    if (ids.some((n) => !Number.isInteger(n))) {
      return { erro: 'Parâmetro category_ids inválido.' };
    }
    where.id = {
      [Op.in]: sequelize.literal(
        '(SELECT product_id FROM product_categories WHERE category_id IN (' + ids.map(Number).join(',') + '))'
      ),
    };
  }

  // option[45]=GG,PP: so produtos que tem a opcao 45 com um desses valores.
  for (const filtro of filtrosDeOpcao(query)) {
    if (!Number.isInteger(filtro.id)) {
      return { erro: 'Parâmetro option inválido.' };
    }
    // "values" e palavra reservada do SQL, entao vai entre crases.
    // sequelize.escape() protege os valores contra injecao de SQL.
    const condicoes = filtro.valores
      .map((v) => 'FIND_IN_SET(' + sequelize.escape(String(v)) + ', `values`)')
      .join(' OR ');
    where.id = {
      [Op.in]: sequelize.literal(
        '(SELECT product_id FROM product_options WHERE id = ' + filtro.id + ' AND (' + condicoes + '))'
      ),
    };
  }

  // fields=name,images,price limita os campos da resposta.
  const camposSimples = ['enabled', 'name', 'slug', 'use_in_menu', 'stock', 'description', 'price', 'price_with_discount'];
  let attributes;
  let includes = INCLUDES_COMPLETOS;
  if (query.fields) {
    const pedidos = String(query.fields).split(',').map((c) => c.trim()).filter(Boolean);
    const simples = pedidos.filter((c) => camposSimples.includes(c));
    const querImagens = pedidos.includes('images');
    const querOpcoes = pedidos.includes('options');
    const querCategorias = pedidos.includes('category_ids');
    if (simples.length === 0 && !querImagens && !querOpcoes && !querCategorias) {
      return { erro: 'Parâmetro fields inválido.' };
    }
    attributes = ['id', ...simples];
    includes = [];
    if (querImagens) includes.push(INCLUDES_COMPLETOS[0]);
    if (querOpcoes) includes.push(INCLUDES_COMPLETOS[1]);
    if (querCategorias) includes.push(INCLUDES_COMPLETOS[2]);
  }

  const opcoes = { where, attributes, include: includes, distinct: true };
  if (limit !== -1) {
    opcoes.limit = limit;
    opcoes.offset = (page - 1) * limit;
  }

  const { rows, count } = await Product.findAndCountAll(opcoes);
  return {
    resultado: {
      data: rows.map(formatarProduto),
      total: count,
      limit,
      page,
    },
  };
}

async function buscarPorId(id) {
  const product = await Product.findByPk(id, { include: INCLUDES_COMPLETOS });
  return product ? formatarProduto(product) : null;
}

// Confere se todas as categorias informadas existem no banco.
async function categoriasExistem(ids) {
  const encontradas = await Category.count({ where: { id: ids } });
  return encontradas === ids.length;
}

// Grava as imagens que vieram no cadastro. Guarda os caminhos em
// arquivosGravados para apagar do disco se a transacao falhar.
async function gravarImagens(productId, images, transaction, arquivosGravados) {
  for (const img of images || []) {
    const caminho = salvarImagem(img.type, img.content);
    if (caminho) {
      if (arquivosGravados) arquivosGravados.push(caminho);
      await ProductImage.create({ product_id: productId, path: caminho, enabled: true }, { transaction });
    }
  }
}

async function gravarOpcoes(productId, options, transaction) {
  for (const opt of options || []) {
    // O enunciado usa "value" em um exemplo e "values" em outro; aceitamos os dois.
    const lista = opt.values || opt.value || [];
    await ProductOption.create({
      product_id: productId,
      title: opt.title,
      shape: opt.shape || 'square',
      radius: parseInt(opt.radius, 10) || 0, // "4px" vira 4
      type: opt.type || 'text',
      values: Array.isArray(lista) ? lista.join(',') : String(lista),
    }, { transaction });
  }
}

async function criar(dados) {
  const { name, slug, price, price_with_discount } = dados;
  // price_with_discount pode ser 0, entao testamos undefined/vazio, nao "falso".
  if (!name || !slug || price === undefined || price === '' || price_with_discount === undefined || price_with_discount === '') {
    return { erro: 'Os campos name, slug, price e price_with_discount são obrigatórios.' };
  }

  const categoryIds = dados.category_ids || [];
  if (categoryIds.length > 0 && !(await categoriasExistem(categoryIds))) {
    return { erro: 'Uma ou mais categorias informadas não existem.' };
  }

  // Imagens com tipo fora da lista de aceitos sao recusadas (400).
  for (const img of dados.images || []) {
    if (img.content && img.type && !TIPOS_DE_IMAGEM[img.type]) {
      return { erro: 'Tipo de imagem não aceito: ' + img.type + '. Use PNG, JPEG, WebP ou GIF.' };
    }
  }

  // Transacao: se qualquer passo falhar, o banco desfaz tudo
  // e os arquivos de imagem gravados sao apagados do disco.
  const arquivosGravados = [];
  const transaction = await sequelize.transaction();
  try {
    const product = await Product.create({
      enabled: dados.enabled === true,
      name,
      slug,
      use_in_menu: dados.use_in_menu === true,
      stock: dados.stock || 0,
      description: dados.description || null,
      price,
      price_with_discount,
    }, { transaction });

    if (categoryIds.length > 0) {
      await product.setCategories(categoryIds, { transaction });
    }
    await gravarImagens(product.id, dados.images, transaction, arquivosGravados);
    await gravarOpcoes(product.id, dados.options, transaction);

    await transaction.commit();
    return { product: await buscarPorId(product.id) };
  } catch (erro) {
    await transaction.rollback();
    for (const caminho of arquivosGravados) {
      apagarArquivo(caminho);
    }
    throw erro;
  }
}

async function atualizar(id, dados) {
  const product = await Product.findByPk(id);
  if (!product) {
    return { naoEncontrado: true };
  }
  const { name, slug, price, price_with_discount } = dados;
  if (!name || !slug || price === undefined || price === '' || price_with_discount === undefined || price_with_discount === '') {
    return { erro: 'Os campos name, slug, price e price_with_discount são obrigatórios.' };
  }

  if (dados.category_ids && !(await categoriasExistem(dados.category_ids))) {
    return { erro: 'Uma ou mais categorias informadas não existem.' };
  }

  for (const img of dados.images || []) {
    if (img.content && img.type && !TIPOS_DE_IMAGEM[img.type]) {
      return { erro: 'Tipo de imagem não aceito: ' + img.type + '. Use PNG, JPEG, WebP ou GIF.' };
    }
  }

  // Transacao tambem na atualizacao: se o banco falhar no meio, nada muda.
  // Arquivos novos sao apagados no rollback; arquivos antigos so sao
  // apagados DEPOIS do commit (assim nunca perdemos a imagem antiga
  // sem ter gravado a nova).
  const arquivosNovos = [];
  const arquivosAntigos = [];
  const transaction = await sequelize.transaction();
  try {
    await product.update({
      enabled: dados.enabled === true,
      name,
      slug,
      use_in_menu: dados.use_in_menu === true,
      stock: dados.stock || 0,
      description: dados.description || null,
      price,
      price_with_discount,
    }, { transaction });

    if (dados.category_ids) {
      await product.setCategories(dados.category_ids, { transaction });
    }

    // Imagens: cada item pode criar, trocar ou apagar.
    for (const img of dados.images || []) {
      if (img.id && img.deleted) {
        const antiga = await ProductImage.findByPk(img.id, { transaction });
        if (antiga) {
          arquivosAntigos.push(antiga.path); // apaga do disco so depois do commit
          await antiga.destroy({ transaction });
        }
      } else if (img.id && img.content) {
        const existente = await ProductImage.findByPk(img.id, { transaction });
        if (existente) {
          if (img.type) {
            // Veio base64: grava arquivo novo e marca o antigo para apagar.
            const caminho = salvarImagem(img.type, img.content);
            arquivosNovos.push(caminho);
            arquivosAntigos.push(existente.path);
            await existente.update({ path: caminho }, { transaction });
          } else {
            // Veio so um caminho/URL: atualiza o texto.
            await existente.update({ path: img.content }, { transaction });
          }
        }
      } else if (img.type && img.content) {
        const caminho = salvarImagem(img.type, img.content);
        arquivosNovos.push(caminho);
        await ProductImage.create({ product_id: product.id, path: caminho, enabled: true }, { transaction });
      }
    }

    // Opcoes: cada item pode criar, atualizar ou apagar.
    for (const opt of dados.options || []) {
      if (opt.id && opt.deleted) {
        await ProductOption.destroy({ where: { id: opt.id, product_id: product.id }, transaction });
      } else if (opt.id) {
        const existente = await ProductOption.findOne({ where: { id: opt.id, product_id: product.id }, transaction });
        if (existente) {
          const lista = opt.values || opt.value;
          await existente.update({
            title: opt.title || existente.title,
            shape: opt.shape || existente.shape,
            radius: opt.radius !== undefined ? (parseInt(opt.radius, 10) || 0) : existente.radius,
            type: opt.type || existente.type,
            values: lista ? (Array.isArray(lista) ? lista.join(',') : String(lista)) : existente.values,
          }, { transaction });
        }
      } else {
        await gravarOpcoes(product.id, [opt], transaction);
      }
    }

    await transaction.commit();
    // Commit feito: agora sim os arquivos antigos podem sair do disco.
    for (const caminho of arquivosAntigos) {
      apagarArquivo(caminho);
    }
    return { atualizado: true };
  } catch (erro) {
    await transaction.rollback();
    // Banco desfeito: remove os arquivos novos que ficaram orfaos.
    for (const caminho of arquivosNovos) {
      apagarArquivo(caminho);
    }
    throw erro;
  }
}

// Apaga o arquivo de imagem do disco, se ele existir.
function apagarArquivo(caminho) {
  if (caminho && caminho.startsWith('/uploads/')) {
    const arquivo = path.join(PASTA_UPLOADS, path.basename(caminho));
    if (fs.existsSync(arquivo)) {
      fs.unlinkSync(arquivo);
    }
  }
}

async function deletar(id) {
  const product = await Product.findByPk(id, { include: ['images'] });
  if (!product) {
    return { naoEncontrado: true };
  }
  // Primeiro o banco: as linhas de imagens, opcoes e ligacoes caem
  // sozinhas pelo ON DELETE CASCADE. Se o banco falhar, os arquivos
  // continuam no disco (melhor sobrar arquivo do que perder imagem
  // de um produto que ainda existe).
  await product.destroy();
  for (const img of product.images || []) {
    apagarArquivo(img.path);
  }
  return { deletado: true };
}

module.exports = { buscar, buscarPorId, criar, atualizar, deletar, ImagemInvalida };
