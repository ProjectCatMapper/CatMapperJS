import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
// import { Neo4jProvider, createDriver } from 'use-neo4j'// Create driver instance
// const driver = createDriver('neo4j', 'https://sociomap.rc.asu.edu', 7687, 'neo4j', 'sociomap')
/*
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const client = new ApolloClient({

  uri: 'sociomap.rc.asu.edu:7474',

  cache: new InMemoryCache(),

});
*/
ReactDOM.render(
  <BrowserRouter basename="/js">
      <Auth0Provider
    domain="dev-onnldmkcx3jun1em.us.auth0.com"
    clientId="2QWgZvzukTh348ToXR7RbvgiaulSmSfc"
    authorizationParams={{
      redirect_uri: 'http://localhost:3000/Profile/'
    }}
  >
      {/* <Neo4jProvider driver={driver}> */}
      <App />
    {/* </Neo4jProvider> */}
  </Auth0Provider>
   </BrowserRouter>,
  document.getElementById("root")
);