import React, { useState, useEffect } from "react";

export const Home = () => {
  const [books, setBooks] = useState([]);  // 存儲從後端獲取的書籍資料
  const [isFetched, setIsFetched] = useState(false);  // 記錄是否已經獲取資料

  // 用來從後端 API 拉取書籍資料
  const fetchBooks = () => {
    fetch("http://localhost:5000/api/books")
      .then(response => response.json())
      .then(data => {
        setBooks(data);  // 將資料設定到狀態中
        setIsFetched(true); // 設定為已經獲取資料
      })
      .catch(error => console.error("Error fetching books:", error));
  };

  return (
    <div>
      <h1>Book List</h1>

      {/* 當按下按鈕時，觸發 fetchBooks 函數來獲取書籍資料 */}
      <button onClick={fetchBooks}>Get Books</button>

      {/* 顯示從後端取得的書籍資料 */}
      {isFetched ? (
        <ul>
          {books.map(book => (
            <li key={book.bookID}>
              {book.title} by {book.author} ({book.publishedYear})
            </li>
          ))}
        </ul>
      ) : (
        <p>No books available.</p>
      )}
    </div>
  );
};