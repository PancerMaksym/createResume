'use client';

import { useEffect } from 'react';

export function AuthBootstrap() {
  useEffect(() => {
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('access_token='))
      ?.split('=')[1];

    const localToken = localStorage.getItem('access_token');

    if (cookieToken && !localToken) {
      localStorage.setItem('access_token', cookieToken);
    }
  }, []);

  return null;
}
