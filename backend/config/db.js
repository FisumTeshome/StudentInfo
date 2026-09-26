const { Pool } = require('pg');

const pgPool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'trainingschedule',
        port: process.env.DB_PORT || 5432,
      }
);

// Custom wrapper to intercept MySQL queries and convert them to Postgres syntax
// This avoids having to change all 9 controller files
const formatQuery = (sql) => {
  let formatted = sql.replace(/`/g, '"'); // Convert backticks to double quotes
  
  // Convert ? to $1, $2, etc. (Naive conversion, assuming ? is only used for parameters)
  let paramCount = 1;
  formatted = formatted.replace(/\?/g, () => `$${paramCount++}`);

  // Convert MySQL CURDATE() to Postgres CURRENT_DATE
  formatted = formatted.replace(/CURDATE\(\)/gi, 'CURRENT_DATE');

  // Handle ON DUPLICATE KEY UPDATE (specifically for attendance Upsert)
  if (formatted.includes('ON DUPLICATE KEY UPDATE')) {
      formatted = formatted.replace(
          /ON DUPLICATE KEY UPDATE(.*)/i, 
          'ON CONFLICT (student_id, course_id, "date") DO UPDATE SET status=EXCLUDED.status, remarks=EXCLUDED.remarks, marked_by=EXCLUDED.marked_by'
      );
  }

  // Auto-return the inserted row id so we can get insertId
  if (formatted.trim().toUpperCase().startsWith('INSERT') && !formatted.toUpperCase().includes('RETURNING')) {
      formatted += ' RETURNING *';
  }

  return formatted;
};

// Postgres returns all column names as lowercase.
// Normalize rows so .ID, .Name etc. still work the same as in MySQL.
const normalizeRow = (row) => {
  if (!row || typeof row !== 'object') return row;
  const normalized = { ...row };
  // Alias lowercase to uppercase for common PK columns
  if ('id' in row && !('ID' in row)) normalized.ID = row.id;
  if ('name' in row && !('Name' in row)) normalized.Name = row.name;
  return normalized;
};

const normalizeRows = (rows) => Array.isArray(rows) ? rows.map(normalizeRow) : rows;

const executeQuery = async (sql, params = []) => {
  const pgSql = formatQuery(sql);
  const result = await pgPool.query(pgSql, params);
  
  const rows = normalizeRows(result.rows);
  
  // Mimic mysql2 return format
  if (result.command === 'INSERT' || result.command === 'UPDATE' || result.command === 'DELETE') {
      const insertedRow = result.rows.length > 0 ? result.rows[0] : {};
      const mysqlResult = {
          insertId: insertedRow.id || insertedRow.ID || null,
          affectedRows: result.rowCount,
          changedRows: result.rowCount
      };
      return [mysqlResult, result.fields];
  }
  
  return [rows, result.fields];
};

const poolWrapper = {
  query: executeQuery,
  execute: executeQuery,
  getConnection: async () => {
      const client = await pgPool.connect();
      return {
          beginTransaction: () => client.query('BEGIN'),
          commit: () => client.query('COMMIT'),
          rollback: () => client.query('ROLLBACK'),
          execute: async (sql, params) => {
              const pgSql = formatQuery(sql);
              const result = await client.query(pgSql, params);
              if (result.command === 'INSERT' || result.command === 'UPDATE' || result.command === 'DELETE') {
                  return [{ insertId: result.rows.length > 0 ? (result.rows[0].id || result.rows[0].ID) : null, affectedRows: result.rowCount }];
              }
              return [result.rows];
          },
          release: () => client.release()
      };
  }
};

module.exports = poolWrapper;
