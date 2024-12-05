import http from 'http';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config({ path: '../userinfo.env' });

const app = express();
const PORT = 5000;



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

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

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
app.post('/api/SignUp', async (req, res) => {
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
app.post('/api/SignIn', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '所有欄位均為必填' });
  }

  try {
    const pool = await connectToDB();

    // 驗證 userName 和密碼
    const SignInQuery = `
      SELECT * 
      FROM member 
      WHERE userName = @Username AND password = @Password
    `;
    const SignInResult = await pool.request()
      .input('Username', sql.VarChar, username)
      .input('Password', sql.VarChar, password)
      .query(SignInQuery);

    if (SignInResult.recordset.length === 0) {
      return res.status(400).json({ error: '用戶名或密碼錯誤' });
    }
    const user = SignInResult.recordset[0];
    res.status(200).json({ userID: user.userID, userName: user.userName });
  } catch (err) {
    console.error('登入失敗:', err.message);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 檢查用戶借閱歷史
app.get('/api/userBooks/:userID/returned', async (req, res) => {
  const { userID } = req.params;

  if (!userID) {
    return res.status(400).json({ error: 'userID 為必填' });
  }

  try {
    const pool = await connectToDB();

    const query = `
      SELECT b.bookID, b.title, b.author, c.copyID, br.borrowDate, br.returnDate
      FROM borrowing br
      JOIN copy c ON br.copyID = c.copyID
      JOIN book b ON c.bookID = b.bookID
      WHERE br.userID = @UserID AND br.status = 'returned';
    `;
    const result = await pool.request()
      .input('UserID', sql.Int, userID)
      .query(query);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('查詢借閱書籍失敗:', err.message);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});


// 檢查用戶借閱數量
app.get('/api/userBooks/:userID', async (req, res) => {
  const { userID } = req.params;

  if (!userID) {
    return res.status(400).json({ error: 'userID 為必填' });
  }

  try {
    const pool = await connectToDB();

    const query = `
      SELECT b.bookID, b.title, b.author, c.copyID, br.borrowDate, br.dueDate
      FROM borrowing br
      JOIN copy c ON br.copyID = c.copyID
      JOIN book b ON c.bookID = b.bookID
      WHERE br.userID = @UserID AND br.returnDate IS NULL
    `;
    const result = await pool.request()
      .input('UserID', sql.Int, userID)
      .query(query);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('查詢借閱書籍失敗:', err.message);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 歸還書本
app.post('/api/returnBook', async (req, res) => {
  const { copyID, userID } = req.body;

  try{
    const pool = await connectToDB();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    const queryBorrowing = `
      UPDATE borrowing
      SET returnDate = GETDATE(), status = 'returned'
      WHERE copyID = @copyID AND userID = @userID AND status = 'borrowed';
    `;
    const resultBorrowing = await transaction.request()
    .input('copyID', sql.Int, copyID)
    .input('userID', sql.Int, userID)
    .query(queryBorrowing);

    if (resultBorrowing.rowsAffected[0] === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: '找不到對應的借閱紀錄或該書已歸還' });
    }

    const queryUpdateBooks = `
      UPDATE copy
      SET status = 'available'
      WHERE copyID = @copyID;
    `;

    const resultUpdateBooks = await transaction.request()
    .input('copyID', sql.Int, copyID)
    .query(queryUpdateBooks);

    if (resultUpdateBooks.rowsAffected[0] === 0) {
      await transaction.rollback();
      return res.status(500).json({ error: '庫存更新失敗' });
    }

    await transaction.commit();
    res.json({ message: '書籍歸還成功，庫存已更新', copyID });
  } catch (error) {
    console.error('歸還書籍失敗:', error);
    res.status(500).json({ error: '伺服器錯誤，請稍後再試' });
  }
});

// 借閱副本
app.post('/api/borrowBook', async (req, res) => {
  const { userID, bookID } = req.body;

  if (!userID || !bookID) {
    return res.status(400).json({ error: 'userID 和 bookID 均為必填' });
  }

  try {
    const pool = await connectToDB();

    // 是否達到借閱上限
    const countQuery = `
      SELECT COUNT(*) AS borrowedCount
      FROM borrowing
      WHERE userID = @UserID AND returnDate IS NULL
    `;
    const countResult = await pool.request()
      .input('UserID', sql.Int, userID)
      .query(countQuery);

    if (countResult.recordset[0].borrowedCount >= 3) {
      return res.status(400).json({ error: '借閱數量已達上限' });
    }

    // 查找可用的書籍副本
    const checkCopyQuery = `
      SELECT TOP 1 copyID
      FROM copy
      WHERE bookID = @BookID AND status = 'available'
    `;
    const copyResult = await pool.request()
      .input('BookID', sql.Int, bookID)
      .query(checkCopyQuery);

    if (copyResult.recordset.length === 0) {
      return res.status(400).json({ error: '該書已無可借閱副本' });
    }

    const copyID = copyResult.recordset[0].copyID;

    // 插入借閱記錄並更新副本狀態
    const borrowQuery = `
      INSERT INTO borrowing (userID, copyID, borrowDate, dueDate, status)
      VALUES (@UserID, @CopyID, GETDATE(), DATEADD(DAY, 14, GETDATE()), 'borrowed');

      UPDATE copy
      SET status = 'unavailable'
      WHERE copyID = @CopyID;
    `;
    const transaction = pool.transaction();

    try {
      await transaction.begin();

      await transaction.request()
        .input('UserID', sql.Int, userID)
        .input('CopyID', sql.Int, copyID)
        .query(borrowQuery);

      await transaction.commit();

      res.status(200).json({ message: '借閱成功', copyID });
    } catch (err) {
      await transaction.rollback();
      console.error('借閱失敗:', err.message);
      res.status(500).json({ error: '伺服器錯誤' });
    }
  } catch (err) {
    console.error('借閱失敗:', err.message);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 查詢最多借閱的書
app.get("/api/mostBorrowedBooks", async (req, res) => {
  try {
    const pool = await connectToDB();
    const queryMostBorrowed = `
      SELECT TOP 1 b.title, COUNT(br.copyID) AS borrowCount
      FROM borrowing br
      JOIN copy c ON br.copyID = c.copyID
      JOIN book b ON c.bookID = b.bookID
      GROUP BY b.title
      ORDER BY COUNT(br.copyID) DESC;
    `;
    const queryMostUsers = `
      SELECT TOP 1 b.title, COUNT(DISTINCT br.userID) AS userCount
      FROM borrowing br
      JOIN copy c ON br.copyID = c.copyID
      JOIN book b ON c.bookID = b.bookID
      GROUP BY b.title
      ORDER BY COUNT(DISTINCT br.userID) DESC;
    `;
    const [mostBorrowedResult, mostUsersResult] = await Promise.all([
      pool.request().query(queryMostBorrowed),
      pool.request().query(queryMostUsers),
    ]);

    res.status(200).json({
      mostBorrowed: mostBorrowedResult.recordset[0],
      mostUsers: mostUsersResult.recordset[0],
    });
  } catch (err) {
    console.error("查詢熱門書籍失敗:", err.message);
    res.status(500).json({ error: "伺服器錯誤" });
  }
});

http.createServer(app).listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  testQuery();
});
