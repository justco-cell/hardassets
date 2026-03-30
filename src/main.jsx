import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AppMobile from './AppMobile.jsx'
import { BlogIndex, BlogPost } from './Blog.jsx'
import ComparePage from './Compare.jsx'

const path = window.location.pathname

// Compare page
if (path === '/compare' || path === '/compare/') {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode><ComparePage /></React.StrictMode>
  )
} else if (path === '/blog' || path === '/blog/') {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode><BlogIndex /></React.StrictMode>
  )
} else if (path.startsWith('/blog/')) {
  const slug = path.replace('/blog/', '').replace(/\/$/, '')
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode><BlogPost slug={slug} /></React.StrictMode>
  )
} else {
  // Main app — mobile detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      {isMobile ? <AppMobile /> : <App />}
    </React.StrictMode>
  )
}
