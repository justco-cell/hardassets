import React, { useState, useEffect } from "react";
import { POSTS, getPost } from "./blog-data.js";

const P={bg:"#0B0F1A",surface:"#111827",elevated:"#1E293B",border:"rgba(148,163,184,0.08)",gold:"#D4A843",goldSoft:"rgba(212,168,67,0.1)",green:"#34D399",text:"#F1F5F9",txS:"#94A3B8",txM:"#475569"};
const ff="'Inter',-apple-system,sans-serif";

function updateMeta(title,description,url,type="article"){
  document.title=title;
  const set=(attr,val,prop)=>{let el=document.querySelector(`meta[${attr}="${prop}"]`);if(!el){el=document.createElement("meta");el.setAttribute(attr,prop);document.head.appendChild(el)}el.setAttribute("content",val)};
  set("name","description",description);
  set("property","og:title",title);
  set("property","og:description",description);
  set("property","og:url",url);
  set("property","og:type",type);
  set("name","twitter:title",title);
  set("name","twitter:description",description);
  let canon=document.querySelector('link[rel="canonical"]');
  if(canon)canon.href=url;
}

function Logo({onClick}){
  return <div onClick={onClick} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
    <div style={{width:32,height:32,borderRadius:10,background:`linear-gradient(145deg,${P.gold},#B8912E)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:P.bg}}>H</div>
    <span style={{fontSize:17,fontWeight:800,color:P.text,letterSpacing:-.5}}>Hard<span style={{color:P.gold}}>Assets</span></span>
  </div>;
}

function Nav({current}){
  return <nav style={{position:"sticky",top:0,zIndex:100,padding:"14px 40px",display:"flex",justifyContent:"space-between",alignItems:"center",backdropFilter:"blur(20px)",background:"rgba(11,15,26,.9)",borderBottom:"1px solid "+P.border}}>
    <div style={{display:"flex",alignItems:"center",gap:28}}>
      <Logo onClick={()=>window.location.href="/"}/>
      <a href="/blog" style={{fontSize:13,fontWeight:current==="blog"?700:400,color:current==="blog"?P.gold:P.txS,textDecoration:"none"}}>Blog</a>
    </div>
    <a href="/" style={{padding:"8px 18px",borderRadius:10,background:`linear-gradient(135deg,${P.gold},#B8912E)`,color:P.bg,fontSize:13,fontWeight:700,textDecoration:"none"}}>Track Your Assets Free →</a>
  </nav>;
}

function CTA(){
  return <div style={{margin:"60px 0 0",padding:"48px 32px",background:P.surface,borderRadius:20,border:"1px solid "+P.border,textAlign:"center"}}>
    <div style={{fontSize:24,fontWeight:800,color:P.text,marginBottom:8}}>Ready to Track Your <span style={{color:P.gold}}>Hard Assets</span>?</div>
    <p style={{fontSize:15,color:P.txS,maxWidth:480,margin:"0 auto 24px",lineHeight:1.6}}>Gold, silver, real estate syndications, crypto, private notes, collectibles — all in one free dashboard with live prices.</p>
    <a href="/" style={{display:"inline-block",padding:"14px 32px",borderRadius:14,background:`linear-gradient(135deg,${P.gold},#B8912E)`,color:P.bg,fontSize:15,fontWeight:700,textDecoration:"none"}}>Start Tracking Free — No Credit Card →</a>
  </div>;
}

function Footer(){
  return <footer style={{borderTop:"1px solid "+P.border,padding:"32px 0",marginTop:60,textAlign:"center"}}>
    <div style={{fontSize:12,color:P.txM}}>© 2026 <a href="/" style={{color:P.gold,textDecoration:"none"}}>HardAssets.io</a> — Track Everything That Holds Value</div>
  </footer>;
}

export function BlogIndex(){
  useEffect(()=>{
    updateMeta(
      "HardAssets.io Blog — Hard Asset Investing Insights",
      "Articles on tracking precious metals, real estate syndications, crypto portfolios, and alternative hard asset investments. Tips, strategies, and guides for hard asset investors.",
      "https://hardassets.io/blog",
      "website"
    );
  },[]);

  return <div style={{background:P.bg,minHeight:"100vh",color:P.text,fontFamily:ff}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');a:hover{opacity:0.85}`}</style>
    <Nav current="blog"/>
    <div style={{maxWidth:800,margin:"0 auto",padding:"48px 24px 80px"}}>
      <h1 style={{fontSize:36,fontWeight:900,letterSpacing:-1,marginBottom:8}}>HardAssets.io <span style={{color:P.gold}}>Blog</span></h1>
      <p style={{fontSize:16,color:P.txS,marginBottom:40,lineHeight:1.6}}>Insights on precious metals, real estate syndications, crypto, and hard asset investing.</p>

      <div style={{display:"flex",flexDirection:"column",gap:24}}>
        {POSTS.map(post=><a key={post.slug} href={"/blog/"+post.slug} style={{textDecoration:"none",color:"inherit"}}>
          <article style={{background:P.surface,border:"1px solid "+P.border,borderRadius:16,padding:28,transition:"all 0.2s",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.borderColor=P.gold+"44"} onMouseLeave={e=>e.currentTarget.style.borderColor=P.border}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <time dateTime={post.date} style={{fontSize:12,color:P.txM,fontFamily:"monospace"}}>{new Date(post.date).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</time>
              <span style={{fontSize:10,color:P.gold,background:P.goldSoft,padding:"2px 8px",borderRadius:5,fontWeight:600}}>Article</span>
            </div>
            <h2 style={{fontSize:20,fontWeight:700,color:P.text,marginBottom:10,lineHeight:1.3}}>{post.title}</h2>
            <p style={{fontSize:14,color:P.txS,lineHeight:1.6,margin:0}}>{post.excerpt}</p>
            <div style={{marginTop:14,fontSize:13,fontWeight:600,color:P.gold}}>Read more →</div>
          </article>
        </a>)}
      </div>

      <CTA/>
      <Footer/>
    </div>
  </div>;
}

export function BlogPost({slug}){
  const[post,setPost]=useState(null);

  useEffect(()=>{
    const p=getPost(slug);
    if(!p){window.location.href="/blog";return}
    setPost(p);
    updateMeta(
      p.title+" — HardAssets.io Blog",
      p.metaDescription,
      "https://hardassets.io/blog/"+p.slug
    );
    // Add article structured data
    let script=document.getElementById("blog-jsonld");
    if(!script){script=document.createElement("script");script.id="blog-jsonld";script.type="application/ld+json";document.head.appendChild(script)}
    script.textContent=JSON.stringify({
      "@context":"https://schema.org",
      "@type":"Article",
      "headline":p.title,
      "description":p.metaDescription,
      "datePublished":p.date,
      "dateModified":p.date,
      "url":"https://hardassets.io/blog/"+p.slug,
      "author":{"@type":"Organization","name":"HardAssets.io","url":"https://hardassets.io"},
      "publisher":{"@type":"Organization","name":"HardAssets.io","url":"https://hardassets.io","logo":{"@type":"ImageObject","url":"https://hardassets.io/icon-512.png"}},
      "mainEntityOfPage":{"@type":"WebPage","@id":"https://hardassets.io/blog/"+p.slug},
      "image":"https://hardassets.io/og-image.png"
    });
    window.scrollTo(0,0);
    return()=>{const el=document.getElementById("blog-jsonld");if(el)el.remove()};
  },[slug]);

  if(!post)return null;

  return <div style={{background:P.bg,minHeight:"100vh",color:P.text,fontFamily:ff}}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
      .blog-content{font-size:17px;line-height:1.8;color:#CBD5E1}
      .blog-content h2{font-size:22px;font-weight:800;color:#F1F5F9;margin:36px 0 16px;letter-spacing:-0.3px}
      .blog-content h3{font-size:18px;font-weight:700;color:#F1F5F9;margin:28px 0 12px}
      .blog-content p{margin:0 0 18px}
      .blog-content ul,.blog-content ol{margin:0 0 18px;padding-left:24px}
      .blog-content li{margin-bottom:8px}
      .blog-content strong{color:#F1F5F9;font-weight:700}
      .blog-content a{color:#D4A843;text-decoration:underline}
      .blog-content blockquote{border-left:3px solid #D4A843;padding:12px 20px;margin:24px 0;background:rgba(212,168,67,0.05);border-radius:0 8px 8px 0;font-style:italic}
    `}</style>
    <Nav current="blog"/>
    <article style={{maxWidth:720,margin:"0 auto",padding:"48px 24px 80px"}}>
      <a href="/blog" style={{fontSize:13,color:P.txS,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:6,marginBottom:24}}>← Back to Blog</a>
      <header>
        <time dateTime={post.date} style={{fontSize:13,color:P.txM,fontFamily:"monospace",display:"block",marginBottom:12}}>{new Date(post.date).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</time>
        <h1 style={{fontSize:"clamp(28px,4vw,38px)",fontWeight:900,lineHeight:1.2,letterSpacing:-0.5,marginBottom:24}}>{post.title}</h1>
        <p style={{fontSize:17,color:P.txS,lineHeight:1.6,marginBottom:32,paddingBottom:32,borderBottom:"1px solid "+P.border}}>{post.excerpt}</p>
      </header>
      <div className="blog-content" dangerouslySetInnerHTML={{__html:post.content}}/>
      <CTA/>
      <Footer/>
    </article>
  </div>;
}
