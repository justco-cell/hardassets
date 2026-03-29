import { useState, useEffect, useMemo, useRef } from "react";
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

// ═══ HARDASSETS MOBILE APP — ALL FEATURES ═══
const P={bg:"#0B0F1A",surface:"#111827",elevated:"#1E293B",card:"rgba(17,24,39,0.72)",border:"rgba(148,163,184,0.08)",borderLight:"rgba(148,163,184,0.12)",gold:"#D4A843",goldSoft:"rgba(212,168,67,0.1)",goldMed:"rgba(212,168,67,0.2)",green:"#34D399",greenSoft:"rgba(52,211,153,0.1)",red:"#F87171",redSoft:"rgba(248,113,113,0.1)",blue:"#60A5FA",blueSoft:"rgba(96,165,250,0.1)",purple:"#A78BFA",purpleSoft:"rgba(167,139,250,0.1)",cyan:"#22D3EE",orange:"#FB923C",text:"#F1F5F9",txS:"#94A3B8",txM:"#475569",txF:"#334155"};
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
const COINS=["BTC","ETH","SOL","ADA","DOT","AVAX","LINK","MATIC","XRP","DOGE","ATOM","UNI","AAVE"];

// ═══ LIVE PRICE APIs ═══
const METALS_API_KEY="IATC8NVAYIAWGIDAREIG473DAREIG";
const COIN_IDS={BTC:"bitcoin",ETH:"ethereum",SOL:"solana",ADA:"cardano",DOT:"polkadot",AVAX:"avalanche-2",LINK:"chainlink",MATIC:"matic-network",XRP:"ripple",DOGE:"dogecoin",ATOM:"cosmos",UNI:"uniswap",AAVE:"aave"};

async function fetchMetalPrices(){
  try{
    const r=await fetch("https://api.metals.dev/v1/latest?api_key="+METALS_API_KEY+"&currency=USD&unit=toz");
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

// ═══ COMPONENTS ═══
function GC({children,style,onClick}){const[h,setH]=useState(false);return<div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{background:P.card,backdropFilter:"blur(40px)",border:`1px solid ${h&&onClick?P.borderLight:P.border}`,borderRadius:20,transition:"all 0.3s",cursor:onClick?"pointer":"default",...style}}>{children}</div>}

function MiniChart({data,color=P.green,height=32,width=60}){const id=useMemo(()=>"m"+Math.random().toString(36).slice(2,7),[]);return<ResponsiveContainer width={width} height={height}><AreaChart data={data} margin={{top:2,right:0,bottom:0,left:0}}><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.3}/><stop offset="100%" stopColor={color} stopOpacity={0}/></linearGradient></defs><Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#${id})`} dot={false}/></AreaChart></ResponsiveContainer>}

function Sheet({open,onClose,title,children}){if(!open)return null;return<div style={{position:"fixed",inset:0,zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}><div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)"}}/><div style={{position:"relative",background:P.surface,borderRadius:"28px 28px 0 0",maxHeight:"88vh",overflow:"auto",animation:"sheetUp 0.35s cubic-bezier(0.32,0.72,0,1)"}}><div style={{display:"flex",justifyContent:"center",padding:"12px 0 0"}}><div style={{width:36,height:4,borderRadius:2,background:P.txF}}/></div><div style={{padding:"12px 24px 8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:20,fontWeight:700,color:P.text}}>{title}</span><button onClick={onClose} style={{width:32,height:32,borderRadius:16,background:P.elevated,border:"none",color:P.txS,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button></div><div style={{padding:"8px 24px 40px"}}>{children}</div></div></div>}

function FF({label,value,onChange,type="text",prefix,placeholder,isMono}){return<div style={{marginBottom:14}}><label style={{display:"block",fontSize:12,fontWeight:600,color:P.txS,marginBottom:6}}>{label}</label><div style={{display:"flex",alignItems:"center",background:P.bg,border:`1px solid ${P.border}`,borderRadius:12,overflow:"hidden"}}>{prefix&&<span style={{padding:"0 0 0 14px",color:P.txM,fontSize:14,fontFamily:mono}}>{prefix}</span>}<input value={value} onChange={e=>onChange(e.target.value)} type={type} placeholder={placeholder} style={{flex:1,background:"transparent",border:"none",color:P.text,fontSize:14,padding:prefix?"12px 14px 12px 6px":"12px 14px",outline:"none",fontFamily:isMono?mono:ff,width:"100%",colorScheme:"dark"}}/></div></div>}

function FS({label,value,onChange,options}){return<div style={{marginBottom:14}}><label style={{display:"block",fontSize:12,fontWeight:600,color:P.txS,marginBottom:6}}>{label}</label><select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",background:P.bg,border:`1px solid ${P.border}`,borderRadius:12,color:P.text,fontSize:14,padding:"12px 14px",outline:"none",appearance:"none",fontFamily:ff}}>{options.map(o=><option key={o.value||o} value={o.value||o} style={{background:P.surface}}>{o.label||o}</option>)}</select></div>}

function Btn({children,onClick,variant="gold",full,style:s}){const vs={gold:{background:`linear-gradient(135deg,${P.gold},#B8912E)`,color:P.bg,boxShadow:`0 4px 20px rgba(212,168,67,0.2)`},ghost:{background:"transparent",color:P.txS,border:`1px solid ${P.border}`},danger:{background:P.redSoft,color:P.red,border:`1px solid rgba(248,113,113,0.15)`},soft:{background:P.goldSoft,color:P.gold,border:`1px solid ${P.goldMed}`,padding:"9px 16px",fontSize:13}};return<button onClick={onClick} style={{border:"none",borderRadius:14,padding:"14px 24px",fontSize:14,fontWeight:700,cursor:"pointer",width:full?"100%":"auto",fontFamily:ff,transition:"all 0.2s",...(vs[variant]||vs.gold),...s}}>{children}</button>}

// ═══ SPONSOR AUTOCOMPLETE ═══
function SponsorInput({value,onChange,synds}){const[show,setShow]=useState(false);const existing=[...new Set(synds.map(s=>s.sponsor).filter(Boolean))];const filtered=existing.filter(s=>s.toLowerCase().includes((value||"").toLowerCase())&&s!==value);return<div style={{position:"relative",marginBottom:14}}><label style={{display:"block",fontSize:12,fontWeight:600,color:P.txS,marginBottom:6}}>Sponsor</label><input value={value} onChange={e=>{onChange(e.target.value);setShow(true)}} onFocus={()=>setShow(true)} onBlur={()=>setTimeout(()=>setShow(false),200)} placeholder="e.g. Bergman" style={{width:"100%",background:P.bg,border:`1px solid ${P.border}`,borderRadius:12,color:P.text,fontSize:14,padding:"12px 14px",outline:"none",fontFamily:ff,boxSizing:"border-box"}}/>{show&&filtered.length>0&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:P.elevated,border:`1px solid ${P.border}`,borderRadius:12,marginTop:4,zIndex:10,overflow:"hidden"}}>{filtered.slice(0,5).map(s=><div key={s} onMouseDown={()=>{onChange(s);setShow(false)}} style={{padding:"10px 14px",fontSize:13,color:P.text,cursor:"pointer",borderBottom:`1px solid ${P.border}`}}>{s}</div>)}</div>}</div>}

// ═══ CSV IMPORT ═══
function CsvImport({onImport,label="Import CSV"}){const ref=useRef();return<><input ref={ref} type="file" accept=".csv,.xlsx,.xls" style={{display:"none"}} onChange={e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>{const text=ev.target.result;const lines=text.split("\n").filter(l=>l.trim());if(lines.length<2)return;const headers=lines[0].split(",").map(h=>h.trim().replace(/"/g,""));const rows=lines.slice(1).map(l=>{const vals=l.split(",").map(v=>v.trim().replace(/"/g,""));const obj={};headers.forEach((h,i)=>obj[h]=vals[i]||"");return obj});onImport(rows)};reader.readAsText(file);e.target.value=""}}/><Btn variant="ghost" onClick={()=>ref.current?.click()} style={{fontSize:12,padding:"8px 14px"}}>{label}</Btn></>}

// ═══ HOLDING CARD ═══
function HoldingCard({item,type,spotPrice,onTap}){
  const val=type==="metal"?item.qty*(ozMap[item.unit]||1)*(spotPrice||item.spot||0):type==="crypto"?item.qty*(spotPrice||item.price||0):type==="synd"?item.invested||0:item.value||0;
  const cost=type==="metal"?item.qty*(item.costPerUnit||0):type==="crypto"?item.qty*(item.avgCost||0):item.invested||val;
  const gain=val-cost,pct=cost>0?(gain/cost)*100:0,up=gain>=0;
  const sp=useMemo(()=>spark(cost||val),[cost,val]);
  const held=yrsHeld(item.dateInvested);
  return<GC onClick={onTap} style={{padding:"16px 18px",marginBottom:10}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:14,fontWeight:600,color:P.text,marginBottom:3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.name||item.metal||item.coin}</div>
        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          {type==="metal"&&item.unit&&<span style={{fontSize:10,color:P.txM,background:P.goldSoft,padding:"1px 7px",borderRadius:5,fontWeight:600}}>{item.unit}</span>}
          {type==="synd"&&item.strategy&&<span style={{fontSize:10,color:P.blue,background:P.blueSoft,padding:"1px 7px",borderRadius:5,fontWeight:600}}>{item.strategy}</span>}
          {type==="synd"&&item.sponsor&&<span style={{fontSize:10,color:P.txM}}>{item.sponsor}</span>}
          {type==="crypto"&&<span style={{fontSize:10,color:P.purple,background:P.purpleSoft,padding:"1px 7px",borderRadius:5,fontWeight:600}}>{item.coin}</span>}
          {item.risk&&<span style={{fontSize:10,fontWeight:700,color:riskColor(+item.risk)}}>{item.risk}/10</span>}
          {held&&<span style={{fontSize:10,color:P.txM}}>{held}yr</span>}
        </div>
        {type==="synd"&&item.expectedRate>0&&<div style={{fontSize:10,color:P.green,marginTop:2}}>Income: {fmt(item.invested*(item.expectedRate/100))}/yr</div>}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <MiniChart data={sp} color={up?P.green:P.red}/>
        <div style={{textAlign:"right",minWidth:70}}>
          <div style={{fontSize:15,fontWeight:700,color:P.text,fontFamily:mono,letterSpacing:-0.5}}>{fmt(val)}</div>
          <div style={{fontSize:11,fontWeight:600,color:up?P.green:P.red,fontFamily:mono}}>{up?"+":""}{fmt(gain)}</div>
        </div>
      </div>
    </div>
    {item.notes&&<div style={{fontSize:10,color:P.txM,marginTop:6,padding:"4px 0",borderTop:`1px solid ${P.border}`,fontStyle:"italic"}}>📝 {item.notes}</div>}
  </GC>
}

// ═══ EDIT FORM (universal) ═══
function EditForm({item,type,onSave,onDelete,onClose,prices,synds=[],allCrypto={}}){
  const[f,sF]=useState({...item});
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
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FS label="Risk" value={f.risk} onChange={v=>sF({...f,risk:v})} options={[...Array(10)].map((_,i)=>({value:String(i+1),label:`${i+1}`}))}/><FS label="Status" value={f.status} onChange={v=>sF({...f,status:v})} options={["Active","Pending","Exited","Default"]}/></div></>}
    {type==="crypto"&&<><FS label="Coin" value={f.coin} onChange={v=>sF({...f,coin:v})} options={COINS}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Quantity" value={f.qty} onChange={v=>sF({...f,qty:v})} type="number" isMono/><FF label="Avg Cost" value={f.avgCost} onChange={v=>sF({...f,avgCost:v})} type="number" prefix="$" isMono/></div>
      {cSpot[f.coin]&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:P.purpleSoft,borderRadius:10,marginBottom:14,border:`1px solid rgba(167,139,250,0.15)`}}><div style={{width:6,height:6,borderRadius:3,background:P.purple}}/><span style={{fontSize:12,color:P.txS}}>Live price</span><span style={{fontSize:13,fontWeight:700,color:P.purple,fontFamily:mono,marginLeft:"auto"}}>${Math.round(cSpot[f.coin]).toLocaleString()}</span></div>}</>}
    {/* Common fields */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      <FF label="Date Invested" value={f.dateInvested||""} onChange={v=>sF({...f,dateInvested:v})} type="date"/>
      <FF label="Hold Period (Yrs)" value={f.holdPeriod||""} onChange={v=>sF({...f,holdPeriod:v})} type="number" isMono/>
    </div>
    {f.dateInvested&&<div style={{fontSize:11,color:P.txS,marginBottom:14}}>Held: <span style={{fontWeight:700,color:P.text,fontFamily:mono}}>{yrsHeld(f.dateInvested)} years</span></div>}
    <FS label="Risk (1-10)" value={f.risk||"5"} onChange={v=>sF({...f,risk:v})} options={[...Array(10)].map((_,i)=>({value:String(i+1),label:`${i+1} — ${i<3?"Low":i<6?"Medium":i<8?"High":"Very High"}`}))}/>
    <FF label="Notes" value={f.notes||""} onChange={v=>sF({...f,notes:v})} placeholder="Optional notes..."/>
    <div style={{display:"flex",gap:10,marginTop:8}}>
      <Btn full onClick={()=>{const updated={...f};if(type==="metal"){updated.qty=+updated.qty;updated.costPerUnit=+updated.costPerUnit;updated.spot=spotMap[updated.metal]||updated.spot||0;updated.name=updated.metal+" "+updated.unit}if(type==="synd"){updated.invested=+updated.invested;updated.expectedRate=+updated.expectedRate;updated.risk=+updated.risk}if(type==="crypto"){updated.qty=+updated.qty;updated.avgCost=+updated.avgCost;updated.price=cSpot[updated.coin]||+updated.avgCost;updated.name=updated.coin}onSave(updated)}}>Save Changes</Btn>
      <Btn variant="danger" onClick={()=>{onDelete(f.id);onClose()}} style={{padding:"14px 18px"}}>🗑</Btn>
    </div>
  </>
}

// ═══ ADD FORMS ═══
function AddMetalForm({onAdd,onClose,prices}){const[f,sF]=useState({metal:"Gold",unit:"1 oz",qty:"",costPerUnit:"",dateInvested:"",holdPeriod:"",risk:"3",notes:""});const spot={Gold:prices.gold,Silver:prices.silver,Platinum:prices.platinum,Palladium:prices.palladium};return<><FS label="Metal" value={f.metal} onChange={v=>sF({...f,metal:v})} options={["Gold","Silver","Platinum","Palladium"]}/><FS label="Unit" value={f.unit} onChange={v=>sF({...f,unit:v})} options={["1 oz","1/2 oz","1/4 oz","1/10 oz","1 kg","10 oz","100 oz","Gram"]}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Quantity" value={f.qty} onChange={v=>sF({...f,qty:v})} type="number" isMono/><FF label="Cost/Unit" value={f.costPerUnit} onChange={v=>sF({...f,costPerUnit:v})} type="number" prefix="$" isMono/></div>{spot[f.metal]&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:P.goldSoft,borderRadius:10,marginBottom:14,border:`1px solid ${P.goldMed}`}}><div style={{width:6,height:6,borderRadius:3,background:P.gold}}/><span style={{fontSize:12,color:P.txS}}>Live spot</span><span style={{fontSize:13,fontWeight:700,color:P.gold,fontFamily:mono,marginLeft:"auto"}}>${spot[f.metal]?.toFixed(2)}/oz</span></div>}<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Date Invested" value={f.dateInvested} onChange={v=>sF({...f,dateInvested:v})} type="date"/><FF label="Hold Period (Yrs)" value={f.holdPeriod} onChange={v=>sF({...f,holdPeriod:v})} type="number" isMono/></div><FS label="Risk" value={f.risk} onChange={v=>sF({...f,risk:v})} options={[...Array(10)].map((_,i)=>({value:String(i+1),label:`${i+1}`}))}/><FF label="Notes" value={f.notes} onChange={v=>sF({...f,notes:v})} placeholder="Optional"/><Btn full onClick={()=>{if(f.qty){onAdd({...f,qty:+f.qty,costPerUnit:+f.costPerUnit,risk:+f.risk,spot:spot[f.metal]||0,name:f.metal+" "+f.unit,id:uid()});onClose()}}}>Add Holding</Btn></>}

function AddSyndForm({onAdd,onClose,synds}){const[f,sF]=useState({name:"",sponsor:"",invested:"",expectedRate:"",projIRR:"",strategy:"Multifamily",risk:"5",status:"Active",dateInvested:"",holdPeriod:"",notes:""});return<><FF label="Deal Name" value={f.name} onChange={v=>sF({...f,name:v})} placeholder="e.g. Pinnacle West"/><SponsorInput value={f.sponsor} onChange={v=>sF({...f,sponsor:v})} synds={synds}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Invested" value={f.invested} onChange={v=>sF({...f,invested:v})} type="number" prefix="$" isMono/><FF label="Rate %" value={f.expectedRate} onChange={v=>sF({...f,expectedRate:v})} type="number" prefix="%" isMono/></div><FF label="Projected IRR %" value={f.projIRR} onChange={v=>sF({...f,projIRR:v})} type="number" prefix="%" isMono/><FS label="Strategy" value={f.strategy} onChange={v=>sF({...f,strategy:v})} options={SYND_TYPES}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FS label="Risk" value={f.risk} onChange={v=>sF({...f,risk:v})} options={[...Array(10)].map((_,i)=>({value:String(i+1),label:`${i+1}`}))}/><FS label="Status" value={f.status} onChange={v=>sF({...f,status:v})} options={["Active","Pending","Exited","Default"]}/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Date Invested" value={f.dateInvested} onChange={v=>sF({...f,dateInvested:v})} type="date"/><FF label="Hold Period (Yrs)" value={f.holdPeriod} onChange={v=>sF({...f,holdPeriod:v})} type="number" isMono/></div><FF label="Notes" value={f.notes} onChange={v=>sF({...f,notes:v})} placeholder="Optional"/><Btn full onClick={()=>{if(f.name&&f.invested){onAdd({...f,invested:+f.invested,expectedRate:+f.expectedRate,projIRR:f.projIRR?+f.projIRR:null,risk:+f.risk,id:uid()});onClose()}}}>Add Syndication</Btn></>}

function AddCryptoForm({onAdd,onClose,prices,allCrypto={}}){const[f,sF]=useState({coin:"BTC",qty:"",avgCost:"",dateInvested:"",holdPeriod:"",risk:"7",notes:""});const spot={BTC:prices.btc,ETH:prices.eth,SOL:prices.sol,...allCrypto};return<><FS label="Coin" value={f.coin} onChange={v=>sF({...f,coin:v})} options={COINS}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Quantity" value={f.qty} onChange={v=>sF({...f,qty:v})} type="number" isMono/><FF label="Avg Cost" value={f.avgCost} onChange={v=>sF({...f,avgCost:v})} type="number" prefix="$" isMono/></div>{spot[f.coin]&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:P.purpleSoft,borderRadius:10,marginBottom:14,border:`1px solid rgba(167,139,250,0.15)`}}><div style={{width:6,height:6,borderRadius:3,background:P.purple}}/><span style={{fontSize:12,color:P.txS}}>Live</span><span style={{fontSize:13,fontWeight:700,color:P.purple,fontFamily:mono,marginLeft:"auto"}}>${Math.round(spot[f.coin]).toLocaleString()}</span></div>}<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FF label="Date Invested" value={f.dateInvested} onChange={v=>sF({...f,dateInvested:v})} type="date"/><FF label="Hold Period (Yrs)" value={f.holdPeriod} onChange={v=>sF({...f,holdPeriod:v})} type="number" isMono/></div><FS label="Risk" value={f.risk} onChange={v=>sF({...f,risk:v})} options={[...Array(10)].map((_,i)=>({value:String(i+1),label:`${i+1}`}))}/><FF label="Notes" value={f.notes} onChange={v=>sF({...f,notes:v})} placeholder="Optional"/><Btn full onClick={()=>{if(f.qty){onAdd({...f,qty:+f.qty,avgCost:+f.avgCost,risk:+f.risk,coin:f.coin,name:f.coin,price:spot[f.coin]||+f.avgCost,id:uid()});onClose()}}}>Add Coin</Btn></>}

// ═══ DEAL ANALYZER ═══
function DealAnalyzer(){const[d,sD]=useState({price:"",rent:"",tax:"",insurance:"",maintenance:"",vacancy:"8",mgmt:"10",downPct:"25",rate:"7",term:"30"});const price=+d.price||0,rent=+d.rent||0,tax=+d.tax||0,ins=+d.insurance||0,maint=+d.maintenance||0;const down=price*(+d.downPct/100),loan=price-down;const mr=(+d.rate/100)/12,n=+d.term*12;const mortgage=mr>0?loan*(mr*Math.pow(1+mr,n))/(Math.pow(1+mr,n)-1):0;const gross=rent*12,vac=gross*(+d.vacancy/100),eff=gross-vac,mgmtC=eff*(+d.mgmt/100);const noi=eff-tax-ins-(maint*12)-mgmtC,cf=noi-(mortgage*12),mcf=cf/12;const cap=price>0?(noi/price)*100:0,coc=down>0?(cf/down)*100:0,dscr=mortgage>0?noi/(mortgage*12):0;const tests=[{name:"Cap Rate",val:cap.toFixed(1)+"%",pass:cap>=6,tgt:"≥ 6%"},{name:"CoC Return",val:coc.toFixed(1)+"%",pass:coc>=8,tgt:"≥ 8%"},{name:"DSCR",val:dscr.toFixed(2),pass:dscr>=1.25,tgt:"≥ 1.25"},{name:"Monthly CF",val:fmt(mcf),pass:mcf>0,tgt:"> $0"}];
  return<div style={{paddingBottom:120}}><div style={{fontSize:13,color:P.txS,marginBottom:16}}>Analyze rental deals with instant cash flow projections.</div><GC style={{padding:18,marginBottom:14}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><FF label="Price" value={d.price} onChange={v=>sD({...d,price:v})} prefix="$" isMono/><FF label="Rent/mo" value={d.rent} onChange={v=>sD({...d,rent:v})} prefix="$" isMono/><FF label="Tax/yr" value={d.tax} onChange={v=>sD({...d,tax:v})} prefix="$" isMono/><FF label="Ins/yr" value={d.insurance} onChange={v=>sD({...d,insurance:v})} prefix="$" isMono/><FF label="Maint/mo" value={d.maintenance} onChange={v=>sD({...d,maintenance:v})} prefix="$" isMono/><FF label="Vacancy%" value={d.vacancy} onChange={v=>sD({...d,vacancy:v})} prefix="%" isMono/><FF label="Down%" value={d.downPct} onChange={v=>sD({...d,downPct:v})} prefix="%" isMono/><FF label="Rate%" value={d.rate} onChange={v=>sD({...d,rate:v})} prefix="%" isMono/></div></GC>
    {price>0&&<><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>{tests.map((t,i)=><GC key={i} style={{padding:"14px 16px",borderColor:t.pass?"rgba(52,211,153,0.12)":"rgba(248,113,113,0.12)"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:11,color:P.txS}}>{t.name}</span><span style={{fontSize:9,color:P.txM}}>{t.tgt}</span></div><div style={{fontSize:20,fontWeight:800,color:t.pass?P.green:P.red,fontFamily:mono}}>{t.val}</div><div style={{fontSize:10,fontWeight:700,color:t.pass?P.green:P.red,marginTop:4}}>{t.pass?"✓ Pass":"✗ Fail"}</div></GC>)}</div><GC style={{padding:18}}><div style={{fontSize:13,fontWeight:700,color:P.text,marginBottom:12}}>Cash Flow</div>{[["Gross",gross],["Vacancy",-vac],["NOI",noi,1],["Mortgage/yr",-(mortgage*12)],["Annual CF",cf,1],["Monthly CF",mcf,1]].map(([l,v,b],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:b?`1px solid ${P.border}`:"none"}}><span style={{fontSize:12,color:b?P.text:P.txS,fontWeight:b?600:400}}>{l}</span><span style={{fontSize:13,fontWeight:b?700:500,color:v>=0?(b?P.green:P.text):P.red,fontFamily:mono}}>{fmt(v)}</span></div>)}</GC></>}
  </div>}

// ═══ PORTFOLIO VIEW ═══
function PortfolioView({metals,synds,crypto,prices,targets,setTargets,allCrypto={}}){
  const spotMap={Gold:prices.gold,Silver:prices.silver,Platinum:prices.platinum,Palladium:prices.palladium};
  const cSpot={BTC:prices.btc,ETH:prices.eth,SOL:prices.sol,...allCrypto};
  const mT=metals.reduce((s,m)=>s+m.qty*(ozMap[m.unit]||1)*(spotMap[m.metal]||m.spot||0),0);
  const sT=synds.reduce((s,x)=>s+(x.invested||0),0);
  const cT=crypto.reduce((s,x)=>s+x.qty*(cSpot[x.coin]||x.price||0),0);
  const total=mT+sT+cT;
  const hardAssets=mT+sT+cT; // metals + RE + crypto all qualify
  const hardPct=total>0?(hardAssets/total*100):0;
  const alloc=[{name:"Precious Metals",value:mT,color:P.gold},{name:"Real Estate",value:sT,color:P.blue},{name:"Crypto",value:cT,color:P.purple}].filter(d=>d.value>0);
  const totalCost=metals.reduce((s,m)=>s+m.qty*(m.costPerUnit||0),0)+synds.reduce((s,x)=>s+(x.invested||0),0)+crypto.reduce((s,x)=>s+x.qty*(x.avgCost||0),0);
  const totalGain=total-totalCost,totalPct=totalCost>0?(totalGain/totalCost*100):0;
  const income=synds.reduce((s,x)=>s+(x.invested*(x.expectedRate||0)/100),0);
  const avgRisk=(()=>{const r=[...synds,...crypto,...metals].filter(x=>x.risk);return r.length?(r.reduce((s,x)=>s+ +x.risk,0)/r.length).toFixed(1):"—"})();
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
      {[{l:"Income/yr",v:fmt(income),c:P.green},{l:"Avg Risk",v:avgRisk+"/10",c:P.orange},{l:"Hard %",v:hardPct.toFixed(1)+"%",c:P.gold},{l:"Assets",v:String(metals.length+synds.length+crypto.length),c:P.blue}].map((m,i)=>
        <GC key={i} style={{padding:"12px 10px",textAlign:"center"}}><div style={{fontSize:9,color:P.txM,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase",marginBottom:4}}>{m.l}</div><div style={{fontSize:16,fontWeight:800,color:m.c,fontFamily:mono}}>{m.v}</div></GC>)}
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
          <span style={{fontSize:9,color:P.txM}}>tgt:{target}%</span>
        </div>}
      </div>})}
      {/* Donut */}
      <div style={{display:"flex",justifyContent:"center",marginTop:8}}>
        <div style={{width:140,height:140,position:"relative"}}><ResponsiveContainer><PieChart><Pie data={alloc} dataKey="value" cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={4} strokeWidth={0} cornerRadius={4}>{alloc.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie></PieChart></ResponsiveContainer><div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:9,color:P.txM,fontWeight:600,letterSpacing:0.5}}>TOTAL</div><div style={{fontSize:14,fontWeight:800,color:P.text,fontFamily:mono}}>{fmt(total)}</div></div></div>
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

// ═══ MAIN APP ═══
export default function HardAssets(){
  const[view,setView]=useState("splash");
  const[tab,setTab]=useState("portfolio");
  const[sheet,setSheet]=useState(null);
  const[editItem,setEditItem]=useState(null);
  const[user,setUser]=useState(null);
  const[authToken,setAuthToken]=useState(null);
  const[syncing,setSyncing]=useState(false);

  const[metals,setMetals]=useState([]);
  const[synds,setSynds]=useState([]);
  const[crypto,setCrypto]=useState([]);
  const[prices,setPrices]=useState({gold:3015,silver:33.8,platinum:1015,palladium:985,goldChg:0.42,silverChg:1.1,platChg:-0.3,btc:87240,eth:2050,sol:140,btcChg:2.1,ethChg:-0.8,solChg:3.4});
  const[allCrypto,setAllCrypto]=useState({});
  const[lastRefresh,setLastRefresh]=useState(null);
  const[refreshing,setRefreshing]=useState(false);
  const[targets,setTargets]=useState({"Precious Metals":30,"Real Estate":35,"Crypto":10,"Equities":10,"Cash":5,"Alternatives":10});

  // Auto-save to Supabase on any data change
  const saveTimer=useRef(null);
  useEffect(()=>{
    if(!authToken||!user)return;
    if(saveTimer.current)clearTimeout(saveTimer.current);
    saveTimer.current=setTimeout(()=>{
      cloudSave(authToken,{metals,syndications:synds,crypto,targets});
    },800); // debounce 800ms
    return()=>{if(saveTimer.current)clearTimeout(saveTimer.current)};
  },[metals,synds,crypto,targets,authToken,user]);

  // Google Sign-In handler
  const handleGoogleLogin=async(credentialResponse)=>{
    const token=credentialResponse.credential;
    setAuthToken(token);
    // Decode JWT to get user info
    try{
      const payload=JSON.parse(atob(token.split('.')[1]));
      setUser({name:payload.name||payload.email,email:payload.email,picture:payload.picture});
    }catch(e){setUser({name:"User",email:"user@hardassets.io"})}
    // Load saved data from Supabase
    setSyncing(true);
    const saved=await cloudLoad(token);
    if(saved){
      if(saved.metals&&saved.metals.length>0)setMetals(saved.metals);
      if(saved.syndications&&saved.syndications.length>0)setSynds(saved.syndications);
      if(saved.crypto&&saved.crypto.length>0)setCrypto(saved.crypto);
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
      window.google.accounts.id.initialize({client_id:GOOGLE_CLIENT_ID,callback:handleGoogleLogin,auto_select:true});
      window.google.accounts.id.renderButton(document.getElementById("gsi-btn"),{type:"standard",shape:"rectangular",theme:"filled_black",size:"large",text:"continue_with",width:320});
    };
    if(window.google?.accounts?.id){initGSI()}
    else{
      const s=document.createElement("script");s.src="https://accounts.google.com/gsi/client";s.async=true;s.defer=true;s.onload=initGSI;document.head.appendChild(s);
    }
  },[view]);

  const logout=()=>{setUser(null);setAuthToken(null);setMetals([]);setSynds([]);setCrypto([]);setView("login")};
  const guestLogin=()=>{setUser({name:"Guest",email:"guest"});setView("app");refreshPrices()};

  // Live price refresh
  const refreshPrices=async()=>{
    setRefreshing(true);
    const[mp,cp]=await Promise.all([fetchMetalPrices(),fetchCryptoPrices()]);
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
    setRefreshing(false);
  };

  // Fetch on mount
  useEffect(()=>{if(view==="app")refreshPrices()},[view]);
  const goldS=useMemo(()=>spark(2850,30,0.008),[]);const silverS=useMemo(()=>spark(30,30,0.012),[]);const btcS=useMemo(()=>spark(78000,30,0.02),[]);const ethS=useMemo(()=>spark(2400,30,0.018),[]);

  const spotMap={Gold:prices.gold,Silver:prices.silver,Platinum:prices.platinum,Palladium:prices.palladium};
  const cSpot={BTC:prices.btc,ETH:prices.eth,SOL:prices.sol,...allCrypto};

  // ═══ LOGIN SCREEN ═══
  if(view==="login")return<div style={{fontFamily:ff,background:P.bg,color:P.text,minHeight:"100vh",maxWidth:430,margin:"0 auto",display:"flex",flexDirection:"column",height:"100vh",position:"relative"}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    <div style={{position:"absolute",top:-100,left:"50%",transform:"translateX(-50%)",width:400,height:400,background:`radial-gradient(circle,${P.gold}08,transparent 70%)`,pointerEvents:"none"}}/>
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 32px"}}>
      <div style={{width:64,height:64,borderRadius:20,background:`linear-gradient(135deg,${P.gold},#B8912E)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:900,color:P.bg,marginBottom:32,boxShadow:`0 8px 32px rgba(212,168,67,0.3)`}}>H</div>
      <div style={{fontSize:26,fontWeight:800,color:P.text,marginBottom:8,animation:"fadeUp 0.6s ease both"}}>Welcome Back</div>
      <div style={{fontSize:14,color:P.txS,marginBottom:48,textAlign:"center",lineHeight:1.5,animation:"fadeUp 0.6s ease 0.1s both"}}>Track your precious metals, real estate,<br/>crypto & alternative investments</div>
      <div style={{width:"100%",animation:"fadeUp 0.6s ease 0.2s both"}}>
        <div id="gsi-btn" style={{display:"flex",justifyContent:"center",marginBottom:12}}/>
        <button onClick={guestLogin} style={{width:"100%",padding:"15px 20px",borderRadius:14,border:`1px solid ${P.border}`,background:"transparent",color:P.txS,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:ff}}>Continue as Guest</button>
      </div>
      {syncing&&<div style={{marginTop:20,fontSize:13,color:P.gold}}>Syncing your data...</div>}
    </div>
    <div style={{padding:"24px 32px 40px",textAlign:"center"}}><div style={{fontSize:10,color:P.txM,lineHeight:1.6}}>Data saved securely to your account.<br/>Free forever.</div></div>
  </div>;

  const NAV=[{key:"portfolio",label:"Portfolio",d:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"},{key:"metals",label:"Metals",d:"M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"},{key:"realestate",label:"RE",d:"M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"},{key:"crypto",label:"Crypto",d:"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"},{key:"analyzer",label:"Analyze",d:"M9 7h6m0 10v-3m-3 3v-6m-3 6v-1m6-9a2 2 0 012 2v8a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2"}];

  // Save/delete helpers
  const saveItem=(updated,type)=>{if(type==="metal")setMetals(p=>p.map(x=>x.id===updated.id?updated:x));if(type==="synd")setSynds(p=>p.map(x=>x.id===updated.id?updated:x));if(type==="crypto")setCrypto(p=>p.map(x=>x.id===updated.id?updated:x));setEditItem(null)};
  const deleteItem=(id,type)=>{if(type==="metal")setMetals(p=>p.filter(x=>x.id!==id));if(type==="synd")setSynds(p=>p.filter(x=>x.id!==id));if(type==="crypto")setCrypto(p=>p.filter(x=>x.id!==id))};

  const TabHeader=({title,count,onAdd,addLabel,onExport,onImport})=><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}><span style={{fontSize:16,fontWeight:700,color:P.text}}>{title} <span style={{fontSize:12,fontWeight:600,color:P.txM,background:P.goldSoft,padding:"2px 8px",borderRadius:6}}>{count}</span></span><div style={{display:"flex",gap:6}}>{onImport&&<CsvImport onImport={onImport} label="Import"/>}{onExport&&<Btn variant="ghost" onClick={onExport} style={{fontSize:11,padding:"7px 12px"}}>Export</Btn>}<Btn variant="soft" onClick={onAdd} style={{fontSize:12}}>{addLabel||"+ Add"}</Btn></div></div>;

  const PriceTag=({label,value,change,color,sp})=>{const up=change>=0;return<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${P.border}`}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:34,height:34,borderRadius:10,background:`${color}12`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:13,fontWeight:700,color}}>{label.slice(0,2)}</span></div><div><div style={{fontSize:13,fontWeight:600,color:P.text}}>{label}</div><div style={{fontSize:11,color:up?P.green:P.red,fontWeight:600,fontFamily:mono}}>{fPct(change)}</div></div></div><div style={{display:"flex",alignItems:"center",gap:10}}>{sp&&<MiniChart data={sp} color={up?P.green:P.red}/>}<div style={{fontSize:15,fontWeight:700,color:P.text,fontFamily:mono,minWidth:70,textAlign:"right"}}>{value>999?"$"+Math.round(value).toLocaleString():"$"+value.toFixed(2)}</div></div></div>};

  const renderTab=()=>{switch(tab){
    case "portfolio": return <PortfolioView metals={metals} synds={synds} crypto={crypto} prices={prices} targets={targets} setTargets={setTargets} allCrypto={allCrypto}/>;
    case "metals": return <div style={{paddingBottom:120}}>
      <GC style={{padding:"14px 18px",marginBottom:14}}><PriceTag label="Gold" value={prices.gold} change={prices.goldChg} color={P.gold} sp={goldS}/><PriceTag label="Silver" value={prices.silver} change={prices.silverChg} color={P.txS} sp={silverS}/><PriceTag label="Platinum" value={prices.platinum} change={prices.platChg} color={P.cyan}/></GC>
      <TabHeader title="Holdings" count={metals.length} onAdd={()=>setSheet("addMetal")} onExport={()=>csvExport(["Metal","Unit","Qty","Cost/Unit","Spot","Value","Gain","Risk","Date Invested","Hold Period","Yrs Held","Notes"],metals.map(m=>[m.metal,m.unit,m.qty,m.costPerUnit,spotMap[m.metal]||m.spot,m.qty*(ozMap[m.unit]||1)*(spotMap[m.metal]||m.spot||0),(m.qty*(ozMap[m.unit]||1)*(spotMap[m.metal]||m.spot||0))-(m.qty*m.costPerUnit),m.risk||"",m.dateInvested||"",m.holdPeriod||"",yrsHeld(m.dateInvested),m.notes||""]),"metals.csv")} onImport={rows=>{const ni=rows.map(r=>({id:uid(),metal:r.Metal||"Gold",unit:r.Unit||"1 oz",qty:+(r.Qty||r.Quantity||0),costPerUnit:+(r["Cost/Unit"]||r.Cost||0),spot:+(r.Spot||0),name:(r.Metal||"Gold")+" "+(r.Unit||"1 oz"),risk:+(r.Risk||0)||null,dateInvested:r["Date Invested"]||"",holdPeriod:r["Hold Period"]||"",notes:r.Notes||""})).filter(i=>i.qty>0);setMetals(p=>[...p,...ni])}}/>
      {metals.map(m=><HoldingCard key={m.id} item={m} type="metal" spotPrice={spotMap[m.metal]} onTap={()=>setEditItem({...m,_type:"metal"})}/>)}
    </div>;
    case "realestate": return <div style={{paddingBottom:120}}>
      {synds.length>0&&(()=>{const by={};synds.forEach(s=>{by[s.strategy]=(by[s.strategy]||0)+s.invested});const data=Object.entries(by).map(([name,value],i)=>({name:name.slice(0,8),value,fill:PIE_C[i%PIE_C.length]}));return<GC style={{padding:"14px 10px",marginBottom:14}}><ResponsiveContainer width="100%" height={90}><BarChart data={data} margin={{top:0,right:0,bottom:0,left:0}}><XAxis dataKey="name" tick={{fontSize:9,fill:P.txM}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:P.elevated,border:`1px solid ${P.border}`,borderRadius:10,fontSize:11,fontFamily:mono}} formatter={v=>fmt(v)}/><Bar dataKey="value" radius={[5,5,0,0]}>{data.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Bar></BarChart></ResponsiveContainer></GC>})()}
      <TabHeader title="Syndications" count={synds.length} onAdd={()=>setSheet("addSynd")} addLabel="+ Add Deal" onExport={()=>csvExport(["Deal","Sponsor","Strategy","Invested","Rate%","Ann Income","Proj IRR","Risk","Status","Date Invested","Hold Period","Yrs Held","Notes"],synds.map(s=>[s.name,s.sponsor,s.strategy,s.invested,s.expectedRate,Math.round(s.invested*(s.expectedRate||0)/100),s.projIRR||"",s.risk,s.status,s.dateInvested||"",s.holdPeriod||"",yrsHeld(s.dateInvested),s.notes||""]),"syndications.csv")} onImport={rows=>{const ni=rows.map(r=>({id:uid(),name:r.Deal||r.Name||"",sponsor:r.Sponsor||"",invested:+(r.Invested||r.Amount||0),expectedRate:+(r["Rate%"]||r.Rate||0),projIRR:+(r["Proj IRR"]||r.IRR||0)||null,strategy:r.Strategy||r.Type||"Multifamily",risk:+(r.Risk||5),status:r.Status||"Active",dateInvested:r["Date Invested"]||"",holdPeriod:r["Hold Period"]||"",notes:r.Notes||""})).filter(i=>i.name&&i.invested>0);setSynds(p=>[...p,...ni])}}/>
      {synds.map(s=><HoldingCard key={s.id} item={s} type="synd" onTap={()=>setEditItem({...s,_type:"synd"})}/>)}
    </div>;
    case "crypto": return <div style={{paddingBottom:120}}>
      <GC style={{padding:"14px 18px",marginBottom:14}}><PriceTag label="Bitcoin" value={prices.btc} change={prices.btcChg} color={P.orange} sp={btcS}/><PriceTag label="Ethereum" value={prices.eth} change={prices.ethChg} color={P.blue} sp={ethS}/><PriceTag label="Solana" value={prices.sol} change={prices.solChg} color={P.purple}/></GC>
      <TabHeader title="Holdings" count={crypto.length} onAdd={()=>setSheet("addCrypto")} addLabel="+ Add Coin" onExport={()=>csvExport(["Coin","Qty","Avg Cost","Current","Value","Gain","Risk","Date Invested","Hold Period","Yrs Held","Notes"],crypto.map(c=>{const sp=cSpot[c.coin]||c.price||0;return[c.coin,c.qty,c.avgCost,sp,c.qty*sp,(c.qty*sp)-(c.qty*c.avgCost),c.risk||"",c.dateInvested||"",c.holdPeriod||"",yrsHeld(c.dateInvested),c.notes||""]}),"crypto.csv")} onImport={rows=>{const ni=rows.map(r=>({id:uid(),coin:r.Coin||"BTC",name:r.Coin||"BTC",qty:+(r.Qty||r.Quantity||0),avgCost:+(r["Avg Cost"]||r.Cost||0),price:cSpot[r.Coin]||+(r.Current||r.Price||0),risk:+(r.Risk||7),dateInvested:r["Date Invested"]||"",holdPeriod:r["Hold Period"]||"",notes:r.Notes||""})).filter(i=>i.qty>0);setCrypto(p=>[...p,...ni])}}/>
      {crypto.map(c=><HoldingCard key={c.id} item={c} type="crypto" spotPrice={cSpot[c.coin]} onTap={()=>setEditItem({...c,_type:"crypto"})}/>)}
    </div>;
    case "analyzer": return <DealAnalyzer/>;
    default: return null;
  }};

  return<div style={{fontFamily:ff,background:P.bg,color:P.text,minHeight:"100vh",maxWidth:430,margin:"0 auto",position:"relative",overflow:"hidden"}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');@keyframes sheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}::-webkit-scrollbar{display:none}input::placeholder{color:${P.txF}}select option{background:${P.surface}}`}</style>
    {/* Status bar */}
    <div style={{height:54,display:"flex",alignItems:"flex-end",justifyContent:"space-between",padding:"0 24px 8px"}}><span style={{fontSize:15,fontWeight:700,fontFamily:mono,color:P.text}}>9:41</span><div style={{display:"flex",gap:6,alignItems:"center"}}><svg width="17" height="12" viewBox="0 0 17 12" fill="none"><rect x="0" y="6" width="3" height="6" rx="1" fill={P.text}/><rect x="4.5" y="4" width="3" height="8" rx="1" fill={P.text}/><rect x="9" y="1.5" width="3" height="10.5" rx="1" fill={P.text}/><rect x="13.5" y="0" width="3" height="12" rx="1" fill={P.text}/></svg><svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke={P.txS} strokeWidth="1"/><rect x="22.5" y="3.5" width="2" height="5" rx="1" fill={P.txS}/><rect x="2" y="2" width="15" height="8" rx="1.5" fill={P.green}/></svg></div></div>
    {/* Header */}
    <div style={{padding:"4px 24px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:38,height:38,borderRadius:12,background:`linear-gradient(145deg,${P.gold},#B8912E)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:900,color:P.bg,boxShadow:`0 4px 16px rgba(212,168,67,0.2)`}}>H</div><div><div style={{fontSize:19,fontWeight:800,color:P.text,letterSpacing:-0.4}}>HardAssets</div><div style={{fontSize:10,color:P.txM,letterSpacing:2,textTransform:"uppercase"}}>Portfolio Intelligence</div></div></div><div style={{display:"flex",alignItems:"center",gap:8}}>
      <button onClick={refreshPrices} style={{background:P.goldSoft,border:`1px solid ${P.goldMed}`,borderRadius:10,padding:"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontFamily:ff}} disabled={refreshing}><span style={{fontSize:14,transition:"transform 0.5s",transform:refreshing?"rotate(360deg)":"none"}}>↻</span><span style={{fontSize:10,fontWeight:600,color:P.gold}}>{refreshing?"...":"Refresh"}</span></button>
      <div style={{width:7,height:7,borderRadius:4,background:syncing?P.orange:user?.email!=="guest"?P.green:P.txM,boxShadow:syncing?`0 0 8px ${P.orange}`:user?.email!=="guest"?`0 0 8px ${P.green}`:"none"}}/>
      <div onClick={logout} style={{width:36,height:36,borderRadius:12,background:`linear-gradient(145deg,${P.elevated},${P.surface})`,border:`1px solid ${P.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden"}}>
        {user?.picture?<img src={user.picture} style={{width:36,height:36,borderRadius:12}} referrerPolicy="no-referrer"/>:<span style={{fontSize:15,fontWeight:700,color:P.gold}}>{(user?.name||"?")[0]}</span>}
      </div></div></div>
    {lastRefresh&&<div style={{padding:"0 24px 8px",fontSize:10,color:P.txM,textAlign:"right"}}>Updated {lastRefresh}</div>}
    {/* Content */}
    <div style={{padding:"0 18px",overflow:"auto",height:"calc(100vh - 54px - 58px - 80px)",WebkitOverflowScrolling:"touch"}}>{renderTab()}</div>
    {/* Bottom nav */}
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"rgba(11,15,26,0.88)",backdropFilter:"blur(40px) saturate(1.8)",borderTop:`1px solid ${P.border}`,padding:"6px 8px 26px",display:"flex",justifyContent:"space-around",zIndex:100}}>
      {NAV.map(n=>{const a=tab===n.key;return<button key={n.key} onClick={()=>setTab(n.key)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"4px 4px",minWidth:48}}><div style={{width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:8,background:a?P.goldSoft:"transparent"}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={a?P.gold:P.txM} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={n.d}/></svg></div><span style={{fontSize:9,fontWeight:a?700:500,color:a?P.gold:P.txM}}>{n.label}</span></button>})}
    </div>
    {/* Sheets */}
    <Sheet open={sheet==="addMetal"} onClose={()=>setSheet(null)} title="Add Metal"><AddMetalForm prices={prices} onAdd={m=>setMetals(p=>[...p,m])} onClose={()=>setSheet(null)}/></Sheet>
    <Sheet open={sheet==="addSynd"} onClose={()=>setSheet(null)} title="Add Syndication"><AddSyndForm synds={synds} onAdd={s=>setSynds(p=>[...p,s])} onClose={()=>setSheet(null)}/></Sheet>
    <Sheet open={sheet==="addCrypto"} onClose={()=>setSheet(null)} title="Add Crypto"><AddCryptoForm prices={prices} allCrypto={allCrypto} onAdd={c=>setCrypto(p=>[...p,c])} onClose={()=>setSheet(null)}/></Sheet>
    {/* Edit Sheet */}
    <Sheet open={!!editItem} onClose={()=>setEditItem(null)} title={`Edit ${editItem?.name||editItem?.metal||editItem?.coin||""}`}>
      {editItem&&<EditForm item={editItem} type={editItem._type} prices={prices} allCrypto={allCrypto} synds={synds} onSave={u=>saveItem(u,editItem._type)} onDelete={id=>deleteItem(id,editItem._type)} onClose={()=>setEditItem(null)}/>}
    </Sheet>
  </div>
}