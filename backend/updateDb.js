const sql = require('mssql');
const config = {
    user: 'sa',
    password: '123456789',
    server: 'localhost',
    database: 'RHDBW',
    port: 61980,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};
sql.connect(config)
    .then(pool => pool.request().query("UPDATE Usuarios SET PasswordHash = '$2b$10$hoby7RVrbnHsJvx.22wpJOSrS6Z/WXuIkcxy9Ho6kXcrq.AswYmOO'"))
    .then(res => { console.log('UPDATED'); process.exit(0); })
    .catch(err => { console.error(err); process.exit(1); });
