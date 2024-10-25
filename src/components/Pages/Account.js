import React, { useState } from 'react';
import "./Account.css";

export const Account = () => {
  // State for login and registration forms
  const [regEmail, setRegEmail] = useState('');
  const [regName, setRegName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // State to manage login and registration visibility
  const [loggedIn, setLoggedIn] = useState(false); // Simulates if the user is logged in
  const [accountExists, setAccountExists] = useState(false); // Simulates if the user has an account
  const [showRegister, setShowRegister] = useState(false); // To toggle registration form visibility
  const [accountInfo, setAccountInfo] = useState(null); // Stores account info once logged in

  // Registration function
  const handleRegister = () => {
    console.log(`Registering: Name = ${regName}, Password = ${regPassword},Email = ${regEmail},`);
    
    // Simulating account creation
    setAccountExists(true);
    alert('Account created successfully! Please login.');
    
    // Hide the registration form after registering
    setShowRegister(false);
    
    // Reset registration fields
    setRegName('');
    setRegPassword('');
    setRegEmail('');
  };

  // Login function
  const handleLogin = () => {
    console.log(`Logging in: UserName = ${loginName}, Password = ${loginPassword}`);
    
    // Simulating login
    if (loginName === regName && loginPassword === regPassword) {
      setLoggedIn(true);
      setAccountInfo({ userName: loginName, name: regName });
      alert('登入成功');
    } else {
      alert('Incorrect credentials. Please try again.');
    }

    // Reset login fields
    setLoginName('');
    setLoginPassword('');
  };

  // Logout function
  const handleLogout = () => {
    setLoggedIn(false);
    setAccountInfo(null);
    alert('登出成功');
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
                onChange={(e) => setEmail(e.target.value)} 
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
