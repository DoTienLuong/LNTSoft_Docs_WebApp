const sql = require('mssql');
require('dotenv').config();

// create config object from environment variables (.env)
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 1433,
    database: process.env.DB_NAME,
    options: {
        encrypt: false,
        trustServerCertificate: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// create the connection pool and connect once
const pool = new sql.ConnectionPool(dbConfig);
const poolConnect = pool.connect();

// test the connection
const testConnection = async () => {
    try {
        await poolConnect;
        console.log('✅ SQL Server database connected successfully.');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
};

// helper to replace '?' placeholders with named params @p0,@p1,...
const replacePlaceholders = (query, params) => {
    let idx = 0;
    const transformed = query.replace(/\?/g, () => `@p${idx++}`);
    return transformed;
};

const executeQuery = async (query, params = []) => {
    try {
        await poolConnect;

        const isInsert = /^\s*INSERT\s+/i.test(query);

        // transform '?' placeholders to named parameters
        let transformedQuery = replacePlaceholders(query, params);

        // for INSERT, append a SCOPE_IDENTITY select so we can return insertId
        if (isInsert && !/SCOPE_IDENTITY\(/i.test(transformedQuery)) {
            transformedQuery = `${transformedQuery}; SELECT SCOPE_IDENTITY() AS id`;
        }

        const request = pool.request();
        params.forEach((p, i) => {
            // let mssql infer the type
            request.input(`p${i}`, p);
        });

        const result = await request.query(transformedQuery);

        // Return shapes compatible with existing mysql2-based code
        const trimmed = query.trim().toUpperCase();
        if (trimmed.startsWith('SELECT')) {
            return result.recordset;
        }
        if (trimmed.startsWith('INSERT')) {
            const id = result.recordset && result.recordset[0] ? result.recordset[0].id : null;
            return { insertId: id != null ? Number(id) : null };
        }
        if (trimmed.startsWith('UPDATE') || trimmed.startsWith('DELETE')) {
            const affected = Array.isArray(result.rowsAffected) ? result.rowsAffected[0] : result.rowsAffected;
            return { affectedRows: affected };
        }

        // fallback: return full result
        return result;
    } catch (error) {
        console.error('❌ Database query error:', error);
        throw error;
    }
};

testConnection();

module.exports = {
    pool,
    executeQuery,
    testConnection,
    sql
};