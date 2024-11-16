import React, { useState, useEffect } from "react";
import config from '../../config.json';

export const BookList = (userID) => {
  const [borrowedCount, setBorrowedCount] = useState(0);
  const [books, setBooks] = useState([]);
  const [isFetched, setIsFetched] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const accountInfo = JSON.parse(localStorage.getItem("accountInfo")) || null;

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 2000);
  };

  const fetchBooks = () => {
    setIsRefreshing(true);
    const Books_URL = config.BOOKS_URL;
    fetch(Books_URL)
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
      setTimeout(() => setIsRefreshing(false), 1000);
    };
    
  // 借閱書籍
  const borrowBook = async (bookID) => {
    const accountInfo = JSON.parse(localStorage.getItem("accountInfo"));
    const userID = parseInt(accountInfo.userID, 10);
  
    if (!userID) {
      showMessage("用戶ID無效，請重新登入", "error");
      return;
    }
  
    try {
      const response = await fetch(`${config.BACKEND_URL}/api/borrowBook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID, bookID }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        showMessage("借閱成功", "success");
        fetchBooks(); 
      } else {
        showMessage(data.error || "借閱失敗", "error");
      }
    } catch (error) {
      console.error("借閱書籍錯誤:", error.message);
      showMessage("伺服器錯誤", "error");
    }
  };
  
  return (
    <div style={{ textAlign: "center" }}>
      <h3 style={{ fontSize: "36px" }}>BookList</h3>

      <button 
        onClick={fetchBooks} 
        style={{
          fontSize: "24px", 
          backgroundColor: isRefreshing ? "#ccc" : "#0a0a23",
          cursor: isRefreshing ? "not-allowed" : "pointer",
          color: isRefreshing ? "#666" : "#fff",
        }}
        disabled={isRefreshing}
      >
        {isRefreshing ? "Refreshed" : "Refresh"}
      </button>
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
                <button 
                  onClick={() => borrowBook(book.bookID)} 
                  disabled={borrowedCount >= 3 || book.availableCopies === 0||(!accountInfo || !accountInfo.userID)}
                  style={{ width:"100px",padding: "10px", fontSize: "24px", cursor: "pointer" }}
                >
                  借閱
                </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <h3 style={{ fontSize: "36px" }}>No books available.</h3>
      )}
    </div>
  );
};