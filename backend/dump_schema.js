const { connectDB } = require('./src/config/db');
const fs = require('fs');

async function run() {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME IN ('NMEMPLEADOS', 'RHPERCEP', 'RHCAMBIOS')
        `);
        fs.writeFileSync('schema.json', JSON.stringify(result.recordset, null, 2));
        console.log('Done');
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
run();
