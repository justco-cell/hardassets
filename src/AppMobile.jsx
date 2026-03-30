import { useState, useEffect, useMemo, useRef } from "react";
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

// ═══ HARDASSETS MOBILE APP — ALL FEATURES ═══
const P={bg:"#0B0F1A",surface:"#111827",elevated:"#1E293B",card:"rgba(17,24,39,0.72)",border:"rgba(148,163,184,0.08)",borderLight:"rgba(148,163,184,0.12)",gold:"#D4A843",goldSoft:"rgba(212,168,67,0.1)",goldMed:"rgba(212,168,67,0.2)",green:"#34D399",greenSoft:"rgba(52,211,153,0.1)",red:"#F87171",redSoft:"rgba(248,113,113,0.1)",blue:"#60A5FA",blueSoft:"rgba(96,165,250,0.1)",purple:"#A78BFA",purpleSoft:"rgba(167,139,250,0.1)",cyan:"#22D3EE",orange:"#FB923C",text:"#F1F5F9",txS:"#A0AEC0",txM:"#52647A",txF:"#334155"};
const PIE_C=[P.gold,P.blue,P.green,P.purple,P.orange,P.cyan,"#EC4899","#84CC16","#F59E0B","#6366F1","#14B8A6"];
const ff="'Inter',-apple-system,sans-serif",mono="'JetBrains Mono',monospace";
const fmt=n=>{if(n==null||isNaN(n))return"$0";const a=Math.abs(n),s=n<0?"-":"";if(a>=1e6)return s+"$"+(a/1e6).toFixed(2)+"M";if(a>=1e3)return s+"$"+(a/1e3).toFixed(1)+"K";return s+"$"+a.toFixed(2)};
const fPct=n=>(n>=0?"+":"")+n.toFixed(2)+"%";
const spark=(base,pts=25,vol=0.012)=>{let v=base;return Array.from({length:pts},(_,i)=>{v+=v*(Math.random()-0.48)*vol;return{x:i,v}})};
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

async function fetchMetalPrices(){
  try{
    const r=await fetch("/api/prices");
    if(!r.ok)return null;
    const d=await r.json();
    if(d.status!=="success"||!d.metals)return null;
    return{gold:d.metals.gold||0,silver:d.metals.silver||0,platinum:d.metals.platinum||0,palladium:d.metals.palladium||0};
  }catch(e){console.log("Metal API err:",e);return null}
}

async function fetchCryptoPrices(){
  try{
    const ids=Object.values(COIN_IDS).join(",");
    const r=await fetch("https://api.coingecko.com/api/v3/simple/price?ids="+ids+"&vs_currencies=usd&include_24hr_change=true");
    if(!r.ok)return null;
    const d=await r.json();
    const results={};
    for(const[sym,cgId] of Object.entries(COIN_IDS)){
      if(d[cgId])results[sym]={price:d[cgId].usd||0,change:d[cgId].usd_24h_change||0};
    }
    return results;
  }catch(e){console.log("Crypto API err:",e);return null}
}

// ═══ CSV HELPERS ═══
const csvExport=(headers,rows,filename)=>{const csv=[headers.join(","),...rows.map(r=>r.map(c=>typeof c==="string"&&c.includes(",")?`"${c}"`:c).join(","))].join("\n");const b=new Blob([csv],{type:"text/csv"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=filename;a.click();URL.revokeObjectURL(u)};

// ═══ SUPABASE CLOUD PERSISTENCE ═══
const GOOGLE_CLIENT_ID="159487463622-ol75fn02c9cg8gmd2h4bpk36gaga3rcf.apps.googleusercontent.com";

async function cloudSave(authToken,data){
  if(!authToken)return;
  try{
    await fetch("/api/save",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+authToken},body:JSON.stringify({data})});
  }catch(e){console.log("Cloud save err:",e)}
}

async function cloudLoad(authToken){
  if(!authToken)return null;
  try{
    const r=await fetch("/api/load",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+authToken}});
    if(!r.ok)return null;
    const d=await r.json();
    return d.data||null;
  }catch(e){console.log("Cloud load err:",e);return null}
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
function GC({children,style,onClick}){const[h,setH]=useState(false);return<div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{background:P.card,backdropFilter:"blur(40px)",border:`1px solid ${h&&onClick?P.borderLight:P.border}`,borderRadius:20,transition:"all 0.3s",cursor:onClick?"pointer":"default",...style}}>{children}</div>}

function MiniChart({data,color=P.green,height=32,width=60}){const id=useMemo(()=>"m"+Math.random().toString(36).slice(2,7),[]);return<ResponsiveContainer width={width} height={height}><AreaChart data={data} margin={{top:2,right:0,bottom:0,left:0}}><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.3}/><stop offset="100%" stopColor={color} stopOpacity={0}/></linearGradient></defs><Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#${id})`} dot={false}/></AreaChart></ResponsiveContainer>}

function Sheet({open,onClose,title,children,onSave}){if(!open)return null;return<div style={{position:"fixed",inset:0,zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}><div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)"}}/><div style={{position:"relative",background:P.surface,borderRadius:"28px 28px 0 0",maxHeight:"88vh",overflow:"auto",animation:"sheetUp 0.35s cubic-bezier(0.32,0.72,0,1)"}}><div style={{display:"flex",justifyContent:"center",padding:"12px 0 0"}}><div style={{width:36,height:4,borderRadius:2,background:P.txF}}/></div><div style={{padding:"12px 24px 8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:20,fontWeight:700,color:P.text}}>{title}</span><div style={{display:"flex",alignItems:"center",gap:8}}>{onSave&&<button onClick={onSave} style={{padding:"6px 14px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${P.gold},#B8912E)`,color:P.bg,fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>✓ Save</button>}<button onClick={onClose} style={{width:32,height:32,borderRadius:16,background:P.elevated,border:"none",color:P.txS,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button></div></div><div style={{padding:"8px 24px 40px"}}>{children}</div></div></div>}

function FF({label,value,onChange,type="text",prefix,placeholder,isMono}){return<div style={{marginBottom:14}}><label style={{display:"block",fontSize:12,fontWeight:600,color:P.txS,marginBottom:6}}>{label}</label><div style={{display:"flex",alignItems:"center",background:P.bg,border:`1px solid ${P.border}`,borderRadius:12,overflow:"hidden"}}>{prefix&&<span style={{padding:"0 0 0 14px",color:P.txM,fontSize:14,fontFamily:mono}}>{prefix}</span>}<input value={value} onChange={e=>onChange(e.target.value)} type={type} placeholder={placeholder} style={{flex:1,background:"transparent",border:"none",color:P.text,fontSize:14,padding:prefix?"14px 14px 14px 6px":"14px 14px",outline:"none",fontFamily:isMono?mono:ff,width:"100%",colorScheme:"dark"}}/></div></div>}

function FS({label,value,onChange,options}){return<div style={{marginBottom:14}}><label style={{display:"block",fontSize:12,fontWeight:600,color:P.txS,marginBottom:6}}>{label}</label><select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",background:P.bg,border:`1px solid ${P.border}`,borderRadius:12,color:P.text,fontSize:14,padding:"12px 14px",outline:"none",appearance:"none",fontFamily:ff}}>{options.map(o=><option key={o.value||o} value={o.value||o} style={{background:P.surface}}>{o.label||o}</option>)}</select></div>}

function Btn({children,onClick,variant="gold",full,style:s}){const vs={gold:{background:`linear-gradient(135deg,${P.gold},#B8912E)`,color:P.bg,boxShadow:`0 4px 20px rgba(212,168,67,0.2)`},ghost:{background:"transparent",color:P.txS,border:`1px solid ${P.border}`},danger:{background:P.redSoft,color:P.red,border:`1px solid rgba(248,113,113,0.15)`},soft:{background:P.goldSoft,color:P.gold,border:`1px solid ${P.goldMed}`,padding:"9px 16px",fontSize:13}};return<button onClick={onClick} style={{border:"none",borderRadius:14,padding:"14px 24px",fontSize:14,fontWeight:700,cursor:"pointer",width:full?"100%":"auto",fontFamily:ff,transition:"all 0.2s",...(vs[variant]||vs.gold),...s}}>{children}</button>}

// ═══ SPONSOR AUTOCOMPLETE ═══
function SponsorInput({value,onChange,synds}){const[show,setShow]=useState(false);const existing=[...new Set(synds.map(s=>s.sponsor).filter(Boolean))];const filtered=existing.filter(s=>s.toLowerCase().includes((value||"").toLowerCase())&&s!==value);return<div style={{position:"relative",marginBottom:14}}><label style={{display:"block",fontSize:12,fontWeight:600,color:P.txS,marginBottom:6}}>Sponsor</label><input value={value} onChange={e=>{onChange(e.target.value);setShow(true)}} onFocus={()=>setShow(true)} onBlur={()=>setTimeout(()=>setShow(false),200)} placeholder="e.g. Bergman" style={{width:"100%",background:P.bg,border:`1px solid ${P.border}`,borderRadius:12,color:P.text,fontSize:14,padding:"12px 14px",outline:"none",fontFamily:ff,boxSizing:"border-box"}}/>{show&&filtered.length>0&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:P.elevated,border:`1px solid ${P.border}`,borderRadius:12,marginTop:4,zIndex:10,overflow:"hidden"}}>{filtered.slice(0,5).map(s=><div key={s} onMouseDown={()=>{onChange(s);setShow(false)}} style={{padding:"10px 14px",fontSize:13,color:P.text,cursor:"pointer",borderBottom:`1px solid ${P.border}`}}>{s}</div>)}</div>}</div>}

// ═══ CSV IMPORT ═══
function CsvImport({onImport,label="Import CSV"}){const ref=useRef();return<><input ref={ref} type="file" accept=".csv,.xlsx,.xls" style={{display:"none"}} onChange={e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>{const text=ev.target.result;const lines=text.split("\n").filter(l=>l.trim());if(lines.length<2)return;const headers=lines[0].split(",").map(h=>h.trim().replace(/"/g,""));const rows=lines.slice(1).map(l=>{const vals=l.split(",").map(v=>v.trim().replace(/"/g,""));const obj={};headers.forEach((h,i)=>obj[h]=vals[i]||"");return obj});onImport(rows)};reader.readAsText(file);e.target.value=""}}/><Btn variant="ghost" onClick={()=>ref.current?.click()} style={{fontSize:12,padding:"8px 14px"}}>{label}</Btn></>}

// ═══ HOLDING CARD ═══
function HoldingCard({item,type,spotPrice,onTap}){
  const val=type==="metal"?item.qty*(ozMap[item.unit]||1)*(spotPrice||item.spot||0):type==="crypto"?item.qty*(spotPrice||item.price||0):type==="synd"?item.invested||0:type==="property"?(+(item.currentValue||0))-(+(item.mortgageBalance||0)):type==="note"?+(item.outstandingBalance||0):type==="collectible"?+(item.currentValue||0):item.value||0;
  const cost=type==="metal"?item.qty*(item.costPerUnit||0):type==="crypto"?item.qty*(item.avgCost||0):type==="property"?+(item.purchasePrice||0):type==="note"?+(item.principal||0):type==="collectible"?+(item.purchasePrice||0):item.invested||val;
  const gain=val-cost,pct=cost>0?(gain/cost)*100:0,up=gain>=0;
  const sp=useMemo(()=>spark(cost||val),[cost,val]);
  const held=yrsHeld(item.dateInvested);
  return<GC onClick={onTap} style={{padding:"16px 18px",marginBottom:10}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:15,fontWeight:600,color:P.text,marginBottom:3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.name||item.metal||item.coin}</div>
        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          {type==="metal"&&item.unit&&<span style={{fontSize:10,color:P.txM,background:P.goldSoft,padding:"1px 7px",borderRadius:5,fontWeight:600}}>{item.unit}</span>}
          {type==="synd"&&(item.strategy||item.type||"Other")&&<span style={{fontSize:10,color:P.blue,background:P.blueSoft,padding:"1px 7px",borderRadius:5,fontWeight:600}}>{(item.strategy||item.type||"Other")}</span>}
          {type==="synd"&&item.sponsor&&<span style={{fontSize:10,color:P.txM}}>{item.sponsor}</span>}
          {type==="crypto"&&<span style={{fontSize:10,color:P.purple,background:P.purpleSoft,padding:"1px 7px",borderRadius:5,fontWeight:600}}>{item.coin}</span>}
          {type==="property"&&item.propType&&<span style={{fontSize:10,color:P.green,background:P.greenSoft,padding:"1px 7px",borderRadius:5,fontWeight:600}}>{item.propType}</span>}
          {type==="note"&&item.noteType&&<span style={{fontSize:10,color:P.cyan,background:"rgba(34,211,238,0.1)",padding:"1px 7px",borderRadius:5,fontWeight:600}}>{item.noteType}</span>}
          {type==="note"&&item.status&&<span style={{fontSize:10,fontWeight:700,color:item.status==="Performing"?P.green:item.status==="Late"?P.orange:item.status==="Default"?P.red:P.txS}}>{item.status}</span>}
          {type==="collectible"&&item.category&&<span style={{fontSize:10,color:P.orange,background:"rgba(251,146,60,0.1)",padding:"1px 7px",borderRadius:5,fontWeight:600}}>{item.category}</span>}
          {item.risk&&<span style={{fontSize:10,fontWeight:700,color:riskColor(+item.risk)}}>{item.risk}/10</span>}
          {held&&<span style={{fontSize:10,color:P.txM}}>{held}yr</span>}
        </div>
        {type==="synd"&&item.expectedRate>0&&<div style={{fontSize:10,color:P.green,marginTop:2}}>Income: {fmt(item.invested*(item.expectedRate/100))}/yr</div>}
        {type==="property"&&<div style={{fontSize:10,color:P.green,marginTop:2}}>CF: {fmt((+(item.monthlyRent||0))-(+(item.monthlyExpenses||0))-(+(item.mortgagePayment||0)))}/mo</div>}
        {type==="note"&&item.interestRate>0&&<div style={{fontSize:10,color:P.cyan,marginTop:2}}>Income: {fmt((+(item.outstandingBalance||0))*(+(item.interestRate||0))/100)}/yr</div>}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <MiniChart data={sp} color={up?P.green:P.red}/>
        <div style={{textAlign:"right",minWidth:70}}>
          <div style={{fontSize:16,fontWeight:700,color:P.text,fontFamily:mono,letterSpacing:-0.5}}>{fmt(val)}</div>
          <div style={{fontSize:12,fontWeight:600,color:up?P.green:P.red,fontFamily:mono}}>{up?"+":""}{fmt(gain)}</div>
        </div>
      </div>
    </div>
    {item.notes&&<div style={{fontSize:10,color:P.txM,marginTop:6,padding:"4px 0",borderTop:`1px solid ${P.border}`,fontStyle:"italic"}}>📝 {item.notes}</div>}
  </GC>
}

// ═══ EDIT FORM (universal) ═══
function EditForm({item,type,onSave,onDelete,onClose,prices,synds=[],allCrypto={},saveRef}){
  const[f,sF]=useState({...item});
  const doSave=()=>{const u={...f};if(type==="metal"){u.qty=+u.qty;u.costPerUnit=+u.costPerUnit;u.spot=({Gold:prices.gold,Silver:prices.silver,Platinum:prices.platinum,Palladium:prices.palladium})[u.metal]||u.spot||0;u.name=u.metal+" "+u.unit}if(type==="synd"){u.invested=+u.invested;u.expectedRate=+u.expectedRate;u.risk=+u.risk}if(type==="crypto"){u.qty=+u.qty;u.avgCost=+u.avgCost;u.price=({BTC:prices.btc,ETH:prices.eth,SOL:prices.sol,...allCrypto})[u.coin]||+u.avgCost;u.name=u.coin}if(type==="property"){u.purchasePrice=+u.purchasePrice;u.currentValue=+u.currentValue;u.mortgageBalance=+u.mortgageBalance;u.monthlyRent=+u.monthlyRent;u.monthlyExpenses=+u.monthlyExpenses;u.mortgagePayment=+u.mortgagePayment;u.risk=+u.risk}if(type==="note"){u.principal=+u.principal;u.outstandingBalance=+u.outstandingBalance;u.interestRate=+u.interestRate;u.ltv=u.ltv?+u.ltv:null;u.risk=+u.risk}if(type==="collectible"){u.purchasePrice=+u.purchasePrice;u.currentValue=+u.currentValue;u.insuranceValue=u.insuranceValue?+u.insuranceValue:null;u.risk=+u.risk}onSave(u)};
  useEffect(()=>{if(saveRef)saveRef.current=doSave});
  const spotMap={Gold:prices.gold,Silver:prices.silver,Platinum:prices.platinum,Palladium:prices.palladium};
  const cSpot={BTC:prices.btc,ETH:prices.eth,SOL:prices.sol,...allCrypto};
  return<>
    {type==="metal"&&<><FS label="Metal" value={f.metal} onChange={v=>sF({...f,metal:v})} options={["Gold","Silver","Platinum","Palladium"]}/>
      <FS label="Unit" value={f.unit} onChange={v=>sF({...f,unit:v})} options={["1 oz","1/2 oz","1/4 oz","1/10 oz","1 kg","10 oz","100 oz","Gram"]}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Quantity" value={f.qty} onChange={v=>sF({...f,qty:v})} type="number" isMono/><FF label="Cost/Unit" value={f.costPerUnit} onChange={v=>sF({...f,costPerUnit:v})} type="number" prefix="$" isMono/></div>
      {spotMap[f.metal]&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:P.goldSoft,borderRadius:10,marginBottom:14,border:`1px solid ${P.goldMed}`}}><div style={{width:6,height:6,borderRadius:3,background:P.gold}}/><span style={{fontSize:12,color:P.txS}}>Live spot</span><span style={{fontSize:13,fontWeight:700,color:P.gold,fontFamily:mono,marginLeft:"auto"}}>${spotMap[f.metal]?.toFixed(2)}/oz</span></div>}</>}
    {type==="synd"&&<><FF label="Deal Name" value={f.name} onChange={v=>sF({...f,name:v})}/><SponsorInput value={f.sponsor} onChange={v=>sF({...f,sponsor:v})} synds={synds}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Invested" value={f.invested} onChange={v=>sF({...f,invested:v})} type="number" prefix="$" isMono/><FF label="Rate %" value={f.expectedRate} onChange={v=>sF({...f,expectedRate:v})} type="number" prefix="%" isMono/></div>
      <FF label="Projected IRR %" value={f.projIRR||""} onChange={v=>sF({...f,projIRR:v})} type="number" prefix="%" isMono/>
      <FS label="Strategy" value={f.strategy} onChange={v=>sF({...f,strategy:v})} options={SYND_TYPES}/>
      <FF label="Location" value={f.location||""} onChange={v=>sF({...f,location:v})} placeholder="e.g. Texas, US"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FS label="Risk" value={f.risk} onChange={v=>sF({...f,risk:v})} options={[...Array(10)].map((_,i)=>({value:String(i+1),label:`${i+1}`}))}/><FS label="Status" value={f.status} onChange={v=>sF({...f,status:v})} options={["Active","Pending","Exited","Default"]}/></div></>}
    {type==="crypto"&&<><FS label="Coin" value={f.coin} onChange={v=>sF({...f,coin:v})} options={COINS}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Quantity" value={f.qty} onChange={v=>sF({...f,qty:v})} type="number" isMono/><FF label="Avg Cost" value={f.avgCost} onChange={v=>sF({...f,avgCost:v})} type="number" prefix="$" isMono/></div>
      {cSpot[f.coin]&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:P.purpleSoft,borderRadius:10,marginBottom:14,border:`1px solid rgba(167,139,250,0.15)`}}><div style={{width:6,height:6,borderRadius:3,background:P.purple}}/><span style={{fontSize:12,color:P.txS}}>Live price</span><span style={{fontSize:13,fontWeight:700,color:P.purple,fontFamily:mono,marginLeft:"auto"}}>${Math.round(cSpot[f.coin]).toLocaleString()}</span></div>}</>}
    {type==="property"&&<><FF label="Property Name" value={f.name} onChange={v=>sF({...f,name:v})} placeholder="e.g. 123 Main St"/>
      <FF label="Address" value={f.address||""} onChange={v=>sF({...f,address:v})} placeholder="Full address"/>
      <FS label="Property Type" value={f.propType||"SFH"} onChange={v=>sF({...f,propType:v})} options={PROP_TYPES}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Purchase Price" value={f.purchasePrice} onChange={v=>sF({...f,purchasePrice:v})} type="number" prefix="$" isMono/><FF label="Current Value" value={f.currentValue} onChange={v=>sF({...f,currentValue:v})} type="number" prefix="$" isMono/></div>
      <FF label="Mortgage Balance" value={f.mortgageBalance||""} onChange={v=>sF({...f,mortgageBalance:v})} type="number" prefix="$" isMono/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}><FF label="Rent/mo" value={f.monthlyRent||""} onChange={v=>sF({...f,monthlyRent:v})} type="number" prefix="$" isMono/><FF label="Expenses/mo" value={f.monthlyExpenses||""} onChange={v=>sF({...f,monthlyExpenses:v})} type="number" prefix="$" isMono/><FF label="Mortgage/mo" value={f.mortgagePayment||""} onChange={v=>sF({...f,mortgagePayment:v})} type="number" prefix="$" isMono/></div></>}
    {type==="note"&&<><FF label="Note Name" value={f.name} onChange={v=>sF({...f,name:v})} placeholder="e.g. Smith Note"/>
      <FS label="Note Type" value={f.noteType||"Hard Money"} onChange={v=>sF({...f,noteType:v})} options={NOTE_TYPES}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Principal" value={f.principal} onChange={v=>sF({...f,principal:v})} type="number" prefix="$" isMono/><FF label="Outstanding" value={f.outstandingBalance} onChange={v=>sF({...f,outstandingBalance:v})} type="number" prefix="$" isMono/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Interest Rate %" value={f.interestRate||""} onChange={v=>sF({...f,interestRate:v})} type="number" prefix="%" isMono/><FF label="Maturity Date" value={f.maturityDate||""} onChange={v=>sF({...f,maturityDate:v})} type="date"/></div>
      <FF label="Collateral" value={f.collateral||""} onChange={v=>sF({...f,collateral:v})} placeholder="e.g. 456 Oak Ave"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FS label="Status" value={f.status||"Performing"} onChange={v=>sF({...f,status:v})} options={NOTE_STATUS}/><FF label="LTV %" value={f.ltv||""} onChange={v=>sF({...f,ltv:v})} type="number" prefix="%" isMono/></div></>}
    {type==="collectible"&&<><FF label="Item Name" value={f.name} onChange={v=>sF({...f,name:v})} placeholder="e.g. Rolex Submariner"/>
      <FS label="Category" value={f.category||"Watch"} onChange={v=>sF({...f,category:v})} options={COLLECT_CATS}/>
      <FF label="Brand" value={f.brand||""} onChange={v=>sF({...f,brand:v})} placeholder="e.g. Rolex"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Purchase Price" value={f.purchasePrice} onChange={v=>sF({...f,purchasePrice:v})} type="number" prefix="$" isMono/><FF label="Current Value" value={f.currentValue} onChange={v=>sF({...f,currentValue:v})} type="number" prefix="$" isMono/></div>
      <FF label="Serial Number" value={f.serialNumber||""} onChange={v=>sF({...f,serialNumber:v})} placeholder="Optional"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Location" value={f.location||""} onChange={v=>sF({...f,location:v})} placeholder="e.g. Safe"/><FF label="Insurance Value" value={f.insuranceValue||""} onChange={v=>sF({...f,insuranceValue:v})} type="number" prefix="$" isMono/></div>
      <FS label="Insured?" value={f.insured||"No"} onChange={v=>sF({...f,insured:v})} options={["Yes","No"]}/></>}
    {/* Common fields */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      <FF label="Date Invested" value={f.dateInvested||""} onChange={v=>sF({...f,dateInvested:v})} type="date"/>
      <FF label="Hold Period (Yrs)" value={f.holdPeriod||""} onChange={v=>sF({...f,holdPeriod:v})} type="number" isMono/>
    </div>
    {f.dateInvested&&<div style={{fontSize:11,color:P.txS,marginBottom:14}}>Held: <span style={{fontWeight:700,color:P.text,fontFamily:mono}}>{yrsHeld(f.dateInvested)} years</span></div>}
    <FS label="Risk (1-10)" value={f.risk||"5"} onChange={v=>sF({...f,risk:v})} options={[...Array(10)].map((_,i)=>({value:String(i+1),label:`${i+1} — ${i<3?"Low":i<6?"Medium":i<8?"High":"Very High"}`}))}/>
    <FF label="Notes" value={f.notes||""} onChange={v=>sF({...f,notes:v})} placeholder="Optional notes..."/>
    <div style={{display:"flex",gap:10,marginTop:8}}>
      <Btn variant="danger" onClick={()=>{onDelete(f.id);onClose()}} style={{padding:"10px 18px",fontSize:12}}>Delete</Btn>
    </div>
  </>
}

// ═══ ADD FORMS ═══
function AddMetalForm({onAdd,onClose,prices}){const[f,sF]=useState({metal:"Gold",unit:"1 oz",qty:"",costPerUnit:"",dateInvested:"",holdPeriod:"",risk:"3",notes:""});const spot={Gold:prices.gold,Silver:prices.silver,Platinum:prices.platinum,Palladium:prices.palladium};return<><FS label="Metal" value={f.metal} onChange={v=>sF({...f,metal:v})} options={["Gold","Silver","Platinum","Palladium"]}/><FS label="Unit" value={f.unit} onChange={v=>sF({...f,unit:v})} options={["1 oz","1/2 oz","1/4 oz","1/10 oz","1 kg","10 oz","100 oz","Gram"]}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Quantity" value={f.qty} onChange={v=>sF({...f,qty:v})} type="number" isMono/><FF label="Cost/Unit" value={f.costPerUnit} onChange={v=>sF({...f,costPerUnit:v})} type="number" prefix="$" isMono/></div>{spot[f.metal]&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:P.goldSoft,borderRadius:10,marginBottom:14,border:`1px solid ${P.goldMed}`}}><div style={{width:6,height:6,borderRadius:3,background:P.gold}}/><span style={{fontSize:12,color:P.txS}}>Live spot</span><span style={{fontSize:13,fontWeight:700,color:P.gold,fontFamily:mono,marginLeft:"auto"}}>${spot[f.metal]?.toFixed(2)}/oz</span></div>}<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Date Invested" value={f.dateInvested} onChange={v=>sF({...f,dateInvested:v})} type="date"/><FF label="Hold Period (Yrs)" value={f.holdPeriod} onChange={v=>sF({...f,holdPeriod:v})} type="number" isMono/></div><FS label="Risk" value={f.risk} onChange={v=>sF({...f,risk:v})} options={[...Array(10)].map((_,i)=>({value:String(i+1),label:`${i+1}`}))}/><FF label="Notes" value={f.notes} onChange={v=>sF({...f,notes:v})} placeholder="Optional"/><Btn full onClick={()=>{if(f.qty){onAdd({...f,qty:+f.qty,costPerUnit:+f.costPerUnit,risk:+f.risk,spot:spot[f.metal]||0,name:f.metal+" "+f.unit,id:uid()});onClose()}}}>Add Holding</Btn></>}

function AddSyndForm({onAdd,onClose,synds}){const[f,sF]=useState({name:"",sponsor:"",invested:"",expectedRate:"",projIRR:"",strategy:"Multifamily",location:"",risk:"5",status:"Active",dateInvested:"",holdPeriod:"",notes:""});return<><FF label="Deal Name" value={f.name} onChange={v=>sF({...f,name:v})} placeholder="e.g. Pinnacle West"/><SponsorInput value={f.sponsor} onChange={v=>sF({...f,sponsor:v})} synds={synds}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Invested" value={f.invested} onChange={v=>sF({...f,invested:v})} type="number" prefix="$" isMono/><FF label="Rate %" value={f.expectedRate} onChange={v=>sF({...f,expectedRate:v})} type="number" prefix="%" isMono/></div><FF label="Projected IRR %" value={f.projIRR} onChange={v=>sF({...f,projIRR:v})} type="number" prefix="%" isMono/><FS label="Strategy" value={f.strategy} onChange={v=>sF({...f,strategy:v})} options={SYND_TYPES}/><FF label="Location" value={f.location} onChange={v=>sF({...f,location:v})} placeholder="e.g. Texas, US"/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FS label="Risk" value={f.risk} onChange={v=>sF({...f,risk:v})} options={[...Array(10)].map((_,i)=>({value:String(i+1),label:`${i+1}`}))}/><FS label="Status" value={f.status} onChange={v=>sF({...f,status:v})} options={["Active","Pending","Exited","Default"]}/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Date Invested" value={f.dateInvested} onChange={v=>sF({...f,dateInvested:v})} type="date"/><FF label="Hold Period (Yrs)" value={f.holdPeriod} onChange={v=>sF({...f,holdPeriod:v})} type="number" isMono/></div><FF label="Notes" value={f.notes} onChange={v=>sF({...f,notes:v})} placeholder="Optional"/><Btn full onClick={()=>{if(f.name&&f.invested){onAdd({...f,invested:+f.invested,expectedRate:+f.expectedRate,projIRR:f.projIRR?+f.projIRR:null,risk:+f.risk,id:uid()});onClose()}}}>Add Syndication</Btn></>}

function AddCryptoForm({onAdd,onClose,prices,allCrypto={}}){const[f,sF]=useState({coin:"BTC",qty:"",avgCost:"",dateInvested:"",holdPeriod:"",risk:"7",notes:""});const spot={BTC:prices.btc,ETH:prices.eth,SOL:prices.sol,...allCrypto};return<><FS label="Coin" value={f.coin} onChange={v=>sF({...f,coin:v})} options={COINS}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Quantity" value={f.qty} onChange={v=>sF({...f,qty:v})} type="number" isMono/><FF label="Avg Cost" value={f.avgCost} onChange={v=>sF({...f,avgCost:v})} type="number" prefix="$" isMono/></div>{spot[f.coin]&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:P.purpleSoft,borderRadius:10,marginBottom:14,border:`1px solid rgba(167,139,250,0.15)`}}><div style={{width:6,height:6,borderRadius:3,background:P.purple}}/><span style={{fontSize:12,color:P.txS}}>Live</span><span style={{fontSize:13,fontWeight:700,color:P.purple,fontFamily:mono,marginLeft:"auto"}}>${Math.round(spot[f.coin]).toLocaleString()}</span></div>}<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Date Invested" value={f.dateInvested} onChange={v=>sF({...f,dateInvested:v})} type="date"/><FF label="Hold Period (Yrs)" value={f.holdPeriod} onChange={v=>sF({...f,holdPeriod:v})} type="number" isMono/></div><FS label="Risk" value={f.risk} onChange={v=>sF({...f,risk:v})} options={[...Array(10)].map((_,i)=>({value:String(i+1),label:`${i+1}`}))}/><FF label="Notes" value={f.notes} onChange={v=>sF({...f,notes:v})} placeholder="Optional"/><Btn full onClick={()=>{if(f.qty){onAdd({...f,qty:+f.qty,avgCost:+f.avgCost,risk:+f.risk,coin:f.coin,name:f.coin,price:spot[f.coin]||+f.avgCost,id:uid()});onClose()}}}>Add Coin</Btn></>}

function AddPropertyForm({onAdd,onClose}){const[f,sF]=useState({name:"",address:"",propType:"SFH",purchasePrice:"",currentValue:"",mortgageBalance:"",monthlyRent:"",monthlyExpenses:"",mortgagePayment:"",datePurchased:"",holdPeriod:"",risk:"5",notes:""});return<><FF label="Property Name" value={f.name} onChange={v=>sF({...f,name:v})} placeholder="e.g. 123 Main St"/><FF label="Address" value={f.address} onChange={v=>sF({...f,address:v})} placeholder="Full address"/><FS label="Property Type" value={f.propType} onChange={v=>sF({...f,propType:v})} options={PROP_TYPES}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Purchase Price" value={f.purchasePrice} onChange={v=>sF({...f,purchasePrice:v})} type="number" prefix="$" isMono/><FF label="Current Value" value={f.currentValue} onChange={v=>sF({...f,currentValue:v})} type="number" prefix="$" isMono/></div><FF label="Mortgage Balance" value={f.mortgageBalance} onChange={v=>sF({...f,mortgageBalance:v})} type="number" prefix="$" isMono/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}><FF label="Rent/mo" value={f.monthlyRent} onChange={v=>sF({...f,monthlyRent:v})} type="number" prefix="$" isMono/><FF label="Expenses/mo" value={f.monthlyExpenses} onChange={v=>sF({...f,monthlyExpenses:v})} type="number" prefix="$" isMono/><FF label="Mortgage/mo" value={f.mortgagePayment} onChange={v=>sF({...f,mortgagePayment:v})} type="number" prefix="$" isMono/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Date Purchased" value={f.datePurchased} onChange={v=>sF({...f,datePurchased:v})} type="date"/><FF label="Hold Period (Yrs)" value={f.holdPeriod} onChange={v=>sF({...f,holdPeriod:v})} type="number" isMono/></div><FS label="Risk" value={f.risk} onChange={v=>sF({...f,risk:v})} options={[...Array(10)].map((_,i)=>({value:String(i+1),label:`${i+1}`}))}/><FF label="Notes" value={f.notes} onChange={v=>sF({...f,notes:v})} placeholder="Optional"/><Btn full onClick={()=>{if(f.name&&f.purchasePrice){onAdd({...f,purchasePrice:+f.purchasePrice,currentValue:+f.currentValue||+f.purchasePrice,mortgageBalance:+(f.mortgageBalance||0),monthlyRent:+(f.monthlyRent||0),monthlyExpenses:+(f.monthlyExpenses||0),mortgagePayment:+(f.mortgagePayment||0),risk:+f.risk,dateInvested:f.datePurchased,id:uid()});onClose()}}}>Add Property</Btn></>}

function AddNoteForm({onAdd,onClose}){const[f,sF]=useState({name:"",noteType:"Hard Money",principal:"",outstandingBalance:"",interestRate:"",maturityDate:"",collateral:"",status:"Performing",ltv:"",dateInvested:"",holdPeriod:"",risk:"5",notes:""});return<><FF label="Note Name" value={f.name} onChange={v=>sF({...f,name:v})} placeholder="e.g. Smith Note"/><FS label="Note Type" value={f.noteType} onChange={v=>sF({...f,noteType:v})} options={NOTE_TYPES}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Principal" value={f.principal} onChange={v=>sF({...f,principal:v})} type="number" prefix="$" isMono/><FF label="Outstanding Balance" value={f.outstandingBalance} onChange={v=>sF({...f,outstandingBalance:v})} type="number" prefix="$" isMono/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Interest Rate %" value={f.interestRate} onChange={v=>sF({...f,interestRate:v})} type="number" prefix="%" isMono/><FF label="Maturity Date" value={f.maturityDate} onChange={v=>sF({...f,maturityDate:v})} type="date"/></div><FF label="Collateral" value={f.collateral} onChange={v=>sF({...f,collateral:v})} placeholder="e.g. 456 Oak Ave"/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FS label="Status" value={f.status} onChange={v=>sF({...f,status:v})} options={NOTE_STATUS}/><FF label="LTV %" value={f.ltv} onChange={v=>sF({...f,ltv:v})} type="number" prefix="%" isMono/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Date Invested" value={f.dateInvested} onChange={v=>sF({...f,dateInvested:v})} type="date"/><FF label="Hold Period (Yrs)" value={f.holdPeriod} onChange={v=>sF({...f,holdPeriod:v})} type="number" isMono/></div><FS label="Risk" value={f.risk} onChange={v=>sF({...f,risk:v})} options={[...Array(10)].map((_,i)=>({value:String(i+1),label:`${i+1}`}))}/><FF label="Notes" value={f.notes} onChange={v=>sF({...f,notes:v})} placeholder="Optional"/><Btn full onClick={()=>{if(f.name&&f.principal){onAdd({...f,principal:+f.principal,outstandingBalance:+(f.outstandingBalance||f.principal),interestRate:+(f.interestRate||0),ltv:+(f.ltv||0),risk:+f.risk,id:uid()});onClose()}}}>Add Note</Btn></>}

function AddCollectibleForm({onAdd,onClose}){const[f,sF]=useState({name:"",category:"Watch",brand:"",purchasePrice:"",currentValue:"",serialNumber:"",location:"",insuranceValue:"",insured:"No",dateAcquired:"",risk:"4",notes:""});return<><FF label="Item Name" value={f.name} onChange={v=>sF({...f,name:v})} placeholder="e.g. Rolex Submariner"/><FS label="Category" value={f.category} onChange={v=>sF({...f,category:v})} options={COLLECT_CATS}/><FF label="Brand" value={f.brand} onChange={v=>sF({...f,brand:v})} placeholder="e.g. Rolex"/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Purchase Price" value={f.purchasePrice} onChange={v=>sF({...f,purchasePrice:v})} type="number" prefix="$" isMono/><FF label="Current Value" value={f.currentValue} onChange={v=>sF({...f,currentValue:v})} type="number" prefix="$" isMono/></div><FF label="Serial Number" value={f.serialNumber} onChange={v=>sF({...f,serialNumber:v})} placeholder="Optional"/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Location" value={f.location} onChange={v=>sF({...f,location:v})} placeholder="e.g. Safe"/><FF label="Insurance Value" value={f.insuranceValue} onChange={v=>sF({...f,insuranceValue:v})} type="number" prefix="$" isMono/></div><FS label="Insured?" value={f.insured} onChange={v=>sF({...f,insured:v})} options={["Yes","No"]}/><FF label="Date Acquired" value={f.dateAcquired} onChange={v=>sF({...f,dateAcquired:v})} type="date"/><FS label="Risk" value={f.risk} onChange={v=>sF({...f,risk:v})} options={[...Array(10)].map((_,i)=>({value:String(i+1),label:`${i+1}`}))}/><FF label="Notes" value={f.notes} onChange={v=>sF({...f,notes:v})} placeholder="Optional"/><Btn full onClick={()=>{if(f.name&&f.purchasePrice){onAdd({...f,purchasePrice:+f.purchasePrice,currentValue:+(f.currentValue||f.purchasePrice),insuranceValue:+(f.insuranceValue||0),risk:+f.risk,dateInvested:f.dateAcquired,id:uid()});onClose()}}}>Add Collectible</Btn></>}

// ═══ DEAL ANALYZER ═══
function DealAnalyzer(){const[d,sD]=useState({price:"",rent:"",tax:"",insurance:"",maintenance:"",vacancy:"8",mgmt:"10",downPct:"25",rate:"7",term:"30"});const price=+d.price||0,rent=+d.rent||0,tax=+d.tax||0,ins=+d.insurance||0,maint=+d.maintenance||0;const down=price*(+d.downPct/100),loan=price-down;const mr=(+d.rate/100)/12,n=+d.term*12;const mortgage=mr>0?loan*(mr*Math.pow(1+mr,n))/(Math.pow(1+mr,n)-1):0;const gross=rent*12,vac=gross*(+d.vacancy/100),eff=gross-vac,mgmtC=eff*(+d.mgmt/100);const noi=eff-tax-ins-(maint*12)-mgmtC,cf=noi-(mortgage*12),mcf=cf/12;const cap=price>0?(noi/price)*100:0,coc=down>0?(cf/down)*100:0,dscr=mortgage>0?noi/(mortgage*12):0;const tests=[{name:"Cap Rate",val:cap.toFixed(1)+"%",pass:cap>=6,tgt:"≥ 6%"},{name:"CoC Return",val:coc.toFixed(1)+"%",pass:coc>=8,tgt:"≥ 8%"},{name:"DSCR",val:dscr.toFixed(2),pass:dscr>=1.25,tgt:"≥ 1.25"},{name:"Monthly CF",val:fmt(mcf),pass:mcf>0,tgt:"> $0"}];
  return<div style={{paddingBottom:120}}><div style={{fontSize:13,color:P.txS,marginBottom:16}}>Analyze rental deals with instant cash flow projections.</div><GC style={{padding:18,marginBottom:14}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><FF label="Price" value={d.price} onChange={v=>sD({...d,price:v})} prefix="$" isMono/><FF label="Rent/mo" value={d.rent} onChange={v=>sD({...d,rent:v})} prefix="$" isMono/><FF label="Tax/yr" value={d.tax} onChange={v=>sD({...d,tax:v})} prefix="$" isMono/><FF label="Ins/yr" value={d.insurance} onChange={v=>sD({...d,insurance:v})} prefix="$" isMono/><FF label="Maint/mo" value={d.maintenance} onChange={v=>sD({...d,maintenance:v})} prefix="$" isMono/><FF label="Vacancy%" value={d.vacancy} onChange={v=>sD({...d,vacancy:v})} prefix="%" isMono/><FF label="Down%" value={d.downPct} onChange={v=>sD({...d,downPct:v})} prefix="%" isMono/><FF label="Rate%" value={d.rate} onChange={v=>sD({...d,rate:v})} prefix="%" isMono/></div></GC>
    {price>0&&<><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>{tests.map((t,i)=><GC key={i} style={{padding:"14px 16px",borderColor:t.pass?"rgba(52,211,153,0.12)":"rgba(248,113,113,0.12)"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:11,color:P.txS}}>{t.name}</span><span style={{fontSize:10,color:P.txM}}>{t.tgt}</span></div><div style={{fontSize:20,fontWeight:800,color:t.pass?P.green:P.red,fontFamily:mono}}>{t.val}</div><div style={{fontSize:10,fontWeight:700,color:t.pass?P.green:P.red,marginTop:4}}>{t.pass?"✓ Pass":"✗ Fail"}</div></GC>)}</div><GC style={{padding:18}}><div style={{fontSize:13,fontWeight:700,color:P.text,marginBottom:12}}>Cash Flow</div>{[["Gross",gross],["Vacancy",-vac],["NOI",noi,1],["Mortgage/yr",-(mortgage*12)],["Annual CF",cf,1],["Monthly CF",mcf,1]].map(([l,v,b],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:b?`1px solid ${P.border}`:"none"}}><span style={{fontSize:12,color:b?P.text:P.txS,fontWeight:b?600:400}}>{l}</span><span style={{fontSize:13,fontWeight:b?700:500,color:v>=0?(b?P.green:P.text):P.red,fontFamily:mono}}>{fmt(v)}</span></div>)}</GC></>}
  </div>}

// ═══ PORTFOLIO VIEW ═══
function PortfolioView({metals,synds,crypto,properties=[],notesLending=[],collectibles=[],prices,targets,setTargets,allCrypto={}}){
  const spotMap={Gold:prices.gold,Silver:prices.silver,Platinum:prices.platinum,Palladium:prices.palladium};
  const cSpot={BTC:prices.btc,ETH:prices.eth,SOL:prices.sol,...allCrypto};
  const mT=metals.reduce((s,m)=>s+m.qty*(ozMap[m.unit]||1)*(spotMap[m.metal]||m.spot||0),0);
  const sT=synds.reduce((s,x)=>s+(x.invested||0),0);
  const cT=crypto.reduce((s,x)=>s+x.qty*(cSpot[x.coin]||x.price||0),0);
  const pT=properties.reduce((s,x)=>s+((+(x.currentValue||0))-(+(x.mortgageBalance||0))),0);
  const nT=notesLending.reduce((s,x)=>s+(+(x.outstandingBalance||0)),0);
  const colT=collectibles.reduce((s,x)=>s+(+(x.currentValue||0)),0);
  const total=mT+sT+cT+pT+nT+colT;
  const hardAssets=mT+sT+cT+pT+nT+colT;
  const hardPct=total>0?(hardAssets/total*100):0;
  const alloc=[{name:"Precious Metals",value:mT,color:P.gold},{name:"Syndications",value:sT,color:P.blue},{name:"Crypto",value:cT,color:P.purple},{name:"Real Estate",value:pT,color:P.green},{name:"Notes & Lending",value:nT,color:P.cyan},{name:"Collectibles",value:colT,color:P.orange}].filter(d=>d.value>0);
  const totalCost=metals.reduce((s,m)=>s+m.qty*(m.costPerUnit||0),0)+synds.reduce((s,x)=>s+(x.invested||0),0)+crypto.reduce((s,x)=>s+x.qty*(x.avgCost||0),0)+properties.reduce((s,x)=>s+(+(x.purchasePrice||0)),0)+notesLending.reduce((s,x)=>s+(+(x.principal||0)),0)+collectibles.reduce((s,x)=>s+(+(x.purchasePrice||0)),0);
  const totalGain=total-totalCost,totalPct=totalCost>0?(totalGain/totalCost*100):0;
  const propIncome=properties.reduce((s,x)=>s+((+(x.monthlyRent||0))-(+(x.monthlyExpenses||0))-(+(x.mortgagePayment||0)))*12,0);
  const noteIncome=notesLending.reduce((s,x)=>s+((+(x.outstandingBalance||0))*(+(x.interestRate||0))/100),0);
  const income=synds.reduce((s,x)=>s+(x.invested*(x.expectedRate||0)/100),0)+propIncome+noteIncome;
  const avgRisk=(()=>{const r=[...synds,...crypto,...metals,...properties,...notesLending,...collectibles].filter(x=>x.risk);return r.length?(r.reduce((s,x)=>s+ +x.risk,0)/r.length).toFixed(1):"—"})();
  const hist=useMemo(()=>spark(totalCost||total*0.85,60,0.008),[totalCost,total]);
  const[showTargets,setShowTargets]=useState(false);

  return<div style={{paddingBottom:120}}>
    {/* Hero */}
    <div style={{textAlign:"center",padding:"8px 0 20px"}}>
      <div style={{fontSize:13,color:P.txS,fontWeight:500,marginBottom:6}}>Total Portfolio</div>
      <div style={{fontSize:38,fontWeight:800,color:P.text,fontFamily:mono,letterSpacing:-2,lineHeight:1}}>{fmt(total)}</div>
      <div style={{display:"inline-flex",alignItems:"center",gap:6,marginTop:10,padding:"5px 14px",borderRadius:20,background:totalGain>=0?P.greenSoft:P.redSoft}}>
        <span style={{fontSize:13,fontWeight:700,color:totalGain>=0?P.green:P.red,fontFamily:mono}}>{totalGain>=0?"↑":"↓"} {fmt(Math.abs(totalGain))} ({fPct(totalPct)})</span>
      </div>
    </div>
    {/* Chart */}
    <GC style={{padding:"14px 8px 4px",marginBottom:14}}><ResponsiveContainer width="100%" height={120}><AreaChart data={hist} margin={{top:0,right:0,bottom:0,left:0}}><defs><linearGradient id="pG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.gold} stopOpacity={0.2}/><stop offset="100%" stopColor={P.gold} stopOpacity={0}/></linearGradient></defs><Area type="monotone" dataKey="v" stroke={P.gold} strokeWidth={2} fill="url(#pG)" dot={false}/></AreaChart></ResponsiveContainer></GC>
    {/* Metrics */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:14}}>
      {[{l:"Income/yr",v:fmt(income),c:P.green},{l:"Avg Risk",v:avgRisk+"/10",c:P.orange},{l:"Hard %",v:hardPct.toFixed(1)+"%",c:P.gold},{l:"Assets",v:String(metals.length+synds.length+crypto.length+properties.length+notesLending.length+collectibles.length),c:P.blue}].map((m,i)=>
        <GC key={i} style={{padding:"12px 10px",textAlign:"center"}}><div style={{fontSize:11,color:P.txM,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase",marginBottom:4}}>{m.l}</div><div style={{fontSize:22,fontWeight:800,color:m.c,fontFamily:mono}}>{m.v}</div></GC>)}
    </div>
    {/* Allocation bar */}
    {alloc.length>0&&<GC style={{padding:18,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><span style={{fontSize:13,fontWeight:700,color:P.text}}>Allocation</span><Btn variant="ghost" onClick={()=>setShowTargets(true)} style={{fontSize:11,padding:"6px 12px"}}>Set Targets</Btn></div>
      <div style={{display:"flex",height:8,borderRadius:4,overflow:"hidden",marginBottom:14}}>{alloc.map((d,i)=><div key={i} style={{flex:d.value,background:d.color}}/>)}</div>
      {alloc.map((d,i)=>{const actual=total>0?(d.value/total*100):0;const target=targets[d.name]||0;const delta=actual-target;return<div key={i} style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:10,height:10,borderRadius:3,background:d.color}}/><span style={{fontSize:13,color:P.text,fontWeight:500}}>{d.name}</span></div>
          <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:13,fontWeight:700,color:P.text,fontFamily:mono}}>{fmt(d.value)}</span><span style={{fontSize:11,color:P.txM,fontFamily:mono}}>{actual.toFixed(1)}%</span></div>
        </div>
        {target>0&&<div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{flex:1,height:4,borderRadius:2,background:P.border,overflow:"hidden",position:"relative"}}><div style={{height:"100%",width:`${Math.min(actual,100)}%`,background:d.color,borderRadius:2}}/><div style={{position:"absolute",left:`${Math.min(target,100)}%`,top:-2,width:2,height:8,background:P.text,borderRadius:1}}/></div>
          <span style={{fontSize:10,fontWeight:700,color:delta>=0?P.green:P.red,fontFamily:mono,minWidth:40}}>{delta>=0?"+":""}{delta.toFixed(1)}%</span>
          <span style={{fontSize:10,color:P.txM}}>tgt:{target}%</span>
        </div>}
      </div>})}
      {/* Donut */}
      <div style={{display:"flex",justifyContent:"center",marginTop:8}}>
        <div style={{width:140,height:140,position:"relative"}}><ResponsiveContainer><PieChart><Pie data={alloc} dataKey="value" cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={4} strokeWidth={0} cornerRadius={4}>{alloc.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie></PieChart></ResponsiveContainer><div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:10,color:P.txM,fontWeight:600,letterSpacing:0.5}}>TOTAL</div><div style={{fontSize:14,fontWeight:800,color:P.text,fontFamily:mono}}>{fmt(total)}</div></div></div>
      </div>
    </GC>}
    {/* Set Targets Sheet */}
    <Sheet open={showTargets} onClose={()=>setShowTargets(false)} title="Set Target Allocation">
      <div style={{fontSize:12,color:P.txS,marginBottom:16}}>Set your ideal % for each asset class. Total should equal 100%.</div>
      {ASSET_CLASSES.map(cls=><div key={cls} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${P.border}`}}>
        <span style={{fontSize:13,color:P.text}}>{cls}</span>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <input value={targets[cls]||0} onChange={e=>setTargets({...targets,[cls]:+e.target.value})} type="number" style={{width:60,background:P.bg,border:`1px solid ${P.border}`,borderRadius:8,color:P.text,fontSize:13,padding:"8px 10px",outline:"none",fontFamily:mono,textAlign:"right"}}/>
          <span style={{fontSize:12,color:P.txM}}>%</span>
        </div>
      </div>)}
      <div style={{display:"flex",justifyContent:"space-between",padding:"14px 0",borderTop:`1px solid ${P.border}`,marginTop:8}}>
        <span style={{fontSize:14,fontWeight:700,color:P.text}}>Total</span>
        <span style={{fontSize:14,fontWeight:700,fontFamily:mono,color:Object.values(targets).reduce((s,v)=>s+v,0)===100?P.green:P.red}}>{Object.values(targets).reduce((s,v)=>s+v,0)}%</span>
      </div>
      <Btn full onClick={()=>setShowTargets(false)} style={{marginTop:12}}>Save Targets</Btn>
    </Sheet>
  </div>
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
export default function HardAssets(){
  const[view,setView]=useState(()=>{try{return sessionStorage.getItem("ha_user")?"app":"home"}catch(e){return"home"}});
  const[tab,setTab]=useState("portfolio");
  const[sheet,setSheet]=useState(null);
  const[editItem,setEditItem]=useState(null);
  const editSaveRef=useRef(null);
  const[confirmDelete,setConfirmDelete]=useState(null);
  const[showFaq,setShowFaq]=useState(false);
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
  const[lastRefresh,setLastRefresh]=useState(null);
  const[refreshing,setRefreshing]=useState(false);
  const[targets,setTargets]=useState({"Precious Metals":30,"Real Estate":35,"Crypto":10,"Equities":10,"Cash":5,"Alternatives":10});
  const[editOriginal,setEditOriginal]=useState(null);
  const[showActivity,setShowActivity]=useState(false);
  const[activityLogs,setActivityLogs]=useState([]);
  const[activityFilter,setActivityFilter]=useState("all");
  const[forex,setForex]=useState(null);
  const[marketSearch,setMarketSearch]=useState("");

  // Persist session
  useEffect(()=>{try{if(user)sessionStorage.setItem("ha_user",JSON.stringify(user));else sessionStorage.removeItem("ha_user")}catch(e){}},[user]);
  useEffect(()=>{try{if(authToken)sessionStorage.setItem("ha_token",authToken);else sessionStorage.removeItem("ha_token")}catch(e){}},[authToken]);

  // Restore data on mount if session exists
  useEffect(()=>{if(authToken&&user&&user.email!=="guest"){setSyncing(true);cloudLoad(authToken).then(saved=>{if(saved){if(saved.metals?.length>0)setMetals(saved.metals);if(saved.syndications?.length>0)setSynds(saved.syndications);if(saved.crypto?.length>0)setCrypto(saved.crypto);if(saved.properties?.length>0)setProperties(saved.properties);if(saved.notesLending?.length>0)setNotesLending(saved.notesLending);if(saved.collectibles?.length>0)setCollectibles(saved.collectibles);if(saved.targets)setTargets(saved.targets)}setSyncing(false);refreshPrices()}).catch(()=>setSyncing(false))}},[]);

  // Auto-save to Supabase on any data change
  const saveTimer=useRef(null);
  useEffect(()=>{
    if(!authToken||!user)return;
    if(saveTimer.current)clearTimeout(saveTimer.current);
    saveTimer.current=setTimeout(()=>{
      cloudSave(authToken,{metals,syndications:synds,crypto,properties,notesLending,collectibles,targets});
    },800); // debounce 800ms
    return()=>{if(saveTimer.current)clearTimeout(saveTimer.current)};
  },[metals,synds,crypto,properties,notesLending,collectibles,targets,authToken,user]);

  // Google Sign-In handler
  const handleGoogleLogin=async(credentialResponse)=>{
    const token=credentialResponse.credential;
    setAuthToken(token);
    // Decode JWT to get user info
    try{
      const payload=JSON.parse(atob(token.split('.')[1]));
      setUser({name:payload.name||payload.email,email:payload.email,picture:payload.picture});
      if(window.posthog){window.posthog.identify(payload.email,{name:payload.name||payload.email,email:payload.email});window.posthog.capture('user_logged_in',{method:'google'})}
    }catch(e){setUser({name:"User",email:"user@hardassets.io"})}
    // Load saved data from Supabase
    setSyncing(true);
    const saved=await cloudLoad(token);
    if(saved){
      if(saved.metals&&saved.metals.length>0)setMetals(saved.metals);
      if(saved.syndications&&saved.syndications.length>0)setSynds(saved.syndications);
      if(saved.crypto&&saved.crypto.length>0)setCrypto(saved.crypto);
      if(saved.properties?.length>0)setProperties(saved.properties);
      if(saved.notesLending?.length>0)setNotesLending(saved.notesLending);
      if(saved.collectibles?.length>0)setCollectibles(saved.collectibles);
      if(saved.targets)setTargets(saved.targets);
    }
    setSyncing(false);
    setView("app");
    refreshPrices();
  };

  // Init Google Sign-In
  useEffect(()=>{
    if(view!=="login")return;
    const initGSI=()=>{
      if(!window.google?.accounts?.id)return;
      window.google.accounts.id.initialize({client_id:GOOGLE_CLIENT_ID,callback:handleGoogleLogin});
      const el=document.getElementById("gsi-btn");
      if(el)window.google.accounts.id.renderButton(el,{type:"standard",shape:"rectangular",theme:"filled_black",size:"large",text:"continue_with",width:300});
    };
    const t=setTimeout(()=>{
      if(window.google?.accounts?.id){initGSI()}
      else{const s=document.createElement("script");s.src="https://accounts.google.com/gsi/client";s.async=true;s.defer=true;s.onload=()=>setTimeout(initGSI,100);document.head.appendChild(s)}
    },100);
    return()=>clearTimeout(t);
  },[view]);

  const logout=()=>{if(window.posthog)window.posthog.reset();setUser(null);setAuthToken(null);setMetals([]);setSynds([]);setCrypto([]);setProperties([]);setNotesLending([]);setCollectibles([]);try{sessionStorage.removeItem("ha_user");sessionStorage.removeItem("ha_token")}catch(e){}setView("home")};
  const guestLogin=()=>{setUser({name:"Guest",email:"guest"});setMetals(DEMO_DATA.metals);setSynds(DEMO_DATA.syndications);setCrypto(DEMO_DATA.crypto);setProperties(DEMO_DATA.properties);setNotesLending(DEMO_DATA.notesLending);setCollectibles(DEMO_DATA.collectibles);setTargets(DEMO_DATA.targets);setView("app");refreshPrices();if(window.posthog)window.posthog.capture('user_logged_in',{method:'guest'})};

  // Live price refresh
  const refreshPrices=async()=>{
    setRefreshing(true);
    const[mp,cp,fx]=await Promise.all([fetchMetalPrices(),fetchCryptoPrices(),fetchForex()]);
    if(fx)setForex(fx);
    setPrices(prev=>{
      const next={...prev};
      if(mp){
        if(mp.gold){next.goldChg=prev.gold>0?((mp.gold-prev.gold)/prev.gold*100):0;next.gold=mp.gold}
        if(mp.silver){next.silverChg=prev.silver>0?((mp.silver-prev.silver)/prev.silver*100):0;next.silver=mp.silver}
        if(mp.platinum){next.platChg=prev.platinum>0?((mp.platinum-prev.platinum)/prev.platinum*100):0;next.platinum=mp.platinum}
        if(mp.palladium)next.palladium=mp.palladium;
      }
      if(cp){
        if(cp.BTC){next.btc=cp.BTC.price;next.btcChg=cp.BTC.change}
        if(cp.ETH){next.eth=cp.ETH.price;next.ethChg=cp.ETH.change}
        if(cp.SOL){next.sol=cp.SOL.price;next.solChg=cp.SOL.change}
      }
      return next;
    });
    // Store all crypto prices
    if(cp){const ac={};for(const[sym,data] of Object.entries(cp)){ac[sym]=data.price}setAllCrypto(ac)}
    // Update metal holdings with live spot
    if(mp){
      setMetals(prev=>prev.map(m=>{
        const liveSpot=({Gold:mp.gold,Silver:mp.silver,Platinum:mp.platinum,Palladium:mp.palladium})[m.metal];
        return liveSpot?{...m,spot:Math.round(liveSpot*100)/100}:m;
      }));
    }
    // Update crypto holdings with live prices
    if(cp){
      setCrypto(prev=>prev.map(c=>{
        const live=cp[c.coin];
        return live?{...c,price:live.price}:c;
      }));
    }
    setLastRefresh(new Date().toLocaleTimeString());
    if(window.posthog)window.posthog.capture('prices_refreshed');
    setRefreshing(false);
  };

  // Auto-trigger demo from ?demo=1 URL param
  useEffect(()=>{const p=new URLSearchParams(window.location.search);if(p.get("demo")&&!user){setUser({name:"Guest",email:"guest"});setMetals(DEMO_DATA.metals);setSynds(DEMO_DATA.syndications);setCrypto(DEMO_DATA.crypto);setProperties(DEMO_DATA.properties);setNotesLending(DEMO_DATA.notesLending);setCollectibles(DEMO_DATA.collectibles);setTargets(DEMO_DATA.targets);setView("app");window.history.replaceState({},"","/");setTimeout(()=>refreshPrices(),500)}},[]);

  // Fetch on mount
  useEffect(()=>{if(view==="app")refreshPrices()},[view]);
  const goldS=useMemo(()=>spark(2850,30,0.008),[]);const silverS=useMemo(()=>spark(30,30,0.012),[]);const btcS=useMemo(()=>spark(78000,30,0.02),[]);const ethS=useMemo(()=>spark(2400,30,0.018),[]);

  const spotMap={Gold:prices.gold,Silver:prices.silver,Platinum:prices.platinum,Palladium:prices.palladium};
  const cSpot={BTC:prices.btc,ETH:prices.eth,SOL:prices.sol,...allCrypto};

  const openEdit=(item,type)=>{setEditOriginal({...item});setEditItem({...item,_type:type})};

  // ═══ MOBILE HOMEPAGE + LOGIN MODAL ═══
  if(view==="home"||view==="login") return <div style={{fontFamily:ff,background:P.bg,color:P.text,minHeight:"100vh",overflowX:"hidden"}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.8}}@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}`}</style>

    {/* Nav */}
    <nav style={{position:"sticky",top:0,zIndex:100,padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",backdropFilter:"blur(20px)",background:"rgba(11,15,26,.9)",borderBottom:"1px solid "+P.border}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:28,height:28,borderRadius:8,background:`linear-gradient(145deg,${P.gold},#B8912E)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:P.bg}}>H</div><span style={{fontSize:15,fontWeight:800,color:P.text}}>Hard<span style={{color:P.gold}}>Assets</span></span></div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <a href="/blog" style={{color:P.txS,fontSize:11,textDecoration:"none"}}>Blog</a>
        <a href="/compare" style={{color:P.txS,fontSize:11,textDecoration:"none"}}>Compare</a>
        {user?<Btn onClick={()=>setView("app")} style={{padding:"8px 16px",fontSize:12}}>Dashboard →</Btn>:<Btn onClick={()=>setView("login")} style={{padding:"8px 16px",fontSize:12}}>Get Started</Btn>}
      </div>
    </nav>

    {/* Hero */}
    <div style={{textAlign:"center",padding:"48px 24px 40px",position:"relative"}}>
      <div style={{position:"absolute",top:-100,left:"50%",transform:"translateX(-50%)",width:400,height:400,background:"radial-gradient(ellipse,rgba(212,168,67,.06),transparent)",pointerEvents:"none"}}/>
      <div style={{position:"relative"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:16,border:"1px solid "+P.border,background:P.surface,fontSize:10,color:P.gold,letterSpacing:1,textTransform:"uppercase",fontWeight:600,marginBottom:20}}><div style={{width:5,height:5,borderRadius:"50%",background:P.green,animation:"pulse 2s infinite"}}/> Free — No credit card</div>
        <h1 style={{fontSize:32,fontWeight:800,lineHeight:1.1,letterSpacing:-1,margin:"0 auto 16px",maxWidth:340}}>HardAssets.io — Track Everything That <span style={{background:`linear-gradient(90deg,${P.gold},#F5D78E,${P.gold})`,backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"shimmer 3s linear infinite"}}>Holds Value</span></h1>
        <p style={{fontSize:15,color:P.txS,maxWidth:300,margin:"0 auto 28px",lineHeight:1.5}}>Gold. Silver. Real estate. Crypto. Live prices & portfolio tracking for hard asset investors.</p>
        <Btn onClick={()=>{guestLogin()}} style={{padding:"14px 28px",fontSize:14,width:"100%",maxWidth:280}}>Try Live Demo →</Btn>
        <Btn variant="ghost" onClick={()=>setView("login")} style={{padding:"12px 28px",fontSize:13,width:"100%",maxWidth:280,marginTop:8}}>Sign In for Cloud Sync</Btn>
        <div style={{fontSize:11,color:P.txM,marginTop:8}}>No sign-up required to try.</div>
      </div>
    </div>

    {/* Stats */}
    <div style={{padding:"48px 20px",borderTop:"1px solid "+P.border,borderBottom:"1px solid "+P.border,background:P.surface}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,textAlign:"center"}}>
        {[["Live","Spot Prices"],["13+","Crypto Coins"],["Free","Forever"]].map(([n,l],i)=>
          <div key={i}><div style={{fontSize:22,fontWeight:900,fontFamily:mono,color:P.gold}}>{n}</div><div style={{fontSize:10,color:P.txM,marginTop:2}}>{l}</div></div>
        )}
      </div>
    </div>

    {/* Features */}
    <div style={{padding:"48px 20px"}}>
      <div style={{fontSize:10,color:P.gold,textTransform:"uppercase",letterSpacing:3,fontWeight:700,marginBottom:8,textAlign:"center"}}>Features</div>
      <div style={{fontSize:22,fontWeight:800,textAlign:"center",marginBottom:24}}>One <span style={{color:P.gold}}>Dashboard</span></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[["◆","Precious Metals","Live spot prices, oz conversion, cost basis"],["◫","RE Syndications","LP positions, IRR, sponsor tracking"],["Ⓒ","Crypto Portfolio","13+ coins with live CoinGecko prices"],["◉","Master Portfolio","11 asset classes, targets, risk scores"]].map(([ic,t,d],i)=>
          <div key={i} style={{background:P.surface,border:"1px solid "+P.border,borderRadius:12,padding:16}}>
            <div style={{fontSize:16,marginBottom:8}}>{ic}</div>
            <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>{t}</div>
            <div style={{fontSize:13,color:P.txS,lineHeight:1.4}}>{d}</div>
          </div>
        )}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:10}}>
        {[["📡","Live Prices"],["📊","CSV Import"],["🎯","Risk Scores"],["☁️","Cloud Sync"]].map(([ic,lb],i)=>
          <div key={i} style={{background:P.surface,border:"1px solid "+P.border,borderRadius:10,padding:12,textAlign:"center"}}><div style={{fontSize:16,marginBottom:4}}>{ic}</div><div style={{fontSize:10,fontWeight:600}}>{lb}</div></div>
        )}
      </div>
    </div>

    {/* How it works */}
    <div style={{padding:"48px 20px",background:P.surface,borderTop:"1px solid "+P.border,borderBottom:"1px solid "+P.border}}>
      <div style={{fontSize:10,color:P.gold,textTransform:"uppercase",letterSpacing:3,fontWeight:700,marginBottom:8,textAlign:"center"}}>How It Works</div>
      <div style={{fontSize:22,fontWeight:800,textAlign:"center",marginBottom:24}}>Start in <span style={{color:P.gold}}>60 Seconds</span></div>
      {[["1","Sign Up Free","Google sign-in. Data syncs across devices."],["2","Add Assets","Manual entry or CSV import. Live prices auto-fill."],["3","Full Picture","Charts, risk scores, income projections."]].map(([n,t,d],i)=>
        <div key={i} style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:20}}>
          <div style={{width:36,height:36,borderRadius:"50%",border:"2px solid "+P.gold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:P.gold,fontFamily:mono,flexShrink:0}}>{n}</div>
          <div><div style={{fontSize:14,fontWeight:700,marginBottom:2}}>{t}</div><div style={{fontSize:12,color:P.txS,lineHeight:1.4}}>{d}</div></div>
        </div>
      )}
    </div>

    {/* Security */}
    <div style={{padding:"48px 20px"}}>
      <div style={{fontSize:10,color:P.gold,textTransform:"uppercase",letterSpacing:3,fontWeight:700,marginBottom:8,textAlign:"center"}}>Security</div>
      <div style={{fontSize:22,fontWeight:800,textAlign:"center",marginBottom:20}}>Your Data, <span style={{color:P.gold}}>Protected</span></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[["🔒","Encrypted DB"],["🔑","Google Auth"],["👁️","Read-Only"],["🚫","No Data Sales"]].map(([ic,t],i)=>
          <div key={i} style={{background:P.surface,border:"1px solid "+P.border,borderRadius:10,padding:14,textAlign:"center"}}><div style={{fontSize:18,marginBottom:4}}>{ic}</div><div style={{fontSize:12,fontWeight:700}}>{t}</div></div>
        )}
      </div>
    </div>

    {/* CTA */}
    <div style={{padding:"40px 24px",textAlign:"center"}}>
      <div style={{fontSize:24,fontWeight:800,lineHeight:1.15,marginBottom:12}}>Ready to See Your<br/><span style={{color:P.gold}}>Complete Picture?</span></div>
      <p style={{fontSize:13,color:P.txS,marginBottom:24,lineHeight:1.5}}>Free forever. No credit card required.</p>
      <Btn onClick={()=>{guestLogin()}} style={{padding:"14px 28px",fontSize:14,width:"100%",maxWidth:280}}>Try Live Demo →</Btn>
      <Btn variant="ghost" onClick={()=>setView("login")} style={{padding:"12px 28px",fontSize:13,width:"100%",maxWidth:280,marginTop:8}}>Sign In for Cloud Sync</Btn>
      <div style={{fontSize:11,color:P.txM,marginTop:8}}>No sign-up required to try.</div>
    </div>

    {/* Footer */}
    <div style={{borderTop:"1px solid "+P.border,padding:"24px 20px",textAlign:"center"}}>
      <div style={{fontSize:11,color:P.txM}}>© 2026 HardAssets.io</div>
      <div style={{fontSize:11,color:P.txM,marginTop:4}}>support@hardassets.io</div>
    </div>

    {/* LOGIN MODAL */}
    {view==="login"&&!user&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)",zIndex:2000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setView("home")}>
      <div onClick={e=>e.stopPropagation()} style={{background:P.surface,borderRadius:"24px 24px 0 0",padding:"32px 24px 40px",width:"100%",maxWidth:430,position:"relative"}}>
        <button onClick={()=>setView("home")} style={{position:"absolute",top:12,right:16,background:P.elevated,border:"none",color:P.txS,width:32,height:32,borderRadius:16,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        <div style={{textAlign:"center"}}>
          <div style={{width:56,height:56,borderRadius:16,background:`linear-gradient(135deg,${P.gold},#B8912E)`,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:900,color:P.bg,marginBottom:20,boxShadow:`0 8px 32px rgba(212,168,67,0.3)`}}>H</div>
          <div style={{fontSize:22,fontWeight:800,marginBottom:6}}>Sign In</div>
          <div style={{fontSize:13,color:P.txS,marginBottom:28}}>Track your investments in one dashboard</div>
          <div id="gsi-btn" style={{display:"flex",justifyContent:"center",marginBottom:14}}/>
          <button onClick={guestLogin} style={{width:"100%",padding:"14px 20px",borderRadius:14,border:`1px solid ${P.border}`,background:"transparent",color:P.txS,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:ff}}>Continue as Guest</button>
          {syncing&&<div style={{marginTop:16,fontSize:13,color:P.gold}}>Loading your portfolio...</div>}
          <div style={{marginTop:24,fontSize:10,color:P.txM}}>Data saved securely. Free forever.</div>
        </div>
      </div>
    </div>}
  </div>;

  const NAV=[{key:"portfolio",label:"Portfolio",d:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"},{key:"markets",label:"Markets",d:"M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"},{key:"metals",label:"Metals",d:"M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"},{key:"realestate",label:"Synds",d:"M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"},{key:"properties",label:"RE",d:"M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4z"},{key:"notes",label:"Notes",d:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"},{key:"collectibles",label:"Collect",d:"M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"},{key:"crypto",label:"Crypto",d:"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"},{key:"analyzer",label:"Analyze",d:"M9 7h6m0 10v-3m-3 3v-6m-3 6v-1m6-9a2 2 0 012 2v8a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2"}];

  // Save/delete helpers
  const saveItem=(updated,type)=>{if(type==="metal")setMetals(p=>p.map(x=>x.id===updated.id?updated:x));if(type==="synd")setSynds(p=>p.map(x=>x.id===updated.id?updated:x));if(type==="crypto")setCrypto(p=>p.map(x=>x.id===updated.id?updated:x));if(type==="property")setProperties(p=>p.map(x=>x.id===updated.id?updated:x));if(type==="note")setNotesLending(p=>p.map(x=>x.id===updated.id?updated:x));if(type==="collectible")setCollectibles(p=>p.map(x=>x.id===updated.id?updated:x));logActivity(authToken,"edit",type,updated.id,updated.name||updated.metal||updated.coin||"Item",editOriginal,updated);if(window.posthog)window.posthog.capture('holding_edited',{type});setEditItem(null)};
  const deleteItem=(id,type)=>{if(type==="metal")setMetals(p=>p.filter(x=>x.id!==id));if(type==="synd")setSynds(p=>p.filter(x=>x.id!==id));if(type==="crypto")setCrypto(p=>p.filter(x=>x.id!==id));if(type==="property")setProperties(p=>p.filter(x=>x.id!==id));if(type==="note")setNotesLending(p=>p.filter(x=>x.id!==id));if(type==="collectible")setCollectibles(p=>p.filter(x=>x.id!==id))};

  const TabHeader=({title,count,onAdd,addLabel,onExport,onImport})=><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}><span style={{fontSize:17,fontWeight:700,color:P.text}}>{title} <span style={{fontSize:12,fontWeight:600,color:P.txM,background:P.goldSoft,padding:"2px 8px",borderRadius:6}}>{count}</span></span><div style={{display:"flex",gap:6}}>{onImport&&<CsvImport onImport={onImport} label="Import"/>}{onExport&&<Btn variant="ghost" onClick={onExport} style={{fontSize:11,padding:"7px 12px"}}>Export</Btn>}<Btn variant="soft" onClick={onAdd} style={{fontSize:12}}>{addLabel||"+ Add"}</Btn></div></div>;

  const PriceTag=({label,value,change,color,sp})=>{const up=change>=0;return<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${P.border}`}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:34,height:34,borderRadius:10,background:`${color}12`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:13,fontWeight:700,color}}>{label.slice(0,2)}</span></div><div><div style={{fontSize:13,fontWeight:600,color:P.text}}>{label}</div><div style={{fontSize:11,color:up?P.green:P.red,fontWeight:600,fontFamily:mono}}>{fPct(change)}</div></div></div><div style={{display:"flex",alignItems:"center",gap:10}}>{sp&&<MiniChart data={sp} color={up?P.green:P.red}/>}<div style={{fontSize:15,fontWeight:700,color:P.text,fontFamily:mono,minWidth:70,textAlign:"right"}}>{value>999?"$"+Math.round(value).toLocaleString():"$"+value.toFixed(2)}</div></div></div>};

  const renderTab=()=>{switch(tab){
    case "portfolio": return <PortfolioView metals={metals} synds={synds} crypto={crypto} properties={properties} notesLending={notesLending} collectibles={collectibles} prices={prices} targets={targets} setTargets={setTargets} allCrypto={allCrypto}/>;
    case "markets": {
      const fxPairs=[{code:"EUR",flag:"🇪🇺",name:"Euro"},{code:"GBP",flag:"🇬🇧",name:"British Pound"},{code:"CHF",flag:"🇨🇭",name:"Swiss Franc"},{code:"JPY",flag:"🇯🇵",name:"Japanese Yen"},{code:"CAD",flag:"🇨🇦",name:"Canadian Dollar"},{code:"AUD",flag:"🇦🇺",name:"Australian Dollar"},{code:"ILS",flag:"🇮🇱",name:"Israeli Shekel"},{code:"CNY",flag:"🇨🇳",name:"Chinese Yuan"},{code:"INR",flag:"🇮🇳",name:"Indian Rupee"},{code:"MXN",flag:"🇲🇽",name:"Mexican Peso"},{code:"BRL",flag:"🇧🇷",name:"Brazilian Real"},{code:"SGD",flag:"🇸🇬",name:"Singapore Dollar"},{code:"HKD",flag:"🇭🇰",name:"Hong Kong Dollar"},{code:"NZD",flag:"🇳🇿",name:"New Zealand Dollar"},{code:"SEK",flag:"🇸🇪",name:"Swedish Krona"},{code:"NOK",flag:"🇳🇴",name:"Norwegian Krone"}];
      const auAgRatio=prices.silver>0?(prices.gold/prices.silver):0;
      const filteredCoins=COINS.filter(c=>c.toLowerCase().includes(marketSearch.toLowerCase()));
      return <div style={{paddingBottom:120}}>
        {/* Metals Section */}
        <div style={{fontSize:10,color:P.gold,textTransform:"uppercase",letterSpacing:2,fontWeight:700,marginBottom:10}}>Precious Metals</div>
        <GC style={{padding:18,marginBottom:10,background:`linear-gradient(135deg,${P.goldSoft},transparent)`,borderColor:P.goldMed}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:10,color:P.txS,fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>Gold</div><div style={{fontSize:28,fontWeight:800,color:P.gold,fontFamily:mono,letterSpacing:-1}}>${prices.gold.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</div><div style={{fontSize:11,fontWeight:600,color:prices.goldChg>=0?P.green:P.red,fontFamily:mono}}>{fPct(prices.goldChg)}</div></div>
            <MiniChart data={goldS} color={P.gold} height={48} width={90}/>
          </div>
        </GC>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
          <GC style={{padding:"12px 10px",textAlign:"center"}}><div style={{fontSize:11,color:P.txM,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase",marginBottom:4}}>Silver</div><div style={{fontSize:15,fontWeight:800,color:P.text,fontFamily:mono}}>${prices.silver.toFixed(2)}</div><div style={{fontSize:10,fontWeight:600,color:prices.silverChg>=0?P.green:P.red,fontFamily:mono}}>{fPct(prices.silverChg)}</div></GC>
          <GC style={{padding:"12px 10px",textAlign:"center"}}><div style={{fontSize:11,color:P.txM,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase",marginBottom:4}}>Platinum</div><div style={{fontSize:15,fontWeight:800,color:P.text,fontFamily:mono}}>${prices.platinum.toFixed(2)}</div><div style={{fontSize:10,fontWeight:600,color:prices.platChg>=0?P.green:P.red,fontFamily:mono}}>{fPct(prices.platChg)}</div></GC>
          <GC style={{padding:"12px 10px",textAlign:"center"}}><div style={{fontSize:11,color:P.txM,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase",marginBottom:4}}>Palladium</div><div style={{fontSize:15,fontWeight:800,color:P.text,fontFamily:mono}}>${prices.palladium.toFixed(2)}</div></GC>
        </div>
        {auAgRatio>0&&<GC style={{padding:"10px 14px",marginBottom:18,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:11,color:P.txS,fontWeight:600}}>Au/Ag Ratio</span><span style={{fontSize:14,fontWeight:800,color:P.gold,fontFamily:mono}}>{auAgRatio.toFixed(1)}</span></GC>}
        {/* Crypto Section */}
        <div style={{fontSize:10,color:P.purple,textTransform:"uppercase",letterSpacing:2,fontWeight:700,marginBottom:10,marginTop:8}}>Crypto</div>
        <div style={{marginBottom:10}}><input value={marketSearch} onChange={e=>setMarketSearch(e.target.value)} placeholder="Search coins..." style={{width:"100%",background:P.bg,border:`1px solid ${P.border}`,borderRadius:12,color:P.text,fontSize:13,padding:"10px 14px",outline:"none",fontFamily:ff,boxSizing:"border-box"}}/></div>
        <GC style={{padding:"10px 14px",marginBottom:18}}>
          {filteredCoins.map(coin=>{const cp=allCrypto[coin];const chg=(cp&&allCrypto[coin+"_chg"])||0;return<div key={coin} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${P.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:30,height:30,borderRadius:8,background:P.purpleSoft,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:11,fontWeight:700,color:P.purple}}>{coin.slice(0,3)}</span></div><span style={{fontSize:13,fontWeight:600,color:P.text}}>{coin}</span></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:700,color:P.text,fontFamily:mono}}>{cp?"$"+cp.toLocaleString(undefined,{maximumFractionDigits:2}):"--"}</div></div>
          </div>})}
          {filteredCoins.length===0&&<div style={{padding:20,textAlign:"center",color:P.txM,fontSize:12}}>No coins match</div>}
        </GC>
        {/* Forex Section */}
        <div style={{fontSize:10,color:P.blue,textTransform:"uppercase",letterSpacing:2,fontWeight:700,marginBottom:10,marginTop:8}}>Currencies (USD Base)</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
          {fxPairs.map(fx=>{const rate=forex?forex[fx.code]:null;return<GC key={fx.code} style={{padding:"12px 14px"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><span style={{fontSize:16}}>{fx.flag}</span><span style={{fontSize:12,fontWeight:700,color:P.text}}>{fx.code}</span></div>
            <div style={{fontSize:10,color:P.txS,marginBottom:4}}>{fx.name}</div>
            <div style={{fontSize:15,fontWeight:800,color:P.text,fontFamily:mono}}>{rate!=null?rate.toFixed(rate>=100?2:4):"--"}</div>
          </GC>})}
        </div>
      </div>}
    case "metals": return <div style={{paddingBottom:120}}>
      <GC style={{padding:"14px 18px",marginBottom:14}}><PriceTag label="Gold" value={prices.gold} change={prices.goldChg} color={P.gold} sp={goldS}/><PriceTag label="Silver" value={prices.silver} change={prices.silverChg} color={P.txS} sp={silverS}/><PriceTag label="Platinum" value={prices.platinum} change={prices.platChg} color={P.cyan}/></GC>
      <TabHeader title="Holdings" count={metals.length} onAdd={()=>setSheet("addMetal")} onExport={()=>{if(window.posthog)window.posthog.capture('csv_exported',{type:'metal'});csvExport(["Metal","Unit","Qty","Cost/Unit","Spot","Value","Gain","Risk","Date Invested","Hold Period","Yrs Held","Notes"],metals.map(m=>[m.metal,m.unit,m.qty,m.costPerUnit,spotMap[m.metal]||m.spot,m.qty*(ozMap[m.unit]||1)*(spotMap[m.metal]||m.spot||0),(m.qty*(ozMap[m.unit]||1)*(spotMap[m.metal]||m.spot||0))-(m.qty*m.costPerUnit),m.risk||"",m.dateInvested||"",m.holdPeriod||"",yrsHeld(m.dateInvested),m.notes||""]),"metals.csv")}} onImport={rows=>{const ni=rows.map(r=>({id:uid(),metal:r.Metal||"Gold",unit:r.Unit||"1 oz",qty:+(r.Qty||r.Quantity||0),costPerUnit:+(r["Cost/Unit"]||r.Cost||0),spot:+(r.Spot||0),name:(r.Metal||"Gold")+" "+(r.Unit||"1 oz"),risk:+(r.Risk||0)||null,dateInvested:r["Date Invested"]||"",holdPeriod:r["Hold Period"]||"",notes:r.Notes||""})).filter(i=>i.qty>0);setMetals(p=>[...p,...ni]);logActivity(authToken,"import","metal",null,"CSV Import",null,{count:ni.length});if(window.posthog)window.posthog.capture('csv_imported',{type:'metal',count:ni.length})}}/>
      {metals.map(m=><HoldingCard key={m.id} item={m} type="metal" spotPrice={spotMap[m.metal]} onTap={()=>openEdit(m,"metal")}/>)}
      {metals.length===0&&<div style={{padding:"40px 20px",textAlign:"center",color:P.txM}}><div style={{fontSize:28,marginBottom:12}}>◆</div><div style={{fontSize:14,fontWeight:600,marginBottom:4}}>No metals yet</div><div style={{fontSize:12}}>Tap <span style={{color:P.gold,fontWeight:700}}>+ Add</span> to start tracking.</div></div>}
    </div>;
    case "realestate": return <div style={{paddingBottom:120}}>
      {synds.length>0&&(()=>{const by={};synds.forEach(s=>{by[(s.strategy||s.type||"Other")]=(by[(s.strategy||s.type||"Other")]||0)+s.invested});const data=Object.entries(by).map(([name,value],i)=>({name:name.slice(0,8),value,fill:PIE_C[i%PIE_C.length]}));return<GC style={{padding:"14px 10px",marginBottom:14}}><ResponsiveContainer width="100%" height={90}><BarChart data={data} margin={{top:0,right:0,bottom:0,left:0}}><XAxis dataKey="name" tick={{fontSize:10,fill:P.txM}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:P.elevated,border:`1px solid ${P.border}`,borderRadius:10,fontSize:11,fontFamily:mono}} formatter={v=>fmt(v)}/><Bar dataKey="value" radius={[5,5,0,0]}>{data.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Bar></BarChart></ResponsiveContainer></GC>})()}
      <TabHeader title="Syndications" count={synds.length} onAdd={()=>setSheet("addSynd")} addLabel="+ Add Deal" onExport={()=>{if(window.posthog)window.posthog.capture('csv_exported',{type:'synd'});csvExport(["Deal","Sponsor","Strategy","Invested","Rate%","Ann Income","Proj IRR","Risk","Status","Date Invested","Hold Period","Yrs Held","Notes"],synds.map(s=>[s.name,s.sponsor,(s.strategy||s.type||"Other"),s.invested,s.expectedRate,Math.round(s.invested*(s.expectedRate||0)/100),s.projIRR||"",s.risk,s.status,s.dateInvested||"",s.holdPeriod||"",yrsHeld(s.dateInvested),s.notes||""]),"syndications.csv")}} onImport={rows=>{const ni=rows.map(r=>({id:uid(),name:r.Deal||r.Name||"",sponsor:r.Sponsor||"",invested:+(r.Invested||r.Amount||0),expectedRate:+(r["Rate%"]||r.Rate||0),projIRR:+(r["Proj IRR"]||r.IRR||0)||null,strategy:r.Strategy||r.Type||"Multifamily",risk:+(r.Risk||5),status:r.Status||"Active",dateInvested:r["Date Invested"]||"",holdPeriod:r["Hold Period"]||"",notes:r.Notes||""})).filter(i=>i.name&&i.invested>0);setSynds(p=>[...p,...ni]);logActivity(authToken,"import","synd",null,"CSV Import",null,{count:ni.length});if(window.posthog)window.posthog.capture('csv_imported',{type:'synd',count:ni.length})}}/>
      {synds.map(s=><HoldingCard key={s.id} item={s} type="synd" onTap={()=>openEdit(s,"synd")}/>)}
      {synds.length===0&&<div style={{padding:"40px 20px",textAlign:"center",color:P.txM}}><div style={{fontSize:28,marginBottom:12}}>◫</div><div style={{fontSize:14,fontWeight:600,marginBottom:4}}>No syndications yet</div><div style={{fontSize:12}}>Tap <span style={{color:P.gold,fontWeight:700}}>+ Add Deal</span> to start tracking.</div></div>}
    </div>;
    case "crypto": return <div style={{paddingBottom:120}}>
      <GC style={{padding:"14px 18px",marginBottom:14}}><PriceTag label="Bitcoin" value={prices.btc} change={prices.btcChg} color={P.orange} sp={btcS}/><PriceTag label="Ethereum" value={prices.eth} change={prices.ethChg} color={P.blue} sp={ethS}/><PriceTag label="Solana" value={prices.sol} change={prices.solChg} color={P.purple}/></GC>
      <TabHeader title="Holdings" count={crypto.length} onAdd={()=>setSheet("addCrypto")} addLabel="+ Add Coin" onExport={()=>{if(window.posthog)window.posthog.capture('csv_exported',{type:'crypto'});csvExport(["Coin","Qty","Avg Cost","Current","Value","Gain","Risk","Date Invested","Hold Period","Yrs Held","Notes"],crypto.map(c=>{const sp=cSpot[c.coin]||c.price||0;return[c.coin,c.qty,c.avgCost,sp,c.qty*sp,(c.qty*sp)-(c.qty*c.avgCost),c.risk||"",c.dateInvested||"",c.holdPeriod||"",yrsHeld(c.dateInvested),c.notes||""]}),"crypto.csv")}} onImport={rows=>{const ni=rows.map(r=>({id:uid(),coin:r.Coin||"BTC",name:r.Coin||"BTC",qty:+(r.Qty||r.Quantity||0),avgCost:+(r["Avg Cost"]||r.Cost||0),price:cSpot[r.Coin]||+(r.Current||r.Price||0),risk:+(r.Risk||7),dateInvested:r["Date Invested"]||"",holdPeriod:r["Hold Period"]||"",notes:r.Notes||""})).filter(i=>i.qty>0);setCrypto(p=>[...p,...ni]);logActivity(authToken,"import","crypto",null,"CSV Import",null,{count:ni.length});if(window.posthog)window.posthog.capture('csv_imported',{type:'crypto',count:ni.length})}}/>
      {crypto.map(c=><HoldingCard key={c.id} item={c} type="crypto" spotPrice={cSpot[c.coin]} onTap={()=>openEdit(c,"crypto")}/>)}
      {crypto.length===0&&<div style={{padding:"40px 20px",textAlign:"center",color:P.txM}}><div style={{fontSize:28,marginBottom:12}}>Ⓒ</div><div style={{fontSize:14,fontWeight:600,marginBottom:4}}>No crypto yet</div><div style={{fontSize:12}}>Tap <span style={{color:P.gold,fontWeight:700}}>+ Add Coin</span> to start tracking.</div></div>}
    </div>;
    case "properties": return <div style={{paddingBottom:120}}>
      {(()=>{const totalEquity=properties.reduce((s,x)=>s+((+(x.currentValue||0))-(+(x.mortgageBalance||0))),0);const totalVal=properties.reduce((s,x)=>s+(+(x.currentValue||0)),0);const totalCF=properties.reduce((s,x)=>s+((+(x.monthlyRent||0))-(+(x.monthlyExpenses||0))-(+(x.mortgagePayment||0))),0);return<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}><GC style={{padding:"16px 18px",textAlign:"center",borderColor:"rgba(52,211,153,0.12)"}}><div style={{fontSize:11,color:P.txM,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase",marginBottom:4}}>Total Equity</div><div style={{fontSize:22,fontWeight:800,color:P.green,fontFamily:mono}}>{fmt(totalEquity)}</div></GC><GC style={{padding:"16px 18px",textAlign:"center",borderColor:"rgba(52,211,153,0.12)"}}><div style={{fontSize:11,color:P.txM,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase",marginBottom:4}}>Total Value</div><div style={{fontSize:22,fontWeight:800,color:P.text,fontFamily:mono}}>{fmt(totalVal)}</div></GC><GC style={{padding:"16px 18px",textAlign:"center",borderColor:"rgba(52,211,153,0.12)"}}><div style={{fontSize:11,color:P.txM,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase",marginBottom:4}}>Monthly CF</div><div style={{fontSize:22,fontWeight:800,color:totalCF>=0?P.green:P.red,fontFamily:mono}}>{fmt(totalCF)}</div></GC></div>})()}
      <TabHeader title="Properties" count={properties.length} onAdd={()=>setSheet("addProperty")} addLabel="+ Add" onExport={()=>{if(window.posthog)window.posthog.capture('csv_exported',{type:'property'});csvExport(["Name","Address","Type","Purchase Price","Current Value","Mortgage","Equity","Rent/mo","Expenses/mo","Mortgage/mo","CF/mo","Risk","Date Purchased","Hold Period","Yrs Held","Notes"],properties.map(p=>{const eq=(+(p.currentValue||0))-(+(p.mortgageBalance||0));const cf=(+(p.monthlyRent||0))-(+(p.monthlyExpenses||0))-(+(p.mortgagePayment||0));return[p.name,p.address||"",p.propType,p.purchasePrice,p.currentValue,p.mortgageBalance||0,eq,p.monthlyRent||0,p.monthlyExpenses||0,p.mortgagePayment||0,cf,p.risk||"",p.dateInvested||p.datePurchased||"",p.holdPeriod||"",yrsHeld(p.dateInvested||p.datePurchased),p.notes||""]}),"properties.csv")}} onImport={rows=>{const ni=rows.map(r=>({id:uid(),name:r.Name||"",address:r.Address||"",propType:r.Type||"SFH",purchasePrice:+(r["Purchase Price"]||0),currentValue:+(r["Current Value"]||0),mortgageBalance:+(r.Mortgage||0),monthlyRent:+(r["Rent/mo"]||0),monthlyExpenses:+(r["Expenses/mo"]||0),mortgagePayment:+(r["Mortgage/mo"]||0),risk:+(r.Risk||5),dateInvested:r["Date Purchased"]||"",holdPeriod:r["Hold Period"]||"",notes:r.Notes||""})).filter(i=>i.name);setProperties(p=>[...p,...ni]);logActivity(authToken,"import","property",null,"CSV Import",null,{count:ni.length});if(window.posthog)window.posthog.capture('csv_imported',{type:'property',count:ni.length})}}/>
      {properties.map(p=><HoldingCard key={p.id} item={p} type="property" onTap={()=>openEdit(p,"property")}/>)}
      {properties.length===0&&<div style={{padding:"40px 20px",textAlign:"center",color:P.txM}}><div style={{fontSize:28,marginBottom:12}}>◉</div><div style={{fontSize:14,fontWeight:600,marginBottom:4}}>No properties yet</div><div style={{fontSize:12}}>Tap <span style={{color:P.gold,fontWeight:700}}>+ Add</span> to start tracking.</div></div>}
    </div>;
    case "notes": return <div style={{paddingBottom:120}}>
      {(()=>{const totalDeployed=notesLending.reduce((s,x)=>s+(+(x.principal||0)),0);const monthlyInc=notesLending.reduce((s,x)=>s+((+(x.outstandingBalance||0))*(+(x.interestRate||0))/100/12),0);const avgRate=notesLending.length>0?notesLending.reduce((s,x)=>s+(+(x.interestRate||0)),0)/notesLending.length:0;return<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}><GC style={{padding:"16px 18px",textAlign:"center",borderColor:"rgba(34,211,238,0.12)"}}><div style={{fontSize:11,color:P.txM,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase",marginBottom:4}}>Deployed</div><div style={{fontSize:22,fontWeight:800,color:P.cyan,fontFamily:mono}}>{fmt(totalDeployed)}</div></GC><GC style={{padding:"16px 18px",textAlign:"center",borderColor:"rgba(34,211,238,0.12)"}}><div style={{fontSize:11,color:P.txM,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase",marginBottom:4}}>Monthly Inc</div><div style={{fontSize:22,fontWeight:800,color:P.green,fontFamily:mono}}>{fmt(monthlyInc)}</div></GC><GC style={{padding:"16px 18px",textAlign:"center",borderColor:"rgba(34,211,238,0.12)"}}><div style={{fontSize:11,color:P.txM,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase",marginBottom:4}}>Avg Rate</div><div style={{fontSize:22,fontWeight:800,color:P.cyan,fontFamily:mono}}>{avgRate.toFixed(1)}%</div></GC></div>})()}
      <TabHeader title="Notes & Lending" count={notesLending.length} onAdd={()=>setSheet("addNote")} addLabel="+ Add" onExport={()=>{if(window.posthog)window.posthog.capture('csv_exported',{type:'note'});csvExport(["Name","Type","Principal","Outstanding","Rate%","Maturity","Collateral","Status","LTV","Risk","Date Invested","Hold Period","Yrs Held","Notes"],notesLending.map(n=>[n.name,n.noteType,n.principal,n.outstandingBalance,n.interestRate||"",n.maturityDate||"",n.collateral||"",n.status,n.ltv||"",n.risk||"",n.dateInvested||"",n.holdPeriod||"",yrsHeld(n.dateInvested),n.notes||""]),"notes.csv")}} onImport={rows=>{const ni=rows.map(r=>({id:uid(),name:r.Name||"",noteType:r.Type||"Hard Money",principal:+(r.Principal||0),outstandingBalance:+(r.Outstanding||0),interestRate:+(r["Rate%"]||0),maturityDate:r.Maturity||"",collateral:r.Collateral||"",status:r.Status||"Performing",ltv:+(r.LTV||0),risk:+(r.Risk||5),dateInvested:r["Date Invested"]||"",holdPeriod:r["Hold Period"]||"",notes:r.Notes||""})).filter(i=>i.name&&i.principal>0);setNotesLending(p=>[...p,...ni]);logActivity(authToken,"import","note",null,"CSV Import",null,{count:ni.length});if(window.posthog)window.posthog.capture('csv_imported',{type:'note',count:ni.length})}}/>
      {notesLending.map(n=><HoldingCard key={n.id} item={n} type="note" onTap={()=>openEdit(n,"note")}/>)}
      {notesLending.length===0&&<div style={{padding:"40px 20px",textAlign:"center",color:P.txM}}><div style={{fontSize:28,marginBottom:12}}>📄</div><div style={{fontSize:14,fontWeight:600,marginBottom:4}}>No notes yet</div><div style={{fontSize:12}}>Tap <span style={{color:P.gold,fontWeight:700}}>+ Add</span> to start tracking.</div></div>}
    </div>;
    case "collectibles": return <div style={{paddingBottom:120}}>
      {(()=>{const totalVal=collectibles.reduce((s,x)=>s+(+(x.currentValue||0)),0);const totalCost=collectibles.reduce((s,x)=>s+(+(x.purchasePrice||0)),0);const gain=totalVal-totalCost;const byCat={};collectibles.forEach(c=>{byCat[c.category||"Other"]=(byCat[c.category||"Other"]||0)+(+(c.currentValue||0))});const catData=Object.entries(byCat).map(([name,value],i)=>({name,value,fill:PIE_C[i%PIE_C.length]}));return<><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}><GC style={{padding:"16px 18px",textAlign:"center",borderColor:"rgba(251,146,60,0.12)"}}><div style={{fontSize:11,color:P.txM,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase",marginBottom:4}}>Total Value</div><div style={{fontSize:22,fontWeight:800,color:P.orange,fontFamily:mono}}>{fmt(totalVal)}</div></GC><GC style={{padding:"16px 18px",textAlign:"center",borderColor:"rgba(251,146,60,0.12)"}}><div style={{fontSize:11,color:P.txM,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase",marginBottom:4}}>Unrealized</div><div style={{fontSize:22,fontWeight:800,color:gain>=0?P.green:P.red,fontFamily:mono}}>{gain>=0?"+":""}{fmt(gain)}</div></GC></div>{catData.length>0&&<GC style={{padding:"14px 10px",marginBottom:14}}><div style={{display:"flex",justifyContent:"center"}}><div style={{width:120,height:120,position:"relative"}}><ResponsiveContainer><PieChart><Pie data={catData} dataKey="value" cx="50%" cy="50%" innerRadius={36} outerRadius={52} paddingAngle={3} strokeWidth={0} cornerRadius={3}>{catData.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Pie></PieChart></ResponsiveContainer></div></div><div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginTop:8}}>{catData.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:2,background:d.fill}}/><span style={{fontSize:10,color:P.txS}}>{d.name} {fmt(d.value)}</span></div>)}</div></GC>}</>})()}
      <TabHeader title="Collectibles" count={collectibles.length} onAdd={()=>setSheet("addCollectible")} addLabel="+ Add" onExport={()=>{if(window.posthog)window.posthog.capture('csv_exported',{type:'collectible'});csvExport(["Name","Category","Brand","Purchase Price","Current Value","Serial","Location","Insurance Value","Insured","Risk","Date Acquired","Yrs Held","Notes"],collectibles.map(c=>[c.name,c.category,c.brand||"",c.purchasePrice,c.currentValue,c.serialNumber||"",c.location||"",c.insuranceValue||"",c.insured||"No",c.risk||"",c.dateInvested||c.dateAcquired||"",yrsHeld(c.dateInvested||c.dateAcquired),c.notes||""]),"collectibles.csv")}} onImport={rows=>{const ni=rows.map(r=>({id:uid(),name:r.Name||"",category:r.Category||"Other",brand:r.Brand||"",purchasePrice:+(r["Purchase Price"]||0),currentValue:+(r["Current Value"]||0),serialNumber:r.Serial||"",location:r.Location||"",insuranceValue:+(r["Insurance Value"]||0),insured:r.Insured||"No",risk:+(r.Risk||4),dateInvested:r["Date Acquired"]||"",notes:r.Notes||""})).filter(i=>i.name);setCollectibles(p=>[...p,...ni]);logActivity(authToken,"import","collectible",null,"CSV Import",null,{count:ni.length});if(window.posthog)window.posthog.capture('csv_imported',{type:'collectible',count:ni.length})}}/>
      {collectibles.map(c=><HoldingCard key={c.id} item={c} type="collectible" onTap={()=>openEdit(c,"collectible")}/>)}
      {collectibles.length===0&&<div style={{padding:"40px 20px",textAlign:"center",color:P.txM}}><div style={{fontSize:28,marginBottom:12}}>★</div><div style={{fontSize:14,fontWeight:600,marginBottom:4}}>No collectibles yet</div><div style={{fontSize:12}}>Tap <span style={{color:P.gold,fontWeight:700}}>+ Add</span> to start tracking.</div></div>}
    </div>;
    case "analyzer": return <DealAnalyzer/>;
    default: return null;
  }};

  return<div style={{fontFamily:ff,background:P.bg,color:P.text,minHeight:"100vh",maxWidth:430,margin:"0 auto",position:"relative",overflow:"hidden",WebkitUserSelect:"none",userSelect:"none"}} onContextMenu={e=>e.preventDefault()} onCopy={e=>e.preventDefault()}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');@keyframes sheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}::-webkit-scrollbar{display:none}input::placeholder{color:${P.txF}}select option{background:${P.surface}}`}</style>
    {user?.email==="guest"&&<div id="demo-banner-m" style={{background:`linear-gradient(90deg,rgba(212,168,67,0.08),${P.surface})`,borderBottom:`1px solid ${P.gold}22`,padding:"8px 16px",display:"flex",justifyContent:"center",alignItems:"center",gap:8,position:"relative"}}><span style={{fontSize:11,color:P.gold}}>📋 Demo — <button onClick={()=>{setUser(null);setAuthToken(null);setView("login")}} style={{background:"none",border:"none",color:P.gold,fontWeight:700,cursor:"pointer",fontSize:11,textDecoration:"underline",fontFamily:ff}}>Sign in</button> to save your data</span><button onClick={()=>document.getElementById("demo-banner-m").style.display="none"} style={{position:"absolute",right:12,background:"none",border:"none",color:P.txM,fontSize:14,cursor:"pointer"}}>✕</button></div>}
    {/* Header */}
    <div style={{padding:"4px 24px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:38,height:38,borderRadius:12,background:`linear-gradient(145deg,${P.gold},#B8912E)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:900,color:P.bg,boxShadow:`0 4px 16px rgba(212,168,67,0.2)`}}>H</div><div><div style={{fontSize:19,fontWeight:800,color:P.text,letterSpacing:-0.4}}>HardAssets</div><div style={{fontSize:10,color:P.txM,letterSpacing:2,textTransform:"uppercase"}}>Portfolio Intelligence</div></div></div><div style={{display:"flex",alignItems:"center",gap:8}}>
      <button onClick={refreshPrices} style={{background:P.goldSoft,border:`1px solid ${P.goldMed}`,borderRadius:10,padding:"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontFamily:ff}} disabled={refreshing}><span style={{fontSize:14,transition:"transform 0.5s",transform:refreshing?"rotate(360deg)":"none"}}>↻</span><span style={{fontSize:10,fontWeight:600,color:P.gold}}>{refreshing?"...":"Refresh"}</span></button>
      <button onClick={()=>{setShowActivity(true);fetchLogs(authToken).then(setActivityLogs)}} style={{background:P.elevated,border:`1px solid ${P.border}`,borderRadius:10,padding:"6px 10px",cursor:"pointer"}}><span style={{fontSize:14}}>🕐</span></button>
      <button onClick={()=>setShowFaq(true)} style={{background:P.elevated,border:`1px solid ${P.border}`,borderRadius:10,padding:"6px 10px",cursor:"pointer"}}><span style={{fontSize:12,color:P.txS}}>?</span></button>
      <div style={{width:7,height:7,borderRadius:4,background:syncing?P.orange:user?.email!=="guest"?P.green:P.txM,boxShadow:syncing?`0 0 8px ${P.orange}`:user?.email!=="guest"?`0 0 8px ${P.green}`:"none"}}/>
      <div onClick={logout} style={{width:36,height:36,borderRadius:12,background:`linear-gradient(145deg,${P.elevated},${P.surface})`,border:`1px solid ${P.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden"}}>
        {user?.picture?<img src={user.picture} style={{width:36,height:36,borderRadius:12}} referrerPolicy="no-referrer"/>:<span style={{fontSize:15,fontWeight:700,color:P.gold}}>{(user?.name||"?")[0]}</span>}
      </div></div></div>
    {lastRefresh&&<div style={{padding:"0 24px 8px",display:"flex",alignItems:"center",justifyContent:"flex-end",gap:5}}><div style={{width:6,height:6,borderRadius:3,background:P.green,boxShadow:`0 0 6px ${P.green}`}}/><span style={{fontSize:10,color:P.txS,fontWeight:500}}>Updated {lastRefresh}</span></div>}
    {/* Content */}
    <div style={{padding:"0 18px",overflow:"auto",height:"calc(100vh - 54px - 58px - 80px)",WebkitOverflowScrolling:"touch"}}>{renderTab()}</div>
    {/* Bottom nav */}
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"rgba(11,15,26,0.88)",backdropFilter:"blur(40px) saturate(1.8)",borderTop:`1px solid ${P.border}`,padding:"6px 8px 26px",display:"inline-flex",justifyContent:"space-around",zIndex:100,overflowX:"auto",whiteSpace:"nowrap"}}>
      {NAV.map(n=>{const a=tab===n.key;return<button key={n.key} onClick={()=>{setTab(n.key);if(window.posthog)window.posthog.capture('tab_viewed',{tab:n.key})}} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"6px 4px",minWidth:48,minHeight:44}}><div style={{width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:8,background:a?P.goldSoft:"transparent"}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={a?P.gold:P.txM} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={n.d}/></svg></div><span style={{fontSize:11,fontWeight:a?700:500,color:a?P.gold:P.txM}}>{n.label}</span></button>})}
    </div>
    {/* Sheets */}
    <Sheet open={sheet==="addMetal"} onClose={()=>setSheet(null)} title="Add Metal"><AddMetalForm prices={prices} onAdd={m=>{setMetals(p=>[...p,m]);logActivity(authToken,"add","metal",m.id,m.name||m.metal,null,m);if(window.posthog)window.posthog.capture('holding_added',{type:'metal'})}} onClose={()=>setSheet(null)}/></Sheet>
    <Sheet open={sheet==="addSynd"} onClose={()=>setSheet(null)} title="Add Syndication"><AddSyndForm synds={synds} onAdd={s=>{setSynds(p=>[...p,s]);logActivity(authToken,"add","synd",s.id,s.name||s.sponsor,null,s);if(window.posthog)window.posthog.capture('holding_added',{type:'synd'})}} onClose={()=>setSheet(null)}/></Sheet>
    <Sheet open={sheet==="addCrypto"} onClose={()=>setSheet(null)} title="Add Crypto"><AddCryptoForm prices={prices} allCrypto={allCrypto} onAdd={c=>{setCrypto(p=>[...p,c]);logActivity(authToken,"add","crypto",c.id,c.name||c.coin,null,c);if(window.posthog)window.posthog.capture('holding_added',{type:'crypto'})}} onClose={()=>setSheet(null)}/></Sheet>
    <Sheet open={sheet==="addProperty"} onClose={()=>setSheet(null)} title="Add Property"><AddPropertyForm onAdd={p=>{setProperties(prev=>[...prev,p]);logActivity(authToken,"add","property",p.id,p.name,null,p);if(window.posthog)window.posthog.capture('holding_added',{type:'property'})}} onClose={()=>setSheet(null)}/></Sheet>
    <Sheet open={sheet==="addNote"} onClose={()=>setSheet(null)} title="Add Note"><AddNoteForm onAdd={n=>{setNotesLending(prev=>[...prev,n]);logActivity(authToken,"add","note",n.id,n.name,null,n);if(window.posthog)window.posthog.capture('holding_added',{type:'note'})}} onClose={()=>setSheet(null)}/></Sheet>
    <Sheet open={sheet==="addCollectible"} onClose={()=>setSheet(null)} title="Add Collectible"><AddCollectibleForm onAdd={c=>{setCollectibles(prev=>[...prev,c]);logActivity(authToken,"add","collectible",c.id,c.name,null,c);if(window.posthog)window.posthog.capture('holding_added',{type:'collectible'})}} onClose={()=>setSheet(null)}/></Sheet>
    {/* Edit Sheet */}
    <Sheet open={!!editItem} onClose={()=>setEditItem(null)} title={`Edit ${editItem?.name||editItem?.metal||editItem?.coin||""}`} onSave={()=>editSaveRef.current&&editSaveRef.current()}>
      {editItem&&<EditForm item={editItem} type={editItem._type} prices={prices} allCrypto={allCrypto} synds={synds} saveRef={editSaveRef} onSave={u=>saveItem(u,editItem._type)} onDelete={id=>setConfirmDelete({id,type:editItem._type,name:editItem?.name||editItem?.metal||editItem?.coin||"this item"})} onClose={()=>setEditItem(null)}/>}
    </Sheet>
    <Sheet open={!!confirmDelete} onClose={()=>setConfirmDelete(null)} title="Confirm Delete">
      <div style={{textAlign:"center",padding:"12px 0"}}>
        <div style={{fontSize:14,color:P.text,marginBottom:8}}>Delete <span style={{fontWeight:700,color:P.red}}>{confirmDelete?.name}</span>?</div>
        <div style={{fontSize:12,color:P.txM,marginBottom:24}}>This cannot be undone.</div>
        <div style={{display:"flex",gap:12,justifyContent:"center"}}>
          <Btn variant="ghost" onClick={()=>setConfirmDelete(null)}>Cancel</Btn>
          <Btn variant="danger" onClick={()=>{if(window.posthog)window.posthog.capture('holding_deleted',{type:confirmDelete.type});logActivity(authToken,"delete",confirmDelete.type,confirmDelete.id,confirmDelete.name,confirmDelete,null);deleteItem(confirmDelete.id,confirmDelete.type);setConfirmDelete(null);setEditItem(null)}}>Delete</Btn>
        </div>
      </div>
    </Sheet>
    <Sheet open={showFaq} onClose={()=>setShowFaq(false)} title="Help & FAQ">
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {[
          ["How do I add a holding?","Tap '+ Add' at the top of any tab. Fill the form and tap submit."],
          ["How do I edit or delete?","Tap any holding card to edit. Use the Delete button at the bottom of the edit form."],
          ["Where do live prices come from?","Metals from metals.dev, crypto from CoinGecko. Tap 'Refresh' to update."],
          ["How does oz-per-unit work?","1oz coin = 1 oz, 100oz bar = 100 oz, 1kg = 32.15 oz. Value = qty × oz/unit × spot."],
          ["What is Cap Rate?","(Annual Rent - Expenses) / Property Value × 100. Measures return independent of financing."],
          ["Syndications vs Physical RE?","Syndications = passive LP investments. Physical RE = properties you own directly."],
          ["How do targets work?","Set ideal % per asset class in Portfolio. Compare actual vs target to rebalance."],
          ["Is data saved automatically?","Yes, auto-saves to cloud within 800ms with Google sign-in. Guest = local only."],
          ["Can I import from CSV?","Yes! Every tab has Import. Export from Excel as CSV, then import."],
          ["What do risk scores mean?","1-3 = Low (green), 4-6 = Medium (gold), 7-8 = High (orange), 9-10 = Very High (red)."],
          ["How is income calculated?","Syndication distributions + property cash flow + note interest, all annualized."],
          ["What if I sign out?","Data saves to cloud. Sign back in with same Google account to restore."]
        ].map(([q,a],i)=><div key={i} style={{borderBottom:`1px solid ${P.border}`,paddingBottom:10}}>
          <div style={{fontSize:13,fontWeight:700,color:P.text,marginBottom:4}}>{q}</div>
          <div style={{fontSize:12,color:P.txS,lineHeight:1.5}}>{a}</div>
        </div>)}
      </div>
    </Sheet>
    <Sheet open={showActivity} onClose={()=>setShowActivity(false)} title="Activity Log">
      <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto"}}>{["all","add","edit","delete","import"].map(f=><button key={f} onClick={()=>setActivityFilter(f)} style={{padding:"5px 12px",borderRadius:8,border:`1px solid ${activityFilter===f?P.gold:P.border}`,background:activityFilter===f?P.goldSoft:"transparent",color:activityFilter===f?P.gold:P.txS,fontSize:11,fontWeight:600,cursor:"pointer",textTransform:"capitalize",fontFamily:ff,whiteSpace:"nowrap"}}>{f}</button>)}</div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {activityLogs.filter(l=>activityFilter==="all"||l.action===activityFilter).slice(0,50).map((l,i)=>{
          const colors={add:P.green,edit:P.gold,delete:P.red,import:P.blue};
          const icons={add:"＋",edit:"✏️",delete:"🗑",import:"📥"};
          let detail="";
          if(l.action==="add")detail="Added "+(l.asset_name||"item");
          else if(l.action==="delete")detail="Removed "+(l.asset_name||"item");
          else if(l.action==="import")detail="Imported "+(l.new_data?.count||"")+" items";
          else detail="Updated "+(l.asset_name||"item");
          return<div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:`1px solid ${P.border}`}}>
            <div style={{width:28,height:28,borderRadius:8,background:(colors[l.action]||P.txM)+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>{icons[l.action]||"•"}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                <span style={{fontSize:10,padding:"1px 6px",borderRadius:4,background:P.elevated,color:P.txS,fontWeight:600}}>{l.asset_type}</span>
                <span style={{fontSize:10,color:P.txM}}>{timeAgo(l.timestamp)}</span>
              </div>
              <div style={{fontSize:12,fontWeight:600,color:P.text}}>{l.asset_name||"Unknown"}</div>
              <div style={{fontSize:10,color:P.txS}}>{detail}</div>
            </div>
          </div>})}
        {activityLogs.filter(l=>activityFilter==="all"||l.action===activityFilter).length===0&&<div style={{padding:30,textAlign:"center",color:P.txM,fontSize:12}}>No activity yet</div>}
      </div>
    </Sheet>
  </div>
}