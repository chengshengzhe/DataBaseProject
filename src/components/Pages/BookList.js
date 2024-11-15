import React, { useState, useEffect } from "react";
import config from '../../config.json';

export const BookList = () => {
  const [books, setBooks] = useState([]);  // 存儲從後端獲取的書籍資料
  const [isFetched, setIsFetched] = useState(false);  // 記錄是否已經獲取資料


  const fetchBooks = () => {
    const BACKEND_URL = config.BACKEND_URL;
    fetch(BACKEND_URL)
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
      <h1 style={{ fontSize: "2rem" }}>BookList</h1>  {/* 修改標題字體大小 */}

      {/* 當按下按鈕時，觸發 fetchBooks 函數來獲取書籍資料 */}
      <button onClick={fetchBooks} style={{ fontSize: "24px" }}>Refresh</button>  {/* 修改按鈕字體大小 */}

      {/* 顯示從後端取得的書籍資料 */}
      {isFetched ? (
        <table style={{ margin: "20px auto", borderCollapse: "collapse", width: "80%" }}>
          <thead>
            <tr style={{ backgroundColor: "#f3f3f3" }}>
              <th style={{ padding: "10px", border: "1px solid #ddd", fontSize: "24px" }}>Title</th>
              <th style={{ border: "1px solid #ddd", fontSize: "24px" }}>Author</th>
              <th style={{ border: "1px solid #ddd", fontSize: "24px" }}>Published Year</th>
              <th style={{ border: "1px solid #ddd", fontSize: "24px" }}>Category</th>
              <th style={{ border: "1px solid #ddd", fontSize: "24px" }}>Available Copies</th>
              <th style={{ border: "1px solid #ddd", fontSize: "24px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {books.map(book => (
              <tr key={book.bookID} style={{ textAlign: "center" }}>
                <td style={{ padding: "2px", border: "2px solid #ddd", fontSize: "30px" }}>{book.title}</td> 
                <td style={{ padding: "2px", border: "2px solid #ddd", fontSize: "30px" }}>{book.author}</td>
                <td style={{ padding: "2px", border: "2px solid #ddd", fontSize: "30px" }}>{book.publishedYear}</td>
                <td style={{ padding: "2px", border: "2px solid #ddd", fontSize: "30px" }}>{book.category}</td>
                <td style={{ padding: "2px", border: "2px solid #ddd", color: "darkred", fontSize: "30px" }}>
                  {book.availableCopies}
                </td>
                <td style={{ padding: "25px", border: "2px solid #ddd" }}>
                  <button style={{ width:"100px",padding: "10px", fontSize: "24px", cursor: "pointer" }}>Borrow</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ fontSize: "24px" }}>No books available.</p>
      )}
    </div>
  );
};
