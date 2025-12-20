'use client';
import { Avatar } from '@mui/material';
import React, { useEffect } from 'react';
import '../style/header.scss';
import AutoComplete from './autocomplate.tsx';
import Link from 'next/link';
import { gql, useQuery } from '@apollo/client';

const GET_USER = gql`
  query GetProfile {
    getProfile {
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
  const { loading, data, refetch } = useQuery<Resume>(GET_USER, {
    fetchPolicy: 'network-only',
  });

  const updateData = async () => {
    await refetch();
  };
  useEffect(() => {
    subscribe('auth:changed', updateData);
  });

  if (loading) {
    return <div className="header">Loading...</div>;
  }
  
  return (
    <div className="header">
      <Link className="main_button" href="/">
        Main
      </Link>
      <div className="right">
        <AutoComplete />
        <Link href={data ? '/profile' : '/register'}>
          <Avatar>{data ? `${data.photo}` && 'P' : 'R'}</Avatar>
        </Link>
      </div>
    </div>
  );
};

function subscribe(eventName: string, listener: () => void) {
  document.addEventListener(eventName, listener);
}

function unsubscribe(eventName: string, listener: () => void) {
  document.removeEventListener(eventName, listener);
}

async function publish(eventName: string) {
  const event = new Event(eventName);
  await document.dispatchEvent(event);
}

export default Header;
export { publish };
