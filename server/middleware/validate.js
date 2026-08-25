// server/middleware/validate.js
// Zod schema validation middleware factory

const { sendError } = require('../utils/response');

/**
 * Validate request body/params/query with a Zod schema
 * @param {ZodSchema} schema
 * @param {'body'|'params'|'query'} source - Which part of req to validate
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return sendError(res, 'Validation failed', 400, errors);
    }
    req[source] = result.data;
    next();
  };
};

module.exports = { validate };
