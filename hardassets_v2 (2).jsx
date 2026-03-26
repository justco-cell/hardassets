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
const STYPES=["Multifamily","Office","Industrial","Retail","Self-Storage","BTR","Mobile Home Parks","Mixed-Use","Hotels","Data Centers","Student Housing","Senior Living","Medical Office","Land","Debt/Credit Fund","Diversified"];
const ACLS=["Precious Metals","Real Estate","Equities","Crypto","Commodities","Fixed Income","Private Credit","Alternatives","Venture/PE","Cash","Other"];
const STS=["Active","Realized","Hold","Watchlist","Exited"];
const COINS=["BTC","ETH","SOL","ADA","DOT","AVAX","MATIC","LINK","XRP","DOGE","Other"];
const MFORMS=["1oz Coins","1oz Rounds","1oz Bars","5oz Bars","10oz Bars","100oz Bars","1kg Bars","Kilo Bars","Junk Silver","Numismatic","ETF/Fund","Other"];
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
function MetalsTab({data,sd,save}){
const[sa,sSa]=useState(false);const[ei,sEi]=useState(null);
const[f,sF]=useState({metal:"Gold",form:"1oz Coins",qty:"",costPer:"",spot:"",risk:"3",notes:""});
const it=data.metals||[];
const tC=it.reduce((s,h)=>s+h.qty*h.costPer,0);const tV=it.reduce((s,h)=>s+h.qty*h.spot,0);
const g=tV-tC;const gP=tC>0?(g/tC)*100:0;
const byM=it.reduce((a,h)=>{a[h.metal]=(a[h.metal]||0)+h.qty*h.spot;return a},{});
const pie=Object.entries(byM).map(([name,value])=>({name,value}));
const add=()=>{if(!f.form||!f.qty||!f.costPer||!f.spot)return;const u={...data,metals:[...it,{id:uid(),metal:f.metal,form:f.form,qty:+f.qty,costPer:+f.costPer,spot:+f.spot,risk:+f.risk||null,notes:f.notes}]};sd(u);save(u);sF({metal:"Gold",form:"1oz Coins",qty:"",costPer:"",spot:"",risk:"3",notes:""});sSa(false)};
const up=(id,k,v)=>{const u={...data,metals:it.map(h=>h.id===id?{...h,[k]:v}:h)};sd(u);save(u)};
const rm=id=>{const u={...data,metals:it.filter(h=>h.id!==id)};sd(u);save(u)};
const sE=()=>{if(!ei)return;const u={...data,metals:it.map(h=>h.id===ei.id?ei:h)};sd(u);save(u);sEi(null)};
return(<div>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
{[["Cost Basis",fmt(tC),T.txD],["Value",fmt(tV),T.gldB],["Gain/Loss",fmt(g),g>=0?T.grn:T.red],["Return",fP(gP),gP>=0?T.grn:T.red]].map(([l,v,c],i)=>
<Cd key={i}><div style={{fontSize:10,color:T.txM,textTransform:"uppercase",letterSpacing:1,fontFamily:"monospace"}}>{l}</div><div style={{fontSize:24,fontWeight:800,color:c,marginTop:4}}>{v}</div></Cd>
)}
</div>
<div style={{display:"flex",gap:16}}>
<div style={{flex:2}}>
<Hd right={<div style={{display:"flex",gap:6}}><Bt ghost sm onClick={()=>csvX(["Metal","Form","Qty","Cost","Spot","Value","Gain","Risk"],it.map(h=>[h.metal,h.form,h.qty,h.costPer,h.spot,h.qty*h.spot,(h.qty*h.spot)-(h.qty*h.costPer),h.risk||""]),"metals.csv")}>Export</Bt><Bt sm onClick={()=>sSa(true)}>+ Add</Bt></div>}>Holdings</Hd>
<Cd style={{padding:0,overflow:"hidden"}}>
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead><tr style={{borderBottom:"1px solid "+T.bdr}}>{["Metal","Form","Qty","Cost","Current","Value","Gain","Risk","",""].map((h,i)=><th key={i} style={{padding:"10px 8px",textAlign:"left",color:T.txM,fontSize:10,textTransform:"uppercase",fontFamily:"monospace"}}>{h}</th>)}</tr></thead>
<tbody>{it.map(h=>{const v=h.qty*h.spot,c=h.qty*h.costPer,gl=v-c;return(
<tr key={h.id} style={{borderBottom:"1px solid "+T.bdr+"22"}}>
<EC value={h.metal} onChange={v=>up(h.id,"metal",v)} color={h.metal==="Gold"?T.gld:T.txD}/>
<EC value={h.form} onChange={v=>up(h.id,"form",v)}/>
<EC value={h.qty} onChange={v=>up(h.id,"qty",v)} type="number"/>
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
<div><Lb>Metal</Lb><Sl value={f.metal} onChange={v=>sF({...f,metal:v})} options={["Gold","Silver","Platinum","Palladium"]} style={{width:"100%"}}/></div>
<div><Lb>Form</Lb><Sl value={f.form} onChange={v=>sF({...f,form:v})} options={MFORMS} style={{width:"100%"}}/></div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
<div><Lb>Qty</Lb><In value={f.qty} onChange={v=>sF({...f,qty:v})} type="number"/></div>
<div><Lb>Cost/Unit</Lb><In value={f.costPer} onChange={v=>sF({...f,costPer:v})} prefix="$" type="number"/></div>
<div><Lb>Current</Lb><In value={f.spot} onChange={v=>sF({...f,spot:v})} prefix="$" type="number"/></div>
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
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
<div><Lb>Qty</Lb><In value={ei.qty} onChange={v=>sEi({...ei,qty:+v})} type="number"/></div>
<div><Lb>Cost</Lb><In value={ei.costPer} onChange={v=>sEi({...ei,costPer:+v})} prefix="$" type="number"/></div>
<div><Lb>Current</Lb><In value={ei.spot} onChange={v=>sEi({...ei,spot:+v})} prefix="$" type="number"/></div>
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
const sE=()=>{if(!ei)return;const u={...data,syndications:it.map(d=>d.id===ei.id?ei:d)};sd(u);save(u);sEi(null)};
return(<div>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
{[["Total Invested",fmt(tI),T.txt],["Avg Rate",aR.toFixed(1)+"%",T.gldB],["Est. Annual Income",fmt(tInc),T.grn],["Avg Proj. IRR",aIRR.toFixed(1)+"%",T.blu]].map(([l,v,c],i)=>
<Cd key={i}><div style={{fontSize:10,color:T.txM,textTransform:"uppercase",letterSpacing:1,fontFamily:"monospace"}}>{l}</div><div style={{fontSize:24,fontWeight:800,color:c,marginTop:4}}>{v}</div></Cd>
)}
</div>
<div style={{display:"flex",gap:16}}>
<div style={{flex:2}}>
<Hd right={<div style={{display:"flex",gap:6}}><Bt ghost sm onClick={()=>csvX(["Deal","Sponsor","Type","Invested","Rate","AnnIncome","IRR","Risk","Status"],it.map(d=>[d.name,d.sponsor,d.type,d.invested,d.rate||0,Math.round(d.invested*(d.rate||0)/100),d.projIRR,d.risk||"",d.status]),"syndications.csv")}>Export</Bt><Bt sm onClick={()=>sSa(true)}>+ Add Deal</Bt></div>}>LP Positions</Hd>
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
function CryptoTab({data,sd,save}){
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
const sE=()=>{if(!ei)return;const u={...data,crypto:it.map(h=>h.id===ei.id?ei:h)};sd(u);save(u);sEi(null)};
return(<div>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
{[["Cost Basis",fmt(tC),T.txD],["Value",fmt(tV),T.gldB],["Gain/Loss",fmt(g),g>=0?T.grn:T.red],["Return",fP(gP),gP>=0?T.grn:T.red]].map(([l,v,c],i)=>
<Cd key={i}><div style={{fontSize:10,color:T.txM,textTransform:"uppercase",letterSpacing:1,fontFamily:"monospace"}}>{l}</div><div style={{fontSize:24,fontWeight:800,color:c,marginTop:4}}>{v}</div></Cd>
)}
</div>
<div style={{display:"flex",gap:16}}>
<div style={{flex:2}}>
<Hd right={<div style={{display:"flex",gap:6}}><Bt ghost sm onClick={()=>csvX(["Coin","Name","Qty","Cost","Current","Value","Gain","Risk"],it.map(h=>[h.coin,h.name,h.qty,h.costPer,h.current,h.qty*h.current,(h.qty*h.current)-(h.qty*h.costPer),h.risk||""]),"crypto.csv")}>Export</Bt><Bt sm onClick={()=>sSa(true)}>+ Add</Bt></div>}>Crypto Holdings</Hd>
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
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><div><Lb>Coin</Lb><Sl value={f.coin} onChange={v=>sF({...f,coin:v})} options={COINS} style={{width:"100%"}}/></div><div><Lb>Name</Lb><In value={f.name} onChange={v=>sF({...f,name:v})}/></div></div>
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
<Hd right={<div style={{display:"flex",gap:6}}><Bt ghost sm onClick={()=>csvX(["Class","Name","Value","Risk","Notes"],it.map(a=>[a.cls,a.name,a.value,a.risk||"",a.notes||""]),"portfolio.csv")}>Export</Bt><Bt sm onClick={()=>sSa(true)}>+ Add</Bt></div>}>Breakdown</Hd>
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
function HomePage({onNav}){
return (<div style={{background:T.bg,minHeight:"100vh",color:T.txt,fontFamily:"system-ui,sans-serif"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 40px",borderBottom:"1px solid "+T.bdr}}><Lg/><div style={{display:"flex",gap:20,alignItems:"center"}}><button onClick={()=>onNav("contact")} style={{background:"none",border:"none",color:T.txD,fontSize:13,cursor:"pointer"}}>Contact</button><button onClick={()=>onNav("login")} style={{background:"none",border:"none",color:T.gld,fontSize:13,cursor:"pointer",fontWeight:600}}>Login</button><Bt onClick={()=>onNav("login")}>Get Started Free</Bt></div></div>
<div style={{textAlign:"center",padding:"80px 40px 40px"}}><div style={{fontSize:11,color:T.gld,textTransform:"uppercase",letterSpacing:3,fontWeight:700,marginBottom:16}}>The Portfolio Dashboard for Real Asset Investors</div><h1 style={{fontSize:46,fontWeight:900,lineHeight:1.1,margin:"0 auto",maxWidth:650}}>Track Everything That <span style={{color:T.gld}}>Holds Value</span></h1><p style={{fontSize:16,color:T.txD,maxWidth:500,margin:"20px auto 0",lineHeight:1.6}}>Gold. Silver. Real estate syndications. Crypto. Commodities. One dashboard for hard asset investors.</p><div style={{marginTop:28,display:"flex",gap:12,justifyContent:"center"}}><Bt onClick={()=>onNav("login")} style={{padding:"14px 32px",fontSize:15}}>Start Tracking Free</Bt><Bt ghost onClick={()=>onNav("contact")} style={{padding:"14px 32px",fontSize:15}}>Contact Us</Bt></div></div>
<div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,padding:"20px 40px 40px",maxWidth:1050,margin:"0 auto"}}>{[["Precious Metals","Track gold, silver, platinum"],["RE Syndications","LP positions, rate %, IRR"],["Deal Analyzer","Cash flow, cap rate, DSCR"],["Crypto","BTC, ETH, SOL tracker"],["Portfolio","Full allocation + risk"]].map(([t,d],i)=> <Cd key={i} style={{padding:16,textAlign:"center"}}><div style={{fontSize:13,fontWeight:700,color:T.txt,marginBottom:4}}>{t}</div><div style={{fontSize:11,color:T.txD,lineHeight:1.4}}>{d}</div></Cd>)}</div>
<div style={{borderTop:"1px solid "+T.bdr,padding:"18px 40px",display:"flex",justifyContent:"space-between",marginTop:20}}><span style={{fontSize:11,color:T.txM}}>2026 HardAssets.io</span><span style={{fontSize:11,color:T.txM}}>info@hardassets.io</span></div>
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
const gBtnRef=useRef(null);const gInitRef=useRef(false);
const onLoginRef=useRef(onLogin);
onLoginRef.current=onLogin;
useEffect(()=>{
if(gInitRef.current)return;
const tryInit=()=>{
if(!window.google||!window.google.accounts||!gBtnRef.current)return false;
window.google.accounts.id.initialize({
client_id:"159487463622-ol75fn02c9cg8gmd2h4bpk36gaga3rcf.apps.googleusercontent.com",
callback:(response)=>{
try{
const parts=response.credential.split(".");
const payload=JSON.parse(atob(parts[1].replace(/-/g,"+").replace(/_/g,"/")));
onLoginRef.current({email:payload.email,name:payload.name||payload.email.split("@")[0],picture:payload.picture,method:"google"});
}catch(e){console.log("JWT decode error",e)}
}
});
window.google.accounts.id.renderButton(gBtnRef.current,{theme:"outline",size:"large",width:340,text:"signin_with",shape:"rectangular"});
gInitRef.current=true;
return true;
};
if(tryInit())return;
const script=document.createElement("script");
script.src="https://accounts.google.com/gsi/client";
script.onload=()=>{setTimeout(tryInit,100)};
document.head.appendChild(script);
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
useEffect(()=>{
const s1=document.createElement("script");s1.src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js";
const s2=document.createElement("script");s2.src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js";
s1.onload=()=>{document.head.appendChild(s2)};
s2.onload=()=>{initFirebase()};
document.head.appendChild(s1);
},[]);
const handleLogin=useCallback(async(u)=>{
setUser(u);setPage("app");
if(u.email&&u.email!=="guest"){
setSyncing(true);
const tryLoad=async(retries)=>{
if(fbReady){try{const saved=await fbLoad(u.email);if(saved){setData(saved)}}catch(e){}}
else if(retries>0){await new Promise(r=>setTimeout(r,500));return tryLoad(retries-1)}
};
await tryLoad(10);
setSyncing(false);
}
},[]);
const save=useCallback(d=>{
sv("ha-v4",d);
if(user&&user.email&&user.email!=="guest"){fbSave(user.email,d)}
},[user]);
if(page==="home") return <HomePage onNav={setPage}/>;
if(page==="contact") return <ContactPg onNav={setPage}/>;
if(page==="login"&&!user) return <LoginPg onLogin={handleLogin} onBack={()=>setPage("home")}/>;
return (<div style={{background:T.bg,minHeight:"100vh",color:T.txt,fontFamily:"system-ui,-apple-system,sans-serif"}}>
<div style={{borderBottom:"1px solid "+T.bdr,padding:"12px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}><Lg onClick={()=>{setUser(null);setPage("home")}}/><div style={{display:"flex",alignItems:"center",gap:14}}>{syncing&&<span style={{fontSize:10,color:T.gld}}>Syncing...</span>}{user?.picture&&<img src={user.picture} style={{width:28,height:28,borderRadius:14}} referrerPolicy="no-referrer"/>}{user?.method==="google"&&!user?.picture&&<GIc/>}<span style={{fontSize:12,color:T.txt,fontWeight:600}}>{user?.name}</span>{fbReady&&<span style={{width:6,height:6,borderRadius:3,background:T.grn,display:"inline-block"}} title="Cloud sync active"/>}<button onClick={()=>{setUser(null);setPage("home")}} style={{background:"none",border:"1px solid "+T.bdr,color:T.txM,padding:"5px 10px",borderRadius:6,fontSize:11,cursor:"pointer"}}>Sign Out</button></div></div>
<div style={{display:"flex",borderBottom:"1px solid "+T.bdr,padding:"0 24px",background:T.bgC+"88",overflowX:"auto"}}>{TABS.map(t=> <button key={t.key} onClick={()=>setTab(t.key)} style={{background:"none",border:"none",color:tab===t.key?T.gld:T.txM,padding:"12px 16px",fontSize:12,fontWeight:tab===t.key?700:400,cursor:"pointer",borderBottom:tab===t.key?"2px solid "+T.gld:"2px solid transparent",whiteSpace:"nowrap"}}><span style={{marginRight:5}}>{t.icon}</span>{t.label}</button>)}</div>
<div style={{padding:"20px 24px",maxWidth:1200,margin:"0 auto"}}>{tab==="metals"&&<MetalsTab data={data} sd={setData} save={save}/>}{tab==="synd"&&<SyndTab data={data} sd={setData} save={save}/>}{tab==="crypto"&&<CryptoTab data={data} sd={setData} save={save}/>}{tab==="deal"&&<DealTab/>}{tab==="port"&&<PortTab data={data} sd={setData} save={save}/>}</div>
</div>);
}
