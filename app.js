const express = require('express');
const fs = require('fs');
const yaml = require('js-yaml');
const { dbConnection } = require('./config/database');
const app = express();

// query.yml 파일 불러오기
const queries = yaml.load(fs.readFileSync('./config/query.yml', 'utf8'));

// 기본 라우트 설정
app.get('/', async (req, res) => {
    const sql = queries.GET_USER;

    try {
        results = await dbConnection(sql);

        // slack api 테스트
        console.log(req)

        res.json({
            results: results,
            message: `Excuted Query successfuly - ${sql}`
        });
    } catch (error) {
        console.log(`Error : ${error}`);
        res.status(500).json({
            error: 'An error occureed while fetching data'
        })
    }
})

// 서버 실행
app.listen(3000, () => {
    console.log('Server is running on post 3000');
})

// 192.168.111.24