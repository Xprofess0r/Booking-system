module.exports = {
  development: {
    username: process.env.DB_USER     || "root",
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME     || "airline_booking_db",
    host:     process.env.DB_HOST     || "127.0.0.1",
    port:     process.env.DB_PORT     || 3306,
    dialect:  "mysql"
  },
  test: {
    username: "root",
    password: null,
    database: "airline_booking_db_test",
    host:     "127.0.0.1",
    dialect:  "mysql"
  },
  production: {
    username: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    host:     process.env.MYSQLHOST,
    port:     Number(process.env.MYSQLPORT) || 3306,
    dialect:  "mysql",
    dialectOptions: {
      connectTimeout: 60000,
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: { max: 5, min: 0, acquire: 60000, idle: 10000 }
  }
};
