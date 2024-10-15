import React, { useState } from 'react';
import "./Account.css";

export const Account = () => {
  // State for login and registration forms
  const [regID, setRegID] = useState('');
  const [regName, setRegName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [loginID, setLoginID] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // State to manage login and registration visibility
  const [loggedIn, setLoggedIn] = useState(false); // Simulates if the user is logged in
  const [accountExists, setAccountExists] = useState(false); // Simulates if the user has an account
  const [showRegister, setShowRegister] = useState(false); // To toggle registration form visibility
  const [accountInfo, setAccountInfo] = useState(null); // Stores account info once logged in

  // Registration function
  const handleRegister = () => {
    console.log(`Registering: UserID = ${regID}, Name = ${regName}, Password = ${regPassword}`);
    
    // Simulating account creation
    setAccountExists(true);
    alert('Account created successfully! Please login.');
    
    // Hide the registration form after registering
    setShowRegister(false);
    
    // Reset registration fields
    setRegID('');
    setRegName('');
    setRegPassword('');
  };

  // Login function
  const handleLogin = () => {
    console.log(`Logging in: UserID = ${loginID}, Password = ${loginPassword}`);
    
    // Simulating login
    if (loginID === regID && loginPassword === regPassword) {
      setLoggedIn(true);
      setAccountInfo({ userID: loginID, name: regName });
      alert('Logged in successfully!');
    } else {
      alert('Incorrect credentials. Please try again.');
    }

    // Reset login fields
    setLoginID('');
    setLoginPassword('');
  };

  // Logout function
  const handleLogout = () => {
    setLoggedIn(false);
    setAccountInfo(null);
    alert('登出成功!');
  };

  return (
    <div>
      {loggedIn ? (
        //登入顯示帳戶資訊
        <div>
          <h3>帳戶資訊</h3>
          <p><strong>UserID:</strong> {accountInfo.userID}</p>
          <p><strong>Name:</strong> {accountInfo.name}</p>
          <button onClick={handleLogout}>登出</button>
        </div>
      ) : (
        //未登入顯示登入表單
        <div>
          <h3>登入帳號</h3>
          <input 
            type="text" 
            placeholder="UserID" 
            value={loginID} 
            onChange={(e) => setLoginID(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={loginPassword} 
            onChange={(e) => setLoginPassword(e.target.value)} 
          />
          <button onClick={handleLogin}>登入</button>

          <h3>註冊帳號</h3>
          {/*註冊按鈕顯示註冊*/}
          {!showRegister && (
            <button onClick={() => setShowRegister(true)}>
              註冊
            </button>
          )}
          {showRegister && (
            <div id="registration-form">
              <input 
                type="text" 
                placeholder="UserID" 
                value={regID} 
                onChange={(e) => setRegID(e.target.value)} 
              />
              <input 
                type="text" 
                placeholder="Name" 
                value={regName} 
                onChange={(e) => setRegName(e.target.value)} 
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={regPassword} 
                onChange={(e) => setRegPassword(e.target.value)} 
              />
              <button onClick={handleRegister}>註冊</button>
              <button onClick={() => setShowRegister(false)}>返回</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
