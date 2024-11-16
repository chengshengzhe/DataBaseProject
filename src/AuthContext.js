import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accountInfo, setAccountInfo] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const storedAccount = localStorage.getItem("accountInfo");
    if (storedAccount) {
      setAccountInfo(JSON.parse(storedAccount));
      setLoggedIn(true);
    }
  }, []);

  const signIn = (account) => {
    setAccountInfo(account);
    setLoggedIn(true);
    localStorage.setItem("accountInfo", JSON.stringify(account));
  };

  // 登出處理
  const signOut = () => {
    setAccountInfo(null);
    setLoggedIn(false);
    localStorage.removeItem("accountInfo");
  };

  return (
    <AuthContext.Provider value={{ accountInfo, loggedIn, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
