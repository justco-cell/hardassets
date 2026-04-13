import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'

// Lazy load all route components — only download what's needed
const App = lazy(() => import('./App.jsx'))
const AppMobile = lazy(() => import('./AppMobile.jsx'))
const BlogModule = lazy(() => import('./Blog.jsx'))
const ComparePage = lazy(() => import('./Compare.jsx'))

const path = window.location.pathname

// Minimal loading spinner matching the dark theme
const Loader = () => (
  <div style={{background:'#0B0F1A',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
    <div style={{width:40,height:40,borderRadius:12,background:'linear-gradient(145deg,#D4A843,#B8912E)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:900,color:'#0B0F1A',animation:'pulse 1.5s ease-in-out infinite'}}>H</div>
    <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.7;transform:scale(0.95)}}`}</style>
  </div>
)

// Blog wrapper to handle named exports from lazy import
function BlogRoute({ slug }) {
  return (
    <Suspense fallback={<Loader />}>
      <BlogModule>
        {(mod) => slug ? <mod.BlogPost slug={slug} /> : <mod.BlogIndex />}
      </BlogModule>
    </Suspense>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))

if (path === '/compare' || path === '/compare/') {
  root.render(
    <React.StrictMode>
      <Suspense fallback={<Loader />}><ComparePage /></Suspense>
    </React.StrictMode>
  )
} else if (path === '/blog' || path === '/blog/') {
  // Need to handle named exports differently with lazy
  import('./Blog.jsx').then(({ BlogIndex }) => {
    root.render(<React.StrictMode><BlogIndex /></React.StrictMode>)
  })
} else if (path.startsWith('/blog/')) {
  const slug = path.replace('/blog/', '').replace(/\/$/, '')
  import('./Blog.jsx').then(({ BlogPost }) => {
    root.render(<React.StrictMode><BlogPost slug={slug} /></React.StrictMode>)
  })
} else {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768
  root.render(
    <React.StrictMode>
      <Suspense fallback={<Loader />}>
        {isMobile ? <AppMobile /> : <App />}
      </Suspense>
    </React.StrictMode>
  )
}
