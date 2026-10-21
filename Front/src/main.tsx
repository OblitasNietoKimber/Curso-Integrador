import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/tokens.css';
import './styles/global.css';
import './styles/login.css';
import './styles/home.css';
import './styles/carta.css';
import './styles/promotions.css';
import './styles/membership.css';
import './styles/checkout.css';
import './styles/checkout-responsive.css';
import './styles/embers.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
