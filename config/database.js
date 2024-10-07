// 데이터베이스 연결 설정 파일

const { Client } = require('pg');
require("dotenv").config();

const pgConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
};

const dbConnection = (sql) => {
    const dbClient = new Client(pgConfig);

    dbClient.connect();

    return new Promise((resolve, reject) => {
        dbClient.query(sql, (err, res) => {
            if (err) reject(err);
            resolve(res);
            dbClient.end();
        })
    });
};

module.exports = { dbConnection };