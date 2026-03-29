import { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

// ═══════════════════════════════════════════════════════════════════
//  HARDASSETS.IO — Premium Web Dashboard
//  Design: Monarch Money × Copilot × Kubera (Desktop)
// ═══════════════════════════════════════════════════════════════════

const P = {
  bg: "#0B0F1A", surface: "#111827", elevated: "#1E293B",
  card: "rgba(17,24,39,0.72)", cardSolid: "#111827",
  border: "rgba(148,163,184,0.08)", borderLight: "rgba(148,163,184,0.12)",
  borderFocus: "rgba(212,168,67,0.3)",
  gold: "#D4A843", goldSoft: "rgba(212,168,67,0.1)", goldMed: "rgba(212,168,67,0.2)",
  green: "#34D399", greenSoft: "rgba(52,211,153,0.1)",
  red: "#F87171", redSoft: "rgba(248,113,113,0.1)",
  blue: "#60A5FA", blueSoft: "rgba(96,165,250,0.1)",
  purple: "#A78BFA", purpleSoft: "rgba(167,139,250,0.1)",
  cyan: "#22D3EE", orange: "#FB923C",
  text: "#F1F5F9", textSecondary: "#94A3B8", textMuted: "#475569", textFaint: "#334155",
};
const PIE_C = [P.gold, P.blue, P.green, P.purple, P.orange, P.cyan, "#EC4899", "#84CC16"];
const ff = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const mono = "'JetBrains Mono', 'SF Mono', monospace";

const fmt = (n) => {
  if (n == null || isNaN(n)) return "$0";
  const a = Math.abs(n), s = n < 0 ? "-" : "";
  if (a >= 1e9) return s + "$" + (a / 1e9).toFixed(2) + "B";
  if (a >= 1e6) return s + "$" + (a / 1e6).toFixed(2) + "M";
  if (a >= 1e3) return s + "$" + (a / 1e3).toFixed(1) + "K";
  return s + "$" + a.toFixed(2);
};
const fPct = (n) => (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
const sparkline = (base, pts = 40, vol = 0.012) => {
  let v = base;
  return Array.from({ length: pts }, (_, i) => { v += v * (Math.random() - 0.48) * vol; return { x: i, v }; });
};
const ozMap = { "1 oz":1,"1/2 oz":0.5,"1/4 oz":0.25,"1/10 oz":0.1,"1 kg":32.151,"10 oz":10,"100 oz":100,"Gram":0.03215 };

// ═══ REUSABLE COMPONENTS ═══

function GlassCard({ children, style, onClick }) {
  const [h, setH] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: P.card, backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)",
        border: `1px solid ${h && onClick ? P.borderLight : P.border}`, borderRadius: 20,
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        transform: h && onClick ? "translateY(-2px)" : "none",
        boxShadow: h && onClick ? "0 8px 32px rgba(0,0,0,0.2)" : "none",
        cursor: onClick ? "pointer" : "default", ...style }}>
      {children}
    </div>
  );
}

function MiniChart({ data, color = P.green, height = 44, width = 100 }) {
  const id = useMemo(() => "mc" + Math.random().toString(36).slice(2, 7), []);
  return (
    <ResponsiveContainer width={width} height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient></defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#${id})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function FormField({ label, value, onChange, type = "text", prefix, placeholder, isMono, style: s }) {
  return (
    <div style={{ marginBottom: 16, ...s }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: P.textSecondary, marginBottom: 8, letterSpacing: 0.2 }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", background: P.bg, border: `1px solid ${P.border}`, borderRadius: 12, overflow: "hidden" }}>
        {prefix && <span style={{ padding: "0 0 0 14px", color: P.textMuted, fontSize: 14, fontFamily: mono }}>{prefix}</span>}
        <input value={value} onChange={e => onChange(e.target.value)} type={type} placeholder={placeholder}
          style={{ flex: 1, background: "transparent", border: "none", color: P.text, fontSize: 14, padding: prefix ? "12px 14px 12px 6px" : "12px 14px", outline: "none", fontFamily: isMono ? mono : ff, width: "100%" }} />
      </div>
    </div>
  );
}

function FormSelect({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: P.textSecondary, marginBottom: 8 }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", background: P.bg, border: `1px solid ${P.border}`, borderRadius: 12, color: P.text, fontSize: 14, padding: "12px 14px", outline: "none", appearance: "none", fontFamily: ff }}>
        {options.map(o => <option key={o.value || o} value={o.value || o} style={{ background: P.surface }}>{o.label || o}</option>)}
      </select>
    </div>
  );
}

function Btn({ children, onClick, variant = "gold", full, style: s }) {
  const base = { border: "none", borderRadius: 14, padding: "14px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: ff, transition: "all 0.2s", width: full ? "100%" : "auto" };
  const variants = {
    gold: { ...base, background: `linear-gradient(135deg, ${P.gold}, #B8912E)`, color: P.bg, boxShadow: `0 4px 20px rgba(212,168,67,0.2)` },
    ghost: { ...base, background: "transparent", color: P.textSecondary, border: `1px solid ${P.border}` },
    danger: { ...base, background: P.redSoft, color: P.red, border: `1px solid rgba(248,113,113,0.15)` },
    soft: { ...base, background: P.goldSoft, color: P.gold, border: `1px solid ${P.goldMed}`, padding: "10px 18px", fontSize: 13 },
  };
  return <button onClick={onClick} style={{ ...(variants[variant] || variants.gold), ...s }}>{children}</button>;
}

function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} />
      <div style={{ position: "relative", background: P.surface, borderRadius: 24, width: "100%", maxWidth: wide ? 700 : 480, maxHeight: "85vh", overflow: "auto", animation: "modalIn 0.25s ease" }}>
        <div style={{ padding: "20px 28px 16px", borderBottom: `1px solid ${P.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: P.surface, zIndex: 2, borderRadius: "24px 24px 0 0" }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: P.text }}>{title}</span>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 16, background: P.elevated, border: "none", color: P.textSecondary, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: "20px 28px 28px" }}>{children}</div>
      </div>
    </div>
  );
}

// ═══ PRICE ROW ═══
function PriceRow({ label, value, change, color, spark }) {
  const up = change >= 0;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: `1px solid ${P.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 15, fontWeight: 700, color }}>{label.slice(0, 2)}</span>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: P.text }}>{label}</div>
          <div style={{ fontSize: 12, color: up ? P.green : P.red, fontWeight: 600, fontFamily: mono }}>{fPct(change)}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {spark && <MiniChart data={spark} color={up ? P.green : P.red} height={36} width={80} />}
        <div style={{ fontSize: 17, fontWeight: 700, color: P.text, fontFamily: mono, minWidth: 90, textAlign: "right" }}>
          {value > 999 ? "$" + Math.round(value).toLocaleString() : "$" + value.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

// ═══ HOLDING TABLE ROW ═══
function HoldingTableRow({ item, type, spotPrice, onTap }) {
  const val = type === "metal" ? item.qty * (ozMap[item.unit] || 1) * (spotPrice || item.spot || 0)
    : type === "crypto" ? item.qty * (spotPrice || item.price || 0)
    : type === "synd" ? item.invested || 0 : item.value || 0;
  const cost = type === "metal" ? item.qty * (item.costPerUnit || 0) : type === "crypto" ? item.qty * (item.avgCost || 0) : item.invested || val;
  const gain = val - cost;
  const pct = cost > 0 ? (gain / cost) * 100 : 0;
  const up = gain >= 0;
  const spark = useMemo(() => sparkline(cost || val, 20, 0.01), [cost, val]);

  return (
    <div onClick={onTap} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 80px 1.2fr 1.2fr", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${P.border}`, cursor: "pointer", transition: "background 0.15s" }}
      onMouseEnter={e => e.currentTarget.style.background = P.surface} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: P.text }}>{item.name || item.metal || item.coin}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
          {type === "metal" && item.unit && <span style={{ fontSize: 10, color: P.textMuted, background: P.goldSoft, padding: "1px 7px", borderRadius: 5, fontWeight: 600 }}>{item.unit}</span>}
          {type === "synd" && item.strategy && <span style={{ fontSize: 10, color: P.blue, background: P.blueSoft, padding: "1px 7px", borderRadius: 5, fontWeight: 600 }}>{item.strategy}</span>}
          {type === "synd" && item.sponsor && <span style={{ fontSize: 10, color: P.textMuted }}>{item.sponsor}</span>}
          {type === "crypto" && <span style={{ fontSize: 10, color: P.purple, background: P.purpleSoft, padding: "1px 7px", borderRadius: 5, fontWeight: 600 }}>{item.coin}</span>}
        </div>
      </div>
      <div style={{ fontSize: 13, color: P.textSecondary, fontFamily: mono }}>
        {type === "metal" ? `${item.qty} × ${item.unit}` : type === "crypto" ? item.qty?.toFixed(4) : item.status || "—"}
      </div>
      <MiniChart data={spark} color={up ? P.green : P.red} height={28} width={70} />
      <div style={{ textAlign: "right", fontSize: 15, fontWeight: 700, color: P.text, fontFamily: mono }}>{fmt(val)}</div>
      <div style={{ textAlign: "right" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: up ? P.green : P.red, fontFamily: mono }}>{up ? "+" : ""}{fmt(gain)}</span>
        <span style={{ fontSize: 11, color: P.textMuted, marginLeft: 6, fontFamily: mono }}>{fPct(pct)}</span>
      </div>
    </div>
  );
}

// ═══ ADD FORMS ═══
function AddMetalForm({ onAdd, onClose, prices }) {
  const [f, sF] = useState({ metal:"Gold", unit:"1 oz", qty:"", costPerUnit:"", notes:"" });
  const spot = { Gold:prices.gold, Silver:prices.silver, Platinum:prices.platinum, Palladium:prices.palladium };
  return (<>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <FormSelect label="Metal" value={f.metal} onChange={v=>sF({...f,metal:v})} options={["Gold","Silver","Platinum","Palladium"]} />
      <FormSelect label="Unit Size" value={f.unit} onChange={v=>sF({...f,unit:v})} options={["1 oz","1/2 oz","1/4 oz","1/10 oz","1 kg","10 oz","100 oz","Gram"]} />
      <FormField label="Quantity" value={f.qty} onChange={v=>sF({...f,qty:v})} type="number" isMono />
      <FormField label="Cost / Unit" value={f.costPerUnit} onChange={v=>sF({...f,costPerUnit:v})} type="number" prefix="$" isMono />
    </div>
    {spot[f.metal] && <div style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 16px", background:P.goldSoft, borderRadius:12, marginBottom:16, border:`1px solid ${P.goldMed}` }}>
      <div style={{ width:6, height:6, borderRadius:3, background:P.gold }}/><span style={{ fontSize:13, color:P.textSecondary }}>Live spot</span>
      <span style={{ fontSize:14, fontWeight:700, color:P.gold, fontFamily:mono, marginLeft:"auto" }}>${spot[f.metal]?.toFixed(2)}/oz</span>
    </div>}
    <FormField label="Notes" value={f.notes} onChange={v=>sF({...f,notes:v})} placeholder="Optional" />
    <Btn full onClick={()=>{ if(f.qty){ onAdd({...f, qty:+f.qty, costPerUnit:+f.costPerUnit, spot:spot[f.metal]||0, name:f.metal+" "+f.unit, id:Date.now()}); onClose(); }}}>Add Holding</Btn>
  </>);
}

function AddSyndForm({ onAdd, onClose }) {
  const [f, sF] = useState({ name:"", sponsor:"", invested:"", expectedRate:"", strategy:"Multifamily", risk:"5", status:"Active" });
  return (<>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
      <FormField label="Deal Name" value={f.name} onChange={v=>sF({...f,name:v})} placeholder="e.g. Pinnacle West" />
      <FormField label="Sponsor" value={f.sponsor} onChange={v=>sF({...f,sponsor:v})} placeholder="e.g. Bergman" />
      <FormField label="Invested" value={f.invested} onChange={v=>sF({...f,invested:v})} type="number" prefix="$" isMono />
      <FormField label="Expected %" value={f.expectedRate} onChange={v=>sF({...f,expectedRate:v})} type="number" prefix="%" isMono />
      <FormSelect label="Strategy" value={f.strategy} onChange={v=>sF({...f,strategy:v})} options={["Multifamily","Office","Retail","Industrial","Hotel","BTR","Self-Storage","Student Housing","Senior Living","Mixed Use","Land","Data Center","Warehouse","Other"]} />
      <FormSelect label="Risk" value={f.risk} onChange={v=>sF({...f,risk:v})} options={[...Array(10)].map((_,i)=>({value:String(i+1),label:`${i+1}`}))} />
    </div>
    <Btn full onClick={()=>{ if(f.name&&f.invested){ onAdd({...f, invested:+f.invested, expectedRate:+f.expectedRate, risk:+f.risk, id:Date.now()}); onClose(); }}}>Add Syndication</Btn>
  </>);
}

function AddCryptoForm({ onAdd, onClose, prices }) {
  const [f, sF] = useState({ coin:"BTC", qty:"", avgCost:"" });
  const spot = { BTC:prices.btc, ETH:prices.eth, SOL:prices.sol };
  return (<>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
      <FormSelect label="Coin" value={f.coin} onChange={v=>sF({...f,coin:v})} options={["BTC","ETH","SOL","ADA","DOT","AVAX","LINK","MATIC","XRP","DOGE","ATOM","UNI","AAVE"]} />
      <FormField label="Quantity" value={f.qty} onChange={v=>sF({...f,qty:v})} type="number" isMono />
      <FormField label="Avg Cost" value={f.avgCost} onChange={v=>sF({...f,avgCost:v})} type="number" prefix="$" isMono />
    </div>
    {spot[f.coin] && <div style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 16px", background:P.purpleSoft, borderRadius:12, marginBottom:16, border:`1px solid rgba(167,139,250,0.15)` }}>
      <div style={{ width:6, height:6, borderRadius:3, background:P.purple }}/><span style={{ fontSize:13, color:P.textSecondary }}>Live price</span>
      <span style={{ fontSize:14, fontWeight:700, color:P.purple, fontFamily:mono, marginLeft:"auto" }}>${Math.round(spot[f.coin]).toLocaleString()}</span>
    </div>}
    <Btn full onClick={()=>{ if(f.qty){ onAdd({...f, qty:+f.qty, avgCost:+f.avgCost, coin:f.coin, name:f.coin, price:spot[f.coin]||+f.avgCost, id:Date.now()}); onClose(); }}}>Add Coin</Btn>
  </>);
}

// ═══ DEAL ANALYZER ═══
function DealAnalyzer() {
  const [d, sD] = useState({ price:"",rent:"",tax:"",insurance:"",maintenance:"",vacancy:"8",mgmt:"10",downPct:"25",rate:"7",term:"30" });
  const price=+d.price||0,rent=+d.rent||0,tax=+d.tax||0,ins=+d.insurance||0,maint=+d.maintenance||0;
  const down=price*(+d.downPct/100), loan=price-down;
  const mr=(+d.rate/100)/12, n=+d.term*12;
  const mortgage=mr>0?loan*(mr*Math.pow(1+mr,n))/(Math.pow(1+mr,n)-1):0;
  const gross=rent*12, vac=gross*(+d.vacancy/100), eff=gross-vac, mgmtC=eff*(+d.mgmt/100);
  const noi=eff-tax-ins-(maint*12)-mgmtC, cf=noi-(mortgage*12), mcf=cf/12;
  const cap=price>0?(noi/price)*100:0, coc=down>0?(cf/down)*100:0, dscr=mortgage>0?noi/(mortgage*12):0;
  const tests=[{name:"Cap Rate",val:cap.toFixed(1)+"%",pass:cap>=6,tgt:"≥ 6%"},{name:"CoC Return",val:coc.toFixed(1)+"%",pass:coc>=8,tgt:"≥ 8%"},{name:"DSCR",val:dscr.toFixed(2),pass:dscr>=1.25,tgt:"≥ 1.25"},{name:"Monthly CF",val:fmt(mcf),pass:mcf>0,tgt:"> $0"}];

  return (
    <div style={{ display: "grid", gridTemplateColumns: price > 0 ? "1fr 1fr" : "1fr", gap: 20 }}>
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: P.text, marginBottom: 20 }}>Property Details</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Purchase Price" value={d.price} onChange={v=>sD({...d,price:v})} prefix="$" isMono />
          <FormField label="Monthly Rent" value={d.rent} onChange={v=>sD({...d,rent:v})} prefix="$" isMono />
          <FormField label="Annual Tax" value={d.tax} onChange={v=>sD({...d,tax:v})} prefix="$" isMono />
          <FormField label="Insurance/yr" value={d.insurance} onChange={v=>sD({...d,insurance:v})} prefix="$" isMono />
          <FormField label="Maint./mo" value={d.maintenance} onChange={v=>sD({...d,maintenance:v})} prefix="$" isMono />
          <FormField label="Vacancy %" value={d.vacancy} onChange={v=>sD({...d,vacancy:v})} prefix="%" isMono />
          <FormField label="Down %" value={d.downPct} onChange={v=>sD({...d,downPct:v})} prefix="%" isMono />
          <FormField label="Rate %" value={d.rate} onChange={v=>sD({...d,rate:v})} prefix="%" isMono />
        </div>
      </GlassCard>

      {price > 0 && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {tests.map((t,i) => (
              <GlassCard key={i} style={{ padding: "18px 20px", borderColor: t.pass ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.12)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: P.textSecondary }}>{t.name}</span>
                  <span style={{ fontSize: 10, color: P.textMuted }}>{t.tgt}</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: t.pass ? P.green : P.red, fontFamily: mono }}>{t.val}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: t.pass ? P.green : P.red, marginTop: 6 }}>{t.pass ? "✓ Pass" : "✗ Fail"}</div>
              </GlassCard>
            ))}
          </div>
          <GlassCard style={{ padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: P.text, marginBottom: 14 }}>Cash Flow Summary</div>
            {[["Gross Income",gross],["Vacancy",-vac],["NOI",noi,true],["Mortgage/yr",-(mortgage*12)],["Annual CF",cf,true],["Monthly CF",mcf,true]].map(([l,v,bold],i)=>(
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderTop:bold?`1px solid ${P.border}`:"none" }}>
                <span style={{ fontSize:13, color:bold?P.text:P.textSecondary, fontWeight:bold?600:400 }}>{l}</span>
                <span style={{ fontSize:14, fontWeight:bold?700:500, color:v>=0?(bold?P.green:P.text):P.red, fontFamily:mono }}>{fmt(v)}</span>
              </div>
            ))}
          </GlassCard>
        </div>
      )}
    </div>
  );
}

// ═══ PORTFOLIO VIEW ═══
function PortfolioView({ metals, synds, crypto, prices }) {
  const spotMap={Gold:prices.gold,Silver:prices.silver,Platinum:prices.platinum,Palladium:prices.palladium};
  const cSpot={BTC:prices.btc,ETH:prices.eth,SOL:prices.sol};
  const mT=metals.reduce((s,m)=>s+m.qty*(ozMap[m.unit]||1)*(spotMap[m.metal]||m.spot||0),0);
  const sT=synds.reduce((s,x)=>s+(x.invested||0),0);
  const cT=crypto.reduce((s,x)=>s+x.qty*(cSpot[x.coin]||x.price||0),0);
  const total=mT+sT+cT;
  const alloc=[{name:"Precious Metals",value:mT,color:P.gold},{name:"Real Estate",value:sT,color:P.blue},{name:"Crypto",value:cT,color:P.purple}].filter(d=>d.value>0);
  const totalCost=metals.reduce((s,m)=>s+m.qty*(m.costPerUnit||0),0)+synds.reduce((s,x)=>s+(x.invested||0),0)+crypto.reduce((s,x)=>s+x.qty*(x.avgCost||0),0);
  const totalGain=total-totalCost, totalPct=totalCost>0?(totalGain/totalCost*100):0;
  const income=synds.reduce((s,x)=>s+(x.invested*(x.expectedRate||0)/100),0);
  const avgRisk=(()=>{const r=synds.filter(x=>x.risk);return r.length?(r.reduce((s,x)=>s+ +x.risk,0)/r.length).toFixed(1):"—";})();
  const hist=useMemo(()=>sparkline(totalCost||total*0.85,80,0.006),[totalCost,total]);

  return (
    <div>
      {/* Hero + Chart Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: 20, marginBottom: 20 }}>
        <GlassCard style={{ padding: 28, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: 13, color: P.textSecondary, fontWeight: 500, marginBottom: 10 }}>Total Portfolio</div>
          <div style={{ fontSize: 40, fontWeight: 800, color: P.text, fontFamily: mono, letterSpacing: -2, lineHeight: 1 }}>{fmt(total)}</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14, padding: "6px 14px", borderRadius: 20, background: totalGain >= 0 ? P.greenSoft : P.redSoft, alignSelf: "flex-start" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: totalGain >= 0 ? P.green : P.red, fontFamily: mono }}>{totalGain >= 0 ? "↑" : "↓"} {fmt(Math.abs(totalGain))} ({fPct(totalPct)})</span>
          </div>
          <div style={{ display: "flex", gap: 28, marginTop: 24 }}>
            {[{l:"Income/yr",v:fmt(income),c:P.green},{l:"Avg Risk",v:avgRisk+"/10",c:P.orange},{l:"Assets",v:String(metals.length+synds.length+crypto.length),c:P.blue}].map((m,i)=>(
              <div key={i}><div style={{ fontSize: 10, color: P.textMuted, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>{m.l}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: m.c, fontFamily: mono }}>{m.v}</div></div>
            ))}
          </div>
        </GlassCard>

        <GlassCard style={{ padding: "20px 16px 8px" }}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={hist} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs><linearGradient id="pG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={P.gold} stopOpacity={0.2} /><stop offset="100%" stopColor={P.gold} stopOpacity={0} />
              </linearGradient></defs>
              <XAxis dataKey="x" hide /><YAxis hide />
              <Tooltip contentStyle={{ background: P.elevated, border: `1px solid ${P.border}`, borderRadius: 12, fontSize: 13, fontFamily: mono }} formatter={v => fmt(v)} labelFormatter={() => ""} />
              <Area type="monotone" dataKey="v" stroke={P.gold} strokeWidth={2} fill="url(#pG)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Allocation row */}
      {alloc.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <GlassCard style={{ padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: P.text, marginBottom: 18 }}>Allocation</div>
            <div style={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", marginBottom: 20 }}>
              {alloc.map((d, i) => <div key={i} style={{ flex: d.value, background: d.color, transition: "flex 0.5s" }} />)}
            </div>
            {alloc.map((d, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < alloc.length - 1 ? `1px solid ${P.border}` : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 4, background: d.color }} />
                  <span style={{ fontSize: 14, color: P.text, fontWeight: 500 }}>{d.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: P.text, fontFamily: mono }}>{fmt(d.value)}</span>
                  <span style={{ fontSize: 12, color: P.textMuted, fontFamily: mono, minWidth: 48, textAlign: "right" }}>{total ? (d.value / total * 100).toFixed(1) : 0}%</span>
                </div>
              </div>
            ))}
          </GlassCard>
          <GlassCard style={{ padding: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 200, height: 200, position: "relative" }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={alloc} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} strokeWidth={0} cornerRadius={4}>
                    {alloc.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 10, color: P.textMuted, fontWeight: 600, letterSpacing: 1 }}>TOTAL</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: P.text, fontFamily: mono }}>{fmt(total)}</div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

// ═══ MAIN APP ═══
export default function HardAssetsDashboard() {
  const [tab, setTab] = useState("portfolio");
  const [modal, setModal] = useState(null);
  const [detail, setDetail] = useState(null);
  const [sideCollapsed, setSideCollapsed] = useState(false);

  const [metals, setMetals] = useState([
    { id:1,metal:"Gold",name:"American Eagle 1oz",unit:"1 oz",qty:10,costPerUnit:1950,spot:3015,risk:2 },
    { id:2,metal:"Gold",name:"100oz Gold Bar",unit:"100 oz",qty:2,costPerUnit:185000,spot:3015,risk:2 },
    { id:3,metal:"Silver",name:"Silver Maple Leaf",unit:"1 oz",qty:500,costPerUnit:26,spot:33.8,risk:3 },
    { id:4,metal:"Platinum",name:"Platinum Eagle",unit:"1 oz",qty:20,costPerUnit:920,spot:1015,risk:4 },
  ]);
  const [synds, setSynds] = useState([
    { id:1,name:"Pinnacle West",sponsor:"Bergman",invested:100000,expectedRate:8,strategy:"Multifamily",risk:5,status:"Active" },
    { id:2,name:"Avery Portorosa",sponsor:"Klein",invested:300000,expectedRate:12,strategy:"Hotel",risk:7,status:"Active" },
    { id:3,name:"Takoma Towers",sponsor:"Biderman",invested:150000,expectedRate:6,strategy:"Multifamily",risk:8,status:"Active" },
  ]);
  const [crypto, setCrypto] = useState([
    { id:1,coin:"BTC",name:"Bitcoin",qty:1.5,avgCost:42000,price:87240 },
    { id:2,coin:"ETH",name:"Ethereum",qty:12,avgCost:2800,price:2050 },
    { id:3,coin:"SOL",name:"Solana",qty:100,avgCost:95,price:140 },
  ]);
  const [prices] = useState({ gold:3015,silver:33.8,platinum:1015,palladium:985,goldChg:0.42,silverChg:1.1,platChg:-0.3,btc:87240,eth:2050,sol:140,btcChg:2.1,ethChg:-0.8,solChg:3.4 });

  const goldS=useMemo(()=>sparkline(2850,30,0.008),[]);
  const silverS=useMemo(()=>sparkline(30,30,0.012),[]);
  const btcS=useMemo(()=>sparkline(78000,30,0.02),[]);
  const ethS=useMemo(()=>sparkline(2400,30,0.018),[]);

  const NAV = [
    { key:"portfolio", label:"Portfolio", icon:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { key:"metals", label:"Precious Metals", icon:"M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
    { key:"realestate", label:"Real Estate", icon:"M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    { key:"crypto", label:"Crypto", icon:"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { key:"analyzer", label:"Deal Analyzer", icon:"M9 7h6m0 10v-3m-3 3v-6m-3 6v-1m6-9a2 2 0 012 2v8a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2" },
  ];

  const renderContent = () => {
    const spotMap={Gold:prices.gold,Silver:prices.silver,Platinum:prices.platinum,Palladium:prices.palladium};
    const cSpot={BTC:prices.btc,ETH:prices.eth,SOL:prices.sol};

    switch (tab) {
      case "portfolio":
        return <PortfolioView metals={metals} synds={synds} crypto={crypto} prices={prices} />;

      case "metals":
        return (<div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:20, marginBottom:20 }}>
            <GlassCard style={{ padding:"16px 20px" }}>
              <PriceRow label="Gold" value={prices.gold} change={prices.goldChg} color={P.gold} spark={goldS}/>
              <PriceRow label="Silver" value={prices.silver} change={prices.silverChg} color={P.textSecondary} spark={silverS}/>
              <PriceRow label="Platinum" value={prices.platinum} change={prices.platChg} color={P.cyan}/>
              <div style={{ borderBottom:"none" }}/>
            </GlassCard>
            <GlassCard style={{ overflow:"hidden" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px 0" }}>
                <span style={{ fontSize:16, fontWeight:700, color:P.text }}>Holdings</span>
                <Btn variant="soft" onClick={()=>setModal("addMetal")}>+ Add Metal</Btn>
              </div>
              <div style={{ padding:"8px 0 0" }}>
                <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 80px 1.2fr 1.2fr", padding:"10px 20px", borderBottom:`1px solid ${P.border}` }}>
                  {["Name","Details","","Value","Gain/Loss"].map(h=><span key={h} style={{ fontSize:11, fontWeight:600, color:P.textMuted, letterSpacing:0.3, textTransform:"uppercase", textAlign:h==="Value"||h==="Gain/Loss"?"right":"left" }}>{h}</span>)}
                </div>
                {metals.map(m=><HoldingTableRow key={m.id} item={m} type="metal" spotPrice={spotMap[m.metal]} onTap={()=>setDetail({...m,_type:"metal"})}/>)}
              </div>
            </GlassCard>
          </div>
        </div>);

      case "realestate":
        return (<div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:20 }}>
            {synds.length > 0 && (()=>{
              const by={}; synds.forEach(s=>{by[s.strategy]=(by[s.strategy]||0)+s.invested});
              const data=Object.entries(by).map(([name,value],i)=>({name,value,fill:PIE_C[i%PIE_C.length]}));
              return <GlassCard style={{ padding:24 }}>
                <div style={{ fontSize:14, fontWeight:700, color:P.text, marginBottom:16 }}>By Strategy</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data} layout="vertical" margin={{top:0,right:0,bottom:0,left:0}}>
                    <XAxis type="number" hide/><YAxis type="category" dataKey="name" tick={{fontSize:12,fill:P.textSecondary}} axisLine={false} tickLine={false} width={80}/>
                    <Tooltip contentStyle={{background:P.elevated,border:`1px solid ${P.border}`,borderRadius:12,fontSize:12,fontFamily:mono}} formatter={v=>fmt(v)}/>
                    <Bar dataKey="value" radius={[0,6,6,0]}>{data.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </GlassCard>;
            })()}
            <GlassCard style={{ overflow:"hidden" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px 0" }}>
                <span style={{ fontSize:16, fontWeight:700, color:P.text }}>Syndications</span>
                <Btn variant="soft" onClick={()=>setModal("addSynd")} style={{ background:P.blueSoft, color:P.blue, borderColor:"rgba(96,165,250,0.15)" }}>+ Add Deal</Btn>
              </div>
              <div style={{ padding:"8px 0 0" }}>
                <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 80px 1.2fr 1.2fr", padding:"10px 20px", borderBottom:`1px solid ${P.border}` }}>
                  {["Name","Status","","Value","Gain/Loss"].map(h=><span key={h} style={{ fontSize:11, fontWeight:600, color:P.textMuted, letterSpacing:0.3, textTransform:"uppercase", textAlign:h==="Value"||h==="Gain/Loss"?"right":"left" }}>{h}</span>)}
                </div>
                {synds.map(s=><HoldingTableRow key={s.id} item={s} type="synd" onTap={()=>setDetail({...s,_type:"synd"})}/>)}
              </div>
            </GlassCard>
          </div>
        </div>);

      case "crypto":
        return (<div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:20 }}>
            <GlassCard style={{ padding:"16px 20px" }}>
              <PriceRow label="Bitcoin" value={prices.btc} change={prices.btcChg} color={P.orange} spark={btcS}/>
              <PriceRow label="Ethereum" value={prices.eth} change={prices.ethChg} color={P.blue} spark={ethS}/>
              <PriceRow label="Solana" value={prices.sol} change={prices.solChg} color={P.purple}/>
            </GlassCard>
            <GlassCard style={{ overflow:"hidden" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px 0" }}>
                <span style={{ fontSize:16, fontWeight:700, color:P.text }}>Holdings</span>
                <Btn variant="soft" onClick={()=>setModal("addCrypto")} style={{ background:P.purpleSoft, color:P.purple, borderColor:"rgba(167,139,250,0.15)" }}>+ Add Coin</Btn>
              </div>
              <div style={{ padding:"8px 0 0" }}>
                <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 80px 1.2fr 1.2fr", padding:"10px 20px", borderBottom:`1px solid ${P.border}` }}>
                  {["Name","Quantity","","Value","Gain/Loss"].map(h=><span key={h} style={{ fontSize:11, fontWeight:600, color:P.textMuted, letterSpacing:0.3, textTransform:"uppercase", textAlign:h==="Value"||h==="Gain/Loss"?"right":"left" }}>{h}</span>)}
                </div>
                {crypto.map(c=><HoldingTableRow key={c.id} item={c} type="crypto" spotPrice={cSpot[c.coin]} onTap={()=>setDetail({...c,_type:"crypto"})}/>)}
              </div>
            </GlassCard>
          </div>
        </div>);

      case "analyzer":
        return <DealAnalyzer />;
      default: return null;
    }
  };

  return (
    <div style={{ fontFamily: ff, background: P.bg, color: P.text, minHeight: "100vh", display: "flex" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        @keyframes modalIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}
        *{box-sizing:border-box} ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:${P.textFaint};border-radius:3px}
        input::placeholder{color:${P.textFaint}} select option{background:${P.surface}}
      `}</style>

      {/* ═══ SIDEBAR ═══ */}
      <div style={{ width: sideCollapsed ? 72 : 240, minHeight: "100vh", background: P.surface, borderRight: `1px solid ${P.border}`, display: "flex", flexDirection: "column", transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)", overflow: "hidden", position: "sticky", top: 0, flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: sideCollapsed ? "20px 16px" : "20px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${P.border}`, cursor: "pointer" }} onClick={() => setSideCollapsed(!sideCollapsed)}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(145deg, ${P.gold}, #B8912E)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 900, color: P.bg, flexShrink: 0, boxShadow: `0 4px 16px rgba(212,168,67,0.2)` }}>H</div>
          {!sideCollapsed && <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: P.text, letterSpacing: -0.4, whiteSpace: "nowrap" }}>HardAssets</div>
            <div style={{ fontSize: 9, color: P.textMuted, letterSpacing: 2, textTransform: "uppercase" }}>Portfolio Intelligence</div>
          </div>}
        </div>

        {/* Nav Items */}
        <div style={{ padding: "12px 8px", flex: 1 }}>
          {NAV.map(n => {
            const active = tab === n.key;
            return (
              <button key={n.key} onClick={() => setTab(n.key)} style={{
                display: "flex", alignItems: "center", gap: 12, width: "100%", padding: sideCollapsed ? "12px 16px" : "12px 16px",
                border: "none", borderRadius: 12, cursor: "pointer", marginBottom: 4, fontFamily: ff,
                background: active ? P.goldSoft : "transparent",
                transition: "all 0.2s",
              }}>
                <div style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? P.gold : P.textMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={n.icon}/></svg>
                </div>
                {!sideCollapsed && <span style={{ fontSize: 14, fontWeight: active ? 600 : 500, color: active ? P.gold : P.textSecondary, whiteSpace: "nowrap" }}>{n.label}</span>}
              </button>
            );
          })}
        </div>

        {/* User */}
        <div style={{ padding: sideCollapsed ? "16px" : "16px 20px", borderTop: `1px solid ${P.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(145deg, ${P.elevated}, ${P.surface})`, border: `1px solid ${P.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: P.gold }}>C</span>
          </div>
          {!sideCollapsed && <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: P.text }}>Chaim</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: P.green, boxShadow: `0 0 6px ${P.green}` }} />
              <span style={{ fontSize: 11, color: P.textMuted }}>Synced</span>
            </div>
          </div>}
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Top bar */}
        <div style={{ padding: "16px 32px", borderBottom: `1px solid ${P.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: `${P.bg}F0`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", zIndex: 50 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: P.text, letterSpacing: -0.5 }}>{NAV.find(n => n.key === tab)?.label}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Live prices ticker */}
            {[{l:"XAU",v:prices.gold,c:prices.goldChg},{l:"BTC",v:prices.btc,c:prices.btcChg},{l:"ETH",v:prices.eth,c:prices.ethChg}].map(p=>(
              <div key={p.l} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:11, fontWeight:700, color:P.textMuted, letterSpacing:0.5 }}>{p.l}</span>
                <span style={{ fontSize:13, fontWeight:600, color:P.text, fontFamily:mono }}>{p.v>999?"$"+Math.round(p.v).toLocaleString():"$"+p.v.toFixed(2)}</span>
                <span style={{ fontSize:11, fontWeight:600, color:p.c>=0?P.green:P.red, fontFamily:mono }}>{p.c>=0?"▲":"▼"}{Math.abs(p.c).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "24px 32px 60px" }}>
          {renderContent()}
        </div>
      </div>

      {/* ═══ MODALS ═══ */}
      <Modal open={modal==="addMetal"} onClose={()=>setModal(null)} title="Add Metal Holding">
        <AddMetalForm prices={prices} onAdd={m=>setMetals(p=>[...p,m])} onClose={()=>setModal(null)} />
      </Modal>
      <Modal open={modal==="addSynd"} onClose={()=>setModal(null)} title="Add Syndication">
        <AddSyndForm onAdd={s=>setSynds(p=>[...p,s])} onClose={()=>setModal(null)} />
      </Modal>
      <Modal open={modal==="addCrypto"} onClose={()=>setModal(null)} title="Add Crypto">
        <AddCryptoForm prices={prices} onAdd={c=>setCrypto(p=>[...p,c])} onClose={()=>setModal(null)} />
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!detail} onClose={()=>setDetail(null)} title={detail?.name||detail?.metal||detail?.coin||""}>
        {detail && (
          <div>
            {(()=>{
              const spotM={Gold:prices.gold,Silver:prices.silver,Platinum:prices.platinum,Palladium:prices.palladium};
              const cS={BTC:prices.btc,ETH:prices.eth,SOL:prices.sol};
              const t=detail._type;
              const val=t==="metal"?detail.qty*(ozMap[detail.unit]||1)*(spotM[detail.metal]||detail.spot||0):t==="crypto"?detail.qty*(cS[detail.coin]||detail.price||0):detail.invested||0;
              const cost=t==="metal"?detail.qty*(detail.costPerUnit||0):t==="crypto"?detail.qty*(detail.avgCost||0):detail.invested||val;
              const gain=val-cost, pct=cost>0?(gain/cost*100):0;
              return (
                <div style={{ textAlign:"center", padding:"8px 0 20px", borderBottom:`1px solid ${P.border}`, marginBottom:20 }}>
                  <div style={{ fontSize:36, fontWeight:800, color:P.text, fontFamily:mono, letterSpacing:-1 }}>{fmt(val)}</div>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:4, marginTop:10, padding:"5px 14px", borderRadius:20, background:gain>=0?P.greenSoft:P.redSoft }}>
                    <span style={{ fontSize:14, fontWeight:700, color:gain>=0?P.green:P.red, fontFamily:mono }}>{gain>=0?"+":""}{fmt(gain)} ({fPct(pct)})</span>
                  </div>
                </div>
              );
            })()}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
              {Object.entries(detail).filter(([k])=>!k.startsWith("_")&&k!=="id").map(([k,v])=>(
                <div key={k} style={{ padding:"12px 16px", background:P.bg, borderRadius:12, border:`1px solid ${P.border}` }}>
                  <div style={{ fontSize:11, color:P.textMuted, fontWeight:600, letterSpacing:0.3, textTransform:"uppercase", marginBottom:4 }}>{k.replace(/([A-Z])/g," $1")}</div>
                  <div style={{ fontSize:14, fontWeight:600, color:P.text, fontFamily:typeof v==="number"?mono:ff }}>{typeof v==="number"?(v>100?fmt(v):v):String(v)}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:12 }}>
              <Btn variant="danger" full onClick={()=>{
                const t=detail._type;
                if(t==="metal") setMetals(p=>p.filter(x=>x.id!==detail.id));
                if(t==="synd") setSynds(p=>p.filter(x=>x.id!==detail.id));
                if(t==="crypto") setCrypto(p=>p.filter(x=>x.id!==detail.id));
                setDetail(null);
              }}>Remove Holding</Btn>
              <Btn variant="ghost" full onClick={()=>setDetail(null)}>Close</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}