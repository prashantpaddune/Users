const Pool = require('pg').Pool

const pool = new Pool({
    user: process.env.USER || 'me',
    host:  process.env.HOST || 'localhost',
    database: process.env.DATABASE || 'users',
    password: process.env.PASSWORD || 'password',
    port: 5432,
});

module.exports = pool;
