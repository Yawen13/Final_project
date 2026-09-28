const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'unfinished_db' // Replace with your actual database name
});

module.exports = pool.promise();