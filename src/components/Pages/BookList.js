import React, { useState, useEffect } from "react";
import config from '../../config.json';

export const BookList = () => {
  const [books, setBooks] = useState([]);
  const [isFetched, setIsFetched] = useState(false);


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
      <h3 style={{ fontSize: "36px" }}>BookList</h3>

      <button onClick={fetchBooks} style={{ fontSize: "24px" }}>Refresh</button>

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
        <h3 style={{ fontSize: "36px" }}>No books available.</h3>
      )}
    </div>
  );
};
