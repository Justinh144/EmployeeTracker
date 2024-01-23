const mysql = require('mysql2');

require('dotenv').config();

const connection = mysql.createConnection ({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'QWER1234',
    database: 'employees',
});

module.exports = connection;