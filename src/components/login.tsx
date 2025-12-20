import { gql, useMutation } from '@apollo/client';
import { Button, TextField } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import {publish} from './../components/header'

const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!) {
    login(createUserInput: { email: $email, password: $password })
  }
`;

const Login = () => {
  const router = useRouter();
  const [loginUser, { loading, error }] = useMutation(LOGIN_USER);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const { data } = await loginUser({
        variables: { email, password },
      });

      if (data.login) {
        publish('auth:changed');
        router.push('/profile');
      }
    } catch (err) {
      console.error('Login error', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="input">
      <TextField
        required
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div className="password">
        <TextField
          required
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <Link href="/forgot" passHref className="forgot">
          <Button variant="text">Forgot password</Button>
        </Link>
      </div>

      <Button
        className="submit"
        type="submit"
        variant="contained"
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'LogIn'}
      </Button>

      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
    </form>
  );
};

export default Login;
