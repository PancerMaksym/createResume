"use client";
import { Avatar } from "@mui/material";
import React from "react";
import "../style/header.scss";
import AutoComplete from "./autocomplate.tsx";
import Link from "next/link";
import { gql, useQuery } from "@apollo/client";

const GET_USER = gql`
  query GetProfile{
    getProfile{
      id
      name
      photo
    }
  }
`;

interface Resume {
  name: string;
  photo: string;
}

const Header = () => {
  const { loading, data } = useQuery<Resume>(GET_USER);

  if (loading) {
    return <div className="header">Loading...</div>;
  }

  return (
    <div className="header">
      <Link className="main_button" href="/">Text</Link>
      <div className="right">
        <AutoComplete />
        <Link href={data ? "/profile" : "/register"}>
          <Avatar>{data ?  (`${data.photo}` && "P") : "R"}</Avatar>
        </Link>
      </div>
    </div>
  );
};

export default Header;
