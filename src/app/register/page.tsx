"use client";

import { Button } from "@mui/material";
import { useState } from "react";
import Login from "../../components/login";
import Register from "../../components/register";
import "../../style/register.scss";

const LogReg = () => {
  const [isLogin, setLogin] = useState(true);

  return (
    <main className="login_page">
      <div className="form">
        <div className="chose">
          <Button onClick={() => setLogin(true)} variant="contained" className={isLogin ? "active login": "login"}>
            Login
          </Button>
          <Button onClick={() => setLogin(false)} variant="contained" className={isLogin ? "register": "active register"}>
            Register
          </Button>
        </div>
        {isLogin ? (
          <div>
            <Login />
          </div>
        ) : (
          <div>
            <Register />
          </div>
        )}
      </div>
    </main>
  );
};

export default LogReg;
