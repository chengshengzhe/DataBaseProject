import React, { useState } from 'react';
import "./Account.css";

export const Account = () => {
  const [regEmail, setRegEmail] = useState('');
  const [regName, setRegName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [loggedIn, setLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
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

  const handleRegister = async () => {
    if (!regName || !regEmail || !regPassword) {
      showMessage("所有欄位均為必填", "error");
      return;
    }

    try {
      const response = await fetch("https://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: regName, email: regEmail, password: regPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        showMessage("帳號創建成功！請登入", "success");
        setShowRegister(false);
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

  const handleLogin = async () => {
    if (!loginName || !loginPassword) {
      showMessage("所有欄位均為必填", "error");
      return;
    }

    try {
      const response = await fetch("https://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: loginName, password: loginPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        showMessage("登入成功", "success");
        setLoggedIn(true);
        setAccountInfo({ userName: loginName });
        setLoginName('');
        setLoginPassword('');
      } else {
        showMessage(data.error || "登入失敗", "error");
      }
    } catch (err) {
      console.error("登入錯誤:", err);
      showMessage("伺服器錯誤", "error");
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setAccountInfo(null);
    showMessage("登出成功", "success");
  };

  return (
    <div>
      {loggedIn ? (
        <div>
          <h3>帳戶資訊</h3>
          <p><strong>UserName:</strong> {accountInfo.userName}</p>
          <button onClick={handleLogout}>登出</button>
        </div>
      ) : (
        <div>
          <h3>登入帳號</h3>
          <input 
            type="text" 
            placeholder="UserName" 
            value={loginName} 
            onChange={(e) => setLoginName(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={loginPassword} 
            onChange={(e) => setLoginPassword(e.target.value)} 
          />
          <button onClick={handleLogin}>登入</button>

          <h3>註冊帳號</h3>
          {!showRegister && (
            <button onClick={() => setShowRegister(true)}>
              註冊
            </button>
          )}
          {showRegister && (
            <div id="registration-form">
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
              <button onClick={handleRegister}>註冊</button>
              <button onClick={() => setShowRegister(false)}>返回</button>
            </div>
          )}
        </div>
      )}
      {/* 將訊息放在整個表單的最下方 */}
      {message && <p className={`message ${messageType}`}>{message}</p>}
    </div>
  );
};
