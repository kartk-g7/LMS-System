import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Ping the backend on startup so Render's free-tier server is warm
// before the user makes their first real API call (cold start takes ~15-20s)
const BACKEND = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'https://lms-system-ua65.onrender.com';
fetch(`${BACKEND}/api/health`, { method: 'GET' }).catch(() => {/* silent — server may be sleeping */});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
