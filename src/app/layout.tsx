'use client';
import { ApolloWrapper } from './ApolloWraper.tsx';
import Header from '../components/header.tsx';
import { CookiesProvider } from 'react-cookie';
import '../style/layout.scss';
import { AuthBootstrap } from './AuthBootstrap.tsx';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CookiesProvider>
          <AuthBootstrap />
          <ApolloWrapper>
            <Header />
            {children}
          </ApolloWrapper>
        </CookiesProvider>
      </body>
    </html>
  );
}
