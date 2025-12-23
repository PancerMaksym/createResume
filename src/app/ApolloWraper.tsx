'use client';

import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache,
} from '@apollo/experimental-nextjs-app-support';
import { HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

function makeClient() {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_DOMAIN,
    credentials: 'include',
    fetchOptions: {
      cache: 'no-store',
    },
  });

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    };
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: from([authLink, httpLink]),
  });
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
