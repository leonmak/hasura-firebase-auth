import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { split } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import gql from "graphql-tag";
import React from "react";
import { ApolloProvider, Mutation, Subscription } from "react-apollo";

const PL_SUB = gql`
  subscription PL {
    programming_language(order_by: { vote_count: desc }) {
      name
      vote_count
    }
  }
`;

const PL_WITH_LOVE_SUB = gql`
  subscription PL_WITH_LOVE($userId: String!) {
    programming_language(order_by: { vote_count: desc }) {
      name
      vote_count
      loved_languages_aggregate(where: { user_id: { _eq: $userId } }) {
        aggregate {
          count
        }
      }
    }
  }
`;

const VOTE_MUTATION = gql`
  mutation Vote($name: String!) {
    update_programming_language(
      _inc: { vote_count: 1 }
      where: { name: { _eq: $name } }
    ) {
      returning {
        vote_count
      }
    }
  }
`;

const LOVE_MUTATION = gql`
  mutation Love($name: String!, $userId: String!) {
    insert_loved_language(objects: { name: $name , user_id: $userId }) {
      affected_rows
    }
  }
`;

const UNLOVE_MUTATION = gql`
  mutation Unlove($name: String!, $userId: String!) {
    delete_loved_language(where: {
      _and: [ 
        { user_id: { _eq: $userId } },
        { name: { _eq: $name } }
      ] 
    }) {
      affected_rows
    }
  }
`;

export default function App({ authState }) {
  const isIn = authState.status === "in";

  const headers = isIn ? { Authorization: `Bearer ${authState.token}` } : {};

  const httpLink = new HttpLink({
    uri: "http://localhost:8080/v1/graphql",
    headers
  });

  const wsLink = new WebSocketLink({
    uri: "ws://localhost:8080/v1/graphql",
    options: {
      reconnect: true,
      connectionParams: {
        headers
      },
      timeout: 30000,
    }
  });

  const link = split(
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query);
      return kind === "OperationDefinition" && operation === "subscription";
    },
    wsLink,
    httpLink
  );

  const client = new ApolloClient({
    link,
    cache: new InMemoryCache()
  });

  return (
    <ApolloProvider client={client}>
      <Subscription
        subscription={isIn ? PL_WITH_LOVE_SUB : PL_SUB}
        variables={isIn ? {userId: authState.user.uid} : null}
      >
        {({ data, loading, error }) => {
          if (loading) return "loading...";
          if (error) return error.message;

          return (
            <ul className="pl-list">
                {data.programming_language.map(pl => {
                const { name, vote_count } = pl;
                let content = null;
                if (isIn) {
                  const userId = authState.user.uid;
                  const isLoved = pl.loved_languages_aggregate.aggregate.count === 1;
                  if (isLoved) {
                    content = (
                      <Mutation mutation={UNLOVE_MUTATION} variables={{ name, userId }}>
                        {unlove => <button onClick={unlove}>Unlove</button>}
                      </Mutation>
                    );
                  } else {
                    content = (
                      <Mutation mutation={LOVE_MUTATION} variables={{ name, userId }}>
                        {love => <button onClick={love}>Love</button>}
                      </Mutation>
                    );
                  }
                }
                return (
                  <li key={name}>
                    <span>{`${name} - ${vote_count}`}</span>
                    <span>
                      <Mutation mutation={VOTE_MUTATION} variables={{ name }}>
                        {vote => <button onClick={vote}>Vote</button>}
                      </Mutation>
                      {content}
                    </span>
                  </li>
                );
              })}
            </ul>
          );
        }}
      </Subscription>
    </ApolloProvider>
  );
}