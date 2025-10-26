import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import AOS from 'aos';
import 'aos/dist/aos.css'; // You can also use <link> for styles
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
