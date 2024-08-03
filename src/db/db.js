const mySql = require("mysql");
require("dotenv").config();

const prod = process.env.production === "true";
console.log(prod);
const connection = prod
  ? mySql.createConnection({
      host: "rockettt.rs", // e.g., 'mysql.yourdomain.com'
      user: process.env.dbUser,
      password: process.env.dbPass,
      //   port: 3306,
      database: "rockettt_admin_panel",
      //   socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock",
    })
  : mySql.createConnection({
      host: "127.0.0.1", // e.g., 'mysql.yourdomain.com'
      user: "root",
      password: "root",
      port: 3306,
      database: "rockettt_admin_panel",
      socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock",
    });

module.exports = connection;
