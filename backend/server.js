import https from 'https';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config({ path: '../userinfo.env' });

const app = express();
const PORT = 5000;

// SSL 憑證
const httpsOptions = {
  key: fs.readFileSync('./certs/key.pem'),
  cert: fs.readFileSync('./certs/cert.pem'),
};

// 資料庫連接設定
const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: 'testuser',
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
  port: 1433,
};

// 連接資料庫
async function connectToDB() {
  try {
    const pool = await sql.connect(dbConfig);
    console.log('資料庫連接成功');
    return pool;
  } catch (err) {
    console.error('資料庫連接失敗:', err.message);
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

// Email 格式驗證
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 創建帳號
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: '所有欄位均為必填' });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: '無效的 Email 格式' });
  }

  try {
    const pool = await connectToDB();

    // 檢查 userName 和 email 是否已存在
    const checkQuery = `SELECT COUNT(*) AS count FROM member WHERE userName = @Username OR email = @Email`;
    const checkResult = await pool.request()
      .input('Username', sql.VarChar, username)
      .input('Email', sql.VarChar, email)
      .query(checkQuery);

    if (checkResult.recordset[0].count > 0) {
      return res.status(400).json({ error: '用戶名或 Email 已被註冊' });
    }

    // 插入新帳號
    const insertQuery = `
      INSERT INTO member (userName, email, password)
      VALUES (@Username, @Email, @Password)
    `;
    await pool.request()
      .input('Username', sql.VarChar, username)
      .input('Email', sql.VarChar, email)
      .input('Password', sql.VarChar, password)
      .query(insertQuery);

    res.status(201).json({ message: '帳號創建成功' });
  } catch (err) {
    console.error('創建帳號失敗:', err.message);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 登入帳號
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '所有欄位均為必填' });
  }

  try {
    const pool = await connectToDB();

    // 驗證 userName 和密碼
    const loginQuery = `
      SELECT * FROM member WHERE userName = @Username AND password = @Password
    `;
    const loginResult = await pool.request()
      .input('Username', sql.VarChar, username)
      .input('Password', sql.VarChar, password)
      .query(loginQuery);

    if (loginResult.recordset.length === 0) {
      return res.status(400).json({ error: '用戶名或密碼錯誤' });
    }

    res.status(200).json({ message: '登入成功' });
  } catch (err) {
    console.error('登入失敗:', err.message);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 啟動伺服器
https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`Server is running on https://localhost:${PORT}`);
  testQuery();
});


