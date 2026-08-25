// server/utils/pagination.js
// Offset-based pagination helpers

/**
 * Parse pagination parameters from query string
 * @param {object} query - req.query
 * @returns {{ page, limit, skip }}
 */
const getPaginationParams = (queryOrPage, optionalLimit) => {
  const isPositional = optionalLimit !== undefined || (typeof queryOrPage !== 'object' && queryOrPage !== undefined);
  const pageStr = isPositional ? queryOrPage : queryOrPage?.page;
  const limitStr = isPositional ? optionalLimit : queryOrPage?.limit;

  const page = Math.max(1, parseInt(pageStr, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(limitStr, 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip, take: limit };
};

/**
 * Build pagination metadata
 * @param {number} total - Total record count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 */
const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = { getPaginationParams, buildPaginationMeta };
