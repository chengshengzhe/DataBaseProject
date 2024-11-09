
import express from 'express';
import cors from 'cors';
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// 建立一個簡單的 API 端點
app.get('/api/books', (req, res) => {
  res.json([{ id: 1, title: "Sample Book", author: "Author" }]);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});