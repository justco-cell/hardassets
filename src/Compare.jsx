import React, { useState, useEffect } from "react";

const P={bg:"#0B0F1A",surface:"#111827",elevated:"#1E293B",border:"rgba(148,163,184,0.08)",borderLight:"rgba(148,163,184,0.12)",gold:"#D4A843",goldSoft:"rgba(212,168,67,0.1)",goldMed:"rgba(212,168,67,0.2)",green:"#34D399",red:"#F87171",blue:"#60A5FA",purple:"#A78BFA",text:"#F1F5F9",txS:"#94A3B8",txM:"#475569"};
const ff="'Inter',-apple-system,sans-serif",mono="'JetBrains Mono',monospace";

function Logo(){return<div onClick={()=>window.location.href="/"} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:10}}><div style={{width:32,height:32,borderRadius:10,background:`linear-gradient(145deg,${P.gold},#B8912E)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:P.bg}}>H</div><span style={{fontSize:17,fontWeight:800,color:P.text,letterSpacing:-.5}}>Hard<span style={{color:P.gold}}>Assets</span></span></div>}

function Nav(){return<nav style={{position:"sticky",top:0,zIndex:100,padding:"14px 40px",display:"flex",justifyContent:"space-between",alignItems:"center",backdropFilter:"blur(20px)",background:"rgba(11,15,26,.9)",borderBottom:"1px solid "+P.border}}><div style={{display:"flex",alignItems:"center",gap:28}}><Logo/><a href="/blog" style={{fontSize:13,color:P.txS,textDecoration:"none"}}>Blog</a><a href="/compare" style={{fontSize:13,fontWeight:700,color:P.gold,textDecoration:"none"}}>Compare</a></div><a href="/" style={{padding:"8px 18px",borderRadius:10,background:`linear-gradient(135deg,${P.gold},#B8912E)`,color:P.bg,fontSize:13,fontWeight:700,textDecoration:"none"}}>Try Live Demo →</a></nav>}

const Check=({text})=><div style={{display:"flex",alignItems:"flex-start",gap:6}}><span style={{color:P.green,fontSize:14,flexShrink:0,marginTop:1}}>✓</span><span style={{fontSize:12,color:P.text,lineHeight:1.4}}>{text}</span></div>;
const Cross=({text})=><div style={{display:"flex",alignItems:"flex-start",gap:6}}><span style={{color:P.red,opacity:0.5,fontSize:14,flexShrink:0,marginTop:1}}>✗</span><span style={{fontSize:12,color:P.txM,lineHeight:1.4}}>{text||"—"}</span></div>;

const SL=({children})=><div style={{fontSize:11,color:P.gold,textTransform:"uppercase",letterSpacing:3,fontWeight:700,marginBottom:12,textAlign:"center"}}>{children}</div>;
const ST=({children})=><div style={{fontSize:"clamp(28px,3.5vw,42px)",fontWeight:800,letterSpacing:"-.5px",marginBottom:16,lineHeight:1.15,textAlign:"center"}}>{children}</div>;

export default function ComparePage(){
  const[openAcc,setOpenAcc]=useState(null);

  useEffect(()=>{
    document.title="HardAssets.io vs Kubera vs GoldFolio vs Monarch — Feature Comparison";
    const set=(a,v,p)=>{let el=document.querySelector(`meta[${a}="${p}"]`);if(!el){el=document.createElement("meta");el.setAttribute(a,p);document.head.appendChild(el)}el.setAttribute("content",v)};
    set("name","description","Compare HardAssets.io against Kubera, GoldFolio, Monarch Money, Empower, and Copilot. See which portfolio tracker is best for gold, real estate syndications, crypto, and hard assets.");
    set("property","og:title","HardAssets.io vs Competitors — Feature Comparison");
    set("property","og:description","The only free dashboard built for hard asset investors. See how we compare to Kubera ($249/yr), Monarch ($180/yr), and more.");
    set("property","og:url","https://hardassets.io/compare");
    let canon=document.querySelector('link[rel="canonical"]');if(canon)canon.href="https://hardassets.io/compare";
  },[]);

  const features=[
    ["Price","Free forever","$249/year","Free","$14.99/mo","Free","$95/year"],
    ["Physical Metals","Full — 8 units, oz conversion, live spot","Manual entry","Dedicated metals app","No metals","No metals","No metals"],
    ["RE Syndications","Full — 16 types, IRR, sponsor, rate%","Capital calls only","—","—","—","—"],
    ["Physical Real Estate","Full — equity, cash flow, cap rate","Zillow integration","—","Basic Zillow","Basic Zillow","Basic"],
    ["Crypto","20+ coins, live CoinGecko","Extensive + DeFi/NFTs","—","Basic","Basic","Basic"],
    ["Collectibles & Art","Watches, wine, art, cars, jewelry","Manual entry","—","—","—","—"],
    ["Notes & Lending","Hard money, private notes, P2P","—","—","—","—","—"],
    ["Deal Analyzer","Cap rate, CoC, DSCR, cash flow","—","—","—","—","—"],
    ["Live Spot Prices","Metals + Crypto + Forex","Yes","Metals only","—","Stocks only","Stocks only"],
    ["Risk Scoring","1-10 per asset, color coded","—","—","—","—","—"],
    ["Target Allocation","11 classes with visual bars","—","—","Budget-based","Basic","—"],
    ["Income Projections","Auto from rate% and rent","—","—","Yes","—","—"],
    ["CSV Import/Export","All tabs","Yes","Yes","Yes","—","—"],
    ["Guest Mode","Full demo, no sign-up","14-day trial","Yes","7-day trial","Yes","30-day trial"],
    ["Bank Sync","Manual only (by design)","20,000+ via Plaid","—","Plaid","Plaid","Plaid"],
    ["Budgeting","Not a budgeting app","—","—","Full","Full","Full"],
    ["Mobile","PWA + Play Store","PWA","iOS + Android","iOS + Android","iOS + Android","iOS + Mac only"],
  ];
  const comps=["HardAssets.io","Kubera","GoldFolio","Monarch","Empower","Copilot"];
  const isGood=v=>v&&v!=="—"&&!v.startsWith("No ")&&!v.startsWith("Manual only")&&!v.startsWith("Not a")&&!v.startsWith("14-day")&&!v.startsWith("7-day")&&!v.startsWith("30-day");

  const deepDives=[
    {name:"Kubera",price:"$249/year",summary:"Kubera is the closest competitor and genuinely excellent. It connects to 20,000+ banks, tracks DeFi/NFTs, and has a unique 'dead man\\'s switch' for estate planning. If you need bank syncing or deep crypto/DeFi tracking, Kubera is worth considering.",
      haWins:["Free forever vs $249/year ($2,490 over 10 years)","Built-in Deal Analyzer (cap rate, CoC, DSCR, cash flow)","Risk scoring (1-10) per asset with color coding","Notes & Lending tab for hard money loans and private notes","Target vs Actual allocation with visual comparison","Annual income auto-calculated from syndication rates","Guest mode with pre-loaded demo — no trial, no credit card","Oz-per-unit conversion for physical metals (1oz to 100oz, 1kg, gram)"],
      bestFor:"Investors who need bank syncing and DeFi tracking",choosHA:"You're focused on hard assets and don't want to pay $249/year"},
    {name:"GoldFolio",price:"Free",summary:"GoldFolio is the best metals-only tracker. Clean design, live prices, CSV import. If you ONLY hold physical metals and nothing else, GoldFolio is great.",
      haWins:["Tracks syndications, crypto, properties, notes, collectibles — not just metals","Deal Analyzer for rental property analysis","Risk scoring and target allocation across all asset classes","Portfolio-level view showing total allocation","Income projections from syndications and rental properties","Markets page with metals + 20 cryptos + 16 currencies"],
      bestFor:"Pure precious metals stackers who hold nothing else",choosHA:"You own metals AND any other alternative asset"},
    {name:"Monarch Money",price:"$14.99/month",summary:"Monarch is the best general budgeting app — great for tracking spending, subscriptions, and bank accounts. Won 'Best Budgeting App' from WSJ and Forbes.",
      haWins:["Free vs $180/year","Physical gold/silver with unit types and oz conversion","RE syndications with sponsor, IRR, distributions","Rental property deal analysis","Risk scoring per asset","Collectibles, private notes, hard money loans"],
      bestFor:"Couples who want full budgeting + bank syncing",choosHA:"Your wealth is primarily in hard assets, not bank accounts"},
    {name:"Empower",price:"Free",summary:"Empower (formerly Personal Capital) is the most popular free net worth tracker. Excellent for traditional portfolios — stocks, bonds, 401k, bank accounts. But its business model is selling wealth management ($100K+ minimum). The free tracker exists to upsell you.",
      haWins:["No upselling or sales calls","Physical precious metals tracking","RE syndications and LP positions","Collectibles, art, and vehicles","Private notes and hard money loans","Deal Analyzer with cap rate and DSCR"],
      bestFor:"Traditional stock/bond investors who might want wealth management",choosHA:"You don't want to be a sales lead, and your wealth is in hard assets"},
    {name:"Copilot Money",price:"$95/year",summary:"Copilot has the best-designed interface in personal finance — Apple Design Award finalist. Beautiful charts, AI categorization, native iOS feel. But it's Apple-only and focused on spending/budgeting.",
      haWins:["Free vs $95/year","Works on any device (web, Android, iOS)","Physical metals, syndications, collectibles","Deal analysis and risk scoring","Markets page with live prices","CSV import/export on every tab"],
      bestFor:"Apple users who want a premium budgeting experience",choosHA:"You need hard asset tracking on any device"},
  ];

  return<div style={{background:P.bg,minHeight:"100vh",color:P.text,fontFamily:ff}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');`}</style>
    <Nav/>

    {/* Hero */}
    <div style={{textAlign:"center",padding:"80px 24px 60px",position:"relative"}}>
      <div style={{position:"absolute",top:-100,left:"50%",transform:"translateX(-50%)",width:600,height:400,background:"radial-gradient(ellipse,rgba(212,168,67,.06),transparent)",pointerEvents:"none"}}/>
      <div style={{position:"relative",maxWidth:720,margin:"0 auto"}}>
        <h1 style={{fontSize:"clamp(32px,4.5vw,52px)",fontWeight:900,lineHeight:1.1,letterSpacing:-1.5,marginBottom:20}}>The Only Dashboard Built for What You <span style={{color:P.gold}}>Actually Own</span></h1>
        <p style={{fontSize:17,color:P.txS,lineHeight:1.6,maxWidth:580,margin:"0 auto"}}>Most portfolio trackers were built for stocks and ETFs. HardAssets was built for gold bars, rental properties, syndication deals, private notes, and everything Wall Street ignores.</p>
      </div>
    </div>

    {/* The Problem */}
    <div style={{padding:"60px 24px",maxWidth:1100,margin:"0 auto"}}>
      <SL>The Problem</SL>
      <ST>Why Generic Trackers <span style={{color:P.gold}}>Don't Work</span></ST>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16,marginTop:32}}>
        {[
          ["Metals-Only Apps Can't See Your Full Picture","GoldFolio and similar apps track your gold and silver beautifully — but what about your syndication deals? Your crypto? Your rental properties? You end up with 4 different apps and a spreadsheet."],
          ["Stock-Heavy Apps Treat Hard Assets as Afterthoughts","Monarch Money, Empower, and Copilot were built for bank accounts, credit cards, and ETFs. Try tracking a 100oz gold bar with oz-per-unit conversion, or a real estate syndication with projected IRR. They can't."],
          ["Premium Trackers Charge Premium Prices","Kubera is excellent — but at $249/year, you're paying $2,490 over a decade just to see your own net worth. HardAssets gives you the same breadth of tracking for $0. Forever."]
        ].map(([t,d],i)=><div key={i} style={{background:P.surface,border:"1px solid "+P.border,borderRadius:16,padding:28}}>
          <div style={{fontSize:17,fontWeight:700,marginBottom:10,color:P.text}}>{t}</div>
          <div style={{fontSize:14,color:P.txS,lineHeight:1.6}}>{d}</div>
        </div>)}
      </div>
    </div>

    {/* Comparison Table */}
    <div style={{padding:"60px 24px",background:P.surface,borderTop:"1px solid "+P.border,borderBottom:"1px solid "+P.border}}>
      <div style={{maxWidth:1200,margin:"0 auto"}}>
        <SL>Head-to-Head</SL>
        <ST>Feature-by-Feature <span style={{color:P.gold}}>Comparison</span></ST>
        <div style={{overflowX:"auto",marginTop:32,borderRadius:16,border:"1px solid "+P.border}}>
          <table style={{width:"100%",minWidth:900,borderCollapse:"collapse",background:P.bg}}>
            <thead>
              <tr>{["Feature",...comps].map((c,i)=><th key={i} style={{padding:"14px 12px",textAlign:"left",fontSize:12,fontWeight:700,color:i===1?P.gold:P.txM,textTransform:"uppercase",letterSpacing:0.5,borderBottom:"2px solid "+(i===1?P.gold+"44":P.border),background:i===1?"rgba(212,168,67,0.04)":"transparent",position:i===0?"sticky":"static",left:i===0?0:"auto",zIndex:i===0?2:1,whiteSpace:"nowrap"}}>{c}</th>)}</tr>
            </thead>
            <tbody>
              {features.map(([feat,...vals],ri)=><tr key={ri}>
                <td style={{padding:"12px",fontSize:13,fontWeight:600,color:P.text,borderBottom:"1px solid "+P.border,position:"sticky",left:0,background:P.bg,zIndex:1,whiteSpace:"nowrap"}}>{feat}</td>
                {vals.map((v,ci)=><td key={ci} style={{padding:"12px",fontSize:12,borderBottom:"1px solid "+P.border,background:ci===0?"rgba(212,168,67,0.04)":"transparent",verticalAlign:"top"}}>
                  {isGood(v)?<Check text={v}/>:<Cross text={v}/>}
                </td>)}
              </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* Deep Dives */}
    <div style={{padding:"60px 24px",maxWidth:900,margin:"0 auto"}}>
      <SL>Detailed Comparisons</SL>
      <ST>How We Stack Up <span style={{color:P.gold}}>One-on-One</span></ST>
      <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:32}}>
        {deepDives.map((c,i)=>{const open=openAcc===i;return<div key={i} style={{background:P.surface,border:"1px solid "+(open?P.gold+"33":P.border),borderRadius:16,overflow:"hidden",transition:"all 0.3s"}}>
          <div onClick={()=>setOpenAcc(open?null:i)} style={{padding:"18px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
            <div><span style={{fontSize:16,fontWeight:700,color:P.text}}>HardAssets vs {c.name}</span><span style={{fontSize:12,color:P.txM,marginLeft:10}}>{c.price}</span></div>
            <span style={{color:P.txM,fontSize:20,transition:"transform 0.3s",transform:open?"rotate(45deg)":"none"}}>+</span>
          </div>
          <div style={{maxHeight:open?1000:0,overflow:"hidden",transition:"max-height 0.5s ease"}}>
            <div style={{padding:"0 24px 24px"}}>
              <p style={{fontSize:14,color:P.txS,lineHeight:1.6,marginBottom:16}}>{c.summary}</p>
              <div style={{fontSize:13,fontWeight:700,color:P.gold,marginBottom:10}}>What HardAssets does that {c.name} doesn't:</div>
              <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:20}}>
                {c.haWins.map((w,wi)=><div key={wi} style={{display:"flex",alignItems:"flex-start",gap:8}}><span style={{color:P.gold,flexShrink:0}}>◆</span><span style={{fontSize:13,color:P.text,lineHeight:1.5}}>{w}</span></div>)}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div style={{padding:"14px 18px",background:P.bg,borderRadius:12,border:"1px solid "+P.border}}>
                  <div style={{fontSize:10,color:P.txM,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Best for</div>
                  <div style={{fontSize:13,color:P.txS}}>{c.bestFor}</div>
                </div>
                <div style={{padding:"14px 18px",background:"rgba(212,168,67,0.04)",borderRadius:12,border:"1px solid "+P.gold+"22"}}>
                  <div style={{fontSize:10,color:P.gold,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Choose HardAssets if</div>
                  <div style={{fontSize:13,color:P.text}}>{c.choosHA}</div>
                </div>
              </div>
            </div>
          </div>
        </div>})}
      </div>
    </div>

    {/* Who Is It For */}
    <div style={{padding:"60px 24px",background:P.surface,borderTop:"1px solid "+P.border,borderBottom:"1px solid "+P.border}}>
      <div style={{maxWidth:1000,margin:"0 auto"}}>
        <SL>Built For</SL>
        <ST>Investors Like <span style={{color:P.gold}}>You</span></ST>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,marginTop:32}}>
          {[
            ["🥇","The Gold & Silver Stacker","You own physical metals — bars, coins, rounds. You want to know your exact portfolio value with proper oz conversion, live spot prices, and gain/loss. You might also hold some crypto as a digital hedge."],
            ["🏢","The Real Estate LP","You invest in syndications — multifamily, self-storage, hotels. You want to track sponsor, invested amount, expected rate, projected IRR, and annual income across all your deals."],
            ["📊","The Hard Asset Allocator","You believe in owning things that hold value — precious metals, real estate, crypto, private notes, collectibles. You want one dashboard that shows your complete picture with risk scoring and target allocation."]
          ].map(([ic,t,d],i)=><div key={i} style={{background:P.bg,border:"1px solid "+P.border,borderRadius:16,padding:28,textAlign:"center"}}>
            <div style={{fontSize:36,marginBottom:14}}>{ic}</div>
            <div style={{fontSize:17,fontWeight:700,marginBottom:8}}>{t}</div>
            <div style={{fontSize:13,color:P.txS,lineHeight:1.6}}>{d}</div>
          </div>)}
        </div>
      </div>
    </div>

    {/* Final CTA */}
    <div style={{padding:"80px 24px",textAlign:"center"}}>
      <div style={{position:"relative",maxWidth:600,margin:"0 auto"}}>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:400,height:250,background:"radial-gradient(ellipse,rgba(212,168,67,.08),transparent)",pointerEvents:"none"}}/>
        <div style={{position:"relative"}}>
          <div style={{fontSize:"clamp(28px,4vw,42px)",fontWeight:800,lineHeight:1.15,marginBottom:12}}>Stop Paying to Track<br/>What You <span style={{color:P.gold}}>Own</span></div>
          <p style={{fontSize:15,color:P.txS,maxWidth:480,margin:"0 auto 28px",lineHeight:1.6}}>Kubera charges $249/year. Monarch charges $180/year. HardAssets is free — with more hard asset features than any of them.</p>
          <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
            <a href="/" style={{padding:"16px 36px",borderRadius:14,background:`linear-gradient(135deg,${P.gold},#B8912E)`,color:P.bg,fontSize:16,fontWeight:700,textDecoration:"none"}}>Try Live Demo →</a>
            <a href="/#features" style={{padding:"16px 36px",borderRadius:14,border:"1px solid "+P.border,background:"transparent",color:P.txS,fontSize:16,fontWeight:600,textDecoration:"none"}}>See All Features</a>
          </div>
          <div style={{marginTop:14,fontSize:12,color:P.txM}}>No sign-up required. No trial period.</div>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div style={{borderTop:"1px solid "+P.border,padding:"32px 24px",textAlign:"center"}}>
      <div style={{fontSize:12,color:P.txM}}>© 2026 <a href="/" style={{color:P.gold,textDecoration:"none"}}>HardAssets.io</a> — Track Everything That Holds Value</div>
    </div>
  </div>;
}
