"use client";
import { Avatar } from "@mui/material";
import React, { useEffect, useState } from "react";
import "../style/header.scss";
import AutoComplete from "./autocomplate.tsx";
import Link from "next/link";

const Header = () => {
  const [token, setToken] = useState<string | null>(null);

  const handleStorageChange = () => {
    const storedToken = localStorage.getItem("token") || "";
    setToken(storedToken);
  };

  useEffect(() => {
    handleStorageChange(); // ← Викликаємо функцію одразу при завантаженні
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  if (token === null) {
    return <div className="header">Loading...</div>;
  }

  return (
    <div className="header">
      <Link href="/">Text</Link>
      <div className="right">
        <AutoComplete />
        <Link href={token ? "/profile" : "/register"}>
          <Avatar>{token ? "P" : "R"}</Avatar>
        </Link>
      </div>
    </div>
  );
};

export default Header;
