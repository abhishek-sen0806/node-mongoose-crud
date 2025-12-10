import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Import custom styles
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
