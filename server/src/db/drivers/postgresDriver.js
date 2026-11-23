import pg from 'pg';
import { migrate } from '../migrate.js';
import { httpError } from '../../utils/httpError.js';

const UNIQUE_VIOLATION = '23505';
const escapeLike = (text) => String(text).replace(/[\\%_]/g, (c) => `\\${c}`);

/**
 * Хранилище в PostgreSQL. Все значения — только через параметры ($1, $2…): SQL-инъекции невозможны.
 * schema — отдельная схема в той же базе (тесты получают свою, чтобы не мешать друг другу).
 */
export async function createPostgresDriver({ url, schema, ssl }) {
  if (schema && !/^[a-z_][a-z0-9_]*$/.test(schema)) throw new Error(`Недопустимое имя схемы: ${schema}`);
  const pool = new pg.Pool({
    connectionString: url,
    ssl,
    max: 10,
    ...(schema && { options: `-c search_path=${schema}` }),
  });
  if (schema) await pool.query(`CREATE SCHEMA IF NOT EXISTS ${pg.escapeIdentifier(schema)}`);
  await migrate(pool);

  const rows = async (sql, params) => (await pool.query(sql, params)).rows.map((r) => r.data);
  const one = async (sql, params) => (await rows(sql, params))[0] ?? null;

  /** WHERE по коллекции и полям-равенствам. add(value) кладёт значение в params и возвращает $n */
  function filter(name, where, add) {
    const clauses = [`collection = ${add(name)}`];
    for (const [key, value] of Object.entries(where)) clauses.push(`data->>${add(key)} = ${add(String(value))}`);
    return clauses;
  }
  const collect = () => {
    const params = [];
    return { params, add: (value) => `$${params.push(value)}` };
  };

  return {
    kind: 'postgres',

    async query(name, { where = {}, search, searchFields = [], sort = '-createdAt', limit } = {}) {
      const { params, add } = collect();
      const clauses = filter(name, where, add);
      if (search && searchFields.length) {
        const pattern = add(`%${escapeLike(search)}%`);
        clauses.push(`(${searchFields.map((f) => `data->>${add(f)} ILIKE ${pattern}`).join(' OR ')})`);
      }
      const desc = sort.startsWith('-');
      const order = `data->${add(desc ? sort.slice(1) : sort)} ${desc ? 'DESC' : 'ASC'} NULLS LAST`;
      const limitSql = limit ? ` LIMIT ${add(Number(limit))}` : '';
      return rows(`SELECT data FROM documents WHERE ${clauses.join(' AND ')} ORDER BY ${order}${limitSql}`, params);
    },

    byId: (name, id) => one('SELECT data FROM documents WHERE collection = $1 AND id = $2', [name, id]),

    async count(name, where = {}) {
      const { params, add } = collect();
      const sql = `SELECT count(*)::int AS n FROM documents WHERE ${filter(name, where, add).join(' AND ')}`;
      return (await pool.query(sql, params)).rows[0].n;
    },

    async insert(name, doc) {
      try {
        return await one(
          'INSERT INTO documents (collection, id, data, created_at) VALUES ($1, $2, $3, $4) RETURNING data',
          [name, doc.id, JSON.stringify(doc), doc.createdAt],
        );
      } catch (err) {
        if (err.code === UNIQUE_VIOLATION) throw httpError(409, 'Такая запись уже есть');
        throw err;
      }
    },

    /** expected — атомарное условие: обновим, только если документ всё ещё в этом состоянии */
    update: (name, id, patch, expected = {}) =>
      one(
        `UPDATE documents SET data = data || $3::jsonb, updated_at = now()
         WHERE collection = $1 AND id = $2 AND data @> $4::jsonb RETURNING data`,
        [name, id, JSON.stringify(patch), JSON.stringify(expected)],
      ),

    async remove(name, id) {
      const { rowCount } = await pool.query('DELETE FROM documents WHERE collection = $1 AND id = $2', [name, id]);
      return rowCount > 0;
    },

    async clear(name) {
      await pool.query('DELETE FROM documents WHERE collection = $1', [name]);
    },

    /** dropSchema — убрать тестовую схему целиком */
    async close({ dropSchema = false } = {}) {
      if (dropSchema && schema) await pool.query(`DROP SCHEMA IF EXISTS ${pg.escapeIdentifier(schema)} CASCADE`);
      await pool.end();
    },
  };
}
