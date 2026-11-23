/**
 * Проверяет req.body по zod-схеме. При ошибке — 400 с понятным сообщением,
 * при успехе — подменяет body очищенными данными (лишние пробелы, приведение типов).
 * @param {import('zod').ZodType} schema
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    const issue = result.error.issues[0];
    return res.status(400).json({ error: issue.message, field: issue.path.join('.') });
  }
  req.body = result.data;
  next();
};
