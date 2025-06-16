"use client"
import { ApolloWrapper } from './ApolloWraper.tsx';
import Header from '@/components/header.tsx';
import "@/style/layout.scss"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    
  return (
    <html lang="en">
      <body>
        <ApolloWrapper >
          <Header/>
          {children}
        </ApolloWrapper>
      </body>
    </html>
  );
}