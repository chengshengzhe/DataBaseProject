import React, { useState, useEffect } from "react";

export const BookList = () => {
  const [books, setBooks] = useState([]);  // 存儲從後端獲取的書籍資料
  const [isFetched, setIsFetched] = useState(false);  // 記錄是否已經獲取資料

  // 用來從後端 API 拉取書籍資料
  const fetchBooks = () => {
    fetch("http://localhost:5000/api/books")
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        setBooks(data);
        setIsFetched(true);
    })
    .catch(error => console.error("Error fetching books:", error.message));
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>BookList</h1>

      {/* 當按下按鈕時，觸發 fetchBooks 函數來獲取書籍資料 */}
      <button onClick={fetchBooks}>Refresh</button>

      {/* 顯示從後端取得的書籍資料 */}
      {isFetched ? (
        <ul className="book-list">
          {books.map(book => (
            <li key={book.bookID}>
            <li key={book.bookID} className="book-item">
            {book.title} by {book.author} ({book.publishedYear})- Available Copies:
            <span style={{ color: "darkred", marginLeft: "10px" }}>
              {book.availableCopies}
              </span>
            </li>
            </li>
          ))}
        </ul>
      ) : (
        <p>No books available.</p>
      )}
    </div>
  );
};