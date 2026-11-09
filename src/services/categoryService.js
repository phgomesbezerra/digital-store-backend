// categoryService.js - regras de negocio das categorias.
const { Category } = require('../models');

// Lista as categorias com paginacao e filtros (Requisito 01 da Secao 03).
async function buscar(query) {
  // limit: quantos itens por pagina (padrao 12; -1 = todos).
  // page: qual pagina (padrao 1; ignorada quando limit = -1).
  const limit = query.limit === undefined ? 12 : Number(query.limit);
  const page = query.page === undefined ? 1 : Number(query.page);

  // Dados incorretos: limit/page precisam ser numeros inteiros validos.
  if (!Number.isInteger(limit) || !Number.isInteger(page) || limit < -1 || limit === 0 || page < 1) {
    return { erro: 'Parâmetros limit ou page inválidos.' };
  }

  // Monta o filtro (where) e os campos (attributes) a partir da query string.
  const where = {};
  if (query.use_in_menu !== undefined) {
    // O enunciado so documenta use_in_menu=true. Aceitamos true/false;
    // qualquer outro valor e dado incorreto (400), nao filtro silencioso.
    if (query.use_in_menu !== 'true' && query.use_in_menu !== 'false') {
      return { erro: 'Parâmetro use_in_menu inválido. Use true ou false.' };
    }
    where.use_in_menu = query.use_in_menu === 'true'; // use_in_menu=true filtra so as do menu
  }

  // Por padrao a resposta traz id, name, slug e use_in_menu (exemplo do enunciado).
  // fields=name,slug limita os campos; o id sempre vai junto.
  let attributes = ['id', 'name', 'slug', 'use_in_menu'];
  if (query.fields) {
    const campos = query.fields.split(',').map((c) => c.trim()).filter(Boolean);
    const permitidos = ['name', 'slug', 'use_in_menu'];
    const validos = campos.filter((c) => permitidos.includes(c));
    if (validos.length === 0) {
      return { erro: 'Parâmetro fields inválido.' };
    }
    attributes = ['id', ...validos];
  }

  const opcoes = { where };
  if (attributes) opcoes.attributes = attributes;
  if (limit !== -1) {
    opcoes.limit = limit;
    opcoes.offset = (page - 1) * limit; // pula os itens das paginas anteriores
  }

  const { rows, count } = await Category.findAndCountAll(opcoes);

  return {
    resultado: {
      data: rows,
      total: count,
      limit,
      page,
    },
  };
}

async function buscarPorId(id) {
  return Category.findByPk(id, { attributes: ['id', 'name', 'slug', 'use_in_menu'] });
}

async function criar(dados) {
  const { name, slug, use_in_menu } = dados;
  if (!name || !slug) {
    return { erro: 'Os campos name e slug são obrigatórios.' };
  }
  const category = await Category.create({ name, slug, use_in_menu: use_in_menu === true });
  return {
    category: { id: category.id, name: category.name, slug: category.slug, use_in_menu: category.use_in_menu },
  };
}

async function atualizar(id, dados) {
  const { name, slug, use_in_menu } = dados;
  if (!name || !slug) {
    return { erro: 'Os campos name e slug são obrigatórios.' };
  }
  const category = await Category.findByPk(id);
  if (!category) {
    return { naoEncontrado: true };
  }
  await category.update({ name, slug, use_in_menu: use_in_menu === true });
  return { atualizado: true };
}

async function deletar(id) {
  const category = await Category.findByPk(id);
  if (!category) {
    return { naoEncontrado: true };
  }
  await category.destroy();
  return { deletado: true };
}

module.exports = { buscar, buscarPorId, criar, atualizar, deletar };
