import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import ReactGA from 'react-ga';

ReactGA.initialize('G-H2ZNVXG1SE');

ReactGA.pageview(window.location.pathname + window.location.search)

ReactDOM.render(
  <AuthProvider>
  <BrowserRouter>
      <App />
   </BrowserRouter>
   </AuthProvider>
,
  document.getElementById("root")
);