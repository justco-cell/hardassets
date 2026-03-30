import React, { useState, useEffect } from "react";

const P={bg:"#0B0F1A",surface:"#111827",elevated:"#1E293B",border:"rgba(148,163,184,0.08)",gold:"#D4A843",goldSoft:"rgba(212,168,67,0.1)",goldMed:"rgba(212,168,67,0.2)",green:"#34D399",red:"#F87171",blue:"#60A5FA",purple:"#A78BFA",text:"#F1F5F9",txS:"#94A3B8",txM:"#475569"};
const ff="'Inter',-apple-system,sans-serif",mono="'JetBrains Mono',monospace";

function Logo(){return<div onClick={()=>window.location.href="/"} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:10}}><div style={{width:32,height:32,borderRadius:10,background:`linear-gradient(145deg,${P.gold},#B8912E)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:P.bg}}>H</div><span style={{fontSize:17,fontWeight:800,color:P.text,letterSpacing:-.5}}>Hard<span style={{color:P.gold}}>Assets</span></span></div>}

function Nav(){return<nav style={{position:"sticky",top:0,zIndex:100,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",backdropFilter:"blur(20px)",background:"rgba(11,15,26,.9)",borderBottom:"1px solid "+P.border}}><div style={{display:"flex",alignItems:"center",gap:20}}><Logo/><a href="/blog" style={{fontSize:13,color:P.txS,textDecoration:"none"}}>Blog</a><a href="/compare" style={{fontSize:13,fontWeight:700,color:P.gold,textDecoration:"none"}}>Compare</a></div><a href="/?demo=1" style={{padding:"8px 16px",borderRadius:10,background:`linear-gradient(135deg,${P.gold},#B8912E)`,color:P.bg,fontSize:12,fontWeight:700,textDecoration:"none",whiteSpace:"nowrap"}}>Try Demo →</a></nav>}

const Ck=()=><span style={{display:"inline-flex",width:22,height:22,borderRadius:11,background:"#34D399",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{color:"#fff",fontSize:12,fontWeight:800,lineHeight:1}}>✓</span></span>;
const Xx=()=><span style={{display:"inline-flex",width:22,height:22,borderRadius:11,background:"rgba(248,113,113,0.2)",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{color:"#F87171",fontSize:12,fontWeight:800,lineHeight:1}}>✗</span></span>;
const Lm=()=><span style={{display:"inline-flex",width:22,height:22,borderRadius:11,background:"rgba(251,191,36,0.2)",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{color:"#FBBF24",fontSize:10,fontWeight:800,lineHeight:1}}>~</span></span>;

const SL=({children})=><div style={{fontSize:11,color:P.gold,textTransform:"uppercase",letterSpacing:3,fontWeight:700,marginBottom:12,textAlign:"center"}}>{children}</div>;
const ST=({children})=><div style={{fontSize:"clamp(26px,3.5vw,40px)",fontWeight:800,letterSpacing:"-0.02em",marginBottom:16,lineHeight:1.15,textAlign:"center"}}>{children}</div>;

const cats=[
  {name:"Pricing",rows:[
    {f:"Price",ha:"Free forever",ku:"$249/yr",gf:"Free",mo:"$14.99/mo",em:"Free",co:"$95/yr",haG:true,kuG:false,gfG:true,moG:false,emG:true,coG:false},
    {f:"10-Year Cost",ha:"$0",ku:"$2,490",gf:"$0",mo:"$1,800",em:"$0",co:"$950",haG:true,kuG:false,gfG:true,moG:false,emG:true,coG:false,highlight:true},
  ]},
  {name:"Hard Asset Tracking",rows:[
    {f:"Physical Metals",ha:"8 units, oz, live spot",ku:"Manual entry",gf:"Full, dedicated",mo:"—",em:"—",co:"—",haG:true,kuG:true,gfG:true},
    {f:"RE Syndications",ha:"16 types, IRR, sponsor",ku:"Capital calls",gf:"—",mo:"—",em:"—",co:"—",haG:true,kuG:true},
    {f:"Collectibles & Art",ha:"Watch, wine, art, car",ku:"Manual entry",gf:"—",mo:"—",em:"—",co:"—",haG:true,kuG:true},
    {f:"Notes & Lending",ha:"Hard money, P2P",ku:"—",gf:"—",mo:"—",em:"—",co:"—",haG:true},
  ]},
  {name:"Real Estate",rows:[
    {f:"Physical Properties",ha:"Equity, CF, cap rate",ku:"Zillow integration",gf:"—",mo:"Basic Zillow",em:"Basic Zillow",co:"Basic",haG:true,kuG:true,moG:true,emG:true,coG:true},
    {f:"Deal Analyzer",ha:"CoC, DSCR, pass/fail",ku:"—",gf:"—",mo:"—",em:"—",co:"—",haG:true},
  ]},
  {name:"Crypto & Digital",rows:[
    {f:"Crypto",ha:"20+ coins, CoinGecko",ku:"Extensive + DeFi",gf:"—",mo:"Basic",em:"Basic",co:"Basic",haG:true,kuG:true,moG:true,emG:true,coG:true},
    {f:"Live Spot Prices",ha:"Metals + Crypto + FX",ku:"Yes",gf:"Metals only",mo:"—",em:"Stocks only",co:"Stocks only",haG:true,kuG:true,gfG:true,emG:true,coG:true},
  ]},
  {name:"Analysis Tools",rows:[
    {f:"Risk Scoring",ha:"1-10, color coded",ku:"—",gf:"—",mo:"—",em:"—",co:"—",haG:true},
    {f:"Target Allocation",ha:"11 classes, visual bars",ku:"—",gf:"—",mo:"Budget-based",em:"Basic",co:"—",haG:true,moG:true,emG:true},
    {f:"Income Projections",ha:"Auto from rate%",ku:"—",gf:"—",mo:"Yes",em:"—",co:"—",haG:true,moG:true},
    {f:"CSV Import/Export",ha:"All tabs",ku:"Yes",gf:"Yes",mo:"Yes",em:"—",co:"—",haG:true,kuG:true,gfG:true,moG:true},
  ]},
  {name:"Access & Platform",rows:[
    {f:"Guest Mode",ha:"Full demo, no sign-up",ku:"14-day trial",gf:"Yes",mo:"7-day trial",em:"Yes",co:"30-day trial",haG:true,gfG:true,emG:true},
    {f:"Bank Sync",ha:"Manual (by design)",ku:"20,000+ Plaid",gf:"—",mo:"Plaid",em:"Plaid",co:"Plaid",kuG:true,moG:true,emG:true,coG:true},
    {f:"Budgeting",ha:"—",ku:"—",gf:"—",mo:"Full",em:"Full",co:"Full",moG:true,emG:true,coG:true},
    {f:"Mobile",ha:"PWA + Play Store",ku:"PWA",gf:"iOS + Android",mo:"iOS + Android",em:"iOS + Android",co:"iOS + Mac",haG:true,kuG:true,gfG:true,moG:true,emG:true,coG:true},
  ]},
];
const compNames=["Kubera","GoldFolio","Monarch","Empower","Copilot"];
const compKeys=["ku","gf","mo","em","co"];

const deepDives=[
  {name:"Kubera",price:"$249/year",
    theyDo:["Connects to 20,000+ banks via Plaid","Deep DeFi/NFT tracking with wallet sync","Estate planning 'dead man\\'s switch'","Clean, modern interface"],
    weDo:["Free forever vs $2,490 over 10 years","Built-in Deal Analyzer (CoC, DSCR)","Risk scoring (1-10) per asset","Notes & Lending tab","Target vs Actual allocation bars","Oz-per-unit metal conversion"],
    chooseThem:"You need bank syncing and deep DeFi/NFT tracking",chooseUs:"You're focused on hard assets and don't want to pay $249/year"},
  {name:"GoldFolio",price:"Free",
    theyDo:["Best metals-only UX","Clean, focused design","Native iOS + Android apps"],
    weDo:["Tracks 6 asset types, not just metals","Deal Analyzer for RE","Risk scoring and target allocation","Income projections","Markets page with crypto + forex"],
    chooseThem:"You ONLY hold physical metals and nothing else",chooseUs:"You own metals AND any other alternative asset"},
  {name:"Monarch Money",price:"$14.99/mo",
    theyDo:["Best budgeting app (WSJ, Forbes)","Full bank/credit card sync","Couples collaboration features","Clean spending analytics"],
    weDo:["Free vs $180/year","Physical metals with oz conversion","RE syndications with IRR","Deal analysis and risk scoring","Collectibles and private notes"],
    chooseThem:"You want full budgeting + bank syncing for everyday spending",chooseUs:"Your wealth is primarily in hard assets, not bank accounts"},
  {name:"Empower",price:"Free",
    theyDo:["Most popular free net worth tracker","Excellent stock/bond portfolio analysis","Retirement planner","Investment fee analyzer"],
    weDo:["No upselling or wealth management sales calls","Physical metals tracking","RE syndications and LP positions","Collectibles, notes, deal analysis","No ads or upsells inside the dashboard"],
    chooseThem:"You're a traditional stock/bond investor open to wealth management",chooseUs:"You don't want to be a sales lead"},
  {name:"Copilot Money",price:"$95/year",
    theyDo:["Apple Design Award finalist","Beautiful native iOS experience","AI-powered transaction categorization","Premium feel and polish"],
    weDo:["Free vs $95/year","Works on any device (web + Android)","Metals, syndications, collectibles","Deal analysis and risk scoring","CSV import/export on every tab"],
    chooseThem:"You're an Apple user who wants premium budgeting",chooseUs:"You need hard asset tracking on any device"},
];

export default function ComparePage(){
  const[openAcc,setOpenAcc]=useState(null);
  const[mobileComp,setMobileComp]=useState(0);
  const[isMobile,setIsMobile]=useState(typeof window!=="undefined"&&window.innerWidth<768);

  useEffect(()=>{
    document.title="HardAssets.io vs Kubera vs GoldFolio vs Monarch — Feature Comparison";
    const set=(a,v,p)=>{let el=document.querySelector(`meta[${a}="${p}"]`);if(!el){el=document.createElement("meta");el.setAttribute(a,p);document.head.appendChild(el)}el.setAttribute("content",v)};
    set("name","description","Compare HardAssets.io against Kubera, GoldFolio, Monarch Money, Empower, and Copilot. Free hard asset portfolio tracker with more features than paid alternatives.");
    set("property","og:title","HardAssets.io vs Competitors — Feature Comparison");
    set("property","og:description","The only free dashboard built for hard asset investors. Compare against Kubera ($249/yr), Monarch ($180/yr), and more.");
    set("property","og:url","https://hardassets.io/compare");
    let canon=document.querySelector('link[rel="canonical"]');if(canon)canon.href="https://hardassets.io/compare";
    const onResize=()=>setIsMobile(window.innerWidth<768);
    window.addEventListener("resize",onResize);return()=>window.removeEventListener("resize",onResize);
  },[]);

  const selComp=compKeys[mobileComp];

  return<div style={{background:P.bg,minHeight:"100vh",color:P.text,fontFamily:ff}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');`}</style>
    <Nav/>

    {/* Hero */}
    <div style={{textAlign:"center",padding:isMobile?"48px 20px 40px":"80px 24px 60px",position:"relative"}}>
      <div style={{position:"absolute",top:-100,left:"50%",transform:"translateX(-50%)",width:600,height:400,background:"radial-gradient(ellipse,rgba(212,168,67,.06),transparent)",pointerEvents:"none"}}/>
      <div style={{position:"relative",maxWidth:720,margin:"0 auto"}}>
        <h1 style={{fontSize:"clamp(32px,5vw,48px)",fontWeight:800,lineHeight:1.1,letterSpacing:"-0.02em",marginBottom:20}}>The Only Dashboard Built for What You <span style={{color:P.gold}}>Actually Own</span></h1>
        <p style={{fontSize:isMobile?16:18,color:P.txS,lineHeight:1.6,maxWidth:580,margin:"0 auto 16px"}}>Most portfolio trackers were built for stocks and ETFs. HardAssets was built for gold bars, rental properties, syndication deals, and everything Wall Street ignores.</p>
        <p style={{fontSize:13,color:P.txM}}>Comparing HardAssets against 5 popular alternatives — honestly and transparently.</p>
      </div>
    </div>

    {/* Problem */}
    <div style={{padding:isMobile?"48px 16px":"60px 24px",maxWidth:1100,margin:"0 auto"}}>
      <SL>The Problem</SL>
      <ST>Why Generic Trackers <span style={{color:P.gold}}>Don't Work</span></ST>
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(3,1fr)",gap:16,marginTop:32}}>
        {[
          ["Metals-Only Apps","GoldFolio tracks gold beautifully — but what about your syndications, crypto, and rental properties? You end up with 4 apps and a spreadsheet."],
          ["Stock-Heavy Apps","Monarch, Empower, Copilot were built for bank accounts and ETFs. Try tracking a 100oz gold bar or a syndication with projected IRR. They can't."],
          ["Premium Pricing","Kubera is excellent — but $249/year means $2,490 over a decade just to see your net worth. HardAssets does more for $0."]
        ].map(([t,d],i)=><div key={i} style={{background:P.surface,border:"1px solid "+P.border,borderRadius:16,padding:isMobile?20:28}}>
          <div style={{fontSize:16,fontWeight:700,marginBottom:8}}>{t}</div>
          <div style={{fontSize:14,color:P.txS,lineHeight:1.6}}>{d}</div>
        </div>)}
      </div>
    </div>

    {/* Comparison Table */}
    <div style={{padding:isMobile?"48px 16px":"60px 24px",background:P.surface,borderTop:"1px solid "+P.border,borderBottom:"1px solid "+P.border}}>
      <div style={{maxWidth:1200,margin:"0 auto"}}>
        <SL>Head-to-Head</SL>
        <ST>Feature-by-Feature <span style={{color:P.gold}}>Comparison</span></ST>

        {isMobile?(
          /* MOBILE TABLE */
          <div style={{marginTop:24}}>
            <select value={mobileComp} onChange={e=>setMobileComp(+e.target.value)} style={{background:P.elevated,border:"1px solid "+P.border,color:P.text,padding:"12px 16px",borderRadius:12,fontSize:16,fontWeight:600,width:"100%",fontFamily:ff,outline:"none",marginBottom:20,WebkitAppearance:"none",appearance:"none"}}>
              {compNames.map((n,i)=><option key={i} value={i} style={{background:P.surface}}>{n}</option>)}
            </select>

            {cats.map((cat,ci)=><div key={ci} style={{background:P.surface,border:"1px solid "+P.border,borderRadius:16,marginBottom:12,overflow:"hidden"}}>
              <div style={{padding:"10px 16px",background:P.elevated,fontSize:13,fontWeight:700,color:P.gold,textTransform:"uppercase",letterSpacing:1.5}}>{cat.name}</div>
              {cat.rows.map((r,ri)=>{
                const compG=r[selComp+"G"];
                const compVal=r[selComp];
                return<div key={ri} style={{borderBottom:ri<cat.rows.length-1?"1px solid "+P.border:"none",padding:"12px 16px"}}>
                  <div style={{fontSize:15,fontWeight:600,color:P.txS,marginBottom:8}}>{r.f}</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    <div style={{minHeight:48,padding:"12px 16px",borderLeft:"3px solid "+P.gold,background:"rgba(212,168,67,0.04)",borderRadius:"0 10px 10px 0",display:"flex",alignItems:"center",gap:8}}>
                      {r.highlight&&r.haG?null:r.haG?<Ck/>:<Xx/>}
                      {r.highlight&&r.haG?<span style={{fontSize:24,fontWeight:900,color:P.gold,fontFamily:mono,textShadow:"0 0 20px rgba(212,168,67,0.3)"}}>{r.ha}</span>:<span style={{fontSize:15,color:r.haG?P.text:P.txM,lineHeight:1.3}}>{r.ha}</span>}
                    </div>
                    <div style={{minHeight:48,padding:"12px 16px",borderRadius:10,background:"rgba(255,255,255,0.015)",display:"flex",alignItems:"center",gap:8}}>
                      {r.highlight&&!compG?null:compG?<Ck/>:<Xx/>}
                      {r.highlight&&!compG?<span style={{fontSize:16,fontWeight:700,color:P.red,fontFamily:mono}}>{compVal}</span>:<span style={{fontSize:15,color:compG?P.text:P.txM,lineHeight:1.3}}>{compVal}</span>}
                    </div>
                  </div>
                </div>;
              })}
            </div>)}
          </div>
        ):(
          /* DESKTOP TABLE */
          <div style={{marginTop:32,background:P.surface,border:"1px solid "+P.border,borderRadius:20,overflow:"hidden"}}>
            {/* Header row */}
            <div style={{display:"grid",gridTemplateColumns:"180px repeat(6,1fr)",borderBottom:"2px solid "+P.border,position:"sticky",top:0,zIndex:3,background:P.surface}}>
              <div style={{padding:"16px 20px",borderRight:"1px solid "+P.border}}/>
              <div style={{padding:"16px 14px",borderLeft:"3px solid "+P.gold,background:"rgba(212,168,67,0.04)",borderRight:"1px solid "+P.border,textAlign:"center"}}>
                <div style={{background:P.goldMed,color:P.gold,fontSize:10,padding:"2px 8px",borderRadius:4,fontWeight:700,display:"inline-block",marginBottom:4}}>Best Value</div>
                <div style={{fontSize:13,fontWeight:800,color:P.gold}}>HardAssets.io</div>
              </div>
              {compNames.map((n,i)=><div key={i} style={{padding:"16px 14px",borderRight:i<4?"1px solid "+P.border:"none",textAlign:"center"}}>
                <div style={{fontSize:13,fontWeight:600,color:P.txS}}>{n}</div>
              </div>)}
            </div>
            {/* Body */}
            {cats.map((cat,ci)=><div key={ci}>
              <div style={{background:P.elevated,fontSize:13,color:P.gold,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700,padding:"10px 20px",borderTop:"1px solid "+P.border}}>{cat.name}</div>
              {cat.rows.map((r,ri)=>{const alt=ri%2===1;return<div key={ri} style={{display:"grid",gridTemplateColumns:"180px repeat(6,1fr)",borderBottom:"1px solid "+P.border,background:alt?"rgba(255,255,255,0.015)":"transparent"}}>
                <div style={{padding:"12px 20px",borderRight:"1px solid "+P.border,fontSize:15,fontWeight:600,color:P.txS,display:"flex",alignItems:"center"}}>{r.f}</div>
                <div style={{padding:"12px 14px",borderLeft:"3px solid "+P.gold,background:"rgba(212,168,67,0.04)",borderRight:"1px solid "+P.border,display:"flex",alignItems:"center",gap:8}}>
                  {r.highlight&&r.haG?null:r.haG?<Ck/>:<Xx/>}
                  {r.highlight&&r.haG?<span style={{fontSize:24,fontWeight:900,color:P.gold,fontFamily:mono,textShadow:"0 0 20px rgba(212,168,67,0.3)"}}>{r.ha}</span>:<span style={{fontSize:14,color:r.haG?P.text:P.txM}}>{r.ha}</span>}
                </div>
                {[r.ku,r.gf,r.mo,r.em,r.co].map((v,vi)=>{const g=r[compKeys[vi]+"G"];return<div key={vi} style={{padding:"12px 14px",borderRight:vi<4?"1px solid "+P.border:"none",display:"flex",alignItems:"center",gap:8}}>
                  {r.highlight&&!g?null:g?<Ck/>:<Xx/>}
                  {r.highlight&&!g?<span style={{color:P.red,fontFamily:mono,fontSize:16,fontWeight:700}}>{v}</span>:<span style={{fontSize:14,color:g?P.text:P.txM}}>{v}</span>}
                </div>})}
              </div>})}
            </div>)}
          </div>
        )}

        <div style={{textAlign:"center",marginTop:32}}>
          <a href="/?demo=1" style={{display:"inline-block",padding:"16px 36px",borderRadius:14,background:`linear-gradient(135deg,${P.gold},#B8912E)`,color:P.bg,fontSize:16,fontWeight:700,textDecoration:"none"}}>Try HardAssets Free — No Sign-Up Required →</a>
        </div>
      </div>
    </div>

    {/* 1v1 Deep Dives */}
    <div style={{padding:isMobile?"48px 16px":"60px 24px",maxWidth:900,margin:"0 auto"}}>
      <SL>Detailed Comparisons</SL>
      <ST>One-on-One <span style={{color:P.gold}}>Breakdowns</span></ST>
      <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:32}}>
        {deepDives.map((c,i)=>{const open=openAcc===i;return<div key={i} style={{background:P.surface,border:"1px solid "+(open?P.gold+"33":P.border),borderRadius:16,overflow:"hidden",transition:"border-color 0.3s"}}>
          <div onClick={()=>setOpenAcc(open?null:i)} style={{padding:isMobile?"16px 18px":"18px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",minHeight:44}}>
            <div><span style={{fontSize:isMobile?15:16,fontWeight:700,color:P.text}}>vs {c.name}</span><span style={{fontSize:12,color:P.txM,marginLeft:10}}>{c.price}</span></div>
            <span style={{color:P.txM,fontSize:20,transition:"transform 0.3s",transform:open?"rotate(45deg)":"none"}}>+</span>
          </div>
          <div style={{maxHeight:open?2000:0,overflow:"hidden",transition:"max-height 0.5s ease"}}>
            <div style={{padding:isMobile?"0 18px 20px":"0 24px 24px"}}>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:16,marginBottom:20}}>
                <div style={{background:P.bg,borderRadius:12,padding:18,border:"1px solid "+P.border}}>
                  <div style={{fontSize:12,fontWeight:700,color:P.txS,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>What {c.name} does well</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {c.theyDo.map((w,wi)=><div key={wi} style={{display:"flex",alignItems:"flex-start",gap:8,fontSize:13,color:P.txS,lineHeight:1.5}}><span style={{color:P.txM,flexShrink:0}}>•</span>{w}</div>)}
                  </div>
                </div>
                <div style={{background:"rgba(212,168,67,0.03)",borderRadius:12,padding:18,border:"1px solid "+P.gold+"22"}}>
                  <div style={{fontSize:12,fontWeight:700,color:P.gold,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>What HardAssets adds</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {c.weDo.map((w,wi)=><div key={wi} style={{display:"flex",alignItems:"flex-start",gap:8,fontSize:13,color:P.text,lineHeight:1.5}}><span style={{color:P.gold,flexShrink:0}}>◆</span>{w}</div>)}
                  </div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12,marginBottom:16}}>
                <div style={{padding:"14px 18px",background:"rgba(52,211,153,0.04)",borderRadius:12,border:"1px solid rgba(52,211,153,0.15)"}}>
                  <div style={{fontSize:10,color:P.green,textTransform:"uppercase",letterSpacing:1,marginBottom:4,fontWeight:700}}>Choose HardAssets if:</div>
                  <div style={{fontSize:13,color:P.text}}>{c.chooseUs}</div>
                </div>
                <div style={{padding:"14px 18px",background:P.bg,borderRadius:12,border:"1px solid "+P.border}}>
                  <div style={{fontSize:10,color:P.txM,textTransform:"uppercase",letterSpacing:1,marginBottom:4,fontWeight:700}}>Consider {c.name} if:</div>
                  <div style={{fontSize:13,color:P.txS}}>{c.chooseThem}</div>
                </div>
              </div>
              <a href="/?demo=1" style={{display:"inline-block",padding:"10px 24px",borderRadius:10,background:P.goldSoft,color:P.gold,fontSize:14,fontWeight:700,textDecoration:"none",border:"1px solid "+P.goldMed,marginTop:16}}>Try HardAssets Free →</a>
            </div>
          </div>
        </div>})}
      </div>
    </div>

    {/* Personas */}
    <div style={{padding:isMobile?"48px 16px":"60px 24px",background:P.surface,borderTop:"1px solid "+P.border,borderBottom:"1px solid "+P.border}}>
      <div style={{maxWidth:1000,margin:"0 auto"}}>
        <SL>Built For</SL>
        <ST>Investors Like <span style={{color:P.gold}}>You</span></ST>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(3,1fr)",gap:16,marginTop:32}}>
          {[
            ["🥇","The Gold & Silver Stacker","Physical metals — bars, coins, rounds. You want exact oz conversion, live spot prices, and gain/loss across your stack."],
            ["🏢","The Real Estate LP","Syndications — multifamily, self-storage, hotels. Track sponsor, IRR, rate%, and annual income across all your deals."],
            ["📊","The Hard Asset Allocator","Metals, real estate, crypto, notes, collectibles. One dashboard with risk scoring and target allocation."]
          ].map(([ic,t,d],i)=><div key={i} style={{background:P.bg,border:"1px solid "+P.border,borderRadius:16,padding:24,textAlign:"center"}}>
            <div style={{fontSize:36,marginBottom:12}}>{ic}</div>
            <div style={{fontSize:16,fontWeight:700,marginBottom:6}}>{t}</div>
            <div style={{fontSize:13,color:P.txS,lineHeight:1.6}}>{d}</div>
          </div>)}
        </div>
      </div>
    </div>

    {/* Final CTA with pricing cards */}
    <div style={{padding:isMobile?"48px 16px":"80px 24px",textAlign:"center"}}>
      <div style={{maxWidth:700,margin:"0 auto"}}>
        <div style={{fontSize:"clamp(26px,4vw,40px)",fontWeight:800,lineHeight:1.15,marginBottom:32}}>Stop Paying to Track<br/>What You <span style={{color:P.gold}}>Own</span></div>

        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr 1fr",gap:16,marginBottom:32}}>
          <div style={{background:P.surface,border:"1px solid "+P.border,borderRadius:16,padding:24,opacity:0.6,textAlign:"center"}}>
            <div style={{fontSize:15,fontWeight:600,color:P.txM}}>Kubera</div>
            <div style={{fontSize:28,fontWeight:800,color:P.red,fontFamily:mono,marginTop:6}}>$249/yr</div>
            <div style={{fontSize:13,color:P.txM,marginTop:6}}>$2,490 over 10 years</div>
            <div style={{fontSize:12,color:P.txM,marginTop:8}}>Excellent for DeFi and bank syncing</div>
          </div>
          <div style={{background:P.surface,border:"1px solid "+P.border,borderRadius:16,padding:24,opacity:0.6,textAlign:"center"}}>
            <div style={{fontSize:15,fontWeight:600,color:P.txM}}>Monarch</div>
            <div style={{fontSize:28,fontWeight:800,color:P.red,fontFamily:mono,marginTop:6}}>$14.99/mo</div>
            <div style={{fontSize:13,color:P.txM,marginTop:6}}>$1,800 over 10 years</div>
            <div style={{fontSize:12,color:P.txM,marginTop:8}}>Best for budgeting and spending</div>
          </div>
          <div style={{background:"rgba(212,168,67,0.04)",border:"2px solid "+P.gold,borderRadius:16,padding:24,textAlign:"center",boxShadow:"0 0 40px rgba(212,168,67,0.12)"}}>
            <div style={{fontSize:15,fontWeight:700,color:P.gold}}>HardAssets</div>
            <div style={{fontSize:36,fontWeight:900,color:P.gold,fontFamily:mono,marginTop:6}}>$0</div>
            <div style={{fontSize:13,color:P.gold,marginTop:6}}>Free forever</div>
            <div style={{fontSize:12,color:P.txS,marginTop:8}}>Built for hard asset investors</div>
          </div>
        </div>

        <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
          <a href="/?demo=1" style={{padding:"16px 36px",borderRadius:14,background:`linear-gradient(135deg,${P.gold},#B8912E)`,color:P.bg,fontSize:16,fontWeight:700,textDecoration:"none"}}>Try Live Demo →</a>
          <a href="/#features" style={{padding:"16px 36px",borderRadius:14,border:"1px solid "+P.border,background:"transparent",color:P.txS,fontSize:16,fontWeight:600,textDecoration:"none"}}>See All Features</a>
        </div>
        <div style={{marginTop:14,fontSize:13,color:P.txM}}>No sign-up required. No credit card. No trial period that expires.</div>
      </div>
    </div>

    {/* Footer */}
    <div style={{borderTop:"1px solid "+P.border,padding:"32px 24px",textAlign:"center"}}>
      <div style={{fontSize:12,color:P.txM}}>© 2026 <a href="/" style={{color:P.gold,textDecoration:"none"}}>HardAssets.io</a> — Track Everything That Holds Value</div>
    </div>
  </div>;
}
