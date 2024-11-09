import React, { useState, useEffect } from "react";

export const Home = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/books")
      .then(response => response.json())
      .then(data => setBooks(data))
      .catch(error => console.error("Error fetching books:", error));
  }, []);

  // 按鈕點擊事件處理器
  const handleButtonClick = () => {
    console.log("Button was clicked!");
    // 您可以在這裡添加其他邏輯，根據需求執行
  };

  return (
    <div>
      <h1>FrontPage</h1>
      {/* 這裡綁定了 onClick 事件 */}
      <button onClick={handleButtonClick}>Test Button</button>

      <h2>Books:</h2>
      <ul>
        {books.map(book => (
          <li key={book.id}>
            {book.title} by {book.author}
          </li>
        ))}
      </ul>
    </div>
  );
};