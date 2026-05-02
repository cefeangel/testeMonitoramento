/**
 * Helper para extrair parâmetros de paginação e calcular offset.
 * @param {string|number} page - Número da página.
 * @param {string|number} limit - Limite de itens por página.
 * @returns {object} Objeto com limit e offset prontos para Sequelize.
 */
export const getPagination = (page, limit) => {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.max(1, Math.min(100, parseInt(limit) || 10)); // Default 10 per user request, max 100
  const offset = (p - 1) * l;
  return { limit: l, offset };
};

/**
 * Formata o objeto de resposta com metadados de paginação.
 * @param {Array} items - Lista de registros retornados.
 * @param {number} totalCount - Total de registros no banco.
 * @param {number} page - Página atual.
 * @param {number} limit - Limite por página usado.
 * @returns {object} Dados formatados.
 */
export const formatPaginatedResponse = (items, totalCount, page, limit) => {
  const p = Math.max(1, parseInt(page) || 1);
  const l = parseInt(limit) || 10;
  const totalPages = Math.ceil(totalCount / l);

  return {
    items,
    totalItems: totalCount,
    totalPages,
    currentPage: p,
    limit: l
  };
};
