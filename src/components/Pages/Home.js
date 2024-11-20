import React, { useState, useEffect } from "react";
import config from "../../config.json";
import "./Home.css";

export const Home = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [accountInfo, setAccountInfo] = useState(null);
  const [mostBorrowedBook, setMostBorrowedBook] = useState(null);
  const [mostUsersBook, setMostUsersBook] = useState(null);
  const [borrowingRecords, setBorrowingRecords] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [message, setMessage] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 6;
  const totalPages = Math.ceil(borrowingRecords.length / recordsPerPage);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 2000);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("accountInfo");
    if (storedUser) {
      setAccountInfo(JSON.parse(storedUser));
      setLoggedIn(true);
    }
  }, []);

  //獲取最多借閱書本
  const fetchMostBorrowedBooks = async () => {
    if (activeTab === "popularBooks") {
      setActiveTab(null);
      return;
    }
    try {
      const response = await fetch(`${config.BACKEND_URL}/api/mostBorrowedBooks`,{
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await response.json();
      if (response.ok) {
        setMostBorrowedBook(data.mostBorrowed);
        setMostUsersBook(data.mostUsers);
        setActiveTab("popularBooks");
      } else {
        console.error("無法獲取數據");
      }
    } catch (error) {
      console.error("伺服器錯誤:", error.message);
    }
  };

  //獲得借閱紀錄
  const fetchBorrowingRecords = async () => {
    if (activeTab === "borrowingRecords") {
      setActiveTab(null);
      return;
    }

    if (!accountInfo?.userID) {
      showMessage("尚未登入");
      return;
    }

    try {
      const response = await fetch(`${config.BACKEND_URL}/api/userBooks/${accountInfo.userID}/returned`,{
        headers: {
          "ngrok-skip-browser-warning": "true", // 加入跳過確認的請求頭
        },
      });
      const data = await response.json();

      if (response.ok) {
        setBorrowingRecords(data);
        setActiveTab("borrowingRecords");
        setCurrentPage(1); 
      } else {
        showMessage(data.error || "無法獲取借閱紀錄");
      }
    } catch (err) {
      console.error("伺服器錯誤:", err.message);
      showMessage("伺服器錯誤");
    }
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = borrowingRecords.slice(indexOfFirstRecord, indexOfLastRecord);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      {message && (
        <div
          style={{
            fontSize: "25px",
            textAlign: "center",
            color: "lightgreen",
            margin: "10px 0",
          }}
        >
          {message}
        </div>
      )}
      <h1 style={{ fontSize: "36px", textAlign: "center" }}>Home</h1>
      <button onClick={fetchMostBorrowedBooks}>
        {activeTab === "popularBooks" ? "收起" : "熱門書籍"}
      </button>
      <button onClick={fetchBorrowingRecords}>
        {activeTab === "borrowingRecords" ? "收起" : "借閱紀錄"}
      </button>

      <div>
        {activeTab === "popularBooks" && (
          <div>
            <h3>借閱次數最多的書籍</h3>
            {mostBorrowedBook ? (
              <>
                <p>書名: {mostBorrowedBook.title}</p>
                <p>次數: {mostBorrowedBook.borrowCount}</p>
              </>
            ) : (
              <p>無數據。</p>
            )}
            <h3>最多人借閱的書籍</h3>
            {mostUsersBook ? (
              <>
                <p>書名: {mostUsersBook.title}</p>
                <p>人數: {mostUsersBook.userCount}</p>
              </>
            ) : (
              <p>無數據。</p>
            )}
          </div>
        )}

        {activeTab === "borrowingRecords" && (
          <div>
            <h3>目前借閱的書籍</h3>
            {currentRecords.length > 0 ? (
              <ul className="borrowed-books-list">
                {currentRecords.map((record, index) => (
                  <li key={index} className="borrowed-book-item">
                    <strong>{record.title}</strong> <span>_</span> by {record.author} <br /> <span>_</span>
                    <span>借閱日期: {new Date(record.borrowDate).toLocaleDateString()}</span> <span>_</span><br />
                    <span>
                      歸還日期:{" "}
                      {record.returnDate
                        ? new Date(record.returnDate).toLocaleDateString()
                        : "尚未歸還"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-borrowed-books">目前沒有借閱的書籍。</p>
            )}
            {totalPages > 1 && (
              <div className="pagination">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    className={`page-button ${currentPage === index + 1 ? "active" : ""}`}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
