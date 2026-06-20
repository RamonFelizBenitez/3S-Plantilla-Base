const { connectDB } = require('./config/db');

async function getSchema() {
    try {
        let pool = await connectDB();
        let result = await pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'RHPERCEP'");
        console.log(result.recordset);
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}

getSchema();
