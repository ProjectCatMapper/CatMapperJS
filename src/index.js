import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';

ReactDOM.render(
  <BrowserRouter basename="/js">
      <Auth0Provider
    domain="dev-onnldmkcx3jun1em.us.auth0.com"
    clientId="2QWgZvzukTh348ToXR7RbvgiaulSmSfc"
    authorizationParams={{
      redirect_uri: 'http://localhost:3000/Profile/'
    }}
  >
      <App />
  </Auth0Provider>
   </BrowserRouter>,
  document.getElementById("root")
);