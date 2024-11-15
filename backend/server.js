import express from 'express';
import cors from 'cors';
import sql from 'mssql';
import dotenv from 'dotenv';

const app = express();

const port = process.env.PORT || 5000;

dotenv.config(); // Vercel 環境變數會自動處理，因此可以省略 path 參數

const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: 'testuser',
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,  // 使用加密連接
    trustServerCertificate: true,  // 避免 SSL 驗證錯誤
  },
  port: 1433,  // 默認 SQL Server 端口
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

// 根路由，測試資料庫
app.get("/", async (req, res) => {
  try {
    const pool = await connectToDB();
    const result = await pool.request().query(`
      SELECT 
        b.bookID, 
        b.title, 
        b.author, 
        b.publishedYear,
        b.category
      FROM 
        book b
    `);
    const books = result.recordset;  // 獲取查詢結果
    res.json(books);  // 返回結果
  } catch (err) {
    console.error("主頁書籍查詢失敗:", err.message);
    res.status(500).send("伺服器錯誤");
  }
});

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
        b.bookID = c.bookID AND c.status = 'available'  // 只計算可用的副本
      GROUP BY 
        b.bookID, b.title, b.author, b.publishedYear, b.category;
    `;

    const result = await sql.query(query);
    res.json(result.recordset);  // 返回查詢結果
  } catch (err) {
    console.error("查詢書籍失敗:", err.message);
    res.status(500).send("伺服器錯誤");
  }
});

// 啟動伺服器並測試資料庫
export default async function handler(req, res) {
  try {
    await testQuery();  // 測試資料庫連接
    res.status(200).send("伺服器運行正常");
  } catch (error) {
    res.status(500).send("伺服器錯誤");
  }
}