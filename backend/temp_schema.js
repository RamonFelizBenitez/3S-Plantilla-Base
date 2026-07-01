const { sql, connectDB } = require('./src/config/db');

async function checkSchema() {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME IN ('RHPERCEP', 'NMEMPLEADOS')
        `);
        console.log(JSON.stringify(result.recordset, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkSchema();
