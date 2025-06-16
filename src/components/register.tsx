import { gql, useMutation } from "@apollo/client";
import { Button, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const ADD_USER = gql`
  mutation AddUser($email: String!, $password: String!) {
    addUser(email: $email, password: $password)
  }
`;

const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      user {
        resume {
          photo
          name
          place
          tags
          HTMLpart
        }
      }
    }
  }
`;


const Register = () => {

  const router = useRouter();
  const [addUser, { loading, error }] = useMutation(ADD_USER);
  const [loginUser] = useMutation(LOGIN_USER);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [retryPassword, setRetryPassword] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    try {
      if (!email.includes("@")) {
        throw new Error("Некоректний email");
      }
  
      if (password !== retryPassword) {
        throw new Error("Паролі не співпадають");
      }
  
      const registerResult = await addUser({
        variables: {
          email: email.trim(),
          password: password.trim()
        },
      });

      if (registerResult.data.addUser === "Success") {
        const loginResult = await loginUser({ variables: { email, password } });

        if (loginResult.data?.loginUser?.token) {
          localStorage.setItem("token", loginResult.data.loginUser.token);
          window.dispatchEvent(new Event("storage"));
          router.push("/profile");
        }
      }
    } catch (err) {
      console.error("Login error", err);
    }
  };
  

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        required
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        required
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <TextField
        required
        id="retry_password"
        label="Retry password"
        type="password"
        value={retryPassword}
        onChange={(e) => setRetryPassword(e.target.value)}
      />

      <Button type="submit" variant="contained" disabled={loading}>
        {loading ? "Logging in..." : "Register"}
      </Button>

      {error && <p style={{ color: "red" }}>Error: {error.message}</p>}

      <Button variant="outlined">Outlined</Button>
    </form>
  );
};

export default Register;
