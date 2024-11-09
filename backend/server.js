import express from 'express';
import cors from 'cors';
import sql from 'mssql';
import dotenv from 'dotenv';
const app = express();
const PORT = process.env.PORT || 5000;

// MSSQL 連接配置 - 使用 Windows 驗證
const dbConfig = {
  server: process.env.DB_SERVER, 
  database: process.env.DB_DATABASE, 
  options: {
    encrypt: true,
    trustServerCertificate: true 
  },
  authentication: {
    type: 'ntlm',           // 使用 Windows 驗證 (NTLM)
    options: {
      domain: '', 
      userName: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    }
  }
};

// 連接到資料庫
async function connectToDB() {
    try {
        await sql.connect(dbConfig);
        console.log('資料庫連接成功');
      } catch (err) {
        console.error('資料庫連接錯誤:', err.message);
        console.error('Stack trace:', err.stack);
      }
}

connectToDB();

// 啟用 CORS 以允許來自不同端口的請求
app.use(cors());
app.use(express.json());

// 連接資料庫並處理查詢
app.get('/api/books', async (req, res) => {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query('SELECT * FROM book');
      res.json(result.recordset); // 返回查詢結果
    } catch (err) {
      console.error('Error fetching books:', err);
      res.status(500).send('Server error');
    }
  });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
