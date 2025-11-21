'use client';

import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache,
} from "@apollo/experimental-nextjs-app-support";
import { HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

function makeClient() {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_DOMAIN,
    fetchOptions: { cache: "no-store" },
  });

  console.log("GraphQL:", process.env.NEXT_PUBLIC_GRAPHQL_DOMAIN);

  const authLink = setContext((_, { headers }) => {
    if (typeof window === "undefined") return { headers };

    return {
      headers: {
        ...headers,
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
