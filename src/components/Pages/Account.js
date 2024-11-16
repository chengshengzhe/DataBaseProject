import React, { useState,useEffect } from 'react';
import "./Account.css";
import config from '../../config.json';

export const Account = () => {
  const [regEmail, setRegEmail] = useState('');
  const [regName, setRegName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [SignInName, setSignInName] = useState('');
  const [SignInPassword, setSignInPassword] = useState('');
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [returnedBooks, setReturnedBooks] = useState([]);
  const [loggedIn, setSignedIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [accountInfo, setAccountInfo] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 2000);
  };

  // Local Storage 中的登入狀態
  useEffect(() => {
    const storedUser = localStorage.getItem('accountInfo');
    if (storedUser) {
      setAccountInfo(JSON.parse(storedUser));
      setSignedIn(true);
    }
  }, []);
  useEffect(() => {
    if (accountInfo?.userID) {
      fetchBorrowedBooks();
    }
  }, [accountInfo]);
  

  const handleSignUp = async () => {
    if (!regName || !regEmail || !regPassword) {
      showMessage("所有欄位均為必填", "error");
      return;
    }
    
    const SignUp_URL = config.SIGNUP_URL;
    try {
      const response = await fetch(SignUp_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: regName, email: regEmail, password: regPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        showMessage("帳號創建成功！請登入", "success");
        setShowSignUp(false);
        setRegName('');
        setRegEmail('');
        setRegPassword('');
      } else {
        showMessage(data.error || "註冊失敗", "error");
      }
    } catch (err) {
      console.error("註冊錯誤:", err);
      showMessage("伺服器錯誤", "error");
    }
  };

  const handleSignIn = async () => {
    if (!SignInName || !SignInPassword) {
      showMessage("所有欄位均為必填", "error");
      return;
    }
    const SignIn_URL = config.SIGNIN_URL;
    try {
      const response = await fetch(SignIn_URL , {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: SignInName, password: SignInPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        showMessage("登入成功", "success");
        setSignedIn(true);
        const userInfo = { userID: data.userID, userName: data.userName };
        setAccountInfo(userInfo);
        localStorage.setItem('accountInfo', JSON.stringify(userInfo));
        setSignInName('');
        setSignInPassword('');
      } else {
        showMessage(data.error || "登入失敗", "error");
      }
    } catch (err) {
      console.error("登入錯誤:", err);
      showMessage("伺服器錯誤", "error");
    }
  };

  const handleSignout = () => {
    setSignedIn(false);
    setAccountInfo(null);
    localStorage.removeItem('accountInfo');
    showMessage("登出成功", "success");
  };
  const handleReturnBook = async (copyID) => {
    console.log("Return Request:", { copyID, userID: accountInfo.userID }); 
    try {
        const response = await fetch(`${config.BACKEND_URL}/api/returnBook`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ copyID, userID: accountInfo.userID }),
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('書籍歸還成功', 'success');
            fetchBorrowedBooks(); 
        } else {
            showMessage(data.error || '書籍歸還失敗', 'error');
        }
    } catch (error) {
        console.error('歸還書籍錯誤:', error.message);
        showMessage('伺服器錯誤', 'error');
    }
};


  const fetchBorrowedBooks = async () => {
    if (!accountInfo?.userID) return;
  
    try {
      const response = await fetch(`${config.BACKEND_URL}/api/userBooks/${accountInfo.userID}`);
      const data = await response.json();
      setBorrowedBooks(data);
    } catch (err) {
      console.error("無法獲取借閱書籍:", err.message);
      showMessage("伺服器錯誤", "error");
    }
  };
  return (
    <div>
      {loggedIn ? (
        <div>
          <h3>Account Information</h3>
          <p><strong>UserName:</strong> {accountInfo.userName}</p>
          <button onClick={handleSignout}>Sign out</button>
          <h3>目前借閱的書籍</h3>
          {borrowedBooks.length > 0 ? (
            <ul className="borrowed-books-list">
              {borrowedBooks.map(book => (
                <li key={book.borrowID} className="borrowed-book-item">
                  <strong>{book.title}</strong> <h>_</h>by {book.author} (Due: {new Date(book.dueDate).toLocaleDateString()})
                  <button
                  className="return-button"
                  onClick={() => handleReturnBook(book.copyID)}
                  >
                  歸還
                  </button>
                </li>
              ))}
            </ul>
            
          ) : (
          <p>目前沒有借閱的書籍。</p>
          
          )}
        </div>
      ) : (
        <div>
          <h3>登入帳號</h3>
          <input 
            type="text" 
            placeholder="UserName" 
            value={SignInName} 
            onChange={(e) => setSignInName(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={SignInPassword} 
            onChange={(e) => setSignInPassword(e.target.value)} 
          />
          <button onClick={handleSignIn}>Sign In</button>

          <h3>註冊帳號(Email格式即可)</h3>
          {!showSignUp && (
            <button onClick={() => setShowSignUp(true)}>
              Sign up
            </button>
          )}
          {showSignUp && (
            <div id="SignUpration-form">
              <input 
                type="text" 
                placeholder="UserName" 
                value={regName} 
                onChange={(e) => setRegName(e.target.value)} 
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={regPassword} 
                onChange={(e) => setRegPassword(e.target.value)} 
              />
              <input 
                type="text" 
                placeholder="Email" 
                value={regEmail} 
                onChange={(e) => setRegEmail(e.target.value)} 
              />
              <button onClick={handleSignUp}>Sign up</button>
              <button onClick={() => setShowSignUp(false)}>Return</button>
            </div>
          )}
        </div>
      )}

      {message && <p className={`message ${messageType}`}>{message}</p>}
    </div>
  );
};
