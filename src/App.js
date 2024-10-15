import "./App.css";
import NavBar from "./components/NavBar";
import { BrowserRouter as Router,  Route, Routes } from "react-router-dom";
import { Home } from "./components/Pages/Home";
import { BookList } from "./components/Pages/BookList";
import { Account } from "./components/Pages/Account";

function App() {
  return (
    <>
      <Router>
        <NavBar />
        <div className="pages">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/BookList" element={<BookList />} />
            <Route path="/Account" element={<Account />} />
          </Routes>
        </div>
      </Router>
  </>
  );
}

export default App;
