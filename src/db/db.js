const mySql = require("mysql");

// const connection = mySql.createConnection({
//   host: "127.0.0.1", // e.g., 'mysql.yourdomain.com'
//   user: "root",
//   password: "root",
//   port: 3306,
//   database: "rockettt_admin_panel",
//   socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock",
// });

const connection = mySql.createConnection({
  host: "rockettt.rs", // e.g., 'mysql.yourdomain.com'
  user: "rockettt_miki",
  password: "fds57,Fk",
  //   port: 3306,
  database: "rockettt_admin_panel",
  //   socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock",
});

module.exports = connection;
