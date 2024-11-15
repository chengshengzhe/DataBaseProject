import https from 'https'; 
import fs from 'fs';  
import express from 'express';
import cors from 'cors';
import sql from 'mssql';
import dotenv from 'dotenv';

const app = express();
const PORT = 5000;

const httpsOptions = {
  key: fs.readFileSync('./certs/key.pem'), 
  cert: fs.readFileSync('./certs/cert.pem')
};

dotenv.config({ path: '../userinfo.env' }); // 指定 .env 檔案路徑
const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: 'testuser',
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },  port: 1433,
};

// 測試資料庫連接
async function connectToDB() {
  try {
    const pool = await sql.connect(dbConfig);
    console.log('資料庫連接成功');
    return pool;
  } catch (err) {
    console.error('資料庫連接錯誤:', err.message);
    console.error('Stack:', err.stack);
    throw err;
  }
}

// 查詢
async function testQuery() {
  try {
    const pool = await connectToDB();
  } catch (err) {
    console.error('測試查詢失敗:', err.message);
  }
}

// 啟用 CORS 並設置 API 路由
app.use(cors());
app.use(express.json());

// 查詢書籍列表和可用副本數量
app.get("/api/books", async (req, res) => {
  try {
    const query = `
      SELECT 
        b.bookID, 
        b.title, 
        b.author, 
        b.publishedYear,
        b.category,
        COUNT(c.copyID) AS availableCopies
      FROM 
        book b
      LEFT JOIN 
        copy c
      ON 
        b.bookID = c.bookID AND c.status = 'available' -- 只計算可用的副本
      GROUP BY 
        b.bookID, b.title, b.author, b.publishedYear, b.category;
    `;

    const result = await sql.query(query);
    res.json(result.recordset); // 返回查詢結果
  } catch (err) {
    console.error("查詢書籍失敗:", err.message);
    res.status(500).send("伺服器錯誤");
  }
});

// 啟動伺服器並測試資料庫
https.createServer(httpsOptions, app).listen(PORT, async () => {
  console.log(`Server is running on https://localhost:${PORT}`);
  await testQuery();
});
