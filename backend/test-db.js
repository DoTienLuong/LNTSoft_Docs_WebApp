const { executeQuery, testConnection } = require('./src/config/database');

async function run() {
  try {
    // Test connection
    await testConnection();

    // Simple read from modules
    const rows = await executeQuery('SELECT TOP 10 * FROM modules', []);
    console.log('Modules rows:', Array.isArray(rows) ? rows.length : 0);
    console.log(rows.slice(0, 5));

    // Simple select via parameterized query example
    const p = await executeQuery('SELECT TOP 1 id, name FROM modules WHERE id = ?', [1]);
    console.log('Module id=1:', p[0] || null);

    process.exit(0);
  } catch (err) {
    console.error('Test DB error:', err);
    process.exit(1);
  }
}

run();
