const knex = require("knex");

const env = require("./env");

const isSQLite = env.DB_CLIENT === "sqlite3" || env.DB_CLIENT === "better-sqlite3";
const isPostgres = env.DB_CLIENT === "pg" || env.DB_CLIENT === "pg-native";
const isMySQL = env.DB_CLIENT === "mysql" || env.DB_CLIENT === "mysql2";

const db = knex({
  client: env.DB_CLIENT,
  connection: {
    ...(isSQLite && { filename: env.DB_FILENAME }),
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    ssl: env.DB_SSL,
  },
  pool: {
    min: env.DB_POOL_MIN || 2,
    max: env.DB_POOL_MAX || 10,
    idleTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    acquireTimeoutMillis: 30000,
    propagateCreateError: false
  },
  useNullAsDefault: true,
  acquireConnectionTimeout: 60000,
  asyncStackTraces: true
});

// Add connection health check
db.on('query-error', (error, obj) => {
  console.error('Database query error:', error);
  if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED') {
    // Implement reconnection logic if needed
  }
});

db.isPostgres = isPostgres;
db.isSQLite = isSQLite;
db.isMySQL = isMySQL;

db.compatibleILIKE = isPostgres ? "andWhereILike" : "andWhereLike";

module.exports = db;
