import { useState, useEffect, useMemo, useRef } from "react";
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

// ═══════════════════════════════════════════════════════════════
//  HARDASSETS.IO — Premium Web Dashboard (ALL FEATURES)
//  APIs: metals.dev + CoinGecko | Design: Monarch × Copilot
// ═══════════════════════════════════════════════════════════════

const P={bg:"#0B0F1A",surface:"#111827",elevated:"#1E293B",card:"rgba(17,24,39,0.72)",border:"rgba(148,163,184,0.08)",borderLight:"rgba(148,163,184,0.12)",gold:"#D4A843",goldSoft:"rgba(212,168,67,0.1)",goldMed:"rgba(212,168,67,0.2)",green:"#34D399",greenSoft:"rgba(52,211,153,0.1)",red:"#F87171",redSoft:"rgba(248,113,113,0.1)",blue:"#60A5FA",blueSoft:"rgba(96,165,250,0.1)",purple:"#A78BFA",purpleSoft:"rgba(167,139,250,0.1)",cyan:"#22D3EE",orange:"#FB923C",text:"#F1F5F9",txS:"#A0AEC0",txM:"#52647A",txF:"#334155"};
const PIE_C=[P.gold,P.blue,P.green,P.purple,P.orange,P.cyan,"#EC4899","#84CC16","#F59E0B","#6366F1","#14B8A6"];
const ff="'Inter',-apple-system,sans-serif",mono="'JetBrains Mono',monospace";
const fmt=n=>{if(n==null||isNaN(n))return"$0";const a=Math.abs(n),s=n<0?"-":"";if(a>=1e6)return s+"$"+(a/1e6).toFixed(2)+"M";if(a>=1e3)return s+"$"+(a/1e3).toFixed(1)+"K";return s+"$"+a.toFixed(2)};
const fPct=n=>(n>=0?"+":"")+n.toFixed(2)+"%";
const spark=(base,pts=40,vol=0.012)=>{let v=base;return Array.from({length:pts},(_,i)=>{v+=v*(Math.random()-0.48)*vol;return{x:i,v}})};
const ozMap={"1 oz":1,"1/2 oz":0.5,"1/4 oz":0.25,"1/10 oz":0.1,"1 kg":32.151,"10 oz":10,"100 oz":100,"Gram":0.03215};
const yrsHeld=d=>{if(!d)return"";const diff=(new Date()-new Date(d))/(365.25*24*3600000);return diff>=0?diff.toFixed(2):""};
const riskColor=r=>r<=3?P.green:r<=6?P.gold:r<=8?P.orange:P.red;
const uid=()=>Date.now()+"_"+Math.random().toString(36).slice(2,6);
const SYND_TYPES=["Multifamily","Office","Retail","Industrial","Hotel","BTR","Self-Storage","Student Housing","Senior Living","Mixed Use","Land","Mobile Home","Medical","Data Center","Warehouse","Debt/Credit Fund"];
const ASSET_CLASSES=["Precious Metals","Real Estate","Equities","Crypto","Commodities","Fixed Income","Private Credit","Alternatives","Venture/PE","Cash","Other"];
const COINS=["BTC","ETH","SOL","ADA","DOT","AVAX","LINK","MATIC","XRP","DOGE","ATOM","UNI","AAVE","BNB","LTC","NEAR","APT","ARB","OP","FIL"];
const PROP_TYPES=["SFH","Duplex","Triplex","Fourplex","Condo","Townhouse","Commercial","Mixed Use","Land","Mobile Home"];
const NOTE_TYPES=["Hard Money","Private Note","P2P Lending","Bridge Loan","Mezzanine","Promissory Note","Mortgage Note","Business Loan","Other"];
const NOTE_STATUS=["Performing","Late","Default","Paid Off"];
const COLLECT_CATS=["Watch","Wine","Art","Car","Jewelry","Coins/Numismatics","Memorabilia","Handbag","Sneakers","Other"];

// ═══ LIVE PRICE APIs ═══
const COIN_IDS={BTC:"bitcoin",ETH:"ethereum",SOL:"solana",ADA:"cardano",DOT:"polkadot",AVAX:"avalanche-2",LINK:"chainlink",MATIC:"matic-network",XRP:"ripple",DOGE:"dogecoin",ATOM:"cosmos",UNI:"uniswap",AAVE:"aave",BNB:"binancecoin",LTC:"litecoin",NEAR:"near",APT:"aptos",ARB:"arbitrum",OP:"optimism",FIL:"filecoin"};

async function fetchMetalPrices(){try{const r=await fetch("/api/prices");if(!r.ok)return null;const d=await r.json();if(d.status!=="success"||!d.metals)return null;return{gold:d.metals.gold||0,silver:d.metals.silver||0,platinum:d.metals.platinum||0,palladium:d.metals.palladium||0}}catch(e){return null}}

async function fetchCryptoPrices(){try{const ids=Object.values(COIN_IDS).join(",");const r=await fetch("https://api.coingecko.com/api/v3/simple/price?ids="+ids+"&vs_currencies=usd&include_24hr_change=true");if(!r.ok)return null;const d=await r.json();const results={};for(const[sym,cgId] of Object.entries(COIN_IDS)){if(d[cgId])results[sym]={price:d[cgId].usd||0,change:d[cgId].usd_24h_change||0}}return results}catch(e){return null}}

// ═══ CSV HELPERS ═══
const csvExport=(headers,rows,filename)=>{const csv=[headers.join(","),...rows.map(r=>r.map(c=>typeof c==="string"&&c.includes(",")?`"${c}"`:c).join(","))].join("\n");const b=new Blob([csv],{type:"text/csv"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=filename;a.click();URL.revokeObjectURL(u)};

// ═══ SUPABASE CLOUD PERSISTENCE ═══
const GOOGLE_CLIENT_ID="159487463622-ol75fn02c9cg8gmd2h4bpk36gaga3rcf.apps.googleusercontent.com";

async function cloudSave(authToken,data){
  if(!authToken)return;
  try{await fetch("/api/save",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+authToken},body:JSON.stringify({data})})}catch(e){console.log("Cloud save err:",e)}
}

async function cloudLoad(authToken){
  if(!authToken)return null;
  try{const r=await fetch("/api/load",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+authToken}});if(!r.ok)return null;const d=await r.json();return d.data||null}catch(e){console.log("Cloud load err:",e);return null}
}

async function saveSnapshot(authToken, data) {
  if (!authToken) return;
  try { await fetch("/api/snapshot", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + authToken }, body: JSON.stringify(data) }); } catch (e) {}
}

async function loadSnapshots(authToken, days = 365) {
  if (!authToken) return [];
  try { const r = await fetch("/api/snapshot?days=" + days, { headers: { "Authorization": "Bearer " + authToken } }); if (!r.ok) return []; const d = await r.json(); return d.snapshots || []; } catch (e) { return []; }
}

function logActivity(authToken,action,assetType,assetId,assetName,oldData,newData){
  if(!authToken)return;
  try{fetch("/api/log",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+authToken},body:JSON.stringify({action,asset_type:assetType,asset_id:assetId,asset_name:assetName,old_data:oldData,new_data:newData})})}catch(e){}
}
async function fetchLogs(authToken){
  if(!authToken)return[];
  try{const r=await fetch("/api/log?limit=200",{headers:{"Authorization":"Bearer "+authToken}});if(!r.ok)return[];const d=await r.json();return d.logs||[]}catch(e){return[]}
}
function timeAgo(ts){if(!ts)return"";const d=new Date(ts),now=new Date(),s=Math.floor((now-d)/1000);if(s<60)return"Just now";if(s<3600)return Math.floor(s/60)+"m ago";if(s<86400)return Math.floor(s/3600)+"h ago";if(s<172800)return"Yesterday";return d.toLocaleDateString("en-US",{month:"short",day:"numeric"})}

async function fetchForex(){try{const r=await fetch("https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,CHF,JPY,CAD,AUD,ILS,CNY,INR,MXN,BRL,SGD,HKD,NZD,SEK,NOK");if(!r.ok)return null;const d=await r.json();return d.rates||null}catch(e){return null}}

// ═══ COMPONENTS ═══
function GC({children,style,onClick}){const[h,setH]=useState(false);return<div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{background:P.card,backdropFilter:"blur(40px)",border:`1px solid ${h&&onClick?P.borderLight:P.border}`,borderRadius:20,transition:"all 0.3s",transform:h&&onClick?"translateY(-2px)":"none",boxShadow:h&&onClick?"0 8px 32px rgba(0,0,0,0.2)":"none",cursor:onClick?"pointer":"default",...style}}>{children}</div>}

function MiniChart({data,color=P.green,height=36,width=80}){const id=useMemo(()=>"m"+Math.random().toString(36).slice(2,7),[]);return<ResponsiveContainer width={width} height={height}><AreaChart data={data} margin={{top:2,right:0,bottom:0,left:0}}><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.3}/><stop offset="100%" stopColor={color} stopOpacity={0}/></linearGradient></defs><Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#${id})`} dot={false}/></AreaChart></ResponsiveContainer>}

function Modal({open,onClose,title,children,wide,onSave}){if(!open)return null;return<div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}><div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)"}}/><div style={{position:"relative",background:P.surface,borderRadius:24,width:"100%",maxWidth:wide?700:520,maxHeight:"85vh",overflow:"auto",animation:"modalIn 0.25s ease"}}><div style={{padding:"20px 28px 16px",borderBottom:`1px solid ${P.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:P.surface,zIndex:2,borderRadius:"24px 24px 0 0"}}><span style={{fontSize:20,fontWeight:700,color:P.text}}>{title}</span><div style={{display:"flex",alignItems:"center",gap:8}}>{onSave&&<button onClick={onSave} style={{padding:"6px 14px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${P.gold},#B8912E)`,color:P.bg,fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>✓ Save</button>}<button onClick={onClose} style={{width:32,height:32,borderRadius:16,background:P.elevated,border:"none",color:P.txS,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button></div></div><div style={{padding:"20px 28px 28px"}}>{children}</div></div></div>}

function FF({label,value,onChange,type="text",prefix,placeholder,isMono,style:s}){return<div style={{marginBottom:14,...s}}><label style={{display:"block",fontSize:12,fontWeight:600,color:P.txS,marginBottom:6}}>{label}</label><div style={{display:"flex",alignItems:"center",background:P.bg,border:`1px solid ${P.border}`,borderRadius:12,overflow:"hidden"}}>{prefix&&<span style={{padding:"0 0 0 14px",color:P.txM,fontSize:14,fontFamily:mono}}>{prefix}</span>}<input value={value} onChange={e=>onChange(e.target.value)} type={type} placeholder={placeholder} style={{flex:1,background:"transparent",border:"none",color:P.text,fontSize:14,padding:prefix?"14px 14px 14px 6px":"14px",outline:"none",fontFamily:isMono?mono:ff,width:"100%",colorScheme:"dark"}}/></div></div>}

function FS({label,value,onChange,options}){return<div style={{marginBottom:14}}><label style={{display:"block",fontSize:12,fontWeight:600,color:P.txS,marginBottom:6}}>{label}</label><select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",background:P.bg,border:`1px solid ${P.border}`,borderRadius:12,color:P.text,fontSize:14,padding:"14px",outline:"none",appearance:"none",fontFamily:ff}}>{options.map(o=><option key={o.value||o} value={o.value||o} style={{background:P.surface}}>{o.label||o}</option>)}</select></div>}

function Btn({children,onClick,variant="gold",full,style:s}){const vs={gold:{background:`linear-gradient(135deg,${P.gold},#B8912E)`,color:P.bg,boxShadow:`0 4px 20px rgba(212,168,67,0.2)`},ghost:{background:"transparent",color:P.txS,border:`1px solid ${P.border}`},danger:{background:P.redSoft,color:P.red,border:`1px solid rgba(248,113,113,0.15)`},soft:{background:P.goldSoft,color:P.gold,border:`1px solid ${P.goldMed}`,padding:"9px 16px",fontSize:13}};return<button onClick={onClick} style={{border:"none",borderRadius:14,padding:"14px 24px",fontSize:14,fontWeight:700,cursor:"pointer",width:full?"100%":"auto",fontFamily:ff,transition:"all 0.2s",...(vs[variant]||vs.gold),...s}}>{children}</button>}

function SponsorInput({value,onChange,synds}){const[show,setShow]=useState(false);const existing=[...new Set(synds.map(s=>s.sponsor).filter(Boolean))];const filtered=existing.filter(s=>s.toLowerCase().includes((value||"").toLowerCase())&&s!==value);return<div style={{position:"relative",marginBottom:14}}><label style={{display:"block",fontSize:12,fontWeight:600,color:P.txS,marginBottom:6}}>Sponsor</label><input value={value} onChange={e=>{onChange(e.target.value);setShow(true)}} onFocus={()=>setShow(true)} onBlur={()=>setTimeout(()=>setShow(false),200)} placeholder="e.g. Bergman" style={{width:"100%",background:P.bg,border:`1px solid ${P.border}`,borderRadius:12,color:P.text,fontSize:14,padding:"12px 14px",outline:"none",fontFamily:ff,boxSizing:"border-box"}}/>{show&&filtered.length>0&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:P.elevated,border:`1px solid ${P.border}`,borderRadius:12,marginTop:4,zIndex:10,overflow:"hidden"}}>{filtered.slice(0,5).map(s=><div key={s} onMouseDown={()=>{onChange(s);setShow(false)}} style={{padding:"10px 14px",fontSize:13,color:P.text,cursor:"pointer",borderBottom:`1px solid ${P.border}`}}>{s}</div>)}</div>}</div>}

function CsvImport({onImport,label="Import"}){const ref=useRef();return<><input ref={ref} type="file" accept=".csv,.xlsx,.xls" style={{display:"none"}} onChange={e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>{const text=ev.target.result;const lines=text.split("\n").filter(l=>l.trim());if(lines.length<2)return;const headers=lines[0].split(",").map(h=>h.trim().replace(/"/g,""));const rows=lines.slice(1).map(l=>{const vals=l.split(",").map(v=>v.trim().replace(/"/g,""));const obj={};headers.forEach((h,i)=>obj[h]=vals[i]||"");return obj});onImport(rows)};reader.readAsText(file);e.target.value=""}}/><Btn variant="ghost" onClick={()=>ref.current?.click()} style={{fontSize:12,padding:"8px 14px"}}>{label}</Btn></>}

// ═══ EDIT FORM ═══
function EditForm({item,type,onSave,onDelete,onClose,prices,synds=[],allCrypto={},saveRef}){
  const[f,sF]=useState({...item});
  const doSave=()=>{const u={...f};if(type==="metal"){u.qty=+u.qty;u.costPerUnit=+u.costPerUnit;u.spot=({Gold:prices.gold,Silver:prices.silver,Platinum:prices.platinum,Palladium:prices.palladium})[u.metal]||u.spot||0;u.name=u.metal+" "+u.unit}if(type==="synd"){u.invested=+u.invested;u.expectedRate=+u.expectedRate;u.risk=+u.risk}if(type==="crypto"){u.qty=+u.qty;u.avgCost=+u.avgCost;u.price=({BTC:prices.btc,ETH:prices.eth,SOL:prices.sol,...allCrypto})[u.coin]||+u.avgCost;u.name=u.coin}if(type==="property"){u.purchasePrice=+u.purchasePrice;u.currentValue=+u.currentValue;u.mortgageBalance=+u.mortgageBalance;u.monthlyRent=+u.monthlyRent;u.monthlyExpenses=+u.monthlyExpenses;u.mortgagePayment=+u.mortgagePayment;u.risk=+u.risk}if(type==="note"){u.principal=+u.principal;u.outstandingBalance=+u.outstandingBalance;u.interestRate=+u.interestRate;u.ltv=u.ltv?+u.ltv:null;u.risk=+u.risk}if(type==="collectible"){u.purchasePrice=+u.purchasePrice;u.currentValue=+u.currentValue;u.insuranceValue=u.insuranceValue?+u.insuranceValue:null;u.risk=+u.risk}onSave(u)};
  useEffect(()=>{if(saveRef)saveRef.current=doSave});

  const spotMap={Gold:prices.gold,Silver:prices.silver,Platinum:prices.platinum,Palladium:prices.palladium};
  const cSpot={BTC:prices.btc,ETH:prices.eth,SOL:prices.sol,...allCrypto};
  return<>
    {type==="metal"&&<><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><FS label="Metal" value={f.metal} onChange={v=>sF({...f,metal:v})} options={["Gold","Silver","Platinum","Palladium"]}/><FS label="Unit" value={f.unit} onChange={v=>sF({...f,unit:v})} options={["1 oz","1/2 oz","1/4 oz","1/10 oz","1 kg","10 oz","100 oz","Gram"]}/><FF label="Quantity" value={f.qty} onChange={v=>sF({...f,qty:v})} type="number" isMono/><FF label="Cost/Unit" value={f.costPerUnit} onChange={v=>sF({...f,costPerUnit:v})} type="number" prefix="$" isMono/></div>
      {spotMap[f.metal]&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:P.goldSoft,borderRadius:10,marginBottom:14,border:`1px solid ${P.goldMed}`}}><div style={{width:6,height:6,borderRadius:3,background:P.gold}}/><span style={{fontSize:12,color:P.txS}}>Live spot</span><span style={{fontSize:13,fontWeight:700,color:P.gold,fontFamily:mono,marginLeft:"auto"}}>${spotMap[f.metal]?.toFixed(2)}/oz</span></div>}</>}
    {type==="synd"&&<><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><FF label="Deal Name" value={f.name} onChange={v=>sF({...f,name:v})}/><SponsorInput value={f.sponsor} onChange={v=>sF({...f,sponsor:v})} synds={synds}/><FF label="Invested" value={f.invested} onChange={v=>sF({...f,invested:v})} type="number" prefix="$" isMono/><FF label="Rate %" value={f.expectedRate} onChange={v=>sF({...f,expectedRate:v})} type="number" prefix="%" isMono/><FF label="Projected IRR %" value={f.projIRR||""} onChange={v=>sF({...f,projIRR:v})} type="number" prefix="%" isMono/><FS label="Strategy" value={f.strategy} onChange={v=>sF({...f,strategy:v})} options={SYND_TYPES}/><FF label="Location" value={f.location||""} onChange={v=>sF({...f,location:v})} placeholder="e.g. Texas, US"/><FS label="Risk" value={f.risk} onChange={v=>sF({...f,risk:v})} options={[...Array(10)].map((_,i)=>({value:String(i+1),label:`${i+1}`}))}/><FS label="Status" value={f.status} onChange={v=>sF({...f,status:v})} options={["Active","Pending","Exited","Default"]}/></div></>}
    {type==="crypto"&&<><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}><FS label="Coin" value={f.coin} onChange={v=>sF({...f,coin:v})} options={COINS}/><FF label="Quantity" value={f.qty} onChange={v=>sF({...f,qty:v})} type="number" isMono/><FF label="Avg Cost" value={f.avgCost} onChange={v=>sF({...f,avgCost:v})} type="number" prefix="$" isMono/></div>
      {cSpot[f.coin]&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:P.purpleSoft,borderRadius:10,marginBottom:14,border:`1px solid rgba(167,139,250,0.15)`}}><div style={{width:6,height:6,borderRadius:3,background:P.purple}}/><span style={{fontSize:12,color:P.txS}}>Live</span><span style={{fontSize:13,fontWeight:700,color:P.purple,fontFamily:mono,marginLeft:"auto"}}>${Math.round(cSpot[f.coin]).toLocaleString()}</span></div>}</>}
    {type==="property"&&<><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><FF label="Property Name" value={f.name} onChange={v=>sF({...f,name:v})}/><FF label="Address" value={f.address||""} onChange={v=>sF({...f,address:v})}/><FS label="Property Type" value={f.propType||"SFH"} onChange={v=>sF({...f,propType:v})} options={PROP_TYPES}/><FF label="Purchase Price" value={f.purchasePrice} onChange={v=>sF({...f,purchasePrice:v})} type="number" prefix="$" isMono/><FF label="Current Value" value={f.currentValue} onChange={v=>sF({...f,currentValue:v})} type="number" prefix="$" isMono/><FF label="Mortgage Balance" value={f.mortgageBalance} onChange={v=>sF({...f,mortgageBalance:v})} type="number" prefix="$" isMono/><FF label="Monthly Rent" value={f.monthlyRent} onChange={v=>sF({...f,monthlyRent:v})} type="number" prefix="$" isMono/><FF label="Monthly Expenses" value={f.monthlyExpenses} onChange={v=>sF({...f,monthlyExpenses:v})} type="number" prefix="$" isMono/><FF label="Mortgage Payment" value={f.mortgagePayment} onChange={v=>sF({...f,mortgagePayment:v})} type="number" prefix="$" isMono/></div></>}
    {type==="note"&&<><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><FF label="Note Name" value={f.name} onChange={v=>sF({...f,name:v})}/><FS label="Note Type" value={f.noteType||"Hard Money"} onChange={v=>sF({...f,noteType:v})} options={NOTE_TYPES}/><FF label="Principal" value={f.principal} onChange={v=>sF({...f,principal:v})} type="number" prefix="$" isMono/><FF label="Outstanding Balance" value={f.outstandingBalance} onChange={v=>sF({...f,outstandingBalance:v})} type="number" prefix="$" isMono/><FF label="Interest Rate %" value={f.interestRate} onChange={v=>sF({...f,interestRate:v})} type="number" prefix="%" isMono/><FF label="Maturity Date" value={f.maturityDate||""} onChange={v=>sF({...f,maturityDate:v})} type="date"/><FF label="Collateral" value={f.collateral||""} onChange={v=>sF({...f,collateral:v})}/><FS label="Status" value={f.status||"Performing"} onChange={v=>sF({...f,status:v})} options={NOTE_STATUS}/><FF label="LTV %" value={f.ltv} onChange={v=>sF({...f,ltv:v})} type="number" prefix="%" isMono/></div></>}
    {type==="collectible"&&<><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><FF label="Item Name" value={f.name} onChange={v=>sF({...f,name:v})}/><FS label="Category" value={f.category||"Watch"} onChange={v=>sF({...f,category:v})} options={COLLECT_CATS}/><FF label="Brand" value={f.brand||""} onChange={v=>sF({...f,brand:v})}/><FF label="Purchase Price" value={f.purchasePrice} onChange={v=>sF({...f,purchasePrice:v})} type="number" prefix="$" isMono/><FF label="Current Value" value={f.currentValue} onChange={v=>sF({...f,currentValue:v})} type="number" prefix="$" isMono/><FF label="Serial Number" value={f.serialNumber||""} onChange={v=>sF({...f,serialNumber:v})}/><FF label="Storage Location" value={f.location||""} onChange={v=>sF({...f,location:v})}/><FF label="Insurance Value" value={f.insuranceValue||""} onChange={v=>sF({...f,insuranceValue:v})} type="number" prefix="$" isMono/><FS label="Insured?" value={f.insured||"No"} onChange={v=>sF({...f,insured:v})} options={["Yes","No"]}/></div></>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
      <FF label="Date Invested" value={f.dateInvested||""} onChange={v=>sF({...f,dateInvested:v})} type="date"/>
      <FF label="Hold Period (Yrs)" value={f.holdPeriod||""} onChange={v=>sF({...f,holdPeriod:v})} type="number" isMono/>
      <FS label="Risk (1-10)" value={f.risk||"5"} onChange={v=>sF({...f,risk:v})} options={[...Array(10)].map((_,i)=>({value:String(i+1),label:`${i+1} — ${i<3?"Low":i<6?"Med":i<8?"High":"V.High"}`}))}/>
    </div>
    {f.dateInvested&&<div style={{fontSize:12,color:P.txS,marginBottom:14}}>Held: <span style={{fontWeight:700,color:P.text,fontFamily:mono}}>{yrsHeld(f.dateInvested)} years</span></div>}
    <FF label="Notes" value={f.notes||""} onChange={v=>sF({...f,notes:v})} placeholder="Optional notes..."/>
    <div style={{display:"flex",gap:12,marginTop:8}}>
      <Btn variant="danger" onClick={()=>{onDelete(f.id);onClose()}} style={{padding:"10px 20px",fontSize:12}}>Delete</Btn>
    </div>
  </>
}

// ═══ ADD FORMS ═══
function AddMetalForm({onAdd,onClose,prices}){const[f,sF]=useState({metal:"Gold",unit:"1 oz",qty:"",costPerUnit:"",dateInvested:"",holdPeriod:"",risk:"3",notes:""});const spot={Gold:prices.gold,Silver:prices.silver,Platinum:prices.platinum,Palladium:prices.palladium};return<><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><FS label="Metal" value={f.metal} onChange={v=>sF({...f,metal:v})} options={["Gold","Silver","Platinum","Palladium"]}/><FS label="Unit" value={f.unit} onChange={v=>sF({...f,unit:v})} options={["1 oz","1/2 oz","1/4 oz","1/10 oz","1 kg","10 oz","100 oz","Gram"]}/><FF label="Quantity" value={f.qty} onChange={v=>sF({...f,qty:v})} type="number" isMono/><FF label="Cost/Unit" value={f.costPerUnit} onChange={v=>sF({...f,costPerUnit:v})} type="number" prefix="$" isMono/></div>{spot[f.metal]&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:P.goldSoft,borderRadius:10,marginBottom:14,border:`1px solid ${P.goldMed}`}}><div style={{width:6,height:6,borderRadius:3,background:P.gold}}/><span style={{fontSize:12,color:P.txS}}>Live spot</span><span style={{fontSize:13,fontWeight:700,color:P.gold,fontFamily:mono,marginLeft:"auto"}}>${spot[f.metal]?.toFixed(2)}/oz</span></div>}<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}><FF label="Date Invested" value={f.dateInvested} onChange={v=>sF({...f,dateInvested:v})} type="date"/><FF label="Hold Period (Yrs)" value={f.holdPeriod} onChange={v=>sF({...f,holdPeriod:v})} type="number" isMono/><FS label="Risk" value={f.risk} onChange={v=>sF({...f,risk:v})} options={[...Array(10)].map((_,i)=>({value:String(i+1),label:`${i+1}`}))}/></div><FF label="Notes" value={f.notes} onChange={v=>sF({...f,notes:v})} placeholder="Optional"/><Btn full onClick={()=>{if(f.qty){onAdd({...f,qty:+f.qty,costPerUnit:+f.costPerUnit,risk:+f.risk,spot:spot[f.metal]||0,name:f.metal+" "+f.unit,id:uid()});onClose()}}}>Add Holding</Btn></>}

function AddSyndForm({onAdd,onClose,synds}){const[f,sF]=useState({name:"",sponsor:"",invested:"",expectedRate:"",projIRR:"",strategy:"Multifamily",location:"",risk:"5",status:"Active",dateInvested:"",holdPeriod:"",notes:""});return<><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><FF label="Deal Name" value={f.name} onChange={v=>sF({...f,name:v})} placeholder="e.g. Pinnacle West"/><SponsorInput value={f.sponsor} onChange={v=>sF({...f,sponsor:v})} synds={synds}/><FF label="Invested" value={f.invested} onChange={v=>sF({...f,invested:v})} type="number" prefix="$" isMono/><FF label="Rate %" value={f.expectedRate} onChange={v=>sF({...f,expectedRate:v})} type="number" prefix="%" isMono/><FF label="Projected IRR %" value={f.projIRR} onChange={v=>sF({...f,projIRR:v})} type="number" prefix="%" isMono/><FS label="Strategy" value={f.strategy} onChange={v=>sF({...f,strategy:v})} options={SYND_TYPES}/><FF label="Location" value={f.location} onChange={v=>sF({...f,location:v})} placeholder="e.g. Texas, US"/><FS label="Risk" value={f.risk} onChange={v=>sF({...f,risk:v})} options={[...Array(10)].map((_,i)=>({value:String(i+1),label:`${i+1}`}))}/><FS label="Status" value={f.status} onChange={v=>sF({...f,status:v})} options={["Active","Pending","Exited","Default"]}/><FF label="Date Invested" value={f.dateInvested} onChange={v=>sF({...f,dateInvested:v})} type="date"/><FF label="Hold Period (Yrs)" value={f.holdPeriod} onChange={v=>sF({...f,holdPeriod:v})} type="number" isMono/></div><FF label="Notes" value={f.notes} onChange={v=>sF({...f,notes:v})} placeholder="Optional"/><Btn full onClick={()=>{if(f.name&&f.invested){onAdd({...f,invested:+f.invested,expectedRate:+f.expectedRate,projIRR:f.projIRR?+f.projIRR:null,risk:+f.risk,id:uid()});onClose()}}}>Add Syndication</Btn></>}

function AddCryptoForm({onAdd,onClose,prices,allCrypto={}}){const[f,sF]=useState({coin:"BTC",qty:"",avgCost:"",dateInvested:"",holdPeriod:"",risk:"7",notes:""});const spot={BTC:prices.btc,ETH:prices.eth,SOL:prices.sol,...allCrypto};return<><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}><FS label="Coin" value={f.coin} onChange={v=>sF({...f,coin:v})} options={COINS}/><FF label="Quantity" value={f.qty} onChange={v=>sF({...f,qty:v})} type="number" isMono/><FF label="Avg Cost" value={f.avgCost} onChange={v=>sF({...f,avgCost:v})} type="number" prefix="$" isMono/></div>{spot[f.coin]&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:P.purpleSoft,borderRadius:10,marginBottom:14,border:`1px solid rgba(167,139,250,0.15)`}}><div style={{width:6,height:6,borderRadius:3,background:P.purple}}/><span style={{fontSize:12,color:P.txS}}>Live</span><span style={{fontSize:13,fontWeight:700,color:P.purple,fontFamily:mono,marginLeft:"auto"}}>${Math.round(spot[f.coin]).toLocaleString()}</span></div>}<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}><FF label="Date Invested" value={f.dateInvested} onChange={v=>sF({...f,dateInvested:v})} type="date"/><FF label="Hold Period (Yrs)" value={f.holdPeriod} onChange={v=>sF({...f,holdPeriod:v})} type="number" isMono/><FS label="Risk" value={f.risk} onChange={v=>sF({...f,risk:v})} options={[...Array(10)].map((_,i)=>({value:String(i+1),label:`${i+1}`}))}/></div><FF label="Notes" value={f.notes} onChange={v=>sF({...f,notes:v})} placeholder="Optional"/><Btn full onClick={()=>{if(f.qty){onAdd({...f,qty:+f.qty,avgCost:+f.avgCost,risk:+f.risk,coin:f.coin,name:f.coin,price:spot[f.coin]||+f.avgCost,id:uid()});onClose()}}}>Add Coin</Btn></>}

function AddPropertyForm({onAdd,onClose}){const[f,sF]=useState({name:"",address:"",propType:"SFH",purchasePrice:"",currentValue:"",mortgageBalance:"",monthlyRent:"",monthlyExpenses:"",mortgagePayment:"",datePurchased:"",holdPeriod:"",risk:"4",notes:""});return<><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><FF label="Property Name" value={f.name} onChange={v=>sF({...f,name:v})} placeholder="e.g. 123 Main St"/><FF label="Address" value={f.address} onChange={v=>sF({...f,address:v})} placeholder="Full address"/><FS label="Property Type" value={f.propType} onChange={v=>sF({...f,propType:v})} options={PROP_TYPES}/><FF label="Purchase Price" value={f.purchasePrice} onChange={v=>sF({...f,purchasePrice:v})} type="number" prefix="$" isMono/><FF label="Current Value" value={f.currentValue} onChange={v=>sF({...f,currentValue:v})} type="number" prefix="$" isMono/><FF label="Mortgage Balance" value={f.mortgageBalance} onChange={v=>sF({...f,mortgageBalance:v})} type="number" prefix="$" isMono/><FF label="Monthly Rent" value={f.monthlyRent} onChange={v=>sF({...f,monthlyRent:v})} type="number" prefix="$" isMono/><FF label="Monthly Expenses" value={f.monthlyExpenses} onChange={v=>sF({...f,monthlyExpenses:v})} type="number" prefix="$" isMono/><FF label="Mortgage Payment" value={f.mortgagePayment} onChange={v=>sF({...f,mortgagePayment:v})} type="number" prefix="$" isMono/><FF label="Date Purchased" value={f.datePurchased} onChange={v=>sF({...f,datePurchased:v})} type="date"/><FF label="Hold Period (Yrs)" value={f.holdPeriod} onChange={v=>sF({...f,holdPeriod:v})} type="number" isMono/><FS label="Risk (1-10)" value={f.risk} onChange={v=>sF({...f,risk:v})} options={[...Array(10)].map((_,i)=>({value:String(i+1),label:`${i+1}`}))}/></div><FF label="Notes" value={f.notes} onChange={v=>sF({...f,notes:v})} placeholder="Optional"/><Btn full onClick={()=>{if(f.name&&f.currentValue){onAdd({...f,purchasePrice:+f.purchasePrice,currentValue:+f.currentValue,mortgageBalance:+f.mortgageBalance,monthlyRent:+f.monthlyRent,monthlyExpenses:+f.monthlyExpenses,mortgagePayment:+f.mortgagePayment,risk:+f.risk,dateInvested:f.datePurchased,id:uid()});onClose()}}}>Add Property</Btn></>}

function AddNoteForm({onAdd,onClose}){const[f,sF]=useState({name:"",noteType:"Hard Money",principal:"",outstandingBalance:"",interestRate:"",maturityDate:"",collateral:"",status:"Performing",ltv:"",dateInvested:"",holdPeriod:"",risk:"5",notes:""});return<><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><FF label="Note Name" value={f.name} onChange={v=>sF({...f,name:v})} placeholder="e.g. Smith Bridge Loan"/><FS label="Note Type" value={f.noteType} onChange={v=>sF({...f,noteType:v})} options={NOTE_TYPES}/><FF label="Principal" value={f.principal} onChange={v=>sF({...f,principal:v})} type="number" prefix="$" isMono/><FF label="Outstanding Balance" value={f.outstandingBalance} onChange={v=>sF({...f,outstandingBalance:v})} type="number" prefix="$" isMono/><FF label="Interest Rate %" value={f.interestRate} onChange={v=>sF({...f,interestRate:v})} type="number" prefix="%" isMono/><FF label="Maturity Date" value={f.maturityDate} onChange={v=>sF({...f,maturityDate:v})} type="date"/><FF label="Collateral" value={f.collateral} onChange={v=>sF({...f,collateral:v})} placeholder="e.g. 456 Oak Ave"/><FS label="Status" value={f.status} onChange={v=>sF({...f,status:v})} options={NOTE_STATUS}/><FF label="LTV %" value={f.ltv} onChange={v=>sF({...f,ltv:v})} type="number" prefix="%" isMono/><FF label="Date Invested" value={f.dateInvested} onChange={v=>sF({...f,dateInvested:v})} type="date"/><FF label="Hold Period (Yrs)" value={f.holdPeriod} onChange={v=>sF({...f,holdPeriod:v})} type="number" isMono/><FS label="Risk (1-10)" value={f.risk} onChange={v=>sF({...f,risk:v})} options={[...Array(10)].map((_,i)=>({value:String(i+1),label:`${i+1}`}))}/></div><FF label="Notes" value={f.notes} onChange={v=>sF({...f,notes:v})} placeholder="Optional"/><Btn full onClick={()=>{if(f.name&&f.outstandingBalance){onAdd({...f,principal:+f.principal,outstandingBalance:+f.outstandingBalance,interestRate:+f.interestRate,ltv:+f.ltv,risk:+f.risk,id:uid()});onClose()}}}>Add Note</Btn></>}

function AddCollectibleForm({onAdd,onClose}){const[f,sF]=useState({name:"",category:"Watch",brand:"",purchasePrice:"",currentValue:"",serialNumber:"",location:"",insuranceValue:"",insured:"No",dateAcquired:"",risk:"5",notes:""});return<><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><FF label="Item Name" value={f.name} onChange={v=>sF({...f,name:v})} placeholder="e.g. Rolex Submariner"/><FS label="Category" value={f.category} onChange={v=>sF({...f,category:v})} options={COLLECT_CATS}/><FF label="Brand" value={f.brand} onChange={v=>sF({...f,brand:v})} placeholder="e.g. Rolex"/><FF label="Purchase Price" value={f.purchasePrice} onChange={v=>sF({...f,purchasePrice:v})} type="number" prefix="$" isMono/><FF label="Current Value" value={f.currentValue} onChange={v=>sF({...f,currentValue:v})} type="number" prefix="$" isMono/><FF label="Serial Number" value={f.serialNumber} onChange={v=>sF({...f,serialNumber:v})} placeholder="Optional"/><FF label="Storage Location" value={f.location} onChange={v=>sF({...f,location:v})} placeholder="e.g. Safe, Vault"/><FF label="Insurance Value" value={f.insuranceValue} onChange={v=>sF({...f,insuranceValue:v})} type="number" prefix="$" isMono/><FS label="Insured?" value={f.insured} onChange={v=>sF({...f,insured:v})} options={["Yes","No"]}/><FF label="Date Acquired" value={f.dateAcquired} onChange={v=>sF({...f,dateAcquired:v})} type="date"/><FS label="Risk (1-10)" value={f.risk} onChange={v=>sF({...f,risk:v})} options={[...Array(10)].map((_,i)=>({value:String(i+1),label:`${i+1}`}))}/></div><FF label="Notes" value={f.notes} onChange={v=>sF({...f,notes:v})} placeholder="Optional"/><Btn full onClick={()=>{if(f.name&&f.currentValue){onAdd({...f,purchasePrice:+f.purchasePrice,currentValue:+f.currentValue,insuranceValue:+f.insuranceValue,risk:+f.risk,dateInvested:f.dateAcquired,id:uid()});onClose()}}}>Add Collectible</Btn></>}

// ═══ TABLE ROW ═══
function TableRow({cols,onClick}){return<div onClick={onClick} style={{display:"grid",gridTemplateColumns:cols.map(c=>c.w||"1fr").join(" "),gap:"0 12px",alignItems:"center",padding:"12px 20px",borderBottom:`1px solid ${P.border}`,cursor:onClick?"pointer":"default",transition:"background 0.15s"}} onMouseEnter={e=>{if(onClick)e.currentTarget.style.background=P.surface}} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>{cols.map((c,i)=><div key={i} style={{fontSize:c.size||14,fontWeight:c.bold?700:c.semi?600:400,color:c.color||P.text,fontFamily:c.mono?mono:ff,textAlign:c.right?"right":"left",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",...(c.style||{})}}>{c.val}</div>)}</div>}

// ═══ DEAL ANALYZER ═══
function DealAnalyzer(){const[d,sD]=useState({price:"",rent:"",tax:"",insurance:"",maintenance:"",vacancy:"8",mgmt:"10",downPct:"25",rate:"7",term:"30"});const price=+d.price||0,rent=+d.rent||0,tax=+d.tax||0,ins=+d.insurance||0,maint=+d.maintenance||0;const down=price*(+d.downPct/100),loan=price-down;const mr=(+d.rate/100)/12,n=+d.term*12;const mortgage=mr>0?loan*(mr*Math.pow(1+mr,n))/(Math.pow(1+mr,n)-1):0;const gross=rent*12,vac=gross*(+d.vacancy/100),eff=gross-vac,mgmtC=eff*(+d.mgmt/100);const noi=eff-tax-ins-(maint*12)-mgmtC,cf=noi-(mortgage*12),mcf=cf/12;const cap=price>0?(noi/price)*100:0,coc=down>0?(cf/down)*100:0,dscr=mortgage>0?noi/(mortgage*12):0;const tests=[{name:"Cap Rate",val:cap.toFixed(1)+"%",pass:cap>=6,tgt:"≥ 6%"},{name:"CoC Return",val:coc.toFixed(1)+"%",pass:coc>=8,tgt:"≥ 8%"},{name:"DSCR",val:dscr.toFixed(2),pass:dscr>=1.25,tgt:"≥ 1.25"},{name:"Monthly CF",val:fmt(mcf),pass:mcf>0,tgt:"> $0"}];
  return<div style={{display:"grid",gridTemplateColumns:price>0?"1fr 1fr":"1fr",gap:20}}>
    <GC style={{padding:24}}><div style={{fontSize:16,fontWeight:700,color:P.text,marginBottom:18}}>Property Details</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Price" value={d.price} onChange={v=>sD({...d,price:v})} prefix="$" isMono/><FF label="Rent/mo" value={d.rent} onChange={v=>sD({...d,rent:v})} prefix="$" isMono/><FF label="Tax/yr" value={d.tax} onChange={v=>sD({...d,tax:v})} prefix="$" isMono/><FF label="Ins/yr" value={d.insurance} onChange={v=>sD({...d,insurance:v})} prefix="$" isMono/><FF label="Maint/mo" value={d.maintenance} onChange={v=>sD({...d,maintenance:v})} prefix="$" isMono/><FF label="Vacancy%" value={d.vacancy} onChange={v=>sD({...d,vacancy:v})} prefix="%" isMono/><FF label="Down%" value={d.downPct} onChange={v=>sD({...d,downPct:v})} prefix="%" isMono/><FF label="Rate%" value={d.rate} onChange={v=>sD({...d,rate:v})} prefix="%" isMono/></div></GC>
    {price>0&&<div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>{tests.map((t,i)=><GC key={i} style={{padding:"16px 18px",borderColor:t.pass?"rgba(52,211,153,0.12)":"rgba(248,113,113,0.12)"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,color:P.txS}}>{t.name}</span><span style={{fontSize:10,color:P.txM}}>{t.tgt}</span></div><div style={{fontSize:22,fontWeight:800,color:t.pass?P.green:P.red,fontFamily:mono}}>{t.val}</div><div style={{fontSize:11,fontWeight:700,color:t.pass?P.green:P.red,marginTop:4}}>{t.pass?"✓ Pass":"✗ Fail"}</div></GC>)}</div>
      <GC style={{padding:24}}><div style={{fontSize:14,fontWeight:700,color:P.text,marginBottom:12}}>Cash Flow</div>{[["Gross",gross],["Vacancy",-vac],["NOI",noi,1],["Mortgage/yr",-(mortgage*12)],["Annual CF",cf,1],["Monthly CF",mcf,1]].map(([l,v,b],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderTop:b?`1px solid ${P.border}`:"none"}}><span style={{fontSize:13,color:b?P.text:P.txS,fontWeight:b?600:400}}>{l}</span><span style={{fontSize:14,fontWeight:b?700:500,color:v>=0?(b?P.green:P.text):P.red,fontFamily:mono}}>{fmt(v)}</span></div>)}</GC></div>}
  </div>}

// ═══ PORTFOLIO VIEW ═══
function PortfolioView({metals,synds,crypto,properties=[],notesLending=[],collectibles=[],prices,targets,setTargets,allCrypto={},authToken:at,snapshots=[],snapRange="3M",setSnapRange}){
  const spotMap={Gold:prices.gold,Silver:prices.silver,Platinum:prices.platinum,Palladium:prices.palladium};
  const cSpot={BTC:prices.btc,ETH:prices.eth,SOL:prices.sol,...allCrypto};
  const mT=metals.reduce((s,m)=>s+m.qty*(ozMap[m.unit]||1)*(spotMap[m.metal]||m.spot||0),0);
  const sT=synds.reduce((s,x)=>s+(x.invested||0),0);
  const cT=crypto.reduce((s,x)=>s+x.qty*(cSpot[x.coin]||x.price||0),0);
  const pT=properties.reduce((s,x)=>s+((+x.currentValue||0)-(+x.mortgageBalance||0)),0);
  const nT=notesLending.reduce((s,x)=>s+(+x.outstandingBalance||0),0);
  const colT=collectibles.reduce((s,x)=>s+(+x.currentValue||0),0);
  const total=mT+sT+cT+pT+nT+colT;
  const hardPct=total>0?((mT+sT+cT+pT+nT+colT)/total*100):0;
  const alloc=[{name:"Precious Metals",value:mT,color:P.gold},{name:"RE Syndications",value:sT,color:P.blue},{name:"Crypto",value:cT,color:P.purple},{name:"Physical RE",value:pT,color:P.green},{name:"Notes & Lending",value:nT,color:P.cyan},{name:"Collectibles",value:colT,color:P.orange}].filter(d=>d.value>0);
  const totalCost=metals.reduce((s,m)=>s+m.qty*(m.costPerUnit||0),0)+synds.reduce((s,x)=>s+(x.invested||0),0)+crypto.reduce((s,x)=>s+x.qty*(x.avgCost||0),0)+properties.reduce((s,x)=>s+(+x.purchasePrice||0),0)+notesLending.reduce((s,x)=>s+(+x.principal||0),0)+collectibles.reduce((s,x)=>s+(+x.purchasePrice||0),0);
  const totalGain=total-totalCost,totalPct=totalCost>0?(totalGain/totalCost*100):0;
  const propRentalIncome=properties.reduce((s,x)=>s+((+x.monthlyRent||0)-(+x.monthlyExpenses||0)-(+x.mortgagePayment||0))*12,0);
  const noteInterestIncome=notesLending.reduce((s,x)=>s+((+x.outstandingBalance||0)*(+x.interestRate||0)/100),0);
  const income=synds.reduce((s,x)=>s+(x.invested*(x.expectedRate||0)/100),0)+propRentalIncome+noteInterestIncome;
  const avgRisk=(()=>{const r=[...synds,...crypto,...metals,...properties,...notesLending,...collectibles].filter(x=>x.risk);return r.length?(r.reduce((s,x)=>s+ +x.risk,0)/r.length).toFixed(1):"—"})();
  const hist=useMemo(()=>spark(totalCost||total*0.85,80,0.006),[totalCost,total]);
  const[showTargets,setShowTargets]=useState(false);

  return<div>
    {/* Performance Chart */}
    {snapshots.length>1&&<GC style={{padding:20,marginBottom:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:16,fontWeight:700,color:P.text}}>Portfolio Performance</div>
        <div style={{display:"flex",gap:4}}>
          {["1W","1M","3M","6M","1Y","All"].map(r=><button key={r} onClick={()=>setSnapRange(r)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${snapRange===r?P.gold:P.border}`,background:snapRange===r?P.goldSoft:"transparent",color:snapRange===r?P.gold:P.txM,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:ff}}>{r}</button>)}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={(()=>{const now=Date.now();const ranges={"1W":7,"1M":30,"3M":90,"6M":180,"1Y":365,"All":9999};const days=ranges[snapRange]||90;return snapshots.filter(s=>now-new Date(s.snapshot_date).getTime()<days*86400000)})()}>
          <defs><linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.gold} stopOpacity={0.3}/><stop offset="100%" stopColor={P.gold} stopOpacity={0}/></linearGradient></defs>
          <XAxis dataKey="snapshot_date" tick={{fontSize:10,fill:P.txM}} axisLine={false} tickLine={false} tickFormatter={d=>new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric"})}/>
          <YAxis tick={{fontSize:10,fill:P.txM,fontFamily:mono}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1e6?"$"+(v/1e6).toFixed(1)+"M":v>=1e3?"$"+(v/1e3).toFixed(0)+"K":"$"+v}/>
          <Tooltip contentStyle={{background:P.elevated,border:`1px solid ${P.border}`,borderRadius:12,fontSize:12,fontFamily:mono}} formatter={v=>"$"+Math.round(v).toLocaleString()} labelFormatter={d=>new Date(d).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}/>
          <Area type="monotone" dataKey="total_value" stroke={P.gold} strokeWidth={2} fill="url(#perfGrad)" dot={false}/>
        </AreaChart>
      </ResponsiveContainer>
    </GC>}
    {/* Hero + Chart */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1.8fr",gap:20,marginBottom:20}}>
      <GC style={{padding:28,display:"flex",flexDirection:"column",justifyContent:"center"}}>
        <div style={{fontSize:13,color:P.txS,fontWeight:500,marginBottom:8}}>Total Portfolio</div>
        <div style={{fontSize:38,fontWeight:800,color:P.text,fontFamily:mono,letterSpacing:-2,lineHeight:1}}>{fmt(total)}</div>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,marginTop:12,padding:"5px 14px",borderRadius:20,background:totalGain>=0?P.greenSoft:P.redSoft,alignSelf:"flex-start"}}><span style={{fontSize:13,fontWeight:700,color:totalGain>=0?P.green:P.red,fontFamily:mono}}>{totalGain>=0?"↑":"↓"} {fmt(Math.abs(totalGain))} ({fPct(totalPct)})</span></div>
        <div style={{display:"flex",gap:24,marginTop:22}}>
          {[{l:"Income/yr",v:fmt(income),c:P.green},{l:"Avg Risk",v:avgRisk+"/10",c:P.orange},{l:"Hard %",v:hardPct.toFixed(1)+"%",c:P.gold},{l:"Assets",v:String(metals.length+synds.length+crypto.length+properties.length+notesLending.length+collectibles.length),c:P.blue}].map((m,i)=><div key={i}><div style={{fontSize:11,color:P.txM,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase",marginBottom:3}}>{m.l}</div><div style={{fontSize:18,fontWeight:800,color:m.c,fontFamily:mono}}>{m.v}</div></div>)}
        </div>
      </GC>
      <GC style={{padding:"18px 14px 6px"}}><ResponsiveContainer width="100%" height={200}><AreaChart data={hist} margin={{top:0,right:0,bottom:0,left:0}}><defs><linearGradient id="pG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.gold} stopOpacity={0.2}/><stop offset="100%" stopColor={P.gold} stopOpacity={0}/></linearGradient></defs><XAxis dataKey="x" hide/><YAxis hide/><Tooltip contentStyle={{background:P.elevated,border:`1px solid ${P.border}`,borderRadius:12,fontSize:13,fontFamily:mono}} formatter={v=>fmt(v)} labelFormatter={()=>""}/><Area type="monotone" dataKey="v" stroke={P.gold} strokeWidth={2} fill="url(#pG)" dot={false}/></AreaChart></ResponsiveContainer></GC>
    </div>
    {/* Allocation + Donut */}
    {alloc.length>0&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
      <GC style={{padding:24}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><span style={{fontSize:14,fontWeight:700,color:P.text}}>Allocation vs Target</span><Btn variant="ghost" onClick={()=>setShowTargets(true)} style={{fontSize:11,padding:"7px 14px"}}>Set Targets</Btn></div>
        <div style={{display:"flex",height:10,borderRadius:5,overflow:"hidden",marginBottom:18}}>{alloc.map((d,i)=><div key={i} style={{flex:d.value,background:d.color}}/>)}</div>
        {alloc.map((d,i)=>{const actual=total>0?(d.value/total*100):0;const target=targets[d.name]||0;const delta=actual-target;return<div key={i} style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:12,height:12,borderRadius:4,background:d.color}}/><span style={{fontSize:14,color:P.text,fontWeight:500}}>{d.name}</span></div><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:14,fontWeight:700,color:P.text,fontFamily:mono}}>{fmt(d.value)}</span><span style={{fontSize:12,color:P.txM,fontFamily:mono}}>{actual.toFixed(1)}%</span></div></div>
          {target>0&&<div style={{display:"flex",alignItems:"center",gap:8}}><div style={{flex:1,height:5,borderRadius:3,background:P.border,overflow:"hidden",position:"relative"}}><div style={{height:"100%",width:`${Math.min(actual,100)}%`,background:d.color,borderRadius:3}}/><div style={{position:"absolute",left:`${Math.min(target,100)}%`,top:-2,width:2,height:9,background:P.text,borderRadius:1}}/></div><span style={{fontSize:11,fontWeight:700,color:delta>=0?P.green:P.red,fontFamily:mono,minWidth:48}}>{delta>=0?"+":""}{delta.toFixed(1)}%</span><span style={{fontSize:10,color:P.txM}}>tgt:{target}%</span></div>}
        </div>})}
      </GC>
      <GC style={{padding:24,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:200,height:200,position:"relative"}}><ResponsiveContainer><PieChart><Pie data={alloc} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} strokeWidth={0} cornerRadius={4}>{alloc.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie></PieChart></ResponsiveContainer><div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:10,color:P.txM,fontWeight:600,letterSpacing:1}}>TOTAL</div><div style={{fontSize:18,fontWeight:800,color:P.text,fontFamily:mono}}>{fmt(total)}</div></div></div></GC>
    </div>}
    {/* Set Targets Modal */}
    <Modal open={showTargets} onClose={()=>setShowTargets(false)} title="Set Target Allocation">
      <div style={{fontSize:12,color:P.txS,marginBottom:16}}>Set your ideal allocation %. Total should equal 100%.</div>
      {ASSET_CLASSES.map(cls=><div key={cls} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${P.border}`}}><span style={{fontSize:13,color:P.text}}>{cls}</span><div style={{display:"flex",alignItems:"center",gap:6}}><input value={targets[cls]||0} onChange={e=>setTargets({...targets,[cls]:+e.target.value})} type="number" style={{width:60,background:P.bg,border:`1px solid ${P.border}`,borderRadius:8,color:P.text,fontSize:13,padding:"8px 10px",outline:"none",fontFamily:mono,textAlign:"right"}}/><span style={{fontSize:12,color:P.txM}}>%</span></div></div>)}
      <div style={{display:"flex",justifyContent:"space-between",padding:"14px 0",marginTop:8}}><span style={{fontSize:14,fontWeight:700,color:P.text}}>Total</span><span style={{fontSize:14,fontWeight:700,fontFamily:mono,color:Object.values(targets).reduce((s,v)=>s+v,0)===100?P.green:P.red}}>{Object.values(targets).reduce((s,v)=>s+v,0)}%</span></div>
      <Btn full onClick={()=>{logActivity(at,"edit","targets",null,"Target Allocation",null,targets);setShowTargets(false)}} style={{marginTop:8}}>Save Targets</Btn>
    </Modal>
  </div>
}

// ═══ HOME PAGE ═══
function HomePage({onNav,user}){
  const[openFaq,setOpenFaq]=useState(null);
  const[legalModal,setLegalModal]=useState(null);
  const faqs=[
    ["Do I need to create an account?","No. You can try the full dashboard as a guest with demo data — no sign-up required. Sign in with Google when you want cloud sync and cross-device access."],
    ["Where do the live prices come from?","Metal prices (gold, silver, platinum, palladium) are pulled from metals.dev in real-time. Crypto prices (BTC, ETH, SOL, and 10+ coins) come from CoinGecko's API."],
    ["How does the oz-per-unit calculation work?","Different metal forms contain different amounts of troy ounces. A 1oz coin = 1 oz, a 100oz bar = 100 oz, a kilo bar = 32.15 oz. The dashboard automatically multiplies your quantity by the oz-per-unit and the live spot price."],
    ["How is my data secured?","Your data is stored in encrypted PostgreSQL database (Supabase) with server-side API routes. Your browser never touches the database directly. Authentication uses Google Identity Services."],
    ["Do you connect to my bank accounts?","No. HardAssets.io is a manual-entry tracker. You add holdings yourself or import from CSV. Zero risk of unauthorized access to financial accounts."],
    ["Can I import from a spreadsheet?","Yes. Every tab has an Import button that accepts CSV files. Export your data from any spreadsheet, click Import, and your holdings are added instantly."],
    ["What asset types can I track?","Precious metals (8 unit types), RE syndications (16 deal types), crypto (13+ coins), plus 11 asset classes in the master portfolio."],
    ["Can I use it on my phone?","Yes. Fully responsive and works on any device. Your data syncs across all devices via your account."]
  ];
  const S={nav:{position:"sticky",top:0,zIndex:100,padding:"16px 40px",display:"flex",justifyContent:"space-between",alignItems:"center",backdropFilter:"blur(20px)",background:"rgba(11,15,26,.85)",borderBottom:"1px solid "+P.border},
    section:{padding:"80px 40px",maxWidth:1100,margin:"0 auto"},
    sLabel:{fontSize:12,color:P.gold,textTransform:"uppercase",letterSpacing:3,fontWeight:700,marginBottom:12},
    sTitle:{fontSize:"clamp(26px,3.5vw,32px)",fontWeight:800,letterSpacing:"-.5px",marginBottom:16,lineHeight:1.15},
    card:{background:P.surface,border:"1px solid "+P.border,borderRadius:12,padding:28,transition:"all .3s"},
    trustCard:{background:P.surface,border:"1px solid "+P.border,borderRadius:12,padding:24},
    fq:{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",fontSize:15,fontWeight:600,padding:"20px 0",borderBottom:"1px solid "+P.border},
    mstat:{background:P.elevated,borderRadius:8,padding:"12px 14px",border:"1px solid "+P.border}};
  const Logo=({big})=><div onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:big?14:10}}><div style={{width:big?40:32,height:big?40:32,borderRadius:big?12:10,background:`linear-gradient(145deg,${P.gold},#B8912E)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:big?20:16,fontWeight:900,color:P.bg}}>H</div><span style={{fontSize:big?22:17,fontWeight:800,color:P.text,letterSpacing:-.5}}>Hard<span style={{color:P.gold}}>Assets</span></span></div>;

  return(<div style={{background:P.bg,minHeight:"100vh",color:P.text,fontFamily:ff}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.8}}@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}`}</style>
    <nav style={S.nav}>
      <Logo/>
      <div style={{display:"flex",gap:20,alignItems:"center"}}>
        <a href="/blog" style={{color:P.txS,fontSize:13,textDecoration:"none"}}>Blog</a>
        <a href="/compare" style={{color:P.txS,fontSize:13,textDecoration:"none"}}>Compare</a>
        <button onClick={()=>onNav("contact")} style={{background:"none",border:"none",color:P.txS,fontSize:13,cursor:"pointer"}}>Contact</button>
        {user?<Btn onClick={()=>onNav("app")}>Dashboard →</Btn>:<><button onClick={()=>onNav("login")} style={{background:"none",border:"none",color:P.gold,fontSize:13,cursor:"pointer",fontWeight:600}}>Login</button><Btn onClick={()=>onNav("demo")}>Try Demo</Btn></>}
      </div>
    </nav>

    <div style={{padding:"8px 40px",background:P.surface,borderBottom:"1px solid "+P.border,display:"flex",justifyContent:"center",gap:24,alignItems:"center",fontSize:12,fontFamily:mono,overflow:"hidden"}}>
      <span style={{color:P.txM}}>LIVE</span><div style={{width:5,height:5,borderRadius:3,background:P.green}}/>
      {[["Au","$3,042","+0.8%",true],["Ag","$34.18","+1.2%",true],["Pt","$1,021","-0.3%",false],["BTC","$87,420","+2.1%",true],["ETH","$2,050","-0.8%",false],["SOL","$140","+3.4%",true]].map(([s,p,c,up],i)=>
        <span key={i}><span style={{color:P.txM}}>{s}</span> <span style={{color:P.text}}>{p}</span> <span style={{color:up?P.green:P.red,fontSize:11}}>{c}</span></span>
      )}
    </div>

    {/* Hero */}
    <div style={{textAlign:"center",padding:"80px 40px 60px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-200,left:"50%",transform:"translateX(-50%)",width:800,height:600,background:"radial-gradient(ellipse,rgba(212,168,67,.06) 0%,transparent 60%)",pointerEvents:"none"}}/>
      <div style={{position:"relative"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 16px",borderRadius:20,border:"1px solid "+P.border,background:P.surface,fontSize:11,color:P.gold,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600,marginBottom:24}}><div style={{width:6,height:6,borderRadius:"50%",background:P.green,animation:"pulse 2s infinite"}}/> Free to use — No credit card required</div>
        <h1 style={{fontSize:"clamp(36px,5vw,48px)",fontWeight:800,lineHeight:1.08,letterSpacing:"-0.02em",maxWidth:720,margin:"0 auto 20px"}}>Track Everything That <span style={{background:`linear-gradient(90deg,${P.gold},#F5D78E,${P.gold})`,backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"shimmer 3s linear infinite"}}>Holds Value</span></h1>
        <p style={{fontSize:17,color:P.txS,maxWidth:540,margin:"0 auto 36px",lineHeight:1.6}}>Gold. Silver. Real estate. Crypto. Collectibles. The only portfolio dashboard built for hard asset investors.</p>
        <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",marginBottom:12}}>
          <Btn onClick={()=>onNav("demo")} style={{padding:"16px 36px",fontSize:16}}>Try Live Demo →</Btn>
          <Btn variant="ghost" onClick={()=>onNav("login")} style={{padding:"16px 36px",fontSize:16}}>Sign In for Cloud Sync</Btn>
        </div>
        <div style={{fontSize:13,color:P.txM}}>No sign-up required to try. Your demo data stays in your browser.</div>

        {/* Dashboard Mockup */}
        <div style={{maxWidth:960,margin:"0 auto"}}>
          <div style={{background:P.surface,border:"1px solid "+P.border,borderRadius:12,overflow:"hidden",boxShadow:"0 40px 80px rgba(0,0,0,.5)"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"10px 16px",background:P.bg,borderBottom:"1px solid "+P.border}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:"#ef4444"}}/><div style={{width:8,height:8,borderRadius:"50%",background:"#f59e0b"}}/><div style={{width:8,height:8,borderRadius:"50%",background:"#10b981"}}/>
              <div style={{marginLeft:12,padding:"4px 12px",background:P.elevated,borderRadius:6,fontSize:11,color:P.txM,fontFamily:mono,flex:1,textAlign:"center"}}>hardassets.io/dashboard</div>
            </div>
            <div style={{padding:16,display:"grid",gap:10}}>
              <div style={{display:"flex",alignItems:"center",gap:14,padding:"6px 12px",background:P.bg,borderRadius:6,fontSize:10,fontFamily:mono,overflow:"hidden"}}>
                <span style={{color:P.txM}}>LIVE</span><div style={{width:5,height:5,borderRadius:3,background:P.green}}/>
                {[["Au","$3,042","+2.1%",true],["Ag","$34.18","+1.8%",true],["Pt","$1,021","-0.3%",false],["BTC","$87,420","+4.2%",true],["ETH","$3,180","+2.8%",true]].map(([s,p,c,up],i)=>
                  <span key={i} style={{whiteSpace:"nowrap"}}><span style={{color:P.txM}}>{s}</span> <span style={{color:P.text}}>{p}</span> <span style={{color:up?P.green:P.red}}>{up?"▲":"▼"}{c}</span></span>
                )}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                {[["Total Portfolio","$1.24M",P.gold],["Hard Assets %","72.4%",P.green],["Est. Annual Income","$47.2K",P.green],["Avg Risk","4.8/10",P.gold]].map(([l,v,c],i)=>
                  <div key={i} style={S.mstat}><div style={{fontSize:9,color:P.txM,textTransform:"uppercase",letterSpacing:1,fontFamily:mono}}>{l}</div><div style={{fontSize:18,fontWeight:800,color:c,marginTop:4}}>{v}</div></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Stats */}
    <div style={{padding:"50px 40px",borderTop:"1px solid "+P.border,borderBottom:"1px solid "+P.border,background:P.surface}}>
      <div style={{maxWidth:1000,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:28,textAlign:"center"}}>
        {[["5","Asset Classes"],["16","RE Deal Types"],["13","Crypto Coins"],["Live","Spot Prices"],["∞","No Limits"]].map(([n,l],i)=>
          <div key={i}><div style={{fontSize:34,fontWeight:900,fontFamily:mono,color:P.gold}}>{n}</div><div style={{fontSize:12,color:P.txM,marginTop:4}}>{l}</div></div>
        )}
      </div>
    </div>

    {/* Features */}
    <div id="features" style={S.section}>
      <div style={{textAlign:"center"}}>
        <div style={S.sLabel}>Features</div>
        <div style={S.sTitle}>Everything You Need in One <span style={{color:P.gold}}>Dashboard</span></div>
        <p style={{fontSize:16,color:P.txS,maxWidth:540,margin:"0 auto",lineHeight:1.6}}>No more juggling spreadsheets across asset classes.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14,marginTop:40}}>
        <div style={S.card}><div style={{fontSize:18,marginBottom:12}}>◆</div><h3 style={{fontSize:16,fontWeight:700,marginBottom:8}}>Precious Metals Tracker</h3><p style={{fontSize:15,color:P.txS,lineHeight:1.5}}>Track physical gold, silver, platinum & palladium with cost basis and real-time gain/loss. Live spot prices with oz-per-unit conversion.</p></div>
        <div style={S.card}><div style={{fontSize:18,marginBottom:12}}>◫</div><h3 style={{fontSize:16,fontWeight:700,marginBottom:8}}>RE Syndication LP Tracker</h3><p style={{fontSize:15,color:P.txS,lineHeight:1.5}}>Monitor LP positions with rate %, projected IRR, and sponsor tracking across 16 deal types.</p></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginTop:14}}>
        <div style={S.card}><div style={{fontSize:18,marginBottom:12}}>⊞</div><h3 style={{fontSize:16,fontWeight:700,marginBottom:8}}>Deal Analyzer</h3><p style={{fontSize:15,color:P.txS,lineHeight:1.5}}>Full cash flow calculator with CoC, Cap Rate, DSCR, and quick pass/fail tests.</p></div>
        <div style={S.card}><div style={{fontSize:18,marginBottom:12}}>Ⓒ</div><h3 style={{fontSize:16,fontWeight:700,marginBottom:8}}>Crypto Portfolio</h3><p style={{fontSize:15,color:P.txS,lineHeight:1.5}}>Track BTC, ETH, SOL & 10+ coins with live prices from CoinGecko, cost basis, and risk scoring.</p></div>
        <div style={S.card}><div style={{fontSize:18,marginBottom:12}}>◉</div><h3 style={{fontSize:16,fontWeight:700,marginBottom:8}}>Master Portfolio</h3><p style={{fontSize:15,color:P.txS,lineHeight:1.5}}>Complete allocation across 11 asset classes with targets, risk scoring & income estimates.</p></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginTop:14}}>
        {[["📡","Live Metal Prices"],["💰","Live Crypto Prices"],["📊","CSV Import"],["📥","CSV Export"],["🎯","Risk Ratings"],["📝","Notes"],["✏️","Inline Edit"],["☁️","Cloud Sync"]].map(([ic,lb],i)=>
          <div key={i} style={{...S.card,textAlign:"center",padding:20}}><div style={{fontSize:18,marginBottom:6}}>{ic}</div><div style={{fontSize:11,fontWeight:600}}>{lb}</div></div>
        )}
      </div>
    </div>

    {/* See It In Action */}
    <div style={{padding:"80px 40px",background:P.surface,borderTop:"1px solid "+P.border,borderBottom:"1px solid "+P.border}}>
      <div style={{maxWidth:1100,margin:"0 auto",textAlign:"center"}}>
        <div style={S.sLabel}>See It In Action</div>
        <div style={S.sTitle}>A Dashboard That <span style={{color:P.gold}}>Gets It</span></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginTop:36}}>
          {[
            ["Portfolio Overview","See your complete allocation across metals, RE, crypto, and alternatives",
              `<div style="display:flex;gap:12;margin-bottom:12"><div style="flex:1;background:#0B0F1A;border:1px solid rgba(148,163,184,0.08);border-radius:8px;padding:12px"><div style="font-size:9px;color:#475569;text-transform:uppercase;letter-spacing:1px">Total Portfolio</div><div style="font-size:22px;font-weight:800;color:#D4A843;font-family:monospace">$1.82M</div></div><div style="flex:1;background:#0B0F1A;border:1px solid rgba(148,163,184,0.08);border-radius:8px;padding:12px"><div style="font-size:9px;color:#475569;text-transform:uppercase;letter-spacing:1px">Hard Assets</div><div style="font-size:22px;font-weight:800;color:#34D399;font-family:monospace">78.4%</div></div></div>`],
            ["Live Spot Prices","Real-time gold, silver, platinum, and crypto prices updated automatically",
              `<div style="display:flex;flex-direction:column;gap:6"><div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(148,163,184,0.08)"><span style="color:#D4A843;font-weight:600">Gold</span><span style="font-family:monospace;font-weight:700;color:#F1F5F9">$3,042.50</span><span style="color:#34D399;font-size:11px">▲ 0.8%</span></div><div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(148,163,184,0.08)"><span style="color:#94A3B8;font-weight:600">Silver</span><span style="font-family:monospace;font-weight:700;color:#F1F5F9">$34.18</span><span style="color:#34D399;font-size:11px">▲ 1.2%</span></div><div style="display:flex;justify-content:space-between;padding:8px 0"><span style="color:#FB923C;font-weight:600">BTC</span><span style="font-family:monospace;font-weight:700;color:#F1F5F9">$87,420</span><span style="color:#34D399;font-size:11px">▲ 2.1%</span></div></div>`],
            ["Deal Analyzer","Analyze rental properties with instant cap rate, CoC return, and DSCR",
              `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8"><div style="background:#0B0F1A;border:1px solid rgba(148,163,184,0.08);border-radius:8px;padding:10px;text-align:center"><div style="font-size:9px;color:#475569;text-transform:uppercase">Cap Rate</div><div style="font-size:18px;font-weight:800;color:#34D399;font-family:monospace">7.2%</div><div style="font-size:9px;color:#34D399">≥ 6% ✓</div></div><div style="background:#0B0F1A;border:1px solid rgba(148,163,184,0.08);border-radius:8px;padding:10px;text-align:center"><div style="font-size:9px;color:#475569;text-transform:uppercase">CoC Return</div><div style="font-size:18px;font-weight:800;color:#34D399;font-family:monospace">9.8%</div><div style="font-size:9px;color:#34D399">≥ 8% ✓</div></div><div style="background:#0B0F1A;border:1px solid rgba(148,163,184,0.08);border-radius:8px;padding:10px;text-align:center"><div style="font-size:9px;color:#475569;text-transform:uppercase">DSCR</div><div style="font-size:18px;font-weight:800;color:#D4A843;font-family:monospace">1.34</div><div style="font-size:9px;color:#34D399">≥ 1.25 ✓</div></div><div style="background:#0B0F1A;border:1px solid rgba(148,163,184,0.08);border-radius:8px;padding:10px;text-align:center"><div style="font-size:9px;color:#475569;text-transform:uppercase">Monthly CF</div><div style="font-size:18px;font-weight:800;color:#34D399;font-family:monospace">$847</div><div style="font-size:9px;color:#34D399">> $0 ✓</div></div></div>`],
            ["Every Asset Type","Metals, syndications, crypto, properties, notes, collectibles — all in one place",
              `<div style="display:flex;flex-direction:column;gap:6"><div style="display:flex;align-items:center;gap:8;padding:8px;background:#0B0F1A;border-radius:8px;border:1px solid rgba(148,163,184,0.08)"><div style="width:28px;height:28px;border-radius:8px;background:rgba(212,168,67,0.15);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#D4A843">Au</div><span style="font-size:12px;font-weight:600;color:#F1F5F9;flex:1">Gold American Eagle</span><span style="font-family:monospace;font-size:12px;font-weight:700;color:#D4A843">$76,250</span></div><div style="display:flex;align-items:center;gap:8;padding:8px;background:#0B0F1A;border-radius:8px;border:1px solid rgba(148,163,184,0.08)"><div style="width:28px;height:28px;border-radius:8px;background:rgba(96,165,250,0.15);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#60A5FA">RE</div><span style="font-size:12px;font-weight:600;color:#F1F5F9;flex:1">Pinnacle West LP</span><span style="font-family:monospace;font-size:12px;font-weight:700;color:#60A5FA">$100K</span></div><div style="display:flex;align-items:center;gap:8;padding:8px;background:#0B0F1A;border-radius:8px;border:1px solid rgba(148,163,184,0.08)"><div style="width:28px;height:28px;border-radius:8px;background:rgba(167,139,250,0.15);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#A78BFA">₿</div><span style="font-size:12px;font-weight:600;color:#F1F5F9;flex:1">Bitcoin</span><span style="font-family:monospace;font-size:12px;font-weight:700;color:#A78BFA">$218K</span></div></div>`]
          ].map(([title,caption,mockup],i)=>
            <div key={i} style={{background:P.surface,border:"1px solid "+P.border,borderRadius:16,overflow:"hidden"}}>
              <div style={{padding:20,background:P.bg,borderBottom:"1px solid "+P.border,minHeight:140}} dangerouslySetInnerHTML={{__html:mockup}}/>
              <div style={{padding:"16px 20px"}}><div style={{fontSize:15,fontWeight:700,color:P.text,marginBottom:4}}>{title}</div><div style={{fontSize:12,color:P.txS,lineHeight:1.5}}>{caption}</div></div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* How it works */}
    <div id="howitworks" style={{padding:"80px 40px",background:P.surface,borderTop:"1px solid "+P.border,borderBottom:"1px solid "+P.border}}>
      <div style={{maxWidth:1100,margin:"0 auto",textAlign:"center"}}>
        <div style={S.sLabel}>How It Works</div>
        <div style={S.sTitle}>Start Tracking in <span style={{color:P.gold}}>60 Seconds</span></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:32,marginTop:40}}>
          {[["1","Try the Demo","Click 'Try Live Demo' to explore a sample portfolio with live prices, allocation charts, and risk scoring. No account needed."],["2","Make It Yours","Add your own holdings — gold bars, syndication deals, crypto, rental properties. Everything calculates automatically."],["3","Sign In to Save","When you're ready, sign in with Google. Your data syncs to the cloud and works on any device."]].map(([n,t,d],i)=>
            <div key={i} style={{textAlign:"center",padding:"28px 20px"}}>
              <div style={{width:48,height:48,borderRadius:"50%",border:"2px solid "+P.gold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:P.gold,margin:"0 auto 18px",fontFamily:mono}}>{n}</div>
              <h3 style={{fontSize:16,fontWeight:700,marginBottom:8}}>{t}</h3>
              <p style={{fontSize:15,color:P.txS,lineHeight:1.5}}>{d}</p>
            </div>
          )}
        </div>
        <div style={{marginTop:24,padding:"16px 24px",background:P.surface,borderRadius:12,border:"1px solid "+P.border,maxWidth:500,margin:"24px auto 0"}}>
          <div style={{fontSize:13,color:P.txS,textAlign:"center"}}>Already know you want in? <button onClick={()=>onNav("login")} style={{background:"none",border:"none",color:P.gold,fontWeight:700,cursor:"pointer",fontSize:13}}>Sign in with Google</button> to start with cloud sync from day one.</div>
        </div>
      </div>
    </div>

    {/* Guest vs Cloud */}
    <div style={S.section}>
      <div style={{textAlign:"center"}}>
        <div style={S.sLabel}>Guest Mode vs Cloud Sync</div>
        <div style={S.sTitle}>Try Everything, <span style={{color:P.gold}}>Then Decide</span></div>
      </div>
      <div style={{maxWidth:700,margin:"36px auto 0",background:P.surface,borderRadius:16,border:"1px solid "+P.border,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"2.5fr 1fr 1fr",padding:"14px 24px",borderBottom:"1px solid "+P.border,background:P.bg}}>
          <span style={{fontSize:12,fontWeight:700,color:P.txM,textTransform:"uppercase"}}>Feature</span>
          <span style={{fontSize:12,fontWeight:700,color:P.txM,textAlign:"center"}}>Guest</span>
          <span style={{fontSize:12,fontWeight:700,color:P.gold,textAlign:"center"}}>Signed In</span>
        </div>
        {[["Live metal & crypto prices",true,true],["Add & track all asset types",true,true],["Deal Analyzer",true,true],["Portfolio allocation & risk",true,true],["CSV import & export",true,true],["Markets page",true,true],["Data saved in browser",true,true],["Cloud sync across devices",false,true],["Data persists after clearing browser",false,true],["Activity history log",false,true]].map(([feat,guest,cloud],i)=>
          <div key={i} style={{display:"grid",gridTemplateColumns:"2.5fr 1fr 1fr",padding:"12px 24px",borderBottom:"1px solid "+P.border}}>
            <span style={{fontSize:13,color:P.text}}>{feat}</span>
            <span style={{textAlign:"center",fontSize:14}}>{guest?<span style={{color:P.green}}>✓</span>:<span style={{color:P.red,opacity:0.5}}>✗</span>}</span>
            <span style={{textAlign:"center",fontSize:14}}>{cloud?<span style={{color:P.green}}>✓</span>:<span style={{color:P.red,opacity:0.5}}>✗</span>}</span>
          </div>
        )}
      </div>
      <div style={{textAlign:"center",marginTop:20,fontSize:13,color:P.txS,maxWidth:500,margin:"20px auto 0"}}>Start as guest. Sign in whenever you're ready. Adding your real holdings takes minutes.</div>
    </div>

    {/* Security */}
    <div id="security" style={S.section}>
      <div style={{textAlign:"center"}}>
        <div style={S.sLabel}>Security & Trust</div>
        <div style={S.sTitle}>Your Data, <span style={{color:P.gold}}>Protected</span></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20,marginTop:36}}>
        {[["🔒","Bank-Level Encryption","All data encrypted with AES-256. Hosted on Supabase with enterprise security."],["🔑","Google Authentication","Sign in with Google. We never see your password."],["👁️","Manual Entry Only","We never connect to your bank or brokerage. Zero risk of unauthorized access."],["🛡️","Guest Mode Available","Try everything without creating an account. Demo data stays in your browser only."]].map(([ic,t,d],i)=>
          <div key={i} style={S.trustCard}><h4 style={{fontSize:14,fontWeight:700,marginBottom:6}}>{ic} {t}</h4><p style={{fontSize:15,color:P.txS,lineHeight:1.5}}>{d}</p></div>
        )}
      </div>
    </div>

    {/* Built For */}
    <div style={{padding:"80px 40px",background:P.surface,borderTop:"1px solid "+P.border,borderBottom:"1px solid "+P.border}}>
      <div style={{maxWidth:900,margin:"0 auto",textAlign:"center"}}>
        <div style={S.sLabel}>Built For</div>
        <div style={S.sTitle}>Investors Who <span style={{color:P.gold}}>Think Different</span></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20,marginTop:36}}>
          {[["🥇","Precious Metals Stackers","Track every coin, bar, and round with real cost basis across gold, silver, platinum."],["🏢","RE Syndication LPs","Monitor LP positions across sponsors and deal types with rate tracking and IRR projections."],["📊","Hard Asset Allocators","See complete allocation across physical and alternative assets with target comparison and risk scoring."]].map(([ic,t,d],i)=>
            <div key={i} style={{...S.card,textAlign:"center",padding:28}}><div style={{fontSize:28,marginBottom:12}}>{ic}</div><h3 style={{fontSize:15,fontWeight:700,marginBottom:6}}>{t}</h3><p style={{fontSize:15,color:P.txS,lineHeight:1.5}}>{d}</p></div>
          )}
        </div>
      </div>
    </div>

    {/* FAQ */}
    <div id="faq" style={S.section}>
      <div style={{textAlign:"center"}}>
        <div style={S.sLabel}>FAQ</div>
        <div style={S.sTitle}>Common Questions</div>
      </div>
      <div style={{maxWidth:680,margin:"36px auto 0"}}>
        {faqs.map(([q,a],i)=>
          <div key={i}><div style={S.fq} onClick={()=>setOpenFaq(openFaq===i?null:i)}>
            <span>{q}</span><span style={{color:P.txM,fontSize:20,transition:"transform .3s",transform:openFaq===i?"rotate(45deg)":"none"}}>+</span>
          </div>
          <div style={{maxHeight:openFaq===i?200:0,overflow:"hidden",transition:"max-height .4s ease",fontSize:16,color:P.txS,lineHeight:1.7,paddingBottom:openFaq===i?16:0}}>{a}</div></div>
        )}
      </div>
    </div>

    {/* Final CTA */}
    <div style={{padding:"80px 40px",textAlign:"center",position:"relative"}}>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:500,height:300,background:"radial-gradient(ellipse,rgba(212,168,67,.08),transparent)",pointerEvents:"none"}}/>
      <div style={{position:"relative"}}>
        <div style={{fontSize:"clamp(28px,4vw,46px)",fontWeight:800,lineHeight:1.15}}>Your Hard Assets Deserve a<br/><span style={{color:P.gold}}>Real Dashboard</span></div>
        <p style={{fontSize:16,color:P.txS,maxWidth:460,margin:"16px auto 32px",lineHeight:1.6}}>Most portfolio trackers ignore gold, real estate, and alternatives. This one was built for them.</p>
        <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
          <Btn onClick={()=>onNav("demo")} style={{padding:"16px 36px",fontSize:16}}>Try Live Demo →</Btn>
          <Btn variant="ghost" onClick={()=>onNav("login")} style={{padding:"16px 36px",fontSize:16}}>Sign In with Google</Btn>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div style={{borderTop:"1px solid "+P.border,padding:"50px 40px 24px"}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:40,marginBottom:36}}>
          <div><Logo/><p style={{fontSize:13,color:P.txS,marginTop:12,lineHeight:1.5,maxWidth:280}}>The portfolio dashboard with live prices built for investors who believe in hard assets.</p></div>
          <div><h4 style={{fontSize:13,color:P.txM,textTransform:"uppercase",letterSpacing:1.5,marginBottom:12}}>Product</h4>{["Features","How It Works","Security","FAQ"].map(l=><div key={l} style={{fontSize:13,color:P.txS,padding:"4px 0",cursor:"pointer"}} onClick={()=>document.getElementById(l.toLowerCase().replace(/ /g,""))?.scrollIntoView({behavior:"smooth"})}>{l}</div>)}</div>
          <div><h4 style={{fontSize:13,color:P.txM,textTransform:"uppercase",letterSpacing:1.5,marginBottom:12}}>Asset Classes</h4>{["Precious Metals","RE Syndications","Crypto","Deal Analyzer"].map(l=><div key={l} style={{fontSize:13,color:P.txS,padding:"4px 0",cursor:"pointer"}} onClick={()=>onNav(user?"app":"login")}>{l}</div>)}</div>
          <div><h4 style={{fontSize:13,color:P.txM,textTransform:"uppercase",letterSpacing:1.5,marginBottom:12}}>Company</h4><a href="/blog" style={{display:"block",fontSize:13,color:P.txS,padding:"4px 0",textDecoration:"none"}}>Blog</a><div style={{fontSize:13,color:P.txS,padding:"4px 0",cursor:"pointer"}} onClick={()=>onNav("contact")}>Contact Us</div><div style={{fontSize:13,color:P.txS,padding:"4px 0"}}>support@hardassets.io</div></div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid "+P.border,paddingTop:20,fontSize:13,color:P.txM}}>
          <div>© 2026 HardAssets.io. All rights reserved.</div>
          <div style={{display:"flex",gap:20}}><span style={{cursor:"pointer"}} onClick={()=>setLegalModal("privacy")}>Privacy Policy</span><span style={{cursor:"pointer"}} onClick={()=>setLegalModal("terms")}>Terms of Service</span></div>
        </div>
      </div>
    </div>

    {legalModal&&<div onClick={()=>setLegalModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{background:P.surface,border:"1px solid "+P.border,borderRadius:16,padding:32,maxWidth:640,maxHeight:"80vh",overflow:"auto",width:"100%"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 style={{fontSize:20,fontWeight:800}}>{legalModal==="privacy"?"Privacy Policy":"Terms of Service"}</h2>
          <button onClick={()=>setLegalModal(null)} style={{background:"none",border:"none",color:P.txM,fontSize:22,cursor:"pointer"}}>x</button>
        </div>
        {legalModal==="privacy"?<div style={{fontSize:13,color:P.txS,lineHeight:1.8}}>
          <p style={{marginBottom:16}}><strong style={{color:P.text}}>Effective Date:</strong> March 26, 2026</p>
          <p style={{marginBottom:16}}><strong style={{color:P.text}}>What We Collect:</strong> When you sign in with Google, we receive your name, email address, and profile picture. We store the portfolio data you enter into the dashboard.</p>
          <p style={{marginBottom:16}}><strong style={{color:P.text}}>How We Use It:</strong> Your data is used solely to provide the HardAssets.io portfolio tracking service. We do not sell, share, rent, or trade your personal information or portfolio data with any third party.</p>
          <p style={{marginBottom:16}}><strong style={{color:P.text}}>Data Storage:</strong> Your portfolio data is stored in an encrypted PostgreSQL database hosted on Supabase. All data transmission uses HTTPS/TLS encryption.</p>
          <p style={{marginBottom:16}}><strong style={{color:P.text}}>No Tracking:</strong> We do not use tracking cookies, advertising pixels, or analytics that identify individual users.</p>
          <p style={{marginBottom:16}}><strong style={{color:P.text}}>Data Deletion:</strong> You may request deletion of your account and all associated data at any time by contacting support@hardassets.io.</p>
          <p style={{marginBottom:16}}><strong style={{color:P.text}}>Contact:</strong> For any privacy questions, email support@hardassets.io.</p>
        </div>:<div style={{fontSize:13,color:P.txS,lineHeight:1.8}}>
          <p style={{marginBottom:16}}><strong style={{color:P.text}}>Effective Date:</strong> March 26, 2026</p>
          <p style={{marginBottom:16}}><strong style={{color:P.text}}>Service Description:</strong> HardAssets.io is a free portfolio tracking dashboard for precious metals, real estate syndications, cryptocurrency, and other asset classes. Provided as-is for informational purposes only.</p>
          <p style={{marginBottom:16}}><strong style={{color:P.text}}>Not Financial Advice:</strong> HardAssets.io does not provide financial, investment, tax, or legal advice. All data and analytics are for informational purposes only.</p>
          <p style={{marginBottom:16}}><strong style={{color:P.text}}>Price Data:</strong> Live metal prices from metals.dev and crypto prices from CoinGecko. We do not guarantee accuracy or timeliness of price data.</p>
          <p style={{marginBottom:16}}><strong style={{color:P.text}}>No Account Connections:</strong> We never connect to your bank, brokerage, or any financial accounts. All data is entered by you.</p>
          <p style={{marginBottom:16}}><strong style={{color:P.text}}>Limitation of Liability:</strong> Provided "as is" without warranties. We are not liable for any losses arising from use of the service.</p>
          <p style={{marginBottom:16}}><strong style={{color:P.text}}>Contact:</strong> For questions, email support@hardassets.io.</p>
        </div>}
      </div>
    </div>}
  </div>);
}

// ═══ CONTACT PAGE ═══
function ContactPg({onNav}){
  const[f,sF]=useState({name:"",email:"",msg:"",_hp:""});const[sent,setSent]=useState(false);const[sending,setSending]=useState(false);const[ts]=useState(Date.now());
  const submit=async()=>{if(!f.name||!f.email||!f.msg)return;setSending(true);try{const r=await fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:f.name,email:f.email,message:f.msg,_hp:f._hp,_ts:ts})});const d=await r.json();if(d.success){setSent(true)}else{window.location.href="mailto:support@hardassets.io?subject="+encodeURIComponent("Contact from "+f.name)+"&body="+encodeURIComponent("From: "+f.name+" ("+f.email+")\n\n"+f.msg);setSent(true)}}catch(e){window.location.href="mailto:support@hardassets.io?subject="+encodeURIComponent("Contact from "+f.name)+"&body="+encodeURIComponent("From: "+f.name+" ("+f.email+")\n\n"+f.msg);setSent(true)}setSending(false)};
  const Logo=()=><div style={{cursor:"pointer",display:"flex",alignItems:"center",gap:10}} onClick={()=>onNav("home")}><div style={{width:32,height:32,borderRadius:10,background:`linear-gradient(145deg,${P.gold},#B8912E)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:P.bg}}>H</div><span style={{fontSize:17,fontWeight:800,color:P.text,letterSpacing:-.5}}>Hard<span style={{color:P.gold}}>Assets</span></span></div>;
  return(<div style={{background:P.bg,minHeight:"100vh",color:P.text,fontFamily:ff}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 40px",borderBottom:"1px solid "+P.border}}><Logo/><Btn variant="ghost" onClick={()=>onNav("home")}>Back</Btn></div>
    <div style={{maxWidth:440,margin:"60px auto",padding:"0 20px"}}><h2 style={{fontSize:24,fontWeight:800,marginBottom:24}}>Get in Touch</h2>
    {sent?<GC style={{textAlign:"center",padding:32}}><div style={{fontSize:16,fontWeight:700,color:P.green}}>Message Sent!</div><div style={{color:P.txS,fontSize:12,marginTop:6}}>We will reply to {f.email}</div></GC>:
    <GC style={{padding:22}}><div style={{display:"flex",flexDirection:"column",gap:12}}>
      <FF label="Name" value={f.name} onChange={v=>sF({...f,name:v})} placeholder="Your name"/>
      <FF label="Email" value={f.email} onChange={v=>sF({...f,email:v})} placeholder="you@email.com"/>
      <div style={{marginBottom:14}}><label style={{display:"block",fontSize:12,fontWeight:600,color:P.txS,marginBottom:6}}>Message</label><textarea value={f.msg} onChange={e=>sF({...f,msg:e.target.value})} placeholder="How can we help?" rows={4} style={{width:"100%",background:P.bg,border:"1px solid "+P.border,borderRadius:12,color:P.text,padding:12,fontSize:14,outline:"none",resize:"vertical",fontFamily:ff,boxSizing:"border-box"}}/></div>
      <input type="text" value={f._hp} onChange={e=>sF({...f,_hp:e.target.value})} style={{position:"absolute",left:"-9999px",opacity:0,height:0,width:0,tabIndex:-1}} autoComplete="off" aria-hidden="true"/>
      <Btn onClick={submit} full style={{opacity:sending?0.6:1}}>{sending?"Sending...":"Send Message"}</Btn>
    </div></GC>}
    </div></div>);
}

const DEMO_DATA={
  metals:[
    {id:"d1",metal:"Gold",unit:"1 oz",qty:25,costPerUnit:1850,spot:0,name:"Gold 1 oz",risk:3,dateInvested:"2023-03-15",notes:"American Eagles"},
    {id:"d2",metal:"Gold",unit:"100 oz",qty:1,costPerUnit:182000,spot:0,name:"Gold 100 oz",risk:3,dateInvested:"2024-01-10",notes:"PAMP bar"},
    {id:"d3",metal:"Silver",unit:"1 oz",qty:1000,costPerUnit:24,spot:0,name:"Silver 1 oz",risk:4,dateInvested:"2022-11-20",notes:"Maple Leafs"},
    {id:"d4",metal:"Platinum",unit:"1 oz",qty:15,costPerUnit:890,spot:0,name:"Platinum 1 oz",risk:4,dateInvested:"2023-09-01",notes:"Eagles"},
    {id:"d5",metal:"Gold",unit:"1/10 oz",qty:50,costPerUnit:210,spot:0,name:"Gold 1/10 oz",risk:3,dateInvested:"2024-06-15",notes:"Fractional Eagles"}
  ],
  syndications:[
    {id:"d6",name:"Pinnacle West Apartments",sponsor:"Bergman",invested:100000,expectedRate:8,projIRR:15,strategy:"Multifamily",risk:5,status:"Active",dateInvested:"2024-06-01",location:"Phoenix, AZ",notes:""},
    {id:"d7",name:"Blue Owl Real Estate VI",sponsor:"Blue Owl",invested:250000,expectedRate:6,projIRR:12,strategy:"Diversified",risk:4,status:"Active",dateInvested:"2024-09-15",location:"US",notes:""},
    {id:"d8",name:"Avery Portorosa LP",sponsor:"Klein",invested:300000,expectedRate:12,projIRR:18,strategy:"Hotel",risk:7,status:"Active",dateInvested:"2025-01-15",location:"Miami, FL",notes:""},
    {id:"d9",name:"Rosser Avenue BTR",sponsor:"Equinum",invested:75000,expectedRate:9,projIRR:16,strategy:"BTR",risk:6,status:"Active",dateInvested:"2024-03-01",location:"Dallas, TX",notes:""}
  ],
  crypto:[
    {id:"d10",coin:"BTC",name:"BTC",qty:2.5,avgCost:38000,price:0,risk:8,dateInvested:"2023-01-15",notes:""},
    {id:"d11",coin:"ETH",name:"ETH",qty:25,avgCost:2200,price:0,risk:8,dateInvested:"2023-06-01",notes:""},
    {id:"d12",coin:"SOL",name:"SOL",qty:200,avgCost:85,price:0,risk:9,dateInvested:"2024-02-10",notes:""}
  ],
  properties:[
    {id:"d13",name:"Primary Residence",address:"123 Oak Lane",propType:"SFH",purchasePrice:450000,currentValue:580000,mortgageBalance:320000,monthlyRent:0,monthlyExpenses:400,mortgagePayment:1800,risk:3,datePurchased:"2020-05-15",notes:""},
    {id:"d14",name:"Rental Duplex",address:"456 Elm St",propType:"Duplex",purchasePrice:280000,currentValue:340000,mortgageBalance:210000,monthlyRent:3200,monthlyExpenses:800,mortgagePayment:1400,risk:5,datePurchased:"2022-08-01",notes:""}
  ],
  notesLending:[
    {id:"d15",name:"Bridge Loan — 123 Main St",noteType:"Hard Money",principal:150000,outstandingBalance:150000,interestRate:12,status:"Performing",collateral:"123 Main St, Osceola FL",risk:6,dateInvested:"2024-11-01",notes:""}
  ],
  collectibles:[
    {id:"d16",name:"Rolex Submariner 124060",category:"Watch",brand:"Rolex",purchasePrice:9500,currentValue:12800,serialNumber:"3K2J9X7",location:"Home safe",insured:"Yes",risk:4,dateAcquired:"2023-04-20",notes:""},
    {id:"d17",name:"2018 Château Margaux (6 bottles)",category:"Wine",brand:"Château Margaux",purchasePrice:3600,currentValue:5200,location:"Wine storage",insured:"No",risk:5,dateAcquired:"2023-12-10",notes:""}
  ],
  targets:{"Precious Metals":25,"Real Estate":35,"Crypto":10,"Equities":10,"Alternatives":10,"Cash":5,"Fixed Income":5}
};

// ═══ MAIN APP ═══
export default function HardAssetsWeb(){
  const[view,setView]=useState(()=>{try{return sessionStorage.getItem("ha_user")?"app":"home"}catch(e){return"home"}});
  const[tab,setTab]=useState("portfolio");
  const[modal,setModal]=useState(null);
  const[editItem,setEditItem]=useState(null);
  const editSaveRef=useRef(null);
  const[confirmDelete,setConfirmDelete]=useState(null);
  const[showFaq,setShowFaq]=useState(false);
  const[sideCollapsed,setSC]=useState(false);
  const[user,setUser]=useState(()=>{try{const s=sessionStorage.getItem("ha_user");return s?JSON.parse(s):null}catch(e){return null}});
  const[authToken,setAuthToken]=useState(()=>sessionStorage.getItem("ha_token")||null);
  const[syncing,setSyncing]=useState(false);

  const[metals,setMetals]=useState([]);
  const[synds,setSynds]=useState([]);
  const[crypto,setCrypto]=useState([]);
  const[properties,setProperties]=useState([]);
  const[notesLending,setNotesLending]=useState([]);
  const[collectibles,setCollectibles]=useState([]);
  const[prices,setPrices]=useState({gold:3015,silver:33.8,platinum:1015,palladium:985,goldChg:0.42,silverChg:1.1,platChg:-0.3,btc:87240,eth:2050,sol:140,btcChg:2.1,ethChg:-0.8,solChg:3.4});
  const[allCrypto,setAllCrypto]=useState({});
  const[targets,setTargets]=useState({"Precious Metals":30,"Real Estate":35,"Crypto":10,"Equities":10,"Cash":5,"Alternatives":10});
  const[lastRefresh,setLastRefresh]=useState(null);
  const[refreshing,setRefreshing]=useState(false);
  const[editOriginal,setEditOriginal]=useState(null);
  const[showActivity,setShowActivity]=useState(false);
  const[activityLogs,setActivityLogs]=useState([]);
  const[activityFilter,setActivityFilter]=useState("all");
  const[forex,setForex]=useState(null);
  const[marketSearch,setMarketSearch]=useState("");
  const[cryptoSort,setCryptoSort]=useState("price");
  const[snapshots,setSnapshots]=useState([]);
  const[snapRange,setSnapRange]=useState("3M");

  // Persist session to sessionStorage
  useEffect(()=>{try{if(user)sessionStorage.setItem("ha_user",JSON.stringify(user));else sessionStorage.removeItem("ha_user")}catch(e){}},[user]);
  useEffect(()=>{try{if(authToken)sessionStorage.setItem("ha_token",authToken);else sessionStorage.removeItem("ha_token")}catch(e){}},[authToken]);

  // Restore data on mount if session exists
  useEffect(()=>{if(authToken&&user&&user.email!=="guest"){setSyncing(true);cloudLoad(authToken).then(saved=>{if(saved){if(saved.metals?.length>0)setMetals(saved.metals);if(saved.syndications?.length>0)setSynds(saved.syndications);if(saved.crypto?.length>0)setCrypto(saved.crypto);if(saved.properties?.length>0)setProperties(saved.properties);if(saved.notesLending?.length>0)setNotesLending(saved.notesLending);if(saved.collectibles?.length>0)setCollectibles(saved.collectibles);if(saved.targets)setTargets(saved.targets);if(saved.name||saved.picture)setUser(prev=>({...prev,name:saved.name||prev.name,picture:saved.picture||prev.picture}))}loadSnapshots(authToken).then(setSnapshots);setSyncing(false);refreshPrices()}).catch(()=>setSyncing(false))}},[]);

  // Auto-save to Supabase on data change
  const saveTimer=useRef(null);
  useEffect(()=>{
    if(!authToken||!user)return;
    if(saveTimer.current)clearTimeout(saveTimer.current);
    saveTimer.current=setTimeout(()=>{cloudSave(authToken,{metals,syndications:synds,crypto,properties,notesLending,collectibles,targets})},800);
    return()=>{if(saveTimer.current)clearTimeout(saveTimer.current)};
  },[metals,synds,crypto,properties,notesLending,collectibles,targets,authToken,user]);

  // Save portfolio snapshot (max once per day, handled server-side)
  const snapTimer=useRef(null);
  useEffect(()=>{
    if(!authToken||!user||user.email==="guest")return;
    if(snapTimer.current)clearTimeout(snapTimer.current);
    snapTimer.current=setTimeout(()=>{
      const spotMap={Gold:prices.gold,Silver:prices.silver,Platinum:prices.platinum,Palladium:prices.palladium};
      const ozMap={"1 oz":1,"1/2 oz":0.5,"1/4 oz":0.25,"1/10 oz":0.1,"1 kg":32.151,"10 oz":10,"100 oz":100,"Gram":0.03215};
      const cSpot={BTC:prices.btc,ETH:prices.eth,SOL:prices.sol,...allCrypto};
      const metals_value=metals.reduce((s,m)=>s+m.qty*(ozMap[m.unit]||1)*(spotMap[m.metal]||m.spot||0),0);
      const re_value=synds.reduce((s,x)=>s+(x.invested||0),0);
      const crypto_value=crypto.reduce((s,c)=>s+c.qty*(cSpot[c.coin]||c.price||0),0);
      const properties_value=properties.reduce((s,p)=>s+((+p.currentValue||0)-(+p.mortgageBalance||0)),0);
      const notes_value=notesLending.reduce((s,n)=>s+(+n.outstandingBalance||0),0);
      const collectibles_value=collectibles.reduce((s,c)=>s+(+c.currentValue||0),0);
      const total_value=metals_value+re_value+crypto_value+properties_value+notes_value+collectibles_value;
      const income_annual=synds.reduce((s,x)=>s+x.invested*(x.expectedRate||0)/100,0)+properties.reduce((s,p)=>s+((+p.monthlyRent||0)-(+p.monthlyExpenses||0)-(+p.mortgagePayment||0))*12,0)+notesLending.reduce((s,n)=>s+(+n.outstandingBalance||0)*(+n.interestRate||0)/100,0);
      if(total_value>0)saveSnapshot(authToken,{total_value,metals_value,re_value,crypto_value,properties_value,notes_value,collectibles_value,income_annual});
    },5000);
    return()=>{if(snapTimer.current)clearTimeout(snapTimer.current)};
  },[metals,synds,crypto,properties,notesLending,collectibles,prices,allCrypto,authToken,user]);

  // Google Sign-In
  const handleGoogleLogin=async(credentialResponse)=>{
    const token=credentialResponse.credential;setAuthToken(token);
    try{const payload=JSON.parse(atob(token.split('.')[1]));setUser({name:payload.name||payload.email,email:payload.email,picture:payload.picture});if(window.posthog){window.posthog.identify(payload.email,{name:payload.name||payload.email,email:payload.email});window.posthog.capture('user_logged_in',{method:'google'})}}catch(e){setUser({name:"User",email:"user@hardassets.io"})}
    setSyncing(true);
    const saved=await cloudLoad(token);
    if(saved){if(saved.metals?.length>0)setMetals(saved.metals);if(saved.syndications?.length>0)setSynds(saved.syndications);if(saved.crypto?.length>0)setCrypto(saved.crypto);if(saved.properties?.length>0)setProperties(saved.properties);if(saved.notesLending?.length>0)setNotesLending(saved.notesLending);if(saved.collectibles?.length>0)setCollectibles(saved.collectibles);if(saved.targets)setTargets(saved.targets);if(saved.name||saved.picture)setUser(prev=>({...prev,name:saved.name||prev.name,picture:saved.picture||prev.picture}))}
    loadSnapshots(token).then(setSnapshots);
    setSyncing(false);setView("app");refreshPrices();
  };

  useEffect(()=>{
    if(view!=="login")return;
    const initGSI=()=>{if(!window.google?.accounts?.id)return;window.google.accounts.id.initialize({client_id:GOOGLE_CLIENT_ID,callback:handleGoogleLogin});const el=document.getElementById("gsi-btn-web");if(el)window.google.accounts.id.renderButton(el,{type:"standard",shape:"rectangular",theme:"filled_black",size:"large",text:"continue_with",width:340})};
    const t=setTimeout(()=>{if(window.google?.accounts?.id){initGSI()}else{const s=document.createElement("script");s.src="https://accounts.google.com/gsi/client";s.async=true;s.defer=true;s.onload=()=>setTimeout(initGSI,100);document.head.appendChild(s)}},100);
    return()=>clearTimeout(t);
  },[view]);

  const logout=()=>{if(window.posthog)window.posthog.reset();setUser(null);setAuthToken(null);setMetals([]);setSynds([]);setCrypto([]);setProperties([]);setNotesLending([]);setCollectibles([]);try{sessionStorage.removeItem("ha_user");sessionStorage.removeItem("ha_token")}catch(e){}setView("home")};
  const guestLogin=()=>{setUser({name:"Guest",email:"guest"});setMetals(DEMO_DATA.metals);setSynds(DEMO_DATA.syndications);setCrypto(DEMO_DATA.crypto);setProperties(DEMO_DATA.properties);setNotesLending(DEMO_DATA.notesLending);setCollectibles(DEMO_DATA.collectibles);setTargets(DEMO_DATA.targets);setView("app");refreshPrices();if(window.posthog)window.posthog.capture('user_logged_in',{method:'guest'});};

  const refreshPrices=async()=>{setRefreshing(true);const[mp,cp,fx]=await Promise.all([fetchMetalPrices(),fetchCryptoPrices(),fetchForex()]);if(fx)setForex(fx);setPrices(prev=>{const next={...prev};if(mp){if(mp.gold){next.goldChg=prev.gold>0?((mp.gold-prev.gold)/prev.gold*100):0;next.gold=mp.gold}if(mp.silver){next.silverChg=prev.silver>0?((mp.silver-prev.silver)/prev.silver*100):0;next.silver=mp.silver}if(mp.platinum){next.platChg=prev.platinum>0?((mp.platinum-prev.platinum)/prev.platinum*100):0;next.platinum=mp.platinum}if(mp.palladium)next.palladium=mp.palladium}if(cp){if(cp.BTC){next.btc=cp.BTC.price;next.btcChg=cp.BTC.change}if(cp.ETH){next.eth=cp.ETH.price;next.ethChg=cp.ETH.change}if(cp.SOL){next.sol=cp.SOL.price;next.solChg=cp.SOL.change}}return next});if(cp){const ac={};for(const[sym,data] of Object.entries(cp)){ac[sym]=data.price}setAllCrypto(ac)}if(mp)setMetals(prev=>prev.map(m=>{const ls=({Gold:mp.gold,Silver:mp.silver,Platinum:mp.platinum,Palladium:mp.palladium})[m.metal];return ls?{...m,spot:Math.round(ls*100)/100}:m}));if(cp)setCrypto(prev=>prev.map(c=>{const l=cp[c.coin];return l?{...c,price:l.price}:c}));setLastRefresh(new Date().toLocaleTimeString());if(window.posthog)window.posthog.capture('prices_refreshed');setRefreshing(false)};

  // Auto-trigger demo from ?demo=1 URL param
  useEffect(()=>{const p=new URLSearchParams(window.location.search);if(p.get("demo")&&!user){setUser({name:"Guest",email:"guest"});setMetals(DEMO_DATA.metals);setSynds(DEMO_DATA.syndications);setCrypto(DEMO_DATA.crypto);setProperties(DEMO_DATA.properties);setNotesLending(DEMO_DATA.notesLending);setCollectibles(DEMO_DATA.collectibles);setTargets(DEMO_DATA.targets);setView("app");window.history.replaceState({},"","/");setTimeout(()=>refreshPrices(),500)}},[]);

  const goldS=useMemo(()=>spark(2850,35,0.008),[]);const silverS=useMemo(()=>spark(30,35,0.012),[]);const btcS=useMemo(()=>spark(78000,35,0.02),[]);const ethS=useMemo(()=>spark(2400,35,0.018),[]);
  const spotMap={Gold:prices.gold,Silver:prices.silver,Platinum:prices.platinum,Palladium:prices.palladium};
  const cSpot={BTC:prices.btc,ETH:prices.eth,SOL:prices.sol,...allCrypto};

  const openEdit=(item,type)=>{setEditOriginal({...item});setEditItem({...item,_type:type})};
  const saveItem=(u,type)=>{if(type==="metal")setMetals(p=>p.map(x=>x.id===u.id?u:x));if(type==="synd")setSynds(p=>p.map(x=>x.id===u.id?u:x));if(type==="crypto")setCrypto(p=>p.map(x=>x.id===u.id?u:x));if(type==="property")setProperties(p=>p.map(x=>x.id===u.id?u:x));if(type==="note")setNotesLending(p=>p.map(x=>x.id===u.id?u:x));if(type==="collectible")setCollectibles(p=>p.map(x=>x.id===u.id?u:x));logActivity(authToken,editOriginal?"edit":"add",type,u.id,u.name||u.metal||u.coin||"Item",editOriginal,u);if(window.posthog)window.posthog.capture('holding_edited',{type});setEditItem(null)};
  const deleteItem=(id,type)=>{if(type==="metal")setMetals(p=>p.filter(x=>x.id!==id));if(type==="synd")setSynds(p=>p.filter(x=>x.id!==id));if(type==="crypto")setCrypto(p=>p.filter(x=>x.id!==id));if(type==="property")setProperties(p=>p.filter(x=>x.id!==id));if(type==="note")setNotesLending(p=>p.filter(x=>x.id!==id));if(type==="collectible")setCollectibles(p=>p.filter(x=>x.id!==id))};

  const TH=({cols})=><div style={{display:"grid",gridTemplateColumns:cols.map(c=>c.w||"1fr").join(" "),gap:"0 12px",padding:"10px 20px",borderBottom:`1px solid ${P.border}`}}>{cols.map((c,i)=><span key={i} style={{fontSize:12,fontWeight:600,color:P.txM,letterSpacing:0.3,textTransform:"uppercase",textAlign:c.right?"right":"left"}}>{c.label}</span>)}</div>;
  const PriceRow=({label,value,change,color,sp})=>{const up=change>=0;return<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 0",borderBottom:`1px solid ${P.border}`}}><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:40,height:40,borderRadius:12,background:`${color}12`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:14,fontWeight:700,color}}>{label.slice(0,2)}</span></div><div><div style={{fontSize:14,fontWeight:600,color:P.text}}>{label}</div><div style={{fontSize:12,color:up?P.green:P.red,fontWeight:600,fontFamily:mono}}>{fPct(change)}</div></div></div><div style={{display:"flex",alignItems:"center",gap:14}}>{sp&&<MiniChart data={sp} color={up?P.green:P.red}/>}<div style={{fontSize:16,fontWeight:700,color:P.text,fontFamily:mono,minWidth:85,textAlign:"right"}}>{value>999?"$"+Math.round(value).toLocaleString():"$"+value.toFixed(2)}</div></div></div>};
  const TabActions=({onAdd,addLabel,onExport,onImport,color=P.gold,bg=P.goldSoft})=><div style={{display:"flex",gap:8}}>{onImport&&<CsvImport onImport={onImport}/>}{onExport&&<Btn variant="ghost" onClick={onExport} style={{fontSize:12,padding:"8px 14px"}}>Export CSV</Btn>}<Btn variant="soft" onClick={onAdd} style={{fontSize:13,background:bg,color,borderColor:`${color}30`}}>{addLabel||"+ Add"}</Btn></div>;

  const NAV=[{key:"portfolio",label:"Portfolio",d:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"},{key:"markets",label:"Markets",d:"M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"},{key:"metals",label:"Precious Metals",d:"M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"},{key:"realestate",label:"Syndications",d:"M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"},{key:"crypto",label:"Crypto",d:"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"},{key:"analyzer",label:"Deal Analyzer",d:"M9 7h6m0 10v-3m-3 3v-6m-3 6v-1m6-9a2 2 0 012 2v8a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2"},{key:"properties",label:"Physical RE",d:"M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4z"},{key:"notes",label:"Notes & Lending",d:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"},{key:"collectibles",label:"Collectibles",d:"M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"}];

  const mkRow=(item,type)=>{const val=type==="metal"?item.qty*(ozMap[item.unit]||1)*(spotMap[item.metal]||item.spot||0):type==="crypto"?item.qty*(cSpot[item.coin]||item.price||0):item.invested||0;const cost=type==="metal"?item.qty*(item.costPerUnit||0):type==="crypto"?item.qty*(item.avgCost||0):item.invested||val;const gain=val-cost,pct=cost>0?(gain/cost*100):0,up=gain>=0;const sp=spark(cost||val,20,0.01);const held=yrsHeld(item.dateInvested);
    return{val,gain,pct,up,sp,held}};

  const renderContent=()=>{switch(tab){
    case "portfolio": return<PortfolioView metals={metals} synds={synds} crypto={crypto} properties={properties} notesLending={notesLending} collectibles={collectibles} prices={prices} targets={targets} setTargets={setTargets} allCrypto={allCrypto} authToken={authToken} snapshots={snapshots} snapRange={snapRange} setSnapRange={setSnapRange}/>;
    case "metals": return<div><div style={{display:"grid",gridTemplateColumns:"1fr 2.2fr",gap:20}}>
      <GC style={{padding:"16px 20px"}}><PriceRow label="Gold" value={prices.gold} change={prices.goldChg} color={P.gold} sp={goldS}/><PriceRow label="Silver" value={prices.silver} change={prices.silverChg} color={P.txS} sp={silverS}/><PriceRow label="Platinum" value={prices.platinum} change={prices.platChg} color={P.cyan}/></GC>
      <GC style={{overflow:"hidden"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px 10px"}}><span style={{fontSize:16,fontWeight:700,color:P.text}}>Holdings <span style={{fontSize:12,color:P.txM,background:P.goldSoft,padding:"2px 8px",borderRadius:6,fontWeight:600}}>{metals.length}</span></span><TabActions onAdd={()=>setModal("addMetal")} onExport={()=>{csvExport(["Metal","Unit","Qty","Cost/Unit","Spot","Value","Gain","Risk","Date Invested","Hold Period","Yrs Held","Notes"],metals.map(m=>{const r=mkRow(m,"metal");return[m.metal,m.unit,m.qty,m.costPerUnit,spotMap[m.metal]||m.spot,r.val,r.gain,m.risk||"",m.dateInvested||"",m.holdPeriod||"",r.held,m.notes||""]}),"metals.csv");if(window.posthog)window.posthog.capture('csv_exported',{type:'metal'})}} onImport={rows=>{const ni=rows.map(r=>({id:uid(),metal:r.Metal||"Gold",unit:r.Unit||"1 oz",qty:+(r.Qty||r.Quantity||0),costPerUnit:+(r["Cost/Unit"]||r.Cost||0),spot:+(r.Spot||0),name:(r.Metal||"Gold")+" "+(r.Unit||"1 oz"),risk:+(r.Risk||0)||null,dateInvested:r["Date Invested"]||"",holdPeriod:r["Hold Period"]||"",notes:r.Notes||""})).filter(i=>i.qty>0);setMetals(p=>[...p,...ni]);logActivity(authToken,"import","metal",null,"CSV Import",null,{count:ni.length});if(window.posthog)window.posthog.capture('csv_imported',{type:'metal',count:ni.length})}}/></div>
        <TH cols={[{label:"Name",w:"2fr"},{label:"Details"},{label:"",w:"80px"},{label:"Value",right:true},{label:"Gain",right:true},{label:"Risk",w:"60px"},{label:"Held",w:"60px"}]}/>
        {metals.map(m=>{const r=mkRow(m,"metal");return<TableRow key={m.id} onClick={()=>openEdit(m,"metal")} cols={[{val:m.name||m.metal,semi:true,w:"2fr"},{val:`${m.qty} × ${m.unit}`,color:P.txS,size:12,mono:true},{val:<MiniChart data={r.sp} color={r.up?P.green:P.red} height={24} width={65}/>,w:"80px"},{val:fmt(r.val),bold:true,mono:true,right:true},{val:<span style={{color:r.up?P.green:P.red}}>{r.up?"+":""}{fmt(r.gain)} <span style={{fontSize:11,color:P.txM}}>({fPct(r.pct)})</span></span>,right:true,size:12},{val:m.risk?<span style={{color:riskColor(+m.risk),fontWeight:700}}>{m.risk}</span>:"—",w:"60px"},{val:r.held?r.held+"yr":"—",color:P.txM,size:11,mono:true,w:"60px"}]}/>})}
        {metals.length===0&&<div style={{padding:"40px 20px",textAlign:"center",color:P.txM}}><div style={{fontSize:28,marginBottom:12}}>◆</div><div style={{fontSize:14,fontWeight:600,marginBottom:4}}>No metals yet</div><div style={{fontSize:12}}>Click <span style={{color:P.gold,fontWeight:700}}>+ Add</span> to start tracking your precious metals holdings.</div></div>}
      </GC></div></div>;
    case "realestate": return<div><div style={{display:"grid",gridTemplateColumns:"1fr 2.2fr",gap:20}}>
      {synds.length>0&&(()=>{const by={};synds.forEach(s=>{by[(s.strategy||s.type||"Other")]=(by[(s.strategy||s.type||"Other")]||0)+s.invested});const data=Object.entries(by).map(([name,value],i)=>({name,value,fill:PIE_C[i%PIE_C.length]}));return<GC style={{padding:24}}><div style={{fontSize:14,fontWeight:700,color:P.text,marginBottom:14}}>By Strategy</div><ResponsiveContainer width="100%" height={200}><BarChart data={data} layout="vertical" margin={{top:0,right:0,bottom:0,left:0}}><XAxis type="number" hide/><YAxis type="category" dataKey="name" tick={{fontSize:11,fill:P.txS}} axisLine={false} tickLine={false} width={80}/><Tooltip contentStyle={{background:P.elevated,border:`1px solid ${P.border}`,borderRadius:12,fontSize:12,fontFamily:mono}} formatter={v=>fmt(v)}/><Bar dataKey="value" radius={[0,6,6,0]}>{data.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Bar></BarChart></ResponsiveContainer></GC>})()}
      <GC style={{overflow:"hidden"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px 10px"}}><span style={{fontSize:16,fontWeight:700,color:P.text}}>Syndications <span style={{fontSize:12,color:P.txM,background:P.blueSoft,padding:"2px 8px",borderRadius:6,fontWeight:600}}>{synds.length}</span></span><TabActions onAdd={()=>setModal("addSynd")} addLabel="+ Add Deal" color={P.blue} bg={P.blueSoft} onExport={()=>{csvExport(["Deal","Sponsor","Strategy","Invested","Rate%","Ann Income","Proj IRR","Risk","Status","Date Invested","Hold Period","Yrs Held","Notes"],synds.map(s=>[s.name,s.sponsor,(s.strategy||s.type||"Other"),s.invested,s.expectedRate,Math.round(s.invested*(s.expectedRate||0)/100),s.projIRR||"",s.risk,s.status,s.dateInvested||"",s.holdPeriod||"",yrsHeld(s.dateInvested),s.notes||""]),"syndications.csv");if(window.posthog)window.posthog.capture('csv_exported',{type:'synd'})}} onImport={rows=>{const ni=rows.map(r=>({id:uid(),name:r.Deal||r.Name||"",sponsor:r.Sponsor||"",invested:+(r.Invested||r.Amount||0),expectedRate:+(r["Rate%"]||r.Rate||0),projIRR:+(r["Proj IRR"]||r.IRR||0)||null,strategy:r.Strategy||r.Type||"Multifamily",risk:+(r.Risk||5),status:r.Status||"Active",dateInvested:r["Date Invested"]||"",holdPeriod:r["Hold Period"]||"",notes:r.Notes||""})).filter(i=>i.name&&i.invested>0);setSynds(p=>[...p,...ni]);logActivity(authToken,"import","synd",null,"CSV Import",null,{count:ni.length});if(window.posthog)window.posthog.capture('csv_imported',{type:'synd',count:ni.length})}}/></div>
        <TH cols={[{label:"Deal",w:"2fr"},{label:"Sponsor",w:"1.2fr"},{label:"Type"},{label:"Invested",right:true,w:"100px"},{label:"Income/yr",right:true,w:"100px"},{label:"IRR",right:true,w:"80px"},{label:"Risk",w:"60px"}]}/>
        {synds.map(s=>{const held=yrsHeld(s.dateInvested);const inc=s.invested*(s.expectedRate||0)/100;return<TableRow key={s.id} onClick={()=>openEdit(s,"synd")} cols={[{val:<div><div style={{fontWeight:600}}>{s.name}</div>{held&&<div style={{fontSize:10,color:P.txM}}>{held} yr</div>}</div>,w:"2fr"},{val:s.sponsor||"—",color:P.txS,size:12,w:"1.2fr"},{val:<span style={{fontSize:10,color:P.blue,background:P.blueSoft,padding:"2px 8px",borderRadius:5,fontWeight:600}}>{(s.strategy||s.type||"Other")}</span>},{val:fmt(s.invested),mono:true,right:true,bold:true,w:"100px"},{val:fmt(inc),mono:true,right:true,color:P.green,size:12,w:"100px"},{val:s.projIRR?s.projIRR+"%":"—",mono:true,right:true,color:P.txS,size:12,w:"80px"},{val:s.risk?<span style={{color:riskColor(+s.risk),fontWeight:700}}>{s.risk}</span>:"—",w:"60px"}]}/>})}
        {synds.length===0&&<div style={{padding:"40px 20px",textAlign:"center",color:P.txM}}><div style={{fontSize:28,marginBottom:12}}>◫</div><div style={{fontSize:14,fontWeight:600,marginBottom:4}}>No syndications yet</div><div style={{fontSize:12}}>Click <span style={{color:P.gold,fontWeight:700}}>+ Add Deal</span> to start tracking your real estate syndication investments.</div></div>}
      </GC></div></div>;
    case "crypto": return<div><div style={{display:"grid",gridTemplateColumns:"1fr 2.2fr",gap:20}}>
      <GC style={{padding:"16px 20px"}}><PriceRow label="Bitcoin" value={prices.btc} change={prices.btcChg} color={P.orange} sp={btcS}/><PriceRow label="Ethereum" value={prices.eth} change={prices.ethChg} color={P.blue} sp={ethS}/><PriceRow label="Solana" value={prices.sol} change={prices.solChg} color={P.purple}/></GC>
      <GC style={{overflow:"hidden"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px 10px"}}><span style={{fontSize:16,fontWeight:700,color:P.text}}>Holdings <span style={{fontSize:12,color:P.txM,background:P.purpleSoft,padding:"2px 8px",borderRadius:6,fontWeight:600}}>{crypto.length}</span></span><TabActions onAdd={()=>setModal("addCrypto")} addLabel="+ Add Coin" color={P.purple} bg={P.purpleSoft} onExport={()=>{csvExport(["Coin","Qty","Avg Cost","Current","Value","Gain","Risk","Date Invested","Hold Period","Yrs Held","Notes"],crypto.map(c=>{const sp=cSpot[c.coin]||c.price||0;const val=c.qty*sp;return[c.coin,c.qty,c.avgCost,sp,val,val-(c.qty*c.avgCost),c.risk||"",c.dateInvested||"",c.holdPeriod||"",yrsHeld(c.dateInvested),c.notes||""]}),"crypto.csv");if(window.posthog)window.posthog.capture('csv_exported',{type:'crypto'})}} onImport={rows=>{const ni=rows.map(r=>({id:uid(),coin:r.Coin||"BTC",name:r.Coin||"BTC",qty:+(r.Qty||r.Quantity||0),avgCost:+(r["Avg Cost"]||r.Cost||0),price:cSpot[r.Coin]||+(r.Current||r.Price||0),risk:+(r.Risk||7),dateInvested:r["Date Invested"]||"",holdPeriod:r["Hold Period"]||"",notes:r.Notes||""})).filter(i=>i.qty>0);setCrypto(p=>[...p,...ni]);logActivity(authToken,"import","crypto",null,"CSV Import",null,{count:ni.length});if(window.posthog)window.posthog.capture('csv_imported',{type:'crypto',count:ni.length})}}/></div>
        <TH cols={[{label:"Coin",w:"1.2fr"},{label:"Qty"},{label:"",w:"70px"},{label:"Value",right:true},{label:"Gain",right:true},{label:"Risk",w:"50px"},{label:"Held",w:"60px"}]}/>
        {crypto.map(c=>{const r=mkRow(c,"crypto");return<TableRow key={c.id} onClick={()=>openEdit(c,"crypto")} cols={[{val:<div><span style={{fontWeight:600}}>{c.name||c.coin}</span> <span style={{fontSize:10,color:P.purple,background:P.purpleSoft,padding:"1px 6px",borderRadius:4,fontWeight:600}}>{c.coin}</span></div>,w:"1.2fr"},{val:c.qty?.toFixed(4),mono:true,color:P.txS,size:12},{val:<MiniChart data={r.sp} color={r.up?P.green:P.red} height={24} width={60}/>,w:"70px"},{val:fmt(r.val),bold:true,mono:true,right:true},{val:<span style={{color:r.up?P.green:P.red}}>{r.up?"+":""}{fmt(r.gain)}</span>,right:true,size:12},{val:c.risk?<span style={{color:riskColor(+c.risk),fontWeight:700}}>{c.risk}</span>:"—",w:"50px"},{val:r.held?r.held+"yr":"—",color:P.txM,size:11,mono:true,w:"60px"}]}/>})}
        {crypto.length===0&&<div style={{padding:"40px 20px",textAlign:"center",color:P.txM}}><div style={{fontSize:28,marginBottom:12}}>⊙</div><div style={{fontSize:14,fontWeight:600,marginBottom:4}}>No crypto yet</div><div style={{fontSize:12}}>Click <span style={{color:P.gold,fontWeight:700}}>+ Add Coin</span> to start tracking your cryptocurrency holdings.</div></div>}
      </GC></div></div>;
    case "analyzer": return<DealAnalyzer/>;
    case "properties": return<div><div style={{display:"grid",gridTemplateColumns:"1fr 2.2fr",gap:20}}>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {(()=>{const totalVal=properties.reduce((s,x)=>s+(+x.currentValue||0),0);const totalEquity=properties.reduce((s,x)=>s+((+x.currentValue||0)-(+x.mortgageBalance||0)),0);const totalCF=properties.reduce((s,x)=>s+((+x.monthlyRent||0)-(+x.monthlyExpenses||0)-(+x.mortgagePayment||0)),0);const avgCap=properties.length>0?properties.reduce((s,x)=>{const cv=+x.currentValue||1;const noi=((+x.monthlyRent||0)-(+x.monthlyExpenses||0))*12;return s+(noi/cv*100)},0)/properties.length:0;return<>{[{l:"Total Equity",v:fmt(totalEquity),c:P.green},{l:"Total Value",v:fmt(totalVal),c:P.text},{l:"Monthly CF",v:fmt(totalCF),c:totalCF>=0?P.green:P.red},{l:"Avg Cap Rate",v:avgCap.toFixed(1)+"%",c:P.gold}].map((m,i)=><GC key={i} style={{padding:"16px 20px"}}><div style={{fontSize:11,color:P.txM,fontWeight:600,letterSpacing:0.5,textTransform:"uppercase",marginBottom:4}}>{m.l}</div><div style={{fontSize:22,fontWeight:800,color:m.c,fontFamily:mono}}>{m.v}</div></GC>)}</>})()}
      </div>
      <GC style={{overflow:"hidden"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px 10px"}}><span style={{fontSize:16,fontWeight:700,color:P.text}}>Properties <span style={{fontSize:12,color:P.txM,background:"rgba(52,211,153,0.1)",padding:"2px 8px",borderRadius:6,fontWeight:600}}>{properties.length}</span></span><TabActions onAdd={()=>setModal("addProperty")} addLabel="+ Add Property" color={P.green} bg={P.greenSoft} onExport={()=>{csvExport(["Name","Type","Address","Purchase Price","Current Value","Mortgage","Equity","Monthly Rent","Monthly Expenses","Mortgage Payment","Monthly CF","Cap Rate","Risk","Date Purchased","Yrs Held","Notes"],properties.map(p=>{const eq=(+p.currentValue||0)-(+p.mortgageBalance||0);const cf=(+p.monthlyRent||0)-(+p.monthlyExpenses||0)-(+p.mortgagePayment||0);const cap=(+p.currentValue>0)?(((+p.monthlyRent||0)-(+p.monthlyExpenses||0))*12/(+p.currentValue)*100):0;return[p.name,p.propType,p.address||"",p.purchasePrice,p.currentValue,p.mortgageBalance,eq,p.monthlyRent,p.monthlyExpenses,p.mortgagePayment,cf,cap.toFixed(1)+"%",p.risk||"",p.datePurchased||p.dateInvested||"",yrsHeld(p.datePurchased||p.dateInvested),p.notes||""]}),"properties.csv");if(window.posthog)window.posthog.capture('csv_exported',{type:'property'})}} onImport={rows=>{const ni=rows.map(r=>({id:uid(),name:r.Name||"",propType:r.Type||"SFH",address:r.Address||"",purchasePrice:+(r["Purchase Price"]||0),currentValue:+(r["Current Value"]||0),mortgageBalance:+(r.Mortgage||r["Mortgage Balance"]||0),monthlyRent:+(r["Monthly Rent"]||0),monthlyExpenses:+(r["Monthly Expenses"]||0),mortgagePayment:+(r["Mortgage Payment"]||0),risk:+(r.Risk||4),datePurchased:r["Date Purchased"]||"",dateInvested:r["Date Purchased"]||"",holdPeriod:r["Hold Period"]||"",notes:r.Notes||""})).filter(i=>i.name);setProperties(p=>[...p,...ni]);logActivity(authToken,"import","property",null,"CSV Import",null,{count:ni.length});if(window.posthog)window.posthog.capture('csv_imported',{type:'property',count:ni.length})}}/></div>
        <TH cols={[{label:"Name",w:"1.5fr"},{label:"Type"},{label:"Value",right:true},{label:"Equity",right:true},{label:"Monthly CF",right:true},{label:"Cap Rate",w:"70px"},{label:"Risk",w:"50px"},{label:"Held",w:"60px"}]}/>
        {properties.map(p=>{const eq=(+p.currentValue||0)-(+p.mortgageBalance||0);const cf=(+p.monthlyRent||0)-(+p.monthlyExpenses||0)-(+p.mortgagePayment||0);const cap=(+p.currentValue>0)?(((+p.monthlyRent||0)-(+p.monthlyExpenses||0))*12/(+p.currentValue)*100):0;const held=yrsHeld(p.datePurchased||p.dateInvested);return<TableRow key={p.id} onClick={()=>openEdit(p,"property")} cols={[{val:p.name,semi:true,w:"1.5fr"},{val:<span style={{fontSize:10,color:P.green,background:P.greenSoft,padding:"1px 7px",borderRadius:5,fontWeight:600}}>{p.propType}</span>},{val:fmt(+p.currentValue),bold:true,mono:true,right:true},{val:fmt(eq),mono:true,right:true,color:eq>=0?P.green:P.red},{val:fmt(cf),mono:true,right:true,color:cf>=0?P.green:P.red,size:12},{val:cap.toFixed(1)+"%",mono:true,color:P.gold,size:12,w:"70px"},{val:p.risk?<span style={{color:riskColor(+p.risk),fontWeight:700}}>{p.risk}</span>:"—",w:"50px"},{val:held?held+"yr":"—",color:P.txM,size:11,mono:true,w:"60px"}]}/>})}
        {properties.length===0&&<div style={{padding:"40px 20px",textAlign:"center",color:P.txM}}><div style={{fontSize:28,marginBottom:12}}>⌂</div><div style={{fontSize:14,fontWeight:600,marginBottom:4}}>No properties yet</div><div style={{fontSize:12}}>Click <span style={{color:P.gold,fontWeight:700}}>+ Add Property</span> to start tracking your real estate holdings.</div></div>}
      </GC></div></div>;
    case "notes": return<div><div style={{display:"grid",gridTemplateColumns:"1fr 2.2fr",gap:20}}>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {(()=>{const totalDeployed=notesLending.reduce((s,x)=>s+(+x.outstandingBalance||0),0);const monthlyInc=notesLending.reduce((s,x)=>s+((+x.outstandingBalance||0)*(+x.interestRate||0)/100/12),0);const avgRate=notesLending.length>0?notesLending.reduce((s,x)=>s+(+x.interestRate||0),0)/notesLending.length:0;const byStatus={};notesLending.forEach(n=>{const st=n.status||"Performing";byStatus[st]=(byStatus[st]||0)+(+n.outstandingBalance||0)});const statusData=Object.entries(byStatus).map(([name,value],i)=>({name,value,fill:name==="Performing"?P.green:name==="Late"?P.orange:name==="Default"?P.red:P.txM}));return<><GC style={{padding:"16px 20px"}}><div style={{fontSize:11,color:P.txM,fontWeight:600,letterSpacing:0.5,textTransform:"uppercase",marginBottom:4}}>Total Deployed</div><div style={{fontSize:22,fontWeight:800,color:P.cyan,fontFamily:mono}}>{fmt(totalDeployed)}</div></GC><GC style={{padding:"16px 20px"}}><div style={{fontSize:11,color:P.txM,fontWeight:600,letterSpacing:0.5,textTransform:"uppercase",marginBottom:4}}>Monthly Income</div><div style={{fontSize:22,fontWeight:800,color:P.green,fontFamily:mono}}>{fmt(monthlyInc)}</div></GC><GC style={{padding:"16px 20px"}}><div style={{fontSize:11,color:P.txM,fontWeight:600,letterSpacing:0.5,textTransform:"uppercase",marginBottom:4}}>Avg Rate</div><div style={{fontSize:22,fontWeight:800,color:P.gold,fontFamily:mono}}>{avgRate.toFixed(1)}%</div></GC>{statusData.length>0&&<GC style={{padding:"16px 20px"}}><div style={{fontSize:11,color:P.txM,fontWeight:600,letterSpacing:0.5,textTransform:"uppercase",marginBottom:8}}>By Status</div><ResponsiveContainer width="100%" height={120}><PieChart><Pie data={statusData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={3} strokeWidth={0}>{statusData.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Pie><Tooltip contentStyle={{background:P.elevated,border:`1px solid ${P.border}`,borderRadius:12,fontSize:12,fontFamily:mono}} formatter={v=>fmt(v)}/></PieChart></ResponsiveContainer>{statusData.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}><div style={{width:8,height:8,borderRadius:4,background:d.fill}}/><span style={{fontSize:11,color:P.txS}}>{d.name}</span><span style={{fontSize:11,fontWeight:700,color:P.text,fontFamily:mono,marginLeft:"auto"}}>{fmt(d.value)}</span></div>)}</GC>}</>})()}
      </div>
      <GC style={{overflow:"hidden"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px 10px"}}><span style={{fontSize:16,fontWeight:700,color:P.text}}>Notes <span style={{fontSize:12,color:P.txM,background:"rgba(34,211,238,0.1)",padding:"2px 8px",borderRadius:6,fontWeight:600}}>{notesLending.length}</span></span><TabActions onAdd={()=>setModal("addNote")} addLabel="+ Add Note" color={P.cyan} bg="rgba(34,211,238,0.1)" onExport={()=>{csvExport(["Name","Type","Principal","Balance","Rate%","Monthly Inc","Status","LTV","Collateral","Maturity","Risk","Date Invested","Yrs Held","Notes"],notesLending.map(n=>{const mi=(+n.outstandingBalance||0)*(+n.interestRate||0)/100/12;return[n.name,n.noteType,n.principal,n.outstandingBalance,n.interestRate,mi.toFixed(2),n.status,n.ltv,n.collateral||"",n.maturityDate||"",n.risk||"",n.dateInvested||"",yrsHeld(n.dateInvested),n.notes||""]}),"notes.csv");if(window.posthog)window.posthog.capture('csv_exported',{type:'note'})}} onImport={rows=>{const ni=rows.map(r=>({id:uid(),name:r.Name||"",noteType:r.Type||"Hard Money",principal:+(r.Principal||0),outstandingBalance:+(r.Balance||r["Outstanding Balance"]||0),interestRate:+(r["Rate%"]||r.Rate||0),maturityDate:r.Maturity||r["Maturity Date"]||"",collateral:r.Collateral||"",status:r.Status||"Performing",ltv:+(r.LTV||0),risk:+(r.Risk||5),dateInvested:r["Date Invested"]||"",holdPeriod:r["Hold Period"]||"",notes:r.Notes||""})).filter(i=>i.name);setNotesLending(p=>[...p,...ni]);logActivity(authToken,"import","note",null,"CSV Import",null,{count:ni.length});if(window.posthog)window.posthog.capture('csv_imported',{type:'note',count:ni.length})}}/></div>
        <TH cols={[{label:"Name",w:"1.3fr"},{label:"Type"},{label:"Balance",right:true},{label:"Rate",w:"60px"},{label:"Mo Inc",right:true,w:"80px"},{label:"Status",w:"80px"},{label:"LTV",w:"55px"},{label:"Risk",w:"45px"},{label:"Held",w:"55px"}]}/>
        {notesLending.map(n=>{const mi=(+n.outstandingBalance||0)*(+n.interestRate||0)/100/12;const held=yrsHeld(n.dateInvested);const stColor=n.status==="Performing"?P.green:n.status==="Late"?P.orange:n.status==="Default"?P.red:P.txM;return<TableRow key={n.id} onClick={()=>openEdit(n,"note")} cols={[{val:n.name,semi:true,w:"1.3fr"},{val:<span style={{fontSize:10,color:P.cyan,background:"rgba(34,211,238,0.1)",padding:"1px 7px",borderRadius:5,fontWeight:600}}>{n.noteType}</span>},{val:fmt(+n.outstandingBalance),bold:true,mono:true,right:true},{val:(+n.interestRate||0).toFixed(1)+"%",mono:true,color:P.gold,size:12,w:"60px"},{val:fmt(mi),mono:true,right:true,color:P.green,size:12,w:"80px"},{val:<span style={{color:stColor,fontWeight:700,fontSize:11}}>{n.status}</span>,w:"80px"},{val:n.ltv?n.ltv+"%":"—",mono:true,color:P.txS,size:11,w:"55px"},{val:n.risk?<span style={{color:riskColor(+n.risk),fontWeight:700}}>{n.risk}</span>:"—",w:"45px"},{val:held?held+"yr":"—",color:P.txM,size:11,mono:true,w:"55px"}]}/>})}
        {notesLending.length===0&&<div style={{padding:"40px 20px",textAlign:"center",color:P.txM}}><div style={{fontSize:28,marginBottom:12}}>▤</div><div style={{fontSize:14,fontWeight:600,marginBottom:4}}>No notes yet</div><div style={{fontSize:12}}>Click <span style={{color:P.gold,fontWeight:700}}>+ Add Note</span> to start tracking your notes and lending positions.</div></div>}
      </GC></div></div>;
    case "collectibles": return<div><div style={{display:"grid",gridTemplateColumns:"1fr 2.2fr",gap:20}}>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {(()=>{const totalVal=collectibles.reduce((s,x)=>s+(+x.currentValue||0),0);const totalCost=collectibles.reduce((s,x)=>s+(+x.purchasePrice||0),0);const unrealGain=totalVal-totalCost;const byCat={};collectibles.forEach(c=>{const cat=c.category||"Other";byCat[cat]=(byCat[cat]||0)+(+c.currentValue||0)});const catData=Object.entries(byCat).map(([name,value],i)=>({name,value,fill:PIE_C[i%PIE_C.length]}));return<><GC style={{padding:"16px 20px"}}><div style={{fontSize:11,color:P.txM,fontWeight:600,letterSpacing:0.5,textTransform:"uppercase",marginBottom:4}}>Total Value</div><div style={{fontSize:22,fontWeight:800,color:P.orange,fontFamily:mono}}>{fmt(totalVal)}</div></GC><GC style={{padding:"16px 20px"}}><div style={{fontSize:11,color:P.txM,fontWeight:600,letterSpacing:0.5,textTransform:"uppercase",marginBottom:4}}>Unrealized Gain</div><div style={{fontSize:22,fontWeight:800,color:unrealGain>=0?P.green:P.red,fontFamily:mono}}>{fmt(unrealGain)}</div></GC>{catData.length>0&&<GC style={{padding:"16px 20px"}}><div style={{fontSize:11,color:P.txM,fontWeight:600,letterSpacing:0.5,textTransform:"uppercase",marginBottom:8}}>By Category</div><ResponsiveContainer width="100%" height={140}><PieChart><Pie data={catData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={3} strokeWidth={0}>{catData.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Pie><Tooltip contentStyle={{background:P.elevated,border:`1px solid ${P.border}`,borderRadius:12,fontSize:12,fontFamily:mono}} formatter={v=>fmt(v)}/></PieChart></ResponsiveContainer>{catData.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}><div style={{width:8,height:8,borderRadius:4,background:d.fill}}/><span style={{fontSize:11,color:P.txS}}>{d.name}</span><span style={{fontSize:11,fontWeight:700,color:P.text,fontFamily:mono,marginLeft:"auto"}}>{fmt(d.value)}</span></div>)}</GC>}</>})()}
      </div>
      <GC style={{overflow:"hidden"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px 10px"}}><span style={{fontSize:16,fontWeight:700,color:P.text}}>Collection <span style={{fontSize:12,color:P.txM,background:"rgba(251,146,60,0.1)",padding:"2px 8px",borderRadius:6,fontWeight:600}}>{collectibles.length}</span></span><TabActions onAdd={()=>setModal("addCollectible")} addLabel="+ Add Item" color={P.orange} bg="rgba(251,146,60,0.1)" onExport={()=>{csvExport(["Name","Category","Brand","Purchase Price","Current Value","Gain","Gain%","Serial","Location","Insurance","Insured","Risk","Date Acquired","Yrs Held","Notes"],collectibles.map(c=>{const gain=(+c.currentValue||0)-(+c.purchasePrice||0);const pct=(+c.purchasePrice>0)?(gain/(+c.purchasePrice)*100):0;return[c.name,c.category,c.brand||"",c.purchasePrice,c.currentValue,gain.toFixed(2),pct.toFixed(1)+"%",c.serialNumber||"",c.location||"",c.insuranceValue||"",c.insured||"",c.risk||"",c.dateAcquired||c.dateInvested||"",yrsHeld(c.dateAcquired||c.dateInvested),c.notes||""]}),"collectibles.csv");if(window.posthog)window.posthog.capture('csv_exported',{type:'collectible'})}} onImport={rows=>{const ni=rows.map(r=>({id:uid(),name:r.Name||"",category:r.Category||"Other",brand:r.Brand||"",purchasePrice:+(r["Purchase Price"]||0),currentValue:+(r["Current Value"]||0),serialNumber:r.Serial||r["Serial Number"]||"",location:r.Location||"",insuranceValue:+(r.Insurance||r["Insurance Value"]||0),insured:r.Insured||"No",risk:+(r.Risk||5),dateAcquired:r["Date Acquired"]||"",dateInvested:r["Date Acquired"]||"",notes:r.Notes||""})).filter(i=>i.name);setCollectibles(p=>[...p,...ni]);logActivity(authToken,"import","collectible",null,"CSV Import",null,{count:ni.length});if(window.posthog)window.posthog.capture('csv_imported',{type:'collectible',count:ni.length})}}/></div>
        <TH cols={[{label:"Name",w:"1.3fr"},{label:"Category"},{label:"Brand"},{label:"Purchase",right:true},{label:"Value",right:true},{label:"Gain",right:true},{label:"Gain%",w:"65px"},{label:"Risk",w:"45px"},{label:"Held",w:"55px"}]}/>
        {collectibles.map(c=>{const gain=(+c.currentValue||0)-(+c.purchasePrice||0);const pct=(+c.purchasePrice>0)?(gain/(+c.purchasePrice)*100):0;const held=yrsHeld(c.dateAcquired||c.dateInvested);return<TableRow key={c.id} onClick={()=>openEdit(c,"collectible")} cols={[{val:c.name,semi:true,w:"1.3fr"},{val:<span style={{fontSize:10,color:P.orange,background:"rgba(251,146,60,0.1)",padding:"1px 7px",borderRadius:5,fontWeight:600}}>{c.category}</span>},{val:c.brand||"—",color:P.txS,size:12},{val:fmt(+c.purchasePrice),mono:true,right:true,color:P.txS,size:12},{val:fmt(+c.currentValue),bold:true,mono:true,right:true},{val:<span style={{color:gain>=0?P.green:P.red}}>{gain>=0?"+":""}{fmt(gain)}</span>,right:true,size:12},{val:<span style={{color:gain>=0?P.green:P.red,fontFamily:mono,fontSize:11}}>{pct>=0?"+":""}{pct.toFixed(1)}%</span>,w:"65px"},{val:c.risk?<span style={{color:riskColor(+c.risk),fontWeight:700}}>{c.risk}</span>:"—",w:"45px"},{val:held?held+"yr":"—",color:P.txM,size:11,mono:true,w:"55px"}]}/>})}
        {collectibles.length===0&&<div style={{padding:"40px 20px",textAlign:"center",color:P.txM}}><div style={{fontSize:28,marginBottom:12}}>★</div><div style={{fontSize:14,fontWeight:600,marginBottom:4}}>No collectibles yet</div><div style={{fontSize:12}}>Click <span style={{color:P.gold,fontWeight:700}}>+ Add Item</span> to start tracking your collectibles.</div></div>}
      </GC></div></div>;
    case "markets": {
  const fxData=forex||{};
  const fxPairs=[
    {code:"EUR",flag:"\u{1F1EA}\u{1F1FA}",name:"Euro"},{code:"GBP",flag:"\u{1F1EC}\u{1F1E7}",name:"British Pound"},{code:"CHF",flag:"\u{1F1E8}\u{1F1ED}",name:"Swiss Franc"},{code:"JPY",flag:"\u{1F1EF}\u{1F1F5}",name:"Japanese Yen"},{code:"CAD",flag:"\u{1F1E8}\u{1F1E6}",name:"Canadian Dollar"},{code:"AUD",flag:"\u{1F1E6}\u{1F1FA}",name:"Australian Dollar"},{code:"ILS",flag:"\u{1F1EE}\u{1F1F1}",name:"Israeli Shekel"},{code:"CNY",flag:"\u{1F1E8}\u{1F1F3}",name:"Chinese Yuan"},{code:"INR",flag:"\u{1F1EE}\u{1F1F3}",name:"Indian Rupee"},{code:"MXN",flag:"\u{1F1F2}\u{1F1FD}",name:"Mexican Peso"},{code:"BRL",flag:"\u{1F1E7}\u{1F1F7}",name:"Brazilian Real"},{code:"SGD",flag:"\u{1F1F8}\u{1F1EC}",name:"Singapore Dollar"},{code:"HKD",flag:"\u{1F1ED}\u{1F1F0}",name:"Hong Kong Dollar"},{code:"NZD",flag:"\u{1F1F3}\u{1F1FF}",name:"New Zealand Dollar"},{code:"SEK",flag:"\u{1F1F8}\u{1F1EA}",name:"Swedish Krona"},{code:"NOK",flag:"\u{1F1F3}\u{1F1F4}",name:"Norwegian Krone"}
  ];
  const allCoins=Object.entries(COIN_IDS).map(([sym])=>{const p=allCrypto[sym]||prices[sym.toLowerCase()]||0;return{sym,price:p}}).filter(c=>c.price>0);
  const sortedCoins=[...allCoins].sort((a,b)=>cryptoSort==="price"?b.price-a.price:cryptoSort==="name"?a.sym.localeCompare(b.sym):0);
  const filtered=marketSearch?sortedCoins.filter(c=>c.sym.toLowerCase().includes(marketSearch.toLowerCase())):sortedCoins;
  const gsRatio=prices.silver>0?(prices.gold/prices.silver).toFixed(1):"\u2014";

  return <div>
    <div style={{marginBottom:20}}><input value={marketSearch} onChange={e=>setMarketSearch(e.target.value)} placeholder="Search markets..." style={{width:"100%",maxWidth:400,background:P.bg,border:`1px solid ${P.border}`,borderRadius:12,color:P.text,fontSize:14,padding:"12px 16px",outline:"none",fontFamily:ff}}/></div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1.5fr 1fr",gap:20}}>
      <div>
        <div style={{fontSize:16,fontWeight:700,color:P.text,marginBottom:14}}>Precious Metals</div>
        <GC style={{padding:20,marginBottom:12}}>
          <div style={{fontSize:11,color:P.txM,textTransform:"uppercase",letterSpacing:1}}>Gold Spot</div>
          <div style={{fontSize:32,fontWeight:800,color:P.gold,fontFamily:mono}}>${Math.round(prices.gold).toLocaleString()}</div>
          <div style={{fontSize:12,color:prices.goldChg>=0?P.green:P.red,fontFamily:mono}}>{prices.goldChg>=0?"\u25B2":"\u25BC"} {Math.abs(prices.goldChg||0).toFixed(2)}%</div>
          <div style={{marginTop:8,fontSize:11,color:P.txM}}>Au/Ag Ratio: <span style={{color:P.gold,fontWeight:700,fontFamily:mono}}>{gsRatio}</span></div>
        </GC>
        {[{name:"Silver",price:prices.silver,chg:prices.silverChg,color:P.txS},{name:"Platinum",price:prices.platinum,chg:prices.platChg,color:P.cyan},{name:"Palladium",price:prices.palladium,chg:0,color:P.blue}].map(m=><GC key={m.name} style={{padding:"14px 18px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:13,fontWeight:600,color:P.text}}>{m.name}</div><div style={{fontSize:11,color:(m.chg||0)>=0?P.green:P.red,fontFamily:mono}}>{(m.chg||0)>=0?"\u25B2":"\u25BC"}{Math.abs(m.chg||0).toFixed(2)}%</div></div>
          <div style={{fontSize:16,fontWeight:700,color:P.text,fontFamily:mono}}>${m.price>999?Math.round(m.price).toLocaleString():m.price?.toFixed(2)}</div>
        </GC>)}
      </div>

      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:16,fontWeight:700,color:P.text}}>Crypto <span style={{fontSize:12,color:P.txM,fontWeight:400}}>{filtered.length} coins</span></div>
          <div style={{display:"flex",gap:4}}>{[{k:"price",l:"Price"},{k:"name",l:"A-Z"}].map(s=><button key={s.k} onClick={()=>setCryptoSort(s.k)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${cryptoSort===s.k?P.purple:P.border}`,background:cryptoSort===s.k?P.purpleSoft:"transparent",color:cryptoSort===s.k?P.purple:P.txM,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:ff}}>{s.l}</button>)}</div>
        </div>
        <div style={{maxHeight:500,overflow:"auto"}}>
          {filtered.map(c=><GC key={c.sym} style={{padding:"10px 16px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:32,height:32,borderRadius:10,background:P.purpleSoft,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:P.purple}}>{c.sym.slice(0,3)}</div>
              <span style={{fontSize:13,fontWeight:600,color:P.text}}>{c.sym}</span>
            </div>
            <div style={{fontSize:14,fontWeight:700,color:P.text,fontFamily:mono}}>{c.price>999?"$"+Math.round(c.price).toLocaleString():"$"+c.price.toFixed(2)}</div>
          </GC>)}
        </div>
      </div>

      <div>
        <div style={{fontSize:16,fontWeight:700,color:P.text,marginBottom:14}}>Currencies <span style={{fontSize:12,color:P.txM,fontWeight:400}}>vs USD</span></div>
        <div style={{maxHeight:500,overflow:"auto"}}>
          {fxPairs.map(fp=>{const rate=fxData[fp.code];if(!rate)return null;return<GC key={fp.code} style={{padding:"10px 16px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:18}}>{fp.flag}</span>
              <div><div style={{fontSize:13,fontWeight:600,color:P.text}}>{fp.code}</div><div style={{fontSize:10,color:P.txM}}>{fp.name}</div></div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:14,fontWeight:700,color:P.text,fontFamily:mono}}>{rate<10?rate.toFixed(4):rate<1000?rate.toFixed(2):Math.round(rate).toLocaleString()}</div>
              <div style={{fontSize:10,color:P.txM,fontFamily:mono}}>1 {fp.code} = ${(1/rate).toFixed(4)}</div>
            </div>
          </GC>})}
        </div>
      </div>
    </div>
  </div>;
}
    default: return null}};

  // ═══ HOME (with login modal) & CONTACT ═══
  if(view==="home"||view==="login") return <>
    <HomePage onNav={v=>{if(v==="demo"){guestLogin();return}if(v==="app"&&user)setView("app");else setView(v)}} user={user}/>
    {view==="login"&&(!user||user.email==="guest")&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setView("home")}>
      <div onClick={e=>e.stopPropagation()} style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:24,padding:40,maxWidth:420,width:"90%",textAlign:"center",position:"relative"}}>
        <button onClick={()=>setView("home")} style={{position:"absolute",top:16,right:16,background:P.elevated,border:"none",color:P.txS,width:32,height:32,borderRadius:16,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        <div style={{width:64,height:64,borderRadius:18,background:`linear-gradient(145deg,${P.gold},#B8912E)`,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:900,color:P.bg,marginBottom:24,boxShadow:`0 12px 40px rgba(212,168,67,0.3)`}}>H</div>
        <div style={{fontSize:26,fontWeight:800,color:P.text,marginBottom:6}}>Sign In</div>
        <div style={{fontSize:14,color:P.txS,marginBottom:32,lineHeight:1.5}}>Track your investments in one dashboard</div>
        <div id="gsi-btn-web" style={{display:"flex",justifyContent:"center",marginBottom:16}}/>
        <button onClick={()=>{guestLogin();setView("app")}} style={{padding:"14px 28px",borderRadius:14,border:`1px solid ${P.border}`,background:"transparent",color:P.txS,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:ff}}>Continue as Guest</button>
        {syncing&&<div style={{marginTop:20,fontSize:14,color:P.gold}}>Loading your portfolio...</div>}
        <div style={{marginTop:32,fontSize:11,color:P.txM}}>Data saved securely to Supabase with encryption.</div>
      </div>
    </div>}
  </>;
  if(view==="contact") return <ContactPg onNav={v=>setView(v)}/>;

  return<div style={{fontFamily:ff,background:P.bg,color:P.text,minHeight:"100vh",display:"flex",WebkitUserSelect:"none",userSelect:"none"}} onContextMenu={e=>e.preventDefault()} onCopy={e=>e.preventDefault()}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');@keyframes modalIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}*{box-sizing:border-box}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${P.txF};border-radius:3px}input::placeholder{color:${P.txF}}select option{background:${P.surface}}`}</style>

    {/* SIDEBAR */}
    <div style={{width:sideCollapsed?72:240,minHeight:"100vh",background:P.surface,borderRight:`1px solid ${P.border}`,display:"flex",flexDirection:"column",transition:"width 0.3s",overflow:"hidden",position:"sticky",top:0,flexShrink:0}}>
      <div style={{padding:sideCollapsed?"20px 16px":"20px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${P.border}`,cursor:"pointer"}} onClick={()=>setSC(!sideCollapsed)}><div style={{width:38,height:38,borderRadius:12,background:`linear-gradient(145deg,${P.gold},#B8912E)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:900,color:P.bg,flexShrink:0,boxShadow:`0 4px 16px rgba(212,168,67,0.2)`}}>H</div>{!sideCollapsed&&<div><div style={{fontSize:17,fontWeight:800,color:P.text,letterSpacing:-0.4,whiteSpace:"nowrap"}}>HardAssets</div><div style={{fontSize:9,color:P.txM,letterSpacing:2,textTransform:"uppercase"}}>Portfolio Intelligence</div></div>}</div>
      <div style={{padding:"12px 8px",flex:1}}>{NAV.map(n=>{const a=tab===n.key;return<button key={n.key} onClick={()=>{setTab(n.key);if(window.posthog)window.posthog.capture('tab_viewed',{tab:n.key})}} style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"12px 16px",border:"none",borderRadius:12,cursor:"pointer",marginBottom:4,fontFamily:ff,background:a?P.goldSoft:"transparent"}}><div style={{width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a?P.gold:P.txM} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={n.d}/></svg></div>{!sideCollapsed&&<span style={{fontSize:14,fontWeight:a?600:500,color:a?P.gold:P.txS,whiteSpace:"nowrap"}}>{n.label}</span>}</button>})}</div>
      <button onClick={()=>{setShowActivity(true);fetchLogs(authToken).then(setActivityLogs)}} style={{display:"flex",alignItems:"center",gap:12,width:"calc(100% - 16px)",padding:"10px 16px",border:"none",borderRadius:12,cursor:"pointer",margin:"0 8px 4px",fontFamily:ff,background:"transparent"}}><div style={{width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.txM} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>{!sideCollapsed&&<span style={{fontSize:13,fontWeight:500,color:P.txS,whiteSpace:"nowrap"}}>Activity Log</span>}</button>
      <button onClick={()=>setView("home")} style={{display:"flex",alignItems:"center",gap:12,width:"calc(100% - 16px)",padding:"10px 16px",border:"none",borderRadius:12,cursor:"pointer",margin:"0 8px 8px",fontFamily:ff,background:"transparent"}}><div style={{width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.txM} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3"/></svg></div>{!sideCollapsed&&<span style={{fontSize:13,fontWeight:500,color:P.txS,whiteSpace:"nowrap"}}>Home Page</span>}</button>
      <div style={{padding:sideCollapsed?"16px":"16px 20px",borderTop:`1px solid ${P.border}`,display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={logout}><div style={{width:32,height:32,borderRadius:10,background:`linear-gradient(145deg,${P.elevated},${P.surface})`,border:`1px solid ${P.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden"}}>{user?.picture?<img src={user.picture} style={{width:32,height:32,borderRadius:10}} referrerPolicy="no-referrer"/>:<span style={{fontSize:13,fontWeight:700,color:P.gold}}>{(user?.name||"?")[0]}</span>}</div>{!sideCollapsed&&<div><div style={{fontSize:13,fontWeight:600,color:P.text}}>{user?.name||"User"}</div><div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:6,height:6,borderRadius:3,background:syncing?P.orange:user?.email!=="guest"?P.green:P.txM,boxShadow:user?.email!=="guest"?`0 0 6px ${P.green}`:"none"}}/><span style={{fontSize:11,color:P.txM}}>{syncing?"Syncing...":user?.email!=="guest"?"Synced":"Guest"}</span></div></div>}</div>
    </div>

    {/* MAIN */}
    <div style={{flex:1,minWidth:0}}>
      {user?.email==="guest"&&<div id="demo-banner" style={{background:`linear-gradient(90deg,${P.goldSoft},${P.surface})`,borderBottom:`1px solid ${P.gold}22`,padding:"8px 24px",display:"flex",justifyContent:"center",alignItems:"center",gap:12}}><span style={{fontSize:12,color:P.gold}}>📋 Demo Portfolio — <button onClick={()=>{setUser(null);setAuthToken(null);setView("login")}} style={{background:"none",border:"none",color:P.gold,fontWeight:700,cursor:"pointer",fontSize:12,textDecoration:"underline",fontFamily:ff}}>Sign in with Google</button> to save your own data</span><button onClick={()=>document.getElementById("demo-banner").style.display="none"} style={{background:"none",border:"none",color:P.txM,fontSize:14,cursor:"pointer",marginLeft:8}}>✕</button></div>}
      {/* Top bar */}
      <div style={{padding:"14px 32px",borderBottom:`1px solid ${P.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:`${P.bg}F0`,backdropFilter:"blur(20px)",zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}><div style={{fontSize:22,fontWeight:800,color:P.text,letterSpacing:-0.5}}>{NAV.find(n=>n.key===tab)?.label}</div>{lastRefresh&&<span style={{fontSize:11,color:P.txS,background:P.greenSoft,padding:"3px 10px",borderRadius:6,fontWeight:600}}>● Updated {lastRefresh}</span>}</div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          {[{l:"XAU",v:prices.gold,c:prices.goldChg},{l:"BTC",v:prices.btc,c:prices.btcChg},{l:"ETH",v:prices.eth,c:prices.ethChg}].map(p=><div key={p.l} style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:11,fontWeight:700,color:P.txM,letterSpacing:0.5}}>{p.l}</span><span style={{fontSize:13,fontWeight:600,color:P.text,fontFamily:mono}}>{p.v>999?"$"+Math.round(p.v).toLocaleString():"$"+p.v.toFixed(2)}</span><span style={{fontSize:11,fontWeight:600,color:p.c>=0?P.green:P.red,fontFamily:mono}}>{p.c>=0?"▲":"▼"}{Math.abs(p.c).toFixed(1)}%</span></div>)}
          <button onClick={()=>setShowFaq(true)} style={{background:P.elevated,border:`1px solid ${P.border}`,borderRadius:10,padding:"8px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontFamily:ff}}><span style={{fontSize:13}}>?</span><span style={{fontSize:12,fontWeight:600,color:P.txS}}>Help</span></button>
          <button onClick={refreshPrices} style={{background:P.goldSoft,border:`1px solid ${P.goldMed}`,borderRadius:10,padding:"8px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontFamily:ff}} disabled={refreshing}><span style={{fontSize:15,transition:"transform 0.5s",transform:refreshing?"rotate(360deg)":"none"}}>↻</span><span style={{fontSize:12,fontWeight:600,color:P.gold}}>{refreshing?"Refreshing...":"Refresh Prices"}</span></button>
        </div>
      </div>
      {/* Content */}
      <div style={{padding:"24px 32px 60px"}}>{renderContent()}</div>
    </div>

    {/* MODALS */}
    <Modal open={modal==="addMetal"} onClose={()=>setModal(null)} title="Add Metal Holding"><AddMetalForm prices={prices} onAdd={m=>{setMetals(p=>[...p,m]);logActivity(authToken,"add","metal",m.id,m.name||m.metal,null,m);if(window.posthog)window.posthog.capture('holding_added',{type:'metal'})}} onClose={()=>setModal(null)}/></Modal>
    <Modal open={modal==="addSynd"} onClose={()=>setModal(null)} title="Add Syndication"><AddSyndForm synds={synds} onAdd={s=>{setSynds(p=>[...p,s]);logActivity(authToken,"add","synd",s.id,s.name,null,s);if(window.posthog)window.posthog.capture('holding_added',{type:'synd'})}} onClose={()=>setModal(null)}/></Modal>
    <Modal open={modal==="addCrypto"} onClose={()=>setModal(null)} title="Add Crypto"><AddCryptoForm prices={prices} allCrypto={allCrypto} onAdd={c=>{setCrypto(p=>[...p,c]);logActivity(authToken,"add","crypto",c.id,c.name||c.coin,null,c);if(window.posthog)window.posthog.capture('holding_added',{type:'crypto'})}} onClose={()=>setModal(null)}/></Modal>
    <Modal open={modal==="addProperty"} onClose={()=>setModal(null)} title="Add Property"><AddPropertyForm onAdd={p=>{setProperties(prev=>[...prev,p]);logActivity(authToken,"add","property",p.id,p.name,null,p);if(window.posthog)window.posthog.capture('holding_added',{type:'property'})}} onClose={()=>setModal(null)}/></Modal>
    <Modal open={modal==="addNote"} onClose={()=>setModal(null)} title="Add Note"><AddNoteForm onAdd={n=>{setNotesLending(prev=>[...prev,n]);logActivity(authToken,"add","note",n.id,n.name,null,n);if(window.posthog)window.posthog.capture('holding_added',{type:'note'})}} onClose={()=>setModal(null)}/></Modal>
    <Modal open={modal==="addCollectible"} onClose={()=>setModal(null)} title="Add Collectible"><AddCollectibleForm onAdd={c=>{setCollectibles(prev=>[...prev,c]);logActivity(authToken,"add","collectible",c.id,c.name,null,c);if(window.posthog)window.posthog.capture('holding_added',{type:'collectible'})}} onClose={()=>setModal(null)}/></Modal>
    <Modal open={!!editItem} onClose={()=>setEditItem(null)} title={`Edit ${editItem?.name||editItem?.metal||editItem?.coin||""}`} wide onSave={()=>editSaveRef.current&&editSaveRef.current()}>{editItem&&<EditForm item={editItem} type={editItem._type} prices={prices} allCrypto={allCrypto} synds={synds} properties={properties} notesLending={notesLending} saveRef={editSaveRef} onSave={u=>saveItem(u,editItem._type)} onDelete={id=>setConfirmDelete({id,type:editItem._type,name:editItem?.name||editItem?.metal||editItem?.coin||"this item"})} onClose={()=>setEditItem(null)}/>}</Modal>
    <Modal open={!!confirmDelete} onClose={()=>setConfirmDelete(null)} title="Confirm Delete">
      <div style={{textAlign:"center",padding:"12px 0"}}>
        <div style={{fontSize:14,color:P.text,marginBottom:8}}>Are you sure you want to delete <span style={{fontWeight:700,color:P.red}}>{confirmDelete?.name}</span>?</div>
        <div style={{fontSize:12,color:P.txM,marginBottom:24}}>This action cannot be undone.</div>
        <div style={{display:"flex",gap:12,justifyContent:"center"}}>
          <Btn variant="ghost" onClick={()=>setConfirmDelete(null)}>Cancel</Btn>
          <Btn variant="danger" onClick={()=>{deleteItem(confirmDelete.id,confirmDelete.type);logActivity(authToken,"delete",confirmDelete.type,confirmDelete.id,confirmDelete.name,confirmDelete,null);if(window.posthog)window.posthog.capture('holding_deleted',{type:confirmDelete.type});setConfirmDelete(null);setEditItem(null)}}>Delete</Btn>
        </div>
      </div>
    </Modal>
    <Modal open={showFaq} onClose={()=>setShowFaq(false)} title="Dashboard Help & FAQ" wide>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {[
          ["How do I add a new holding?","Click the '+ Add' button at the top of any tab (Metals, Syndications, Crypto, Properties, Notes, Collectibles). Fill in the form and click the submit button."],
          ["How do I edit or delete a holding?","Click on any row in the table to open the edit form. Make your changes and click 'Save Changes'. To delete, click the red 'Delete' button at the bottom of the edit form."],
          ["Where do the live prices come from?","Metal prices (gold, silver, platinum, palladium) come from metals.dev API. Crypto prices (BTC, ETH, SOL, and 10+ coins) come from CoinGecko. Click 'Refresh Prices' in the top bar to update."],
          ["How does oz-per-unit work for metals?","Different metal forms contain different troy ounces. A 1oz coin = 1 oz, a 100oz bar = 100 oz, a 1kg bar = 32.15 oz. The dashboard multiplies your quantity × oz/unit × spot price for accurate valuation."],
          ["What is Cap Rate?","Cap Rate = (Annual Rental Income - Annual Expenses) / Property Value × 100. It measures a property's return independent of financing. Higher cap rates generally mean higher returns but may indicate higher risk."],
          ["What's the difference between Syndications and Physical RE?","Syndications are passive LP (limited partner) investments in deals managed by sponsors. Physical RE is property you own directly — tracking purchase price, mortgage, rental income, and cash flow."],
          ["How do target allocations work?","Click 'Set Targets' in the Portfolio tab to set your ideal percentage for each asset class. The dashboard compares your actual allocation vs targets so you can see where to rebalance."],
          ["Is my data saved automatically?","Yes. All changes auto-save to the cloud (Supabase) within 800ms when you're signed in with Google. Guest mode data is stored locally only and will be lost if you clear your browser."],
          ["Can I import from a spreadsheet?","Yes! Every tab has an 'Import' button that accepts CSV files. Export from Excel/Sheets as CSV, then import. Column names are matched automatically. You can also export your data to CSV anytime."],
          ["What do the risk scores mean?","Risk is rated 1-10: Green (1-3) = Low risk, Gold (4-6) = Medium, Orange (7-8) = High, Red (9-10) = Very High. Set risk based on your own assessment of each holding."],
          ["How is portfolio income calculated?","Annual income includes: syndication distributions (invested × rate%), property rental cash flow (rent - expenses - mortgage × 12), and note/lending interest (balance × rate%). All are summed in the Portfolio tab."],
          ["What happens if I sign out?","Your data is saved to the cloud. Sign back in with the same Google account and everything loads automatically. Guest data is not saved to the cloud."]
        ].map(([q,a],i)=><div key={i} style={{borderBottom:i<11?`1px solid ${P.border}`:"none",paddingBottom:12}}>
          <div style={{fontSize:14,fontWeight:700,color:P.text,marginBottom:6}}>{q}</div>
          <div style={{fontSize:13,color:P.txS,lineHeight:1.6}}>{a}</div>
        </div>)}
      </div>
    </Modal>
    <Modal open={showActivity} onClose={()=>setShowActivity(false)} title="Activity Log" wide>
      <div style={{display:"flex",gap:8,marginBottom:16}}>{["all","add","edit","delete","import"].map(f=><button key={f} onClick={()=>setActivityFilter(f)} style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${activityFilter===f?P.gold:P.border}`,background:activityFilter===f?P.goldSoft:"transparent",color:activityFilter===f?P.gold:P.txS,fontSize:12,fontWeight:600,cursor:"pointer",textTransform:"capitalize",fontFamily:ff}}>{f}</button>)}</div>
      <div style={{maxHeight:500,overflow:"auto",display:"flex",flexDirection:"column",gap:8}}>
        {activityLogs.filter(l=>activityFilter==="all"||l.action===activityFilter).slice(0,50).map((l,i)=>{
          const colors={add:P.green,edit:P.gold,delete:P.red,import:P.blue};
          const icons={add:"\uFF0B",edit:"\u270F\uFE0F",delete:"\uD83D\uDDD1",import:"\uD83D\uDCE5"};
          const typeBg={metal:P.goldSoft,synd:P.blueSoft,crypto:P.purpleSoft,property:"rgba(52,211,153,0.1)",note:"rgba(34,211,238,0.1)",collectible:"rgba(251,146,60,0.1)",targets:P.goldSoft};
          const typeColor={metal:P.gold,synd:P.blue,crypto:P.purple,property:P.green,note:P.cyan,collectible:P.orange,targets:P.gold};
          let detail="";
          if(l.action==="add")detail="Added "+(l.asset_name||"item");
          else if(l.action==="delete")detail="Removed "+(l.asset_name||"item");
          else if(l.action==="import")detail="Imported "+(l.new_data?.count||"")+" items";
          else if(l.action==="edit"&&l.old_data&&l.new_data){const changes=[];Object.keys(l.new_data).forEach(k=>{if(k!=="_type"&&k!=="id"&&JSON.stringify(l.old_data[k])!==JSON.stringify(l.new_data[k]))changes.push(k)});detail=changes.length>0?"Changed: "+changes.slice(0,3).join(", "):"Updated "+(l.asset_name||"item")}
          else detail="Updated "+(l.asset_name||"item");
          return<div key={i} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:`1px solid ${P.border}`}}>
            <div style={{width:32,height:32,borderRadius:10,background:(colors[l.action]||P.txM)+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{icons[l.action]||"\u2022"}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <span style={{fontSize:10,padding:"2px 8px",borderRadius:5,background:typeBg[l.asset_type]||P.elevated,color:typeColor[l.asset_type]||P.txS,fontWeight:600}}>{l.asset_type}</span>
                <span style={{fontSize:11,color:P.txM}}>{timeAgo(l.timestamp)}</span>
              </div>
              <div style={{fontSize:13,fontWeight:600,color:P.text}}>{l.asset_name||"Unknown"}</div>
              <div style={{fontSize:11,color:P.txS}}>{detail}</div>
            </div>
          </div>})}
        {activityLogs.filter(l=>activityFilter==="all"||l.action===activityFilter).length===0&&<div style={{padding:40,textAlign:"center",color:P.txM}}>No activity yet</div>}
      </div>
    </Modal>
  </div>
}