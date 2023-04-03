import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import "./App.css";
import UserInfo from "./components/UserInfo";
import SetToken from "./components/SetToken";
import config from "./config";
import withAuth from './withAuth';


function LoginPage() {
  const handleLogin = () => {
    window.location.href = config.apiUrl;
  };

  return (
    <header className="App-header">
      <h1>Splitwise Login</h1>
      <button onClick={handleLogin} className="Login-button">
        Log in with Splitwise
      </button>
    </header>
  );
}

const Login = withAuth(LoginPage,  false);
const ProtectedUserInfo = withAuth(UserInfo, true);
const SetAuthToken = withAuth(SetToken, false);


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/set_auth_token"
            element={<SetAuthToken />}
          />
          <Route
            path="/user_info"
            element={<ProtectedUserInfo />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
