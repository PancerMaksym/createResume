"use client";
import { gql, useMutation } from "@apollo/client";
import { TextField } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

const SET_NEW_PASSWORD = gql`
  mutation setNewPassword($token: String!, $password: String!) {
    setNewPassword(token: $token, password: $password)
  }
`;

const ResetPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [setNewPassword, { loading, error }] = useMutation(SET_NEW_PASSWORD);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const checkResult = await setNewPassword({
      variables: {
        token,
        password,
      },
    });

    if (checkResult.data.setNewPassword === "Success") {
      router.push("/register");
    } else {
      console.error("Error:", checkResult.data.setNewPassword);
    }
  };

  return (
    <main>
      <h2>Reset password</h2>
      <form onSubmit={onSubmit}>
        <TextField
          required
          id="password"
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Send to mail</button>
      </form>
    </main>
  );
};

export default ResetPage;
