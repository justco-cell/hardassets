import React, { useState, useEffect, useCallback, useRef } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
const T={bg:"#060d1b",bgC:"#0d1526",bgI:"#0a1020",bdr:"#1a2744",gld:"#d4a843",gldD:"#9e7c2e",gldB:"#ecc94b",grn:"#10b981",red:"#ef4444",blu:"#3b82f6",pur:"#8b5cf6",cyn:"#06b6d4",org:"#f97316",txt:"#e8edf5",txD:"#8896b0",txM:"#566583"};
const PC=[T.gld,T.blu,T.grn,T.pur,T.org,T.cyn,"#ec4899","#84cc16"];
const fmt=n=>{if(n==null||isNaN(n))return"$0";const a=Math.abs(n);return a>=1e6?"$"+(n/1e6).toFixed(2)+"M":a>=1e3?"$"+(n/1e3).toFixed(1)+"K":"$"+n.toFixed(2)};
const fP=n=>(n>=0?"+":"")+n.toFixed(2)+"%";
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const mm={};
let db=null;let fbReady=false;
function initFirebase(){
if(fbReady)return;
try{
if(!window.firebase)return;
window.firebase.initializeApp({apiKey:"AIzaSyDhZVIzQ1d9urU0oqZjmAEn5px9uz02e5c",authDomain:"hardassets.firebaseapp.com",projectId:"hardassets",storageBucket:"hardassets.firebasestorage.app",messagingSenderId:"584271534897",appId:"1:584271534897:web:33b0334ce7676ba2032e10"});
db=window.firebase.firestore();
fbReady=true;
}catch(e){console.log("FB init:",e)}
}
const userKey=email=>email.replace(/[.#$/\[\]]/g,"_").toLowerCase();
const fbSave=async(email,d)=>{if(!db||!email||email==="guest")return;try{await db.collection("users").doc(userKey(email)).set({data:JSON.stringify(d),updated:new Date().toISOString()},{merge:true})}catch(e){console.log("save err",e)}};
const fbLoad=async(email)=>{if(!db||!email||email==="guest")return null;try{const doc=await db.collection("users").doc(userKey(email)).get();if(doc.exists){const r=doc.data();return r.data?JSON.parse(r.data):null}return null}catch(e){console.log("load err",e);return null}};
const sv=async(k,d)=>{try{mm[k]=JSON.stringify(d)}catch(e){}};
const lo=async k=>{return mm[k]?JSON.parse(mm[k]):null};

const GOLD_API_KEY="3698ded390f2b2d265935002acb5880556253ad19ba99d7c8e90c66aba02c374";
const COIN_MAP={BTC:"bitcoin",ETH:"ethereum",SOL:"solana",ADA:"cardano",DOT:"polkadot",AVAX:"avalanche-2",MATIC:"matic-network",LINK:"chainlink",XRP:"ripple",DOGE:"dogecoin"};
const METAL_MAP={Gold:"XAU",Silver:"XAG",Platinum:"XPT",Palladium:"XPD"};

async function fetchMetalPrices(){
  try{
    const results={};
    for(const[name,sym] of Object.entries(METAL_MAP)){
      const r=await fetch("https://www.goldapi.io/api/"+sym+"/USD",{headers:{"x-access-token":GOLD_API_KEY,"Content-Type":"application/json"}});
      if(r.ok){const d=await r.json();results[name]={price:d.price||0,prev:d.prev_close_price||d.price||0}}
    }
    return results;
  }catch(e){console.log("Metal price err:",e);return null}
}

async function fetchCryptoPrices(){
  try{
    const ids=Object.values(COIN_MAP).join(",");
    const r=await fetch("https://api.coingecko.com/api/v3/simple/price?ids="+ids+"&vs_currencies=usd&include_24hr_change=true");
    if(!r.ok)return null;
    const d=await r.json();
    const results={};
    for(const[sym,cgId] of Object.entries(COIN_MAP)){
      if(d[cgId])results[sym]={price:d[cgId].usd||0,change24h:d[cgId].usd_24h_change||0}
    }
    return results;
  }catch(e){console.log("Crypto price err:",e);return null}
}

function applyPricesToData(data,metalPrices,cryptoPrices){
  const updated={...data};
  if(metalPrices&&updated.metals){
    updated.metals=updated.metals.map(h=>{
      const mp=metalPrices[h.metal];
      return mp?{...h,spot:Math.round(mp.price*100)/100}:h;
    });
  }
  if(cryptoPrices&&updated.crypto){
    updated.crypto=updated.crypto.map(h=>{
      const cp=cryptoPrices[h.coin];
      return cp?{...h,current:Math.round(cp.price*100)/100}:h;
    });
  }
  return updated;
}

function PriceTicker({prices,onRefresh,lastUpdated}){
  if(!prices)return null;
  const{metals,crypto}=prices;
  const items=[];
  if(metals){Object.entries(metals).forEach(([name,d])=>{const chg=d.prev>0?((d.price-d.prev)/d.prev*100):0;items.push({label:name==="Gold"?"Au":name==="Silver"?"Ag":name==="Platinum"?"Pt":"Pd",price:d.price,change:chg})})}
  if(crypto){["BTC","ETH","SOL"].forEach(sym=>{const d=crypto[sym];if(d)items.push({label:sym,price:d.price,change:d.change24h||0})})}
  if(items.length===0)return null;
  return(<div style={{display:"flex",alignItems:"center",gap:16,padding:"8px 24px",background:"#080e1e",borderBottom:"1px solid "+T.bdr,overflowX:"auto",fontSize:12,fontFamily:"monospace"}}>
    <span style={{color:T.txM,fontSize:10,whiteSpace:"nowrap"}}>LIVE</span>
    <div style={{width:6,height:6,borderRadius:3,background:T.grn,animation:"pulse 2s infinite"}}/>
    {items.map((it,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap"}}>
      <span style={{color:T.txM}}>{it.label}</span>
      <span style={{color:T.txt,fontWeight:600}}>${it.price>=1000?it.price.toLocaleString("en-US",{maximumFractionDigits:0}):it.price.toFixed(2)}</span>
      <span style={{color:it.change>=0?T.grn:T.red,fontSize:11}}>{it.change>=0?"▲":"▼"}{Math.abs(it.change).toFixed(1)}%</span>
    </div>)}
    <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
      {lastUpdated&&<span style={{color:T.txM,fontSize:10}}>Updated {lastUpdated}</span>}
      <button onClick={onRefresh} style={{background:"none",border:"1px solid "+T.bdr,color:T.txD,padding:"3px 8px",borderRadius:4,fontSize:10,cursor:"pointer"}}>↻ Refresh</button>
    </div>
  </div>);
}
const STYPES=["Multifamily","Office","Industrial","Retail","Self-Storage","BTR","Mobile Home Parks","Mixed-Use","Hotels","Data Centers","Student Housing","Senior Living","Medical Office","Land","Debt/Credit Fund","Diversified"];
const ACLS=["Precious Metals","Real Estate","Equities","Crypto","Commodities","Fixed Income","Private Credit","Alternatives","Venture/PE","Cash","Other"];
const STS=["Active","Realized","Hold","Watchlist","Exited"];
const COINS=["BTC","ETH","SOL","ADA","DOT","AVAX","MATIC","LINK","XRP","DOGE","Other"];
const MFORMS=["1oz Coins","1oz Rounds","1oz Bars","5oz Bars","10oz Bars","100oz Bars","1kg Bars","Kilo Bars","Junk Silver","Numismatic","ETF/Fund","Other"];
const OZ_PER={"1oz Coins":1,"1oz Rounds":1,"1oz Bars":1,"5oz Bars":5,"10oz Bars":10,"100oz Bars":100,"1kg Bars":32.1507,"Kilo Bars":32.1507,"Junk Silver":0.715,"Numismatic":1,"ETF/Fund":1,"Other":1};
const getOz=(form)=>OZ_PER[form]||1;
const DEF={
metals:[{id:"m1",metal:"Gold",form:"1oz Coins",qty:10,costPer:1850,spot:2650,risk:3,notes:""},{id:"m2",metal:"Silver",form:"100oz Bars",qty:3,costPer:2400,spot:3200,risk:4,notes:""}],
syndications:[{id:"s1",name:"Takoma Towers",sponsor:"Schweb Partners",invested:75000,rate:8,projIRR:15,status:"Active",type:"Multifamily",risk:6,notes:""},{id:"s2",name:"Blue Owl RE VI",sponsor:"Blue Owl",invested:150000,rate:6,projIRR:14,status:"Active",type:"Diversified",risk:5,notes:""}],
crypto:[{id:"c1",coin:"BTC",name:"Bitcoin",qty:0.5,costPer:35000,current:68000,risk:8,notes:""},{id:"c2",coin:"ETH",name:"Ethereum",qty:5,costPer:2200,current:3400,risk:8,notes:""}],
portfolio:[{id:"p1",cls:"Precious Metals",name:"Physical Gold & Silver",value:91400,risk:3,notes:""},{id:"p2",cls:"Real Estate",name:"Syndication LPs",value:525000,risk:6,notes:""},{id:"p3",cls:"Equities",name:"MSFT, CRM, NOW, ADBE",value:145000,risk:5,notes:""},{id:"p4",cls:"Crypto",name:"Bitcoin & ETH",value:51000,risk:8,notes:""},{id:"p5",cls:"Cash",name:"Cash & T-Bills",value:120000,risk:1,notes:""}],
targets:{"Precious Metals":15,"Real Estate":40,"Equities":15,"Crypto":5,"Cash":10,"Other":15}
};
const Cd=({children,style,glow})=><div style={{background:T.bgC,border:"1px solid "+(glow?T.gld+"44":T.bdr),borderRadius:12,padding:"16px 18px",...(glow?{boxShadow:"0 0 20px "+T.gld+"22"}:{}),...style}}>{children}</div>;
const Bt=({children,onClick,ghost,sm,style})=><button onClick={onClick} style={{padding:sm?"5px 10px":"8px 16px",borderRadius:8,fontWeight:700,fontSize:sm?11:12,border:ghost?"1px solid "+T.bdr:"none",cursor:"pointer",background:ghost?"transparent":"linear-gradient(135deg,"+T.gld+","+T.gldD+")",color:ghost?T.txD:T.bg,...style}}>{children}</button>;
const In=({value,onChange,placeholder,prefix,suffix,type="text",style})=><div style={{display:"flex",alignItems:"center",background:T.bgI,border:"1px solid "+T.bdr,borderRadius:8,padding:"0 10px",...style}}>{prefix&&<span style={{color:T.txM,fontSize:12,marginRight:4}}>{prefix}</span>}<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{background:"transparent",border:"none",color:T.txt,padding:"9px 4px",fontSize:13,width:"100%",outline:"none",fontFamily:"monospace"}}/>{suffix&&<span style={{color:T.txM,fontSize:12,marginLeft:4}}>{suffix}</span>}</div>;
const Sl=({value,onChange,options,style})=><select value={value} onChange={e=>onChange(e.target.value)} style={{background:T.bgI,border:"1px solid "+T.bdr,color:T.txt,padding:"9px 10px",borderRadius:8,fontSize:12,outline:"none",...style}}>{options.map(o=><option key={o}>{o}</option>)}</select>;
const Hd=({children,right})=><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div style={{fontSize:12,fontWeight:700,color:T.gld,textTransform:"uppercase",letterSpacing:1.5,fontFamily:"monospace"}}>{children}</div>{right}</div>;
const Lb=({children})=><label style={{fontSize:10,color:T.txM,display:"block",marginBottom:3,textTransform:"uppercase"}}>{children}</label>;
const TD=({children,color,bold})=><td style={{padding:"10px 8px",color:color||T.txt,fontWeight:bold?700:400,fontFamily:"monospace",fontSize:12}}>{children}</td>;
const Md=({open,onClose,title,children})=>{if(!open)return null;return <div style={{position:"fixed",inset:0,background:"#000000aa",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{background:T.bgC,border:"1px solid "+T.bdr,borderRadius:16,padding:28,minWidth:420,maxWidth:600,maxHeight:"85vh",overflow:"auto"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}><div style={{fontSize:16,fontWeight:700,color:T.txt}}>{title}</div><button onClick={onClose} style={{background:"none",border:"none",color:T.txM,fontSize:20,cursor:"pointer"}}>x</button></div>{children}</div></div>};
const RB=({risk})=>{if(!risk)return <span style={{color:T.txM,fontSize:10}}>-</span>;const r=+risk;const c=r<=3?T.grn:r<=6?T.gld:T.red;return <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:28,height:4,borderRadius:2,background:T.bdr,overflow:"hidden"}}><div style={{width:(r/10)*100+"%",height:"100%",background:c,borderRadius:2}}/></div><span style={{fontSize:10,color:c,fontWeight:700,fontFamily:"monospace"}}>{r}</span></div>};
const RI=({value,onChange})=><div><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><Lb>Risk (1-10)</Lb><span style={{fontSize:12,fontWeight:700,color:!value?T.txM:(+value)<=3?T.grn:(+value)<=6?T.gld:T.red,fontFamily:"monospace"}}>{value||"-"}/10</span></div><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:9,color:T.grn}}>Low</span><input type="range" min="1" max="10" value={value||5} onChange={e=>onChange(e.target.value)} style={{flex:1,accentColor:T.gld}}/><span style={{fontSize:9,color:T.red}}>High</span></div></div>;
function EC({value,onChange,type="text",color}){
const[ed,setEd]=useState(false);const[v,setV]=useState(String(value));const ref=useRef(null);
useEffect(()=>{if(ed&&ref.current)ref.current.focus()},[ed]);
if(!ed)return <td onClick={()=>{setV(String(value));setEd(true)}} style={{padding:"10px 8px",color:color||T.txt,fontFamily:"monospace",fontSize:12,cursor:"pointer"}} title="Click to edit">{type==="number"?fmt(+value):value}</td>;
return <td style={{padding:"4px"}}><input ref={ref} type={type} value={v} onChange={e=>setV(e.target.value)} onBlur={()=>{onChange(type==="number"?+v:v);setEd(false)}} onKeyDown={e=>{if(e.key==="Enter"){onChange(type==="number"?+v:v);setEd(false)}if(e.key==="Escape")setEd(false)}} style={{background:T.bgI,border:"1px solid "+T.gld,borderRadius:4,color:T.txt,padding:"6px 8px",fontSize:12,width:"100%",outline:"none",fontFamily:"monospace",boxSizing:"border-box"}}/></td>
}
function SpIn({value,onChange,sponsors}){
const[sh,setSh]=useState(false);
const fl=sponsors.filter(s=>s.toLowerCase().includes((value||"").toLowerCase())&&s.toLowerCase()!==(value||"").toLowerCase());
return <div style={{position:"relative"}}><In value={value} onChange={v=>{onChange(v);setSh(true)}} placeholder="Sponsor name"/>{sh&&fl.length>0&&value&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:T.bgC,border:"1px solid "+T.bdr,borderRadius:8,zIndex:10,maxHeight:100,overflow:"auto",marginTop:2}}>{fl.slice(0,5).map((s,i)=><div key={i} onClick={()=>{onChange(s);setSh(false)}} style={{padding:"8px 12px",cursor:"pointer",fontSize:12,color:T.txD}}>{s}</div>)}</div>}</div>
}
function csvX(h,r,fn){
const lines = [h.join(",")];
r.forEach(row => lines.push(row.map(c=>typeof c==="string"&&c.includes(",")?'"'+c+'"':c).join(",")));
const csv = lines.join("\n");
const b=new Blob([csv],{type:"text/csv"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=fn;a.click();URL.revokeObjectURL(u)
}
function CsvImp({onImport,label}){
const ref=useRef(null);
const handle=e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>{const text=ev.target.result;const lines=text.split("\n").map(l=>l.trim()).filter(Boolean);if(lines.length<2)return;const headers=lines[0].split(",").map(h=>h.replace(/"/g,"").trim());const rows=lines.slice(1).map(l=>{const vals=l.split(",").map(v=>v.replace(/"/g,"").trim());const obj={};headers.forEach((h,i)=>{obj[h]=vals[i]||""});return obj});onImport(rows)};reader.readAsText(file);e.target.value=""};
return <><input ref={ref} type="file" accept=".csv,.txt" onChange={handle} style={{display:"none"}}/><Bt ghost sm onClick={()=>ref.current?.click()}>{label||"Import"}</Bt></>
}
function MetalsTab({data,sd,save,prices}){
const[sa,sSa]=useState(false);const[ei,sEi]=useState(null);
const[f,sF]=useState({metal:"Gold",form:"1oz Coins",qty:"",costPer:"",spot:"",risk:"3",notes:""});
const it=data.metals||[];
const tC=it.reduce((s,h)=>s+h.qty*h.costPer,0);const tV=it.reduce((s,h)=>s+h.qty*getOz(h.form)*h.spot,0);
const g=tV-tC;const gP=tC>0?(g/tC)*100:0;
const byM=it.reduce((a,h)=>{a[h.metal]=(a[h.metal]||0)+h.qty*getOz(h.form)*h.spot;return a},{});
const pie=Object.entries(byM).map(([name,value])=>({name,value}));
const add=()=>{if(!f.form||!f.qty||!f.costPer||!f.spot)return;const u={...data,metals:[...it,{id:uid(),metal:f.metal,form:f.form,qty:+f.qty,costPer:+f.costPer,spot:+f.spot,risk:+f.risk||null,notes:f.notes}]};sd(u);save(u);sF({metal:"Gold",form:"1oz Coins",qty:"",costPer:"",spot:"",risk:"3",notes:""});sSa(false)};
const up=(id,k,v)=>{const u={...data,metals:it.map(h=>h.id===id?{...h,[k]:v}:h)};sd(u);save(u)};
const rm=id=>{const u={...data,metals:it.filter(h=>h.id!==id)};sd(u);save(u)};
const imp=(rows)=>{const newM=rows.map(r=>({id:uid(),metal:r.Metal||r.metal||"Gold",form:r.Form||r.form||"1oz Coins",qty:+(r.Qty||r.qty||0),costPer:+(r["Cost/Unit"]||r.Cost||r.costPer||r.cost||0),spot:+(r["Spot/oz"]||r.Spot||r.spot||r.Current||r.current||0),risk:+(r.Risk||r.risk||3),notes:r.Notes||r.notes||""})).filter(m=>m.qty>0);const u={...data,metals:[...it,...newM]};sd(u);save(u)};
const sE=()=>{if(!ei)return;const u={...data,metals:it.map(h=>h.id===ei.id?ei:h)};sd(u);save(u);sEi(null)};
return(<div>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
{[["Cost Basis",fmt(tC),T.txD],["Value",fmt(tV),T.gldB],["Gain/Loss",fmt(g),g>=0?T.grn:T.red],["Return",fP(gP),gP>=0?T.grn:T.red]].map(([l,v,c],i)=>
<Cd key={i}><div style={{fontSize:10,color:T.txM,textTransform:"uppercase",letterSpacing:1,fontFamily:"monospace"}}>{l}</div><div style={{fontSize:24,fontWeight:800,color:c,marginTop:4}}>{v}</div></Cd>
)}
</div>
<div style={{display:"flex",gap:16}}>
<div style={{flex:2}}>
<Hd right={<div style={{display:"flex",gap:6}}><CsvImp onImport={imp} label="Import"/><Bt ghost sm onClick={()=>csvX(["Metal","Form","Qty","Oz/Unit","Cost","Spot/oz","Value","Gain","Risk"],it.map(h=>[h.metal,h.form,h.qty,getOz(h.form),h.costPer,h.spot,h.qty*getOz(h.form)*h.spot,(h.qty*getOz(h.form)*h.spot)-(h.qty*h.costPer),h.risk||""]),"metals.csv")}>Export</Bt><Bt sm onClick={()=>{const lp=prices?.metals?.Gold?.price;sF({metal:"Gold",form:"1oz Coins",qty:"",costPer:"",spot:lp?String(Math.round(lp*100)/100):"",risk:"3",notes:""});sSa(true)}}>+ Add</Bt></div>}>Holdings</Hd>
<Cd style={{padding:0,overflow:"hidden"}}>
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead><tr style={{borderBottom:"1px solid "+T.bdr}}>{["Metal","Form","Qty","Oz","Cost/Unit","Spot/oz","Value","Gain","Risk","",""].map((h,i)=><th key={i} style={{padding:"10px 8px",textAlign:"left",color:T.txM,fontSize:10,textTransform:"uppercase",fontFamily:"monospace"}}>{h}</th>)}</tr></thead>
<tbody>{it.map(h=>{const oz=getOz(h.form),v=h.qty*oz*h.spot,c=h.qty*h.costPer,gl=v-c;return(
<tr key={h.id} style={{borderBottom:"1px solid "+T.bdr+"22"}}>
<EC value={h.metal} onChange={v=>up(h.id,"metal",v)} color={h.metal==="Gold"?T.gld:T.txD}/>
<EC value={h.form} onChange={v=>up(h.id,"form",v)}/>
<EC value={h.qty} onChange={v=>up(h.id,"qty",v)} type="number"/>
<TD color={T.txD}>{oz}</TD>
<EC value={h.costPer} onChange={v=>up(h.id,"costPer",v)} type="number" color={T.txD}/>
<EC value={h.spot} onChange={v=>up(h.id,"spot",v)} type="number"/>
<TD color={T.gldB} bold>{fmt(v)}</TD>
<TD color={gl>=0?T.grn:T.red} bold>{fmt(gl)}</TD>
<TD><RB risk={h.risk}/></TD>
<TD><button onClick={()=>sEi({...h})} style={{background:"none",border:"none",color:T.blu,cursor:"pointer",fontSize:11}}>Edit</button></TD>
<TD><button onClick={()=>rm(h.id)} style={{background:"none",border:"none",color:T.red,cursor:"pointer",fontSize:14,opacity:.6}}>x</button></TD>
</tr>)})}</tbody>
</table>
{it.length===0&&<div style={{padding:24,textAlign:"center",color:T.txM}}>No holdings yet. Click + Add.</div>}
</Cd>
</div>
<div style={{flex:.8}}>
<Hd>Allocation</Hd>
<Cd style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
{pie.length>0?<><ResponsiveContainer width="100%" height={180}><PieChart><Pie data={pie} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>{pie.map((_,i)=><Cell key={i} fill={PC[i%PC.length]}/>)}</Pie><Tooltip formatter={v=>fmt(v)} contentStyle={{background:T.bgC,border:"1px solid "+T.bdr,borderRadius:8,fontSize:12}}/></PieChart></ResponsiveContainer><div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>{pie.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:T.txD}}><div style={{width:8,height:8,borderRadius:2,background:PC[i%PC.length]}}/>{d.name}</div>)}</div></>:<div style={{padding:40,color:T.txM}}>Add holdings</div>}
</Cd>
</div>
</div>
<Md open={sa} onClose={()=>sSa(false)} title="Add Metal">
<div style={{display:"flex",flexDirection:"column",gap:12}}>
<div><Lb>Metal</Lb><Sl value={f.metal} onChange={v=>{const lp=prices?.metals?.[v]?.price;sF({...f,metal:v,spot:lp?String(Math.round(lp*100)/100):f.spot})}} options={["Gold","Silver","Platinum","Palladium"]} style={{width:"100%"}}/></div>
<div><Lb>Form</Lb><Sl value={f.form} onChange={v=>sF({...f,form:v})} options={MFORMS} style={{width:"100%"}}/></div>
{f.form&&<div style={{padding:6,background:T.bgI,borderRadius:6,fontSize:11,color:T.txD}}>{getOz(f.form)} oz per unit{f.qty&&f.spot?(" · Total oz: "+(+f.qty*getOz(f.form)).toFixed(2)+" · Value: "+fmt(+f.qty*getOz(f.form)*(+f.spot))):""}</div>}
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
<div><Lb>Qty (units)</Lb><In value={f.qty} onChange={v=>sF({...f,qty:v})} type="number"/></div>
<div><Lb>Cost/Unit</Lb><In value={f.costPer} onChange={v=>sF({...f,costPer:v})} prefix="$" type="number"/></div>
<div><Lb>Spot $/oz</Lb><In value={f.spot} onChange={v=>sF({...f,spot:v})} prefix="$" type="number"/></div>
</div>
<RI value={f.risk} onChange={v=>sF({...f,risk:v})}/>
<div><Lb>Notes</Lb><In value={f.notes} onChange={v=>sF({...f,notes:v})} placeholder="Optional"/></div>
<Bt onClick={add} style={{width:"100%"}}>Add Holding</Bt>
</div>
</Md>
<Md open={!!ei} onClose={()=>sEi(null)} title="Edit Holding">
{ei&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
<div><Lb>Metal</Lb><Sl value={ei.metal} onChange={v=>sEi({...ei,metal:v})} options={["Gold","Silver","Platinum","Palladium"]} style={{width:"100%"}}/></div>
<div><Lb>Form</Lb><Sl value={ei.form} onChange={v=>sEi({...ei,form:v})} options={MFORMS} style={{width:"100%"}}/></div>
{ei.form&&<div style={{padding:6,background:T.bgI,borderRadius:6,fontSize:11,color:T.txD}}>{getOz(ei.form)} oz per unit{ei.qty&&ei.spot?(" · Total oz: "+(ei.qty*getOz(ei.form)).toFixed(2)+" · Value: "+fmt(ei.qty*getOz(ei.form)*ei.spot)):""}</div>}
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
<div><Lb>Qty (units)</Lb><In value={ei.qty} onChange={v=>sEi({...ei,qty:+v})} type="number"/></div>
<div><Lb>Cost/Unit</Lb><In value={ei.costPer} onChange={v=>sEi({...ei,costPer:+v})} prefix="$" type="number"/></div>
<div><Lb>Spot $/oz</Lb><In value={ei.spot} onChange={v=>sEi({...ei,spot:+v})} prefix="$" type="number"/></div>
</div>
<RI value={ei.risk} onChange={v=>sEi({...ei,risk:+v})}/>
<div><Lb>Notes</Lb><In value={ei.notes||""} onChange={v=>sEi({...ei,notes:v})}/></div>
<Bt onClick={sE} style={{width:"100%"}}>Save Changes</Bt>
</div>}
</Md>
</div>)
}
function SyndTab({data,sd,save}){
const[sa,sSa]=useState(false);const[ei,sEi]=useState(null);
const[f,sF]=useState({name:"",sponsor:"",invested:"",rate:"",projIRR:"",status:"Active",type:"Multifamily",risk:"5",notes:""});
const it=data.syndications||[];
const sp=[...new Set(it.map(d=>d.sponsor).filter(Boolean))];
const tI=it.reduce((s,d)=>s+d.invested,0);
const tInc=it.reduce((s,d)=>s+d.invested*(d.rate||0)/100,0);
const aIRR=it.length>0?it.reduce((s,d)=>s+d.projIRR,0)/it.length:0;
const aR=it.length>0?it.reduce((s,d)=>s+(d.rate||0),0)/it.length:0;
const byT=it.reduce((a,d)=>{a[d.type]=(a[d.type]||0)+d.invested;return a},{});
const pie=Object.entries(byT).map(([name,value])=>({name,value}));
const add=()=>{if(!f.name||!f.invested)return;const u={...data,syndications:[...it,{id:uid(),name:f.name,sponsor:f.sponsor,invested:+f.invested,rate:+(f.rate||0),projIRR:+(f.projIRR||0),status:f.status,type:f.type,risk:+f.risk||null,notes:f.notes}]};sd(u);save(u);sF({name:"",sponsor:"",invested:"",rate:"",projIRR:"",status:"Active",type:"Multifamily",risk:"5",notes:""});sSa(false)};
const up=(id,k,v)=>{const u={...data,syndications:it.map(d=>d.id===id?{...d,[k]:v}:d)};sd(u);save(u)};
const rm=id=>{const u={...data,syndications:it.filter(d=>d.id!==id)};sd(u);save(u)};
const imp=(rows)=>{const newS=rows.map(r=>({id:uid(),name:r.Deal||r.Name||r.name||"",sponsor:r.Sponsor||r.sponsor||"",invested:+(r.Invested||r.invested||0),rate:+(r.Rate||r.rate||0),projIRR:+(r.IRR||r.projIRR||r.irr||0),status:r.Status||r.status||"Active",type:r.Type||r.type||"Multifamily",risk:+(r.Risk||r.risk||5),notes:r.Notes||r.notes||""})).filter(s=>s.name&&s.invested>0);const u={...data,syndications:[...it,...newS]};sd(u);save(u)};
const sE=()=>{if(!ei)return;const u={...data,syndications:it.map(d=>d.id===ei.id?ei:d)};sd(u);save(u);sEi(null)};
return(<div>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
{[["Total Invested",fmt(tI),T.txt],["Avg Rate",aR.toFixed(1)+"%",T.gldB],["Est. Annual Income",fmt(tInc),T.grn],["Avg Proj. IRR",aIRR.toFixed(1)+"%",T.blu]].map(([l,v,c],i)=>
<Cd key={i}><div style={{fontSize:10,color:T.txM,textTransform:"uppercase",letterSpacing:1,fontFamily:"monospace"}}>{l}</div><div style={{fontSize:24,fontWeight:800,color:c,marginTop:4}}>{v}</div></Cd>
)}
</div>
<div style={{display:"flex",gap:16}}>
<div style={{flex:2}}>
<Hd right={<div style={{display:"flex",gap:6}}><CsvImp onImport={imp} label="Import"/><Bt ghost sm onClick={()=>csvX(["Deal","Sponsor","Type","Invested","Rate","AnnIncome","IRR","Risk","Status"],it.map(d=>[d.name,d.sponsor,d.type,d.invested,d.rate||0,Math.round(d.invested*(d.rate||0)/100),d.projIRR,d.risk||"",d.status]),"syndications.csv")}>Export</Bt><Bt sm onClick={()=>sSa(true)}>+ Add Deal</Bt></div>}>LP Positions</Hd>
<Cd style={{padding:0,overflow:"auto"}}>
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead><tr style={{borderBottom:"1px solid "+T.bdr}}>{["Deal","Sponsor","Type","Invested","Rate%","Ann.Income","IRR","Risk","Status","",""].map((h,i)=><th key={i} style={{padding:"10px 6px",textAlign:"left",color:T.txM,fontSize:10,textTransform:"uppercase",fontFamily:"monospace",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
<tbody>{it.map(d=>{const ai=d.invested*(d.rate||0)/100;return(
<tr key={d.id} style={{borderBottom:"1px solid "+T.bdr+"22"}}>
<EC value={d.name} onChange={v=>up(d.id,"name",v)} color={T.gld}/>
<EC value={d.sponsor} onChange={v=>up(d.id,"sponsor",v)} color={T.txD}/>
<TD color={T.txD}>{d.type}</TD>
<EC value={d.invested} onChange={v=>up(d.id,"invested",v)} type="number"/>
<EC value={d.rate||0} onChange={v=>up(d.id,"rate",v)} type="number" color={T.gldB}/>
<TD color={T.grn} bold>{fmt(ai)}</TD>
<EC value={d.projIRR} onChange={v=>up(d.id,"projIRR",v)} type="number" color={T.blu}/>
<TD><RB risk={d.risk}/></TD>
<TD><span style={{background:(d.status==="Active"?T.grn:T.txM)+"18",color:d.status==="Active"?T.grn:T.txM,padding:"3px 8px",borderRadius:20,fontSize:10}}>{d.status}</span></TD>
<TD><button onClick={()=>sEi({...d})} style={{background:"none",border:"none",color:T.blu,cursor:"pointer",fontSize:11}}>Edit</button></TD>
<TD><button onClick={()=>rm(d.id)} style={{background:"none",border:"none",color:T.red,cursor:"pointer",fontSize:14,opacity:.6}}>x</button></TD>
</tr>)})}</tbody>
</table>
{it.length===0&&<div style={{padding:24,textAlign:"center",color:T.txM}}>No deals yet.</div>}
</Cd>
</div>
<div style={{flex:.8}}>
<Hd>By Strategy</Hd>
<Cd style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
{pie.length>0?<ResponsiveContainer width="100%" height={180}><PieChart><Pie data={pie} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={60} paddingAngle={3}>{pie.map((_,i)=><Cell key={i} fill={PC[i%PC.length]}/>)}</Pie><Tooltip formatter={v=>fmt(v)} contentStyle={{background:T.bgC,border:"1px solid "+T.bdr,borderRadius:8,fontSize:12}}/></PieChart></ResponsiveContainer>:<div style={{padding:40,color:T.txM}}>Add deals</div>}
</Cd>
</div>
</div>
<Md open={sa} onClose={()=>sSa(false)} title="Add Syndication Deal">
<div style={{display:"flex",flexDirection:"column",gap:12}}>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><div><Lb>Deal</Lb><In value={f.name} onChange={v=>sF({...f,name:v})} placeholder="Takoma Towers"/></div><div><Lb>Sponsor</Lb><SpIn value={f.sponsor} onChange={v=>sF({...f,sponsor:v})} sponsors={sp}/></div></div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><div><Lb>Type</Lb><Sl value={f.type} onChange={v=>sF({...f,type:v})} options={STYPES} style={{width:"100%"}}/></div><div><Lb>Status</Lb><Sl value={f.status} onChange={v=>sF({...f,status:v})} options={STS} style={{width:"100%"}}/></div></div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}><div><Lb>Invested</Lb><In value={f.invested} onChange={v=>sF({...f,invested:v})} prefix="$" type="number"/></div><div><Lb>Rate %</Lb><In value={f.rate} onChange={v=>sF({...f,rate:v})} suffix="%" type="number"/></div><div><Lb>Proj IRR</Lb><In value={f.projIRR} onChange={v=>sF({...f,projIRR:v})} suffix="%" type="number"/></div></div>
{f.invested&&f.rate&&<div style={{padding:8,background:T.grn+"11",borderRadius:8,fontSize:12,color:T.grn}}>Est. Annual Income: <strong>{fmt((+f.invested)*(+f.rate)/100)}</strong></div>}
<RI value={f.risk} onChange={v=>sF({...f,risk:v})}/>
<div><Lb>Notes</Lb><In value={f.notes} onChange={v=>sF({...f,notes:v})}/></div>
<Bt onClick={add} style={{width:"100%"}}>Add Deal</Bt>
</div>
</Md>
<Md open={!!ei} onClose={()=>sEi(null)} title="Edit Deal">
{ei&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><div><Lb>Deal</Lb><In value={ei.name} onChange={v=>sEi({...ei,name:v})}/></div><div><Lb>Sponsor</Lb><SpIn value={ei.sponsor} onChange={v=>sEi({...ei,sponsor:v})} sponsors={sp}/></div></div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><div><Lb>Type</Lb><Sl value={ei.type} onChange={v=>sEi({...ei,type:v})} options={STYPES} style={{width:"100%"}}/></div><div><Lb>Status</Lb><Sl value={ei.status} onChange={v=>sEi({...ei,status:v})} options={STS} style={{width:"100%"}}/></div></div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}><div><Lb>Invested</Lb><In value={ei.invested} onChange={v=>sEi({...ei,invested:+v})} prefix="$" type="number"/></div><div><Lb>Rate</Lb><In value={ei.rate||""} onChange={v=>sEi({...ei,rate:+v})} suffix="%" type="number"/></div><div><Lb>IRR</Lb><In value={ei.projIRR} onChange={v=>sEi({...ei,projIRR:+v})} suffix="%" type="number"/></div></div>
<RI value={ei.risk} onChange={v=>sEi({...ei,risk:+v})}/>
<div><Lb>Notes</Lb><In value={ei.notes||""} onChange={v=>sEi({...ei,notes:v})}/></div>
<Bt onClick={sE} style={{width:"100%"}}>Save</Bt>
</div>}
</Md>
</div>)
}
function CryptoTab({data,sd,save,prices}){
const[sa,sSa]=useState(false);const[ei,sEi]=useState(null);
const[f,sF]=useState({coin:"BTC",name:"Bitcoin",qty:"",costPer:"",current:"",risk:"8",notes:""});
const it=data.crypto||[];
const tC=it.reduce((s,h)=>s+h.qty*h.costPer,0);const tV=it.reduce((s,h)=>s+h.qty*h.current,0);
const g=tV-tC;const gP=tC>0?(g/tC)*100:0;
const byC=it.reduce((a,h)=>{a[h.coin]=(a[h.coin]||0)+h.qty*h.current;return a},{});
const pie=Object.entries(byC).map(([name,value])=>({name,value}));
const add=()=>{if(!f.qty||!f.costPer||!f.current)return;const u={...data,crypto:[...it,{id:uid(),coin:f.coin,name:f.name,qty:+f.qty,costPer:+f.costPer,current:+f.current,risk:+f.risk||null,notes:f.notes}]};sd(u);save(u);sF({coin:"BTC",name:"Bitcoin",qty:"",costPer:"",current:"",risk:"8",notes:""});sSa(false)};
const up=(id,k,v)=>{const u={...data,crypto:it.map(h=>h.id===id?{...h,[k]:v}:h)};sd(u);save(u)};
const rm=id=>{const u={...data,crypto:it.filter(h=>h.id!==id)};sd(u);save(u)};
const imp=(rows)=>{const newC=rows.map(r=>({id:uid(),coin:r.Coin||r.coin||"BTC",name:r.Name||r.name||"",qty:+(r.Qty||r.qty||0),costPer:+(r.Cost||r.costPer||r.cost||0),current:+(r.Current||r.current||r.Price||r.price||0),risk:+(r.Risk||r.risk||8),notes:r.Notes||r.notes||""})).filter(c=>c.qty>0);const u={...data,crypto:[...it,...newC]};sd(u);save(u)};
const sE=()=>{if(!ei)return;const u={...data,crypto:it.map(h=>h.id===ei.id?ei:h)};sd(u);save(u);sEi(null)};
return(<div>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
{[["Cost Basis",fmt(tC),T.txD],["Value",fmt(tV),T.gldB],["Gain/Loss",fmt(g),g>=0?T.grn:T.red],["Return",fP(gP),gP>=0?T.grn:T.red]].map(([l,v,c],i)=>
<Cd key={i}><div style={{fontSize:10,color:T.txM,textTransform:"uppercase",letterSpacing:1,fontFamily:"monospace"}}>{l}</div><div style={{fontSize:24,fontWeight:800,color:c,marginTop:4}}>{v}</div></Cd>
)}
</div>
<div style={{display:"flex",gap:16}}>
<div style={{flex:2}}>
<Hd right={<div style={{display:"flex",gap:6}}><CsvImp onImport={imp} label="Import"/><Bt ghost sm onClick={()=>csvX(["Coin","Name","Qty","Cost","Current","Value","Gain","Risk"],it.map(h=>[h.coin,h.name,h.qty,h.costPer,h.current,h.qty*h.current,(h.qty*h.current)-(h.qty*h.costPer),h.risk||""]),"crypto.csv")}>Export</Bt><Bt sm onClick={()=>{const lp=prices?.crypto?.BTC?.price;sF({coin:"BTC",name:"Bitcoin",qty:"",costPer:"",current:lp?String(Math.round(lp*100)/100):"",risk:"8",notes:""});sSa(true)}}>+ Add</Bt></div>}>Crypto Holdings</Hd>
<Cd style={{padding:0,overflow:"hidden"}}>
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead><tr style={{borderBottom:"1px solid "+T.bdr}}>{["Coin","Name","Qty","Cost","Current","Value","Gain","Risk","",""].map((h,i)=><th key={i} style={{padding:"10px 8px",textAlign:"left",color:T.txM,fontSize:10,textTransform:"uppercase",fontFamily:"monospace"}}>{h}</th>)}</tr></thead>
<tbody>{it.map(h=>{const v=h.qty*h.current,c=h.qty*h.costPer,gl=v-c;return(
<tr key={h.id} style={{borderBottom:"1px solid "+T.bdr+"22"}}>
<TD color={T.org} bold>{h.coin}</TD>
<EC value={h.name} onChange={v=>up(h.id,"name",v)} color={T.txD}/>
<EC value={h.qty} onChange={v=>up(h.id,"qty",v)} type="number"/>
<EC value={h.costPer} onChange={v=>up(h.id,"costPer",v)} type="number" color={T.txD}/>
<EC value={h.current} onChange={v=>up(h.id,"current",v)} type="number"/>
<TD color={T.gldB} bold>{fmt(v)}</TD>
<TD color={gl>=0?T.grn:T.red} bold>{fmt(gl)}</TD>
<TD><RB risk={h.risk}/></TD>
<TD><button onClick={()=>sEi({...h})} style={{background:"none",border:"none",color:T.blu,cursor:"pointer",fontSize:11}}>Edit</button></TD>
<TD><button onClick={()=>rm(h.id)} style={{background:"none",border:"none",color:T.red,cursor:"pointer",fontSize:14,opacity:.6}}>x</button></TD>
</tr>)})}</tbody>
</table>
{it.length===0&&<div style={{padding:24,textAlign:"center",color:T.txM}}>No crypto yet.</div>}
</Cd>
</div>
<div style={{flex:.8}}>
<Hd>Allocation</Hd>
<Cd style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
{pie.length>0?<><ResponsiveContainer width="100%" height={180}><PieChart><Pie data={pie} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>{pie.map((_,i)=><Cell key={i} fill={PC[i%PC.length]}/>)}</Pie><Tooltip formatter={v=>fmt(v)} contentStyle={{background:T.bgC,border:"1px solid "+T.bdr,borderRadius:8,fontSize:12}}/></PieChart></ResponsiveContainer><div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>{pie.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:T.txD}}><div style={{width:8,height:8,borderRadius:2,background:PC[i%PC.length]}}/>{d.name}</div>)}</div></>:<div style={{padding:40,color:T.txM}}>Add crypto</div>}
</Cd>
</div>
</div>
<Md open={sa} onClose={()=>sSa(false)} title="Add Crypto">
<div style={{display:"flex",flexDirection:"column",gap:12}}>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><div><Lb>Coin</Lb><Sl value={f.coin} onChange={v=>{const lp=prices?.crypto?.[v]?.price;sF({...f,coin:v,current:lp?String(Math.round(lp*100)/100):f.current})}} options={COINS} style={{width:"100%"}}/></div><div><Lb>Name</Lb><In value={f.name} onChange={v=>sF({...f,name:v})}/></div></div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}><div><Lb>Qty</Lb><In value={f.qty} onChange={v=>sF({...f,qty:v})} type="number"/></div><div><Lb>Cost/Unit</Lb><In value={f.costPer} onChange={v=>sF({...f,costPer:v})} prefix="$" type="number"/></div><div><Lb>Current</Lb><In value={f.current} onChange={v=>sF({...f,current:v})} prefix="$" type="number"/></div></div>
<RI value={f.risk} onChange={v=>sF({...f,risk:v})}/>
<div><Lb>Notes</Lb><In value={f.notes} onChange={v=>sF({...f,notes:v})}/></div>
<Bt onClick={add} style={{width:"100%"}}>Add Crypto</Bt>
</div>
</Md>
<Md open={!!ei} onClose={()=>sEi(null)} title="Edit Crypto">
{ei&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><div><Lb>Coin</Lb><Sl value={ei.coin} onChange={v=>sEi({...ei,coin:v})} options={COINS} style={{width:"100%"}}/></div><div><Lb>Name</Lb><In value={ei.name} onChange={v=>sEi({...ei,name:v})}/></div></div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}><div><Lb>Qty</Lb><In value={ei.qty} onChange={v=>sEi({...ei,qty:+v})} type="number"/></div><div><Lb>Cost</Lb><In value={ei.costPer} onChange={v=>sEi({...ei,costPer:+v})} prefix="$" type="number"/></div><div><Lb>Current</Lb><In value={ei.current} onChange={v=>sEi({...ei,current:+v})} prefix="$" type="number"/></div></div>
<RI value={ei.risk} onChange={v=>sEi({...ei,risk:+v})}/>
<div><Lb>Notes</Lb><In value={ei.notes||""} onChange={v=>sEi({...ei,notes:v})}/></div>
<Bt onClick={sE} style={{width:"100%"}}>Save</Bt>
</div>}
</Md>
</div>)
}
function DealTab(){
const[d,setD]=useState({price:250000,down:25,closing:5000,rehab:0,rent:2200,vacancy:5,propTax:250,insurance:120,maintenance:100,propMgmt:10,hoa:0,rate:7,term:30});
const u=(k,v)=>setD({...d,[k]:parseFloat(v)||0});
const da=d.price*(d.down/100),ln=d.price-da,ci=da+d.closing+d.rehab;
const mr=d.rate/100/12,np=d.term*12;
const mt=mr>0?ln*(mr*Math.pow(1+mr,np))/(Math.pow(1+mr,np)-1):0;
const er=d.rent*(1-d.vacancy/100),ox=d.propTax+d.insurance+d.maintenance+(d.rent*d.propMgmt/100)+d.hoa;
const noi=er-ox,cf=noi-mt,acf=cf*12;
const coc=ci>0?(acf/ci)*100:0,cap=d.price>0?((noi*12)/d.price)*100:0;
const ds=mt>0?noi/mt:0,op=d.price>0?(d.rent/d.price)*100:0;
const F=({label,k,prefix,suffix})=><div style={{marginBottom:10}}><Lb>{label}</Lb><In value={d[k]} onChange={v=>u(k,v)} prefix={prefix} suffix={suffix} type="number"/></div>;
return(<div style={{display:"flex",gap:20}}>
<div style={{width:260}}>
<Cd>
<Hd>Property</Hd><F label="Price" k="price" prefix="$"/><F label="Down %" k="down" suffix="%"/><F label="Closing" k="closing" prefix="$"/><F label="Rehab" k="rehab" prefix="$"/>
<Hd>Monthly</Hd><F label="Rent" k="rent" prefix="$"/><F label="Vacancy" k="vacancy" suffix="%"/><F label="Tax" k="propTax" prefix="$"/><F label="Insurance" k="insurance" prefix="$"/><F label="Maint." k="maintenance" prefix="$"/><F label="Mgmt %" k="propMgmt" suffix="%"/><F label="HOA" k="hoa" prefix="$"/>
<Hd>Financing</Hd><F label="Rate" k="rate" suffix="%"/><F label="Term (Yrs)" k="term"/>
</Cd>
</div>
<div style={{flex:1}}>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
<Cd glow={cf>=0} style={{textAlign:"center",padding:"16px 10px"}}><div style={{fontSize:10,color:T.txM,textTransform:"uppercase"}}>Monthly CF</div><div style={{fontSize:26,fontWeight:800,color:cf>=0?T.grn:T.red,marginTop:4}}>{fmt(cf)}</div></Cd>
{[["CoC",coc.toFixed(2)+"%",coc>=8?T.grn:coc>=4?T.gld:T.red],["Cap Rate",cap.toFixed(2)+"%",cap>=6?T.grn:cap>=4?T.gld:T.red],["DSCR",ds.toFixed(2)+"x",ds>=1.25?T.grn:ds>=1?T.gld:T.red]].map(([l,v,c],i)=>
<Cd key={i}><div style={{fontSize:10,color:T.txM,textTransform:"uppercase",fontFamily:"monospace"}}>{l}</div><div style={{fontSize:20,fontWeight:800,color:c,marginTop:4}}>{v}</div></Cd>
)}
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
<Cd><Hd>Cash Required</Hd>
{[["Down",fmt(da)],["Closing",fmt(d.closing)],["Rehab",fmt(d.rehab)]].map(([l,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:12}}><span style={{color:T.txD}}>{l}</span><span style={{color:T.txt,fontFamily:"monospace"}}>{v}</span></div>)}
<div style={{borderTop:"1px solid "+T.bdr,marginTop:8,paddingTop:8,display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:13}}><span>Total</span><span style={{color:T.gldB,fontFamily:"monospace"}}>{fmt(ci)}</span></div>
</Cd>
<Cd><Hd>Monthly P&L</Hd>
{[["Eff. Rent",fmt(er),T.grn],["OpEx","-"+fmt(ox),T.red],["NOI",fmt(noi),T.txt],["Mortgage","-"+fmt(mt),T.red]].map(([l,v,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:12}}><span style={{color:T.txD}}>{l}</span><span style={{color:c,fontFamily:"monospace"}}>{v}</span></div>)}
<div style={{borderTop:"1px solid "+T.bdr,marginTop:8,paddingTop:8,display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:13}}><span>Cash Flow</span><span style={{color:cf>=0?T.grn:T.red,fontFamily:"monospace"}}>{fmt(cf)}/mo</span></div>
</Cd>
</div>
<Cd><Hd>Quick Tests</Hd>
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
{[{l:"1% Rule",v:op.toFixed(2)+"%",p:op>=1},{l:"50% Rule",v:fmt(d.rent*.5-mt)+"/mo",p:d.rent*.5-mt>0},{l:"Annual CF",v:fmt(acf),p:acf>0}].map((t,i)=>
<div key={i} style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:800,color:t.p?T.grn:T.red}}>{t.v}</div><div style={{fontSize:11,color:t.p?T.grn:T.red,fontWeight:700}}>{t.p?"PASS":"FAIL"}</div></div>
)}
</div>
</Cd>
</div>
</div>)
}
function PortTab({data,sd,save}){
const[sa,sSa]=useState(false);const[ei,sEi]=useState(null);const[st,sSt]=useState(false);
const[f,sF]=useState({cls:"Precious Metals",name:"",value:"",risk:"5",notes:""});
const it=data.portfolio||[];const tg=data.targets||DEF.targets;
const tot=it.reduce((s,a)=>s+a.value,0);
const byC=it.reduce((a,i)=>{a[i.cls]=(a[i.cls]||0)+i.value;return a},{});
const pie=Object.entries(byC).map(([name,value])=>({name,value,pct:tot>0?((value/tot)*100).toFixed(1):"0"}));
const hv=it.filter(a=>["Precious Metals","Real Estate","Crypto","Commodities"].includes(a.cls)).reduce((s,a)=>s+a.value,0);
const hp=tot>0?(hv/tot)*100:0;
const ar=it.filter(a=>a.risk).length>0?(it.filter(a=>a.risk).reduce((s,a)=>s+(a.risk||0),0)/it.filter(a=>a.risk).length):0;
const sI=(data.syndications||[]).reduce((s,d)=>s+d.invested*(d.rate||0)/100,0);
const add=()=>{if(!f.name||!f.value)return;const u={...data,portfolio:[...it,{id:uid(),cls:f.cls,name:f.name,value:+f.value,risk:+f.risk||null,notes:f.notes}]};sd(u);save(u);sF({cls:"Precious Metals",name:"",value:"",risk:"5",notes:""});sSa(false)};
const rm=id=>{const u={...data,portfolio:it.filter(a=>a.id!==id)};sd(u);save(u)};
const imp=(rows)=>{const newP=rows.map(r=>({id:uid(),cls:r.Class||r.cls||"Other",name:r.Name||r.name||"",value:+(r.Value||r.value||0),risk:+(r.Risk||r.risk||5),notes:r.Notes||r.notes||""})).filter(p=>p.name&&p.value>0);const u={...data,portfolio:[...it,...newP]};sd(u);save(u)};
const sE=()=>{if(!ei)return;const u={...data,portfolio:it.map(a=>a.id===ei.id?ei:a)};sd(u);save(u);sEi(null)};
const sTg=t=>{const u={...data,targets:t};sd(u);save(u)};
return(<div>
<div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:20}}>
<Cd glow><div style={{fontSize:10,color:T.txM,textTransform:"uppercase",fontFamily:"monospace"}}>Total</div><div style={{fontSize:26,fontWeight:800,color:T.gldB,marginTop:4}}>{fmt(tot)}</div></Cd>
<Cd><div style={{fontSize:10,color:T.txM,textTransform:"uppercase",fontFamily:"monospace"}}>Hard %</div><div style={{fontSize:22,fontWeight:800,color:T.grn,marginTop:4}}>{hp.toFixed(1)}%</div></Cd>
<Cd><div style={{fontSize:10,color:T.txM,textTransform:"uppercase",fontFamily:"monospace"}}>Hard Value</div><div style={{fontSize:22,fontWeight:800,color:T.gld,marginTop:4}}>{fmt(hv)}</div></Cd>
<Cd><div style={{fontSize:10,color:T.txM,textTransform:"uppercase",fontFamily:"monospace"}}>Ann. Income</div><div style={{fontSize:22,fontWeight:800,color:T.grn,marginTop:4}}>{fmt(sI)}</div></Cd>
<Cd><div style={{fontSize:10,color:T.txM,textTransform:"uppercase",fontFamily:"monospace"}}>Avg Risk</div><div style={{fontSize:22,fontWeight:800,color:ar<=3?T.grn:ar<=6?T.gld:T.red,marginTop:4}}>{ar>0?ar.toFixed(1):"-"}<span style={{fontSize:12,color:T.txM}}>/10</span></div></Cd>
</div>
<div style={{display:"flex",gap:16}}>
<div style={{flex:1}}>
<Hd right={<Bt ghost sm onClick={()=>sSt(true)}>Set Targets</Bt>}>Actual vs Target</Hd>
<Cd>{ACLS.map(cls=>{const ac=tot>0?((byC[cls]||0)/tot)*100:0;const target=tg[cls]||0;if(ac===0&&target===0)return null;const df=ac-target;
return <div key={cls} style={{marginBottom:10}}>
<div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
<span style={{color:T.txt}}>{cls}</span>
<span style={{fontFamily:"monospace"}}><span style={{color:T.txD}}>Tgt {target}%</span> <span style={{color:T.gld,marginLeft:6}}>Act {ac.toFixed(1)}%</span> <span style={{color:df>=0?T.grn:T.red,marginLeft:6}}>({df>=0?"+":""}{df.toFixed(1)})</span></span>
</div>
<div style={{height:5,borderRadius:3,background:T.bdr,overflow:"hidden"}}><div style={{width:Math.min(ac,100)+"%",height:"100%",background:T.gld,borderRadius:3}}/></div>
</div>})}
</Cd>
</div>
<div style={{flex:1.2}}>
<Hd right={<div style={{display:"flex",gap:6}}><CsvImp onImport={imp} label="Import"/><Bt ghost sm onClick={()=>csvX(["Class","Name","Value","Risk","Notes"],it.map(a=>[a.cls,a.name,a.value,a.risk||"",a.notes||""]),"portfolio.csv")}>Export</Bt><Bt sm onClick={()=>sSa(true)}>+ Add</Bt></div>}>Breakdown</Hd>
<Cd style={{maxHeight:450,overflow:"auto"}}>
{Object.entries(byC).sort((a,b)=>b[1]-a[1]).map(([cls,ct])=>
<div key={cls} style={{marginBottom:14}}>
<div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13,fontWeight:700,color:T.txt}}>{cls}</span><span style={{fontSize:12,color:T.gldB,fontFamily:"monospace"}}>{fmt(ct)}</span></div>
{it.filter(a=>a.cls===cls).map(a=>
<div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"3px 0 3px 14px",fontSize:12}}>
<span style={{color:T.txD,flex:1}}>{a.name}</span>
<div style={{display:"flex",alignItems:"center",gap:8}}>
<RB risk={a.risk}/>
<span style={{color:T.txt,fontFamily:"monospace",minWidth:55,textAlign:"right"}}>{fmt(a.value)}</span>
<button onClick={()=>sEi({...a})} style={{background:"none",border:"none",color:T.blu,cursor:"pointer",fontSize:10}}>Edit</button>
<button onClick={()=>rm(a.id)} style={{background:"none",border:"none",color:T.red,cursor:"pointer",fontSize:12,opacity:.5}}>x</button>
</div>
</div>
)}
</div>
)}
{it.length===0&&<div style={{padding:24,textAlign:"center",color:T.txM}}>No assets.</div>}
</Cd>
</div>
</div>
<Md open={sa} onClose={()=>sSa(false)} title="Add Asset">
<div style={{display:"flex",flexDirection:"column",gap:12}}>
<div><Lb>Class</Lb><Sl value={f.cls} onChange={v=>sF({...f,cls:v})} options={ACLS} style={{width:"100%"}}/></div>
<div><Lb>Name</Lb><In value={f.name} onChange={v=>sF({...f,name:v})} placeholder="Gold Eagles, Takoma Towers"/></div>
<div><Lb>Value</Lb><In value={f.value} onChange={v=>sF({...f,value:v})} prefix="$" type="number"/></div>
<RI value={f.risk} onChange={v=>sF({...f,risk:v})}/>
<div><Lb>Notes</Lb><In value={f.notes} onChange={v=>sF({...f,notes:v})}/></div>
<Bt onClick={add} style={{width:"100%"}}>Add Asset</Bt>
</div>
</Md>
<Md open={!!ei} onClose={()=>sEi(null)} title="Edit Asset">
{ei&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
<div><Lb>Class</Lb><Sl value={ei.cls} onChange={v=>sEi({...ei,cls:v})} options={ACLS} style={{width:"100%"}}/></div>
<div><Lb>Name</Lb><In value={ei.name} onChange={v=>sEi({...ei,name:v})}/></div>
<div><Lb>Value</Lb><In value={ei.value} onChange={v=>sEi({...ei,value:+v})} prefix="$" type="number"/></div>
<RI value={ei.risk} onChange={v=>sEi({...ei,risk:+v})}/>
<div><Lb>Notes</Lb><In value={ei.notes||""} onChange={v=>sEi({...ei,notes:v})}/></div>
<Bt onClick={sE} style={{width:"100%"}}>Save</Bt>
</div>}
</Md>
<Md open={st} onClose={()=>sSt(false)} title="Set Target Allocations">
<div style={{display:"flex",flexDirection:"column",gap:8}}>
<div style={{color:T.txD,fontSize:12}}>Set ideal % per class (should total 100%)</div>
{ACLS.map(c=><div key={c} style={{display:"flex",alignItems:"center",gap:10}}><span style={{flex:1,fontSize:12,color:T.txt}}>{c}</span><In value={tg[c]||0} onChange={v=>sTg({...tg,[c]:+v})} suffix="%" type="number" style={{width:80}}/></div>)}
<div style={{borderTop:"1px solid "+T.bdr,paddingTop:8,display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:700}}>
<span>Total</span>
<span style={{color:Object.values(tg).reduce((s,v)=>s+v,0)===100?T.grn:T.red}}>{Object.values(tg).reduce((s,v)=>s+v,0)}%</span>
</div>
</div>
</Md>
</div>)
}
const TABS=[{key:"metals",label:"Metals",icon:"\u25C6"},{key:"synd",label:"RE Syndications",icon:"\u25EB"},{key:"crypto",label:"Crypto",icon:"\u24B8"},{key:"deal",label:"Deal Analyzer",icon:"\u229E"},{key:"port",label:"Portfolio",icon:"\u25C9"}];
const GIc=()=> <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>;
const Lg=({big,onClick})=> <div onClick={onClick} style={{display:"flex",alignItems:"center",gap:10,cursor:onClick?"pointer":"default"}}><div style={{width:big?42:32,height:big?42:32,borderRadius:9,background:"linear-gradient(135deg,"+T.gld+","+T.gldD+")",display:"flex",alignItems:"center",justifyContent:"center",fontSize:big?20:16,fontWeight:900,color:T.bg}}>H</div><div><div style={{fontSize:big?22:16,fontWeight:800,color:T.txt}}>HardAssets<span style={{color:T.gld}}>.io</span></div><div style={{fontSize:9,color:T.txM,letterSpacing:2,textTransform:"uppercase"}}>Track Everything That Holds Value</div></div></div>;


function useReveal(){
  const ref=useRef(null);const[vis,setVis]=useState(false);
  useEffect(()=>{if(!ref.current)return;const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){setVis(true);o.disconnect()}},{threshold:.15,rootMargin:"0px 0px -40px 0px"});o.observe(ref.current);return()=>o.disconnect()},[]);
  return[ref,vis];
}
function Rv({children,delay=0,style={}}){const[ref,vis]=useReveal();return <div ref={ref} style={{opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(30px)",transition:"opacity .7s cubic-bezier(.25,.1,.25,1) "+delay+"s, transform .7s cubic-bezier(.25,.1,.25,1) "+delay+"s",...style}}>{children}</div>}

function HomePage({onNav,user}){
  const S={nav:{position:"sticky",top:0,zIndex:100,padding:"16px 40px",display:"flex",justifyContent:"space-between",alignItems:"center",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",background:"rgba(6,13,27,.85)",borderBottom:"1px solid "+T.bdr},
    link:{background:"none",border:"none",color:T.txD,fontSize:13,cursor:"pointer"},
    loginLink:{background:"none",border:"none",color:T.gld,fontSize:13,cursor:"pointer",fontWeight:600},
    badge:{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 16px",borderRadius:20,border:"1px solid "+T.bdr,background:T.bgC,fontSize:11,color:T.gld,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600,marginBottom:24},
    dot:{width:6,height:6,borderRadius:"50%",background:T.grn,animation:"pulse 2s infinite"},
    mockup:{background:T.bgC,border:"1px solid "+T.bdr,borderRadius:12,overflow:"hidden",boxShadow:"0 40px 80px rgba(0,0,0,.5)"},
    bar:{display:"flex",alignItems:"center",gap:6,padding:"10px 16px",background:T.bgI,borderBottom:"1px solid "+T.bdr},
    mdot:w=>({width:8,height:8,borderRadius:"50%",background:w}),
    mstat:{background:T.bgI,borderRadius:8,padding:"12px 14px",border:"1px solid "+T.bdr},
    section:{padding:"80px 40px",maxWidth:1100,margin:"0 auto"},
    sLabel:{fontSize:11,color:T.gld,textTransform:"uppercase",letterSpacing:3,fontWeight:700,marginBottom:12},
    sTitle:{fontSize:"clamp(28px,3.5vw,42px)",fontWeight:800,letterSpacing:"-.5px",marginBottom:16,lineHeight:1.15},
    card:{background:T.bgC,border:"1px solid "+T.bdr,borderRadius:12,padding:28,transition:"all .3s"},
    trustCard:{background:T.bgC,border:"1px solid "+T.bdr,borderRadius:12,padding:24},
    fq:{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",fontSize:15,fontWeight:600,padding:"20px 0",borderBottom:"1px solid "+T.bdr}};

  const[openFaq,setOpenFaq]=useState(null);
  const faqs=[
    ["Is HardAssets.io really free?","Yes. The core dashboard with all features — including live prices, CSV import/export, and cloud sync — is completely free. No credit card required. We plan to offer premium features in the future, but the current product is free."],
    ["Where do the live prices come from?","Metal prices (gold, silver, platinum, palladium) are pulled from Gold-API.com in real-time. Crypto prices (BTC, ETH, SOL, and 10+ coins) come from CoinGecko's API. Prices update automatically every time you log in, and you can refresh anytime with the Refresh button in the price ticker bar."],
    ["How does the oz-per-unit calculation work?","Different metal forms contain different amounts of troy ounces. A 1oz coin = 1 oz, a 100oz bar = 100 oz, a kilo bar = 32.15 oz, and junk silver = 0.715 oz per unit. The dashboard automatically multiplies your quantity by the oz-per-unit and the live spot price to show accurate portfolio value."],
    ["How is my data secured?","Your data is stored in Google Cloud Firestore with AES-256 encryption. Authentication uses Google Identity Services. All data transmission uses HTTPS/TLS."],
    ["Do you connect to my bank accounts?","No. HardAssets.io is a manual-entry tracker. You add holdings yourself or import from CSV. Zero risk of unauthorized access to financial accounts."],
    ["Can I import from a spreadsheet?","Yes. Every tab has an Import button that accepts CSV files. Export your data from any spreadsheet, click Import, and your holdings are added instantly. Column names are matched automatically."],
    ["What asset types can I track?","Precious metals (12 form types), RE syndications (16 deal types), crypto (13+ coins), plus 11 asset classes in the master portfolio including equities, commodities, fixed income, private credit, alternatives, and more."],
    ["Can I use it on my phone?","Yes. Fully responsive and works on any device. Your data syncs across all devices via your account."]
  ];

  return (<div style={{background:T.bg,minHeight:"100vh",color:T.txt,fontFamily:"system-ui,sans-serif"}}>
    <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.8}}`}</style>

    {/* Nav */}
    <nav style={S.nav}>
      <Lg onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}/>
      <div style={{display:"flex",gap:20,alignItems:"center"}}>
        <button onClick={()=>onNav("contact")} style={S.link}>Contact</button>
        {user?<Bt onClick={()=>onNav("app")}>Dashboard →</Bt>:<><button onClick={()=>onNav("login")} style={S.loginLink}>Login</button><Bt onClick={()=>onNav("login")}>Get Started Free</Bt></>}
      </div>
    </nav>

    {/* Hero */}
    <div style={{textAlign:"center",padding:"80px 40px 60px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-200,left:"50%",transform:"translateX(-50%)",width:800,height:600,background:"radial-gradient(ellipse,rgba(212,168,67,.06) 0%,transparent 60%)",pointerEvents:"none"}}/>
      <div style={{position:"relative"}}>
        <Rv><div style={S.badge}><div style={S.dot}/> Free to use — No credit card required</div></Rv>
        <Rv delay={.1}><h1 style={{fontSize:"clamp(36px,5.5vw,62px)",fontWeight:900,lineHeight:1.05,letterSpacing:-1.5,maxWidth:720,margin:"0 auto 20px"}}>Track Everything<br/>That <span style={{color:T.gld}}>Holds Value</span></h1></Rv>
        <Rv delay={.2}><p style={{fontSize:"clamp(16px,1.8vw,19px)",color:T.txD,maxWidth:540,margin:"0 auto 36px",lineHeight:1.6}}>Gold. Silver. Real estate syndications. Crypto. Commodities. Live spot prices, portfolio tracking, and risk analysis — built for hard asset investors.</p></Rv>
        <Rv delay={.3}><div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:50}}>
          <Bt onClick={()=>onNav(user?"app":"login")} style={{padding:"14px 32px",fontSize:15}}>{user?"Go to Dashboard →":"Start Tracking Free →"}</Bt>
          <Bt ghost onClick={()=>document.getElementById("features")?.scrollIntoView({behavior:"smooth"})} style={{padding:"14px 32px",fontSize:15}}>See Features</Bt>
        </div></Rv>

        {/* Dashboard Mockup */}
        <Rv delay={.4}><div style={{maxWidth:960,margin:"0 auto"}}>
          <div style={S.mockup}>
            <div style={S.bar}><div style={S.mdot("#ef4444")}/><div style={S.mdot("#f59e0b")}/><div style={S.mdot("#10b981")}/><div style={{marginLeft:12,padding:"4px 12px",background:T.bg,borderRadius:6,fontSize:11,color:T.txM,fontFamily:"monospace",flex:1,textAlign:"center"}}>hardassets.io/dashboard</div></div>
            <div style={{padding:16,display:"grid",gap:10}}>
              <div style={{display:"flex",alignItems:"center",gap:14,padding:"6px 12px",background:"#080e1e",borderRadius:6,fontSize:10,fontFamily:"monospace",overflow:"hidden"}}>
                <span style={{color:T.txM}}>LIVE</span><div style={{width:5,height:5,borderRadius:3,background:T.grn}}/>
                {[["Au","$3,042","+2.1%",true],["Ag","$34.18","+1.8%",true],["Pt","$1,021","-0.3%",false],["BTC","$87,420","+4.2%",true],["ETH","$3,180","+2.8%",true]].map(([s,p,c,up],i)=>
                  <span key={i} style={{whiteSpace:"nowrap"}}><span style={{color:T.txM}}>{s}</span> <span style={{color:T.txt}}>{p}</span> <span style={{color:up?T.grn:T.red}}>{up?"▲":"▼"}{c}</span></span>
                )}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                {[["Total Portfolio","$1.24M",T.gldB],["Hard Assets %","72.4%",T.grn],["Est. Annual Income","$47.2K",T.grn],["Avg Risk","4.8/10",T.gld]].map(([l,v,c],i)=>
                  <div key={i} style={S.mstat}><div style={{fontSize:9,color:T.txM,textTransform:"uppercase",letterSpacing:1,fontFamily:"monospace"}}>{l}</div><div style={{fontSize:18,fontWeight:800,color:c,marginTop:4}}>{v}</div></div>
                )}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10}}>
                <div style={{...S.mstat,padding:12}}>
                  <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr 1fr",gap:8,paddingBottom:8,borderBottom:"1px solid "+T.bdr,marginBottom:6}}>
                    {["Asset","Value","Gain","Risk"].map(h=><div key={h} style={{fontSize:9,color:T.txM,textTransform:"uppercase",fontFamily:"monospace"}}>{h}</div>)}
                  </div>
                  {[["Gold (Physical)","$265K","+43.2%","3",T.gld],["Silver (Physical)","$96K","+33.3%","4",T.txD],["Takoma Towers LP","$75K","8% rate","6",T.blu],["Blue Owl RE VI","$150K","6% rate","5",T.blu],["Bitcoin","$34K","+94.3%","8","#f97316"]].map(([a,v,g,r,c],i)=>
                    <div key={i} style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr 1fr",gap:8,padding:"5px 0",borderBottom:"1px solid "+T.bdr+"33"}}>
                      <div style={{fontSize:11,fontFamily:"monospace",color:c}}>{a}</div>
                      <div style={{fontSize:11,fontFamily:"monospace"}}>{v}</div>
                      <div style={{fontSize:11,fontFamily:"monospace",color:g.includes("+")?T.grn:T.gldB}}>{g}</div>
                      <div style={{fontSize:11,fontFamily:"monospace",color:T.txD}}>{r}</div>
                    </div>
                  )}
                </div>
                <div style={{...S.mstat,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg viewBox="0 0 120 120" width="110" height="110"><circle cx="60" cy="60" r="48" fill="none" stroke={T.bdr} strokeWidth="16"/><circle cx="60" cy="60" r="48" fill="none" stroke={T.gld} strokeWidth="16" strokeDasharray="90 212" strokeDashoffset="-18" strokeLinecap="round"/><circle cx="60" cy="60" r="48" fill="none" stroke={T.blu} strokeWidth="16" strokeDasharray="60 242" strokeDashoffset="-108" strokeLinecap="round"/><circle cx="60" cy="60" r="48" fill="none" stroke={T.grn} strokeWidth="16" strokeDasharray="42 260" strokeDashoffset="-168" strokeLinecap="round"/><circle cx="60" cy="60" r="48" fill="none" stroke="#f97316" strokeWidth="16" strokeDasharray="28 274" strokeDashoffset="-210" strokeLinecap="round"/><text x="60" y="56" textAnchor="middle" fill={T.txt} fontSize="13" fontWeight="800" fontFamily="system-ui">$1.24M</text><text x="60" y="70" textAnchor="middle" fill={T.txM} fontSize="7" fontFamily="monospace">TOTAL</text></svg>
                </div>
              </div>
            </div>
          </div>
        </div></Rv>
      </div>
    </div>

    {/* Stats */}
    <div style={{padding:"50px 40px",borderTop:"1px solid "+T.bdr,borderBottom:"1px solid "+T.bdr,background:T.bgI}}>
      <div style={{maxWidth:1000,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:28,textAlign:"center"}}>
        {[["5","Asset Classes"],["16","RE Deal Types"],["13","Crypto Coins"],["Live","Spot Prices"],["100%","Free to Use"]].map(([n,l],i)=>
          <Rv key={i} delay={i*.1}><div style={{fontSize:34,fontWeight:900,fontFamily:"monospace",color:T.gldB}}>{n}</div><div style={{fontSize:12,color:T.txM,marginTop:4}}>{l}</div></Rv>
        )}
      </div>
    </div>

    {/* Features Bento */}
    <div id="features" style={S.section}>
      <div style={{textAlign:"center"}}>
        <Rv><div style={S.sLabel}>Features</div></Rv>
        <Rv delay={.1}><div style={S.sTitle}>Everything You Need in One <span style={{color:T.gld}}>Dashboard</span></div></Rv>
        <Rv delay={.2}><p style={{fontSize:16,color:T.txD,maxWidth:540,margin:"0 auto",lineHeight:1.6}}>No more juggling spreadsheets across asset classes.</p></Rv>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14,marginTop:40}}>
        <Rv><div style={S.card}><div style={{fontSize:18,marginBottom:12}}>◆</div><h3 style={{fontSize:16,fontWeight:700,marginBottom:8}}>Precious Metals Tracker</h3><p style={{fontSize:13,color:T.txD,lineHeight:1.5}}>Track physical gold, silver, platinum & palladium with cost basis and real-time gain/loss. Live spot prices update automatically from Gold-API on every login with oz-per-unit conversion for accurate valuation.</p><div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:14}}>{["1oz Coins","Bars","Rounds","Junk Silver","ETFs","Live Spot Prices"].map(t=><span key={t} style={{padding:"4px 10px",borderRadius:6,fontSize:10,background:T.bgI,border:"1px solid "+T.bdr,color:t==="Live Spot Prices"?T.grn:T.txM,fontFamily:"monospace"}}>{t}</span>)}</div></div></Rv>
        <Rv delay={.1}><div style={S.card}><div style={{fontSize:18,marginBottom:12}}>◫</div><h3 style={{fontSize:16,fontWeight:700,marginBottom:8}}>RE Syndication LP Tracker</h3><p style={{fontSize:13,color:T.txD,lineHeight:1.5}}>Monitor LP positions with rate %, projected IRR, and sponsor tracking across 16 deal types.</p></div></Rv>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginTop:14}}>
        <Rv><div style={S.card}><div style={{fontSize:18,marginBottom:12}}>⊞</div><h3 style={{fontSize:16,fontWeight:700,marginBottom:8}}>Deal Analyzer</h3><p style={{fontSize:13,color:T.txD,lineHeight:1.5}}>Full cash flow calculator with CoC, Cap Rate, DSCR, and quick pass/fail tests.</p></div></Rv>
        <Rv delay={.1}><div style={S.card}><div style={{fontSize:18,marginBottom:12}}>Ⓒ</div><h3 style={{fontSize:16,fontWeight:700,marginBottom:8}}>Crypto Portfolio</h3><p style={{fontSize:13,color:T.txD,lineHeight:1.5}}>Track BTC, ETH, SOL & 10+ coins with live prices from CoinGecko, cost basis tracking, and portfolio allocation with risk scoring.</p></div></Rv>
        <Rv delay={.2}><div style={S.card}><div style={{fontSize:18,marginBottom:12}}>◉</div><h3 style={{fontSize:16,fontWeight:700,marginBottom:8}}>Master Portfolio</h3><p style={{fontSize:13,color:T.txD,lineHeight:1.5}}>Complete allocation across 11 asset classes with targets, risk scoring & income estimates.</p></div></Rv>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginTop:14}}>
        {[["📡","Live Metal Prices"],["💰","Live Crypto Prices"],["📊","CSV Import"],["📥","CSV Export"],["🎯","Risk Ratings"],["📝","Notes"],["✏️","Inline Edit"],["☁️","Cloud Sync"]].map(([ic,lb],i)=>
          <Rv key={i} delay={i*.05}><div style={{...S.card,textAlign:"center",padding:18}}><div style={{fontSize:18,marginBottom:6}}>{ic}</div><div style={{fontSize:11,fontWeight:600}}>{lb}</div></div></Rv>
        )}
      </div>
    </div>

    {/* How it works */}
    <div style={{padding:"80px 40px",background:T.bgI,borderTop:"1px solid "+T.bdr,borderBottom:"1px solid "+T.bdr}}>
      <div style={{maxWidth:1100,margin:"0 auto",textAlign:"center"}}>
        <Rv><div style={S.sLabel}>How It Works</div></Rv>
        <Rv delay={.1}><div style={S.sTitle}>Start Tracking in <span style={{color:T.gld}}>60 Seconds</span></div></Rv>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:32,marginTop:40}}>
          {[["1","Sign Up Free","Create an account with Google or email. Your data syncs across all devices securely."],["2","Add Your Assets","Enter holdings manually or import from CSV. Live spot prices auto-fill for metals and crypto."],["3","See the Full Picture","Live price ticker, allocation charts, risk scores, income projections — updated in real time."]].map(([n,t,d],i)=>
            <Rv key={i} delay={i*.1}><div style={{textAlign:"center",padding:"28px 20px"}}>
              <div style={{width:48,height:48,borderRadius:"50%",border:"2px solid "+T.gld,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:T.gld,margin:"0 auto 18px",fontFamily:"monospace"}}>{n}</div>
              <h3 style={{fontSize:16,fontWeight:700,marginBottom:8}}>{t}</h3>
              <p style={{fontSize:13,color:T.txD,lineHeight:1.5}}>{d}</p>
            </div></Rv>
          )}
        </div>
      </div>
    </div>

    {/* Security */}
    <div style={S.section}>
      <div style={{textAlign:"center"}}>
        <Rv><div style={S.sLabel}>Security & Trust</div></Rv>
        <Rv delay={.1}><div style={S.sTitle}>Your Data, <span style={{color:T.gld}}>Protected</span></div></Rv>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20,marginTop:36}}>
        {[["🔒","Encrypted Storage","AES-256 encryption via Google Cloud Firestore."],["🔑","Google Auth","Secure sign-in via Google. We never see your password."],["👁️","Read-Only","Manual entry only. Zero risk of unauthorized transactions."],["🚫","No Selling Data","Your portfolio data is never shared or sold. Period."]].map(([ic,t,d],i)=>
          <Rv key={i} delay={i*.1}><div style={S.trustCard}><h4 style={{fontSize:14,fontWeight:700,marginBottom:6}}>{ic} {t}</h4><p style={{fontSize:12,color:T.txD,lineHeight:1.5}}>{d}</p></div></Rv>
        )}
      </div>
    </div>

    {/* Built For */}
    <div style={{padding:"80px 40px",background:T.bgI,borderTop:"1px solid "+T.bdr,borderBottom:"1px solid "+T.bdr}}>
      <div style={{maxWidth:900,margin:"0 auto",textAlign:"center"}}>
        <Rv><div style={S.sLabel}>Built For</div></Rv>
        <Rv delay={.1}><div style={S.sTitle}>Investors Who <span style={{color:T.gld}}>Think Different</span></div></Rv>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20,marginTop:36}}>
          {[["🥇","Precious Metals Stackers","Track every coin, bar, and round with real cost basis across gold, silver, platinum."],["🏢","RE Syndication LPs","Monitor LP positions across sponsors and deal types with rate tracking and IRR projections."],["📊","Hard Asset Allocators","See complete allocation across physical and alternative assets with target comparison and risk scoring."]].map(([ic,t,d],i)=>
            <Rv key={i} delay={i*.1}><div style={{...S.card,textAlign:"center",padding:28}}><div style={{fontSize:28,marginBottom:12}}>{ic}</div><h3 style={{fontSize:15,fontWeight:700,marginBottom:6}}>{t}</h3><p style={{fontSize:12,color:T.txD,lineHeight:1.5}}>{d}</p></div></Rv>
          )}
        </div>
      </div>
    </div>

    {/* FAQ */}
    <div style={S.section}>
      <div style={{textAlign:"center"}}>
        <Rv><div style={S.sLabel}>FAQ</div></Rv>
        <Rv delay={.1}><div style={S.sTitle}>Common Questions</div></Rv>
      </div>
      <div style={{maxWidth:680,margin:"36px auto 0"}}>
        {faqs.map(([q,a],i)=>
          <Rv key={i} delay={i*.05}><div style={S.fq} onClick={()=>setOpenFaq(openFaq===i?null:i)}>
            <span>{q}</span><span style={{color:T.txM,fontSize:20,transition:"transform .3s",transform:openFaq===i?"rotate(45deg)":"none"}}>+</span>
          </div>
          <div style={{maxHeight:openFaq===i?200:0,overflow:"hidden",transition:"max-height .4s ease",fontSize:14,color:T.txD,lineHeight:1.6,paddingBottom:openFaq===i?16:0}}>{a}</div></Rv>
        )}
      </div>
    </div>

    {/* Final CTA */}
    <div style={{padding:"80px 40px",textAlign:"center",position:"relative"}}>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:500,height:300,background:"radial-gradient(ellipse,rgba(212,168,67,.08),transparent)",pointerEvents:"none"}}/>
      <div style={{position:"relative"}}>
        <Rv><div style={{fontSize:"clamp(28px,4vw,46px)",fontWeight:800,lineHeight:1.15}}>Ready to See Your<br/><span style={{color:T.gld}}>Complete Picture?</span></div></Rv>
        <Rv delay={.1}><p style={{fontSize:16,color:T.txD,maxWidth:460,margin:"16px auto 32px",lineHeight:1.6}}>Live metal and crypto prices. Portfolio tracking across every hard asset class. Risk scoring. Income projections. Free forever.</p></Rv>
        <Rv delay={.2}><Bt onClick={()=>onNav(user?"app":"login")} style={{padding:"16px 40px",fontSize:17}}>{user?"Go to Dashboard →":"Start Tracking Free →"}</Bt></Rv>
        <Rv delay={.3}><div style={{marginTop:14,fontSize:12,color:T.txM}}>No credit card · Free forever · 60-second setup</div></Rv>
      </div>
    </div>

    {/* Footer */}
    <div style={{borderTop:"1px solid "+T.bdr,padding:"50px 40px 24px"}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:40,marginBottom:36}}>
          <div><Lg/><p style={{fontSize:13,color:T.txD,marginTop:12,lineHeight:1.5,maxWidth:280}}>The portfolio dashboard with live prices built for investors who believe in hard assets.</p></div>
          <div><h4 style={{fontSize:11,color:T.txM,textTransform:"uppercase",letterSpacing:1.5,marginBottom:12}}>Product</h4>{["Features","How It Works","Security","FAQ"].map(l=><div key={l} style={{fontSize:13,color:T.txD,padding:"4px 0",cursor:"pointer"}} onClick={()=>document.getElementById(l.toLowerCase().replace(/ /g,""))?.scrollIntoView({behavior:"smooth"})}>{l}</div>)}</div>
          <div><h4 style={{fontSize:11,color:T.txM,textTransform:"uppercase",letterSpacing:1.5,marginBottom:12}}>Asset Classes</h4>{["Precious Metals","RE Syndications","Crypto","Deal Analyzer"].map(l=><div key={l} style={{fontSize:13,color:T.txD,padding:"4px 0",cursor:"pointer"}} onClick={()=>onNav("login")}>{l}</div>)}</div>
          <div><h4 style={{fontSize:11,color:T.txM,textTransform:"uppercase",letterSpacing:1.5,marginBottom:12}}>Company</h4><div style={{fontSize:13,color:T.txD,padding:"4px 0",cursor:"pointer"}} onClick={()=>onNav("contact")}>Contact Us</div><div style={{fontSize:13,color:T.txD,padding:"4px 0"}}>info@hardassets.io</div></div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid "+T.bdr,paddingTop:20,fontSize:11,color:T.txM}}>
          <div>© 2026 HardAssets.io. All rights reserved.</div>
          <div style={{display:"flex",gap:20}}><span>Privacy Policy</span><span>Terms of Service</span></div>
        </div>
      </div>
    </div>
  </div>);
}

function ContactPg({onNav}){
  const[f,sF]=useState({name:"",email:"",msg:""});const[sent,setSent]=useState(false);
  return (<div style={{background:T.bg,minHeight:"100vh",color:T.txt,fontFamily:"system-ui,sans-serif"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 40px",borderBottom:"1px solid "+T.bdr}}><Lg onClick={()=>onNav("home")}/><Bt ghost onClick={()=>onNav("home")}>Back</Bt></div>
    <div style={{maxWidth:440,margin:"60px auto",padding:"0 20px"}}><h2 style={{fontSize:24,fontWeight:800,marginBottom:24}}>Get in Touch</h2>
    {sent? <Cd style={{textAlign:"center",padding:32}}><div style={{fontSize:16,fontWeight:700,color:T.grn}}>Message Sent!</div><div style={{color:T.txD,fontSize:12,marginTop:6}}>We will reply to {f.email}</div></Cd>:
    <Cd style={{padding:22}}><div style={{display:"flex",flexDirection:"column",gap:12}}><div><Lb>Name</Lb><In value={f.name} onChange={v=>sF({...f,name:v})} placeholder="Your name"/></div><div><Lb>Email</Lb><In value={f.email} onChange={v=>sF({...f,email:v})} placeholder="you@email.com"/></div><div><Lb>Message</Lb><textarea value={f.msg} onChange={e=>sF({...f,msg:e.target.value})} placeholder="How can we help?" rows={4} style={{width:"100%",background:T.bgI,border:"1px solid "+T.bdr,borderRadius:8,color:T.txt,padding:10,fontSize:13,outline:"none",resize:"vertical",fontFamily:"system-ui",boxSizing:"border-box"}}/></div><Bt onClick={()=>{if(f.name&&f.email&&f.msg)setSent(true)}} style={{width:"100%",padding:"11px 0"}}>Send to info@hardassets.io</Bt></div></Cd>}
    </div></div>);
}

function LoginPg({onLogin,onBack}){
  const[mode,setMode]=useState("login");const[email,setEmail]=useState("");const[pass,setPass]=useState("");const[name,setName]=useState("");const[err,setErr]=useState("");
  const gBtnRef=useRef(null);const doneRef=useRef(false);
  const onLoginRef=useRef(onLogin);
  onLoginRef.current=onLogin;
  useEffect(()=>{
    if(doneRef.current)return;
    const render=()=>{
      if(!window.google||!window.google.accounts||!gBtnRef.current||doneRef.current)return;
      doneRef.current=true;
      window.google.accounts.id.initialize({
        client_id:"159487463622-ol75fn02c9cg8gmd2h4bpk36gaga3rcf.apps.googleusercontent.com",
        ux_mode:"popup",
        callback:(response)=>{try{const p=JSON.parse(atob(response.credential.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));onLoginRef.current({email:p.email,name:p.name||p.email.split("@")[0],picture:p.picture,method:"google"})}catch(e){}}
      });
      window.google.accounts.id.renderButton(gBtnRef.current,{theme:"outline",size:"large",width:340,text:"signin_with"});
    };
    if(window.google&&window.google.accounts){render();return;}
    const id=setInterval(()=>{if(window.google&&window.google.accounts){clearInterval(id);render()}},300);
    return()=>clearInterval(id);
  },[]);
  const sub=()=>{if(!email||!pass){setErr("Fill all fields");return;}if(mode==="signup"&&!name){setErr("Enter name");return;}onLogin({email,name:name||email.split("@")[0]})};
  return (<div style={{background:T.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif"}}>
    <div style={{position:"relative",width:380}}><div style={{textAlign:"center",marginBottom:32}}><Lg big onClick={onBack}/></div>
    <Cd style={{padding:26}}>
    <div ref={gBtnRef} style={{marginBottom:14,display:"flex",justifyContent:"center",minHeight:44}}/>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}><div style={{flex:1,height:1,background:T.bdr}}/><span style={{fontSize:11,color:T.txM}}>or sign in with email</span><div style={{flex:1,height:1,background:T.bdr}}/></div>
    <div style={{display:"flex",marginBottom:18,borderRadius:8,overflow:"hidden",border:"1px solid "+T.bdr}}>{["login","signup"].map(m=> <button key={m} onClick={()=>{setMode(m);setErr("")}} style={{flex:1,padding:"9px 0",background:mode===m?T.gld+"18":"transparent",color:mode===m?T.gld:T.txM,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",textTransform:"uppercase",letterSpacing:1}}>{m==="login"?"Sign In":"Sign Up"}</button>)}</div>
    <div style={{display:"flex",flexDirection:"column",gap:10}}>{mode==="signup"&&<div><Lb>Name</Lb><In value={name} onChange={setName} placeholder="Your name"/></div>}<div><Lb>Email</Lb><In value={email} onChange={setEmail} placeholder="you@email.com"/></div><div><Lb>Password</Lb><In value={pass} onChange={setPass} placeholder="********" type="password"/></div>{err&&<div style={{color:T.red,fontSize:12}}>{err}</div>}<Bt onClick={sub} style={{width:"100%",padding:"11px 0",marginTop:4,fontSize:13}}>{mode==="login"?"Sign In":"Create Account"}</Bt></div>
    <div style={{textAlign:"center",marginTop:14}}><button onClick={()=>onLogin({email:"guest",name:"Guest"})} style={{background:"none",border:"none",color:T.txM,fontSize:12,cursor:"pointer",textDecoration:"underline"}}>Continue as guest</button></div>
    </Cd></div></div>);
}

export default function App(){
  const[page,setPage]=useState("home");const[user,setUser]=useState(null);const[tab,setTab]=useState("metals");const[data,setData]=useState(DEF);const[syncing,setSyncing]=useState(false);
  const[prices,setPrices]=useState(null);const[lastUpdated,setLastUpdated]=useState(null);
  useEffect(()=>{initFirebase()},[]);

  const refreshPrices=useCallback(async(currentData)=>{
    const[mp,cp]=await Promise.all([fetchMetalPrices(),fetchCryptoPrices()]);
    const ts=new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});
    setPrices({metals:mp,crypto:cp});setLastUpdated(ts);
    if(mp||cp){
      const d=currentData||data;
      const updated=applyPricesToData(d,mp,cp);
      setData(updated);
      if(user&&user.email&&user.email!=="guest"){fbSave(user.email,updated)}
      return updated;
    }
    return currentData||data;
  },[data,user]);

  const handleLogin=useCallback(async(u)=>{
    setUser(u);setPage("app");
    let loadedData=DEF;
    if(u.email&&u.email!=="guest"){
      setSyncing(true);
      const tryLoad=async(retries)=>{
        if(fbReady){try{const saved=await fbLoad(u.email);if(saved)return saved}catch(e){}}
        else if(retries>0){await new Promise(r=>setTimeout(r,500));return tryLoad(retries-1)}
        return null;
      };
      const saved=await tryLoad(10);
      if(saved){loadedData=saved;setData(saved)}
      setSyncing(false);
    }
    const[mp,cp]=await Promise.all([fetchMetalPrices(),fetchCryptoPrices()]);
    const ts=new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});
    setPrices({metals:mp,crypto:cp});setLastUpdated(ts);
    if(mp||cp){
      const updated=applyPricesToData(loadedData,mp,cp);
      setData(updated);
      if(u.email&&u.email!=="guest"){fbSave(u.email,updated)}
    }
  },[]);

  const save=useCallback(d=>{
    sv("ha-v4",d);
    if(user&&user.email&&user.email!=="guest"){fbSave(user.email,d)}
  },[user]);
  if(page==="home") return <HomePage onNav={setPage} user={user}/>;
  if(page==="contact") return <ContactPg onNav={setPage}/>;
  if(page==="login"&&!user) return <LoginPg onLogin={handleLogin} onBack={()=>setPage("home")}/>;
  if(page==="login"&&user){setPage("app");return null;}
  return (<div style={{background:T.bg,minHeight:"100vh",color:T.txt,fontFamily:"system-ui,-apple-system,sans-serif"}}>
    <PriceTicker prices={prices} onRefresh={()=>refreshPrices(data)} lastUpdated={lastUpdated}/>
    <div style={{borderBottom:"1px solid "+T.bdr,padding:"12px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}><Lg onClick={()=>setPage("home")}/><div style={{display:"flex",alignItems:"center",gap:14}}>{syncing&&<span style={{fontSize:10,color:T.gld}}>Syncing...</span>}{user?.picture&&<img src={user.picture} style={{width:28,height:28,borderRadius:14}} referrerPolicy="no-referrer"/>}{user?.method==="google"&&!user?.picture&&<GIc/>}<span style={{fontSize:12,color:T.txt,fontWeight:600}}>{user?.name}</span>{fbReady&&<span style={{width:6,height:6,borderRadius:3,background:T.grn,display:"inline-block"}} title="Cloud sync active"/>}<button onClick={()=>{setUser(null);setPrices(null);setPage("home")}} style={{background:"none",border:"1px solid "+T.bdr,color:T.txM,padding:"5px 10px",borderRadius:6,fontSize:11,cursor:"pointer"}}>Sign Out</button></div></div>
    <div style={{display:"flex",borderBottom:"1px solid "+T.bdr,padding:"0 24px",background:T.bgC+"88",overflowX:"auto"}}>{TABS.map(t=> <button key={t.key} onClick={()=>setTab(t.key)} style={{background:"none",border:"none",color:tab===t.key?T.gld:T.txM,padding:"12px 16px",fontSize:12,fontWeight:tab===t.key?700:400,cursor:"pointer",borderBottom:tab===t.key?"2px solid "+T.gld:"2px solid transparent",whiteSpace:"nowrap"}}><span style={{marginRight:5}}>{t.icon}</span>{t.label}</button>)}</div>
    <div style={{padding:"20px 24px",maxWidth:1200,margin:"0 auto"}}>{tab==="metals"&&<MetalsTab data={data} sd={setData} save={save} prices={prices}/>}{tab==="synd"&&<SyndTab data={data} sd={setData} save={save}/>}{tab==="crypto"&&<CryptoTab data={data} sd={setData} save={save} prices={prices}/>}{tab==="deal"&&<DealTab/>}{tab==="port"&&<PortTab data={data} sd={setData} save={save}/>}</div>
  </div>);
}
