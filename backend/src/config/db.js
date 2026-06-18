const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123456789',
    server: process.env.DB_SERVER && process.env.DB_SERVER.includes('\\') 
        ? 'localhost' 
        : (process.env.DB_SERVER || 'localhost'),
    database: process.env.DB_NAME || 'RHDBW',
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: false, // For local SQL Server instances
        trustServerCertificate: true,
    }
};

let pool;

const connectDB = async () => {
    try {
        if (!pool) {
            pool = await sql.connect(config);
            console.log('Connected to SQL Server');
        }
        return pool;
    } catch (err) {
        console.error('Database Connection Failed! Bad Config: ', err);
        throw err;
    }
};

module.exports = {
    sql,
    connectDB
};
