'use client';
import { gql, useMutation } from '@apollo/client';
import { TextField } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import '../../style/reset.scss';

const SET_NEW_PASSWORD = gql`
  mutation UpdateUser($token: String!, $password: String!) {
    updateUser(token: $token, password: $password)
  }
`;

const ResetPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
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

    if (checkResult.data.updateUser === 'Success') {
      router.push('/register');
    } else {
      console.error('Error:', checkResult.errors);
    }
  };

  if(loading){
    return (
      <h3>loading...</h3>
    )
  }

  if(error){
    return (
      <h3>${error?.message}</h3>
    )
  }

  return (
    <main className="reset_page">
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
