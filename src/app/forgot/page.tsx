"use client";

import { gql, useMutation } from "@apollo/client";
import { TextField } from "@mui/material";
import React, { Dispatch, SetStateAction, useState } from "react";
import "@/style/forgot.scss"

const SEND_EMAIL = gql`
  mutation User($email: String!) {
    sendEmail(email: $email)
  }
`;

const Forgot = () => {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [sendEmail, { loading, error }] = useMutation(SEND_EMAIL);

  const sendToEmail = async () => {
    const checkResult = await sendEmail({
      variables: {
        email: email.trim(),
      },
    });
    
    if (checkResult.data.sendEmail === "Success") {
      setSent(true);
    } else {
      console.error("Error:", checkResult.data.sendEmail);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendToEmail();
  };

  const handleRetry = () => {
    setSent(false);
  };

  return (
    <main className="forgot_page">
      {!sent ? (
        <Email onSubmit={handleSubmit} setEmail={setEmail} email={email} />
      ) : (
        <Res onRetry={handleRetry} sendToEmail={sendToEmail} />
      )}
    </main>
  );
};

export default Forgot;

const Email = ({
  onSubmit,
  setEmail,
  email,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  setEmail: Dispatch<SetStateAction<string>>;
  email: string;
}) => {
  return (
    <section>
      <h2>Forgot password</h2>
      <form onSubmit={onSubmit}>
        <TextField
          required
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Send to mail</button>
      </form>
    </section>
  );
};

const Res = ({
  onRetry,
  sendToEmail,
}: {
  onRetry: () => void;
  sendToEmail: () => void;
}) => {
  return (
    <section>
      <h2>Successfully sent</h2>
      <div className="buttons">
        <button onClick={onRetry}>Back</button>
        <button onClick={sendToEmail}>Send Again</button>
      </div>
    </section>
  );
};
