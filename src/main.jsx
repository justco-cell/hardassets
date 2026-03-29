import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AppMobile from './AppMobile.jsx'

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isMobile ? <AppMobile /> : <App />}
  </React.StrictMode>,
)
