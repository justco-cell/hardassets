import { useState, useEffect, useCallback, useMemo } from "react";
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

// ═══════════════════════════════════════════════════════════════
//  HARDASSETS — Premium Fintech Portfolio Tracker
//  Design language: Monarch Money × Copilot × Kubera
// ═══════════════════════════════════════════════════════════════

const P = {
  bg: "#0B0F1A",
  surface: "#111827",
  surfaceHover: "#1A2235",
  elevated: "#1E293B",
  card: "rgba(17,24,39,0.72)",
  cardSolid: "#111827",
  glass: "rgba(30,41,59,0.45)",
  border: "rgba(148,163,184,0.08)",
  borderLight: "rgba(148,163,184,0.12)",
  borderFocus: "rgba(212,168,67,0.3)",
  gold: "#D4A843",
  goldSoft: "rgba(212,168,67,0.1)",
  goldMed: "rgba(212,168,67,0.2)",
  green: "#34D399",
  greenSoft: "rgba(52,211,153,0.1)",
  greenMed: "rgba(52,211,153,0.15)",
  red: "#F87171",
  redSoft: "rgba(248,113,113,0.1)",
  blue: "#60A5FA",
  blueSoft: "rgba(96,165,250,0.1)",
  purple: "#A78BFA",
  purpleSoft: "rgba(167,139,250,0.1)",
  cyan: "#22D3EE",
  orange: "#FB923C",
  text: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#475569",
  textFaint: "#334155",
  white: "#FFFFFF",
};
const PIE = [P.gold, P.blue, P.green, P.purple, P.orange, P.cyan, "#EC4899", "#84CC16"];

const FONT_INJECT = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');`;

const ff = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const mono = "'JetBrains Mono', 'SF Mono', monospace";

const fmt = (n) => {
  if (n == null || isNaN(n)) return "$0";
  const a = Math.abs(n);
  const s = n < 0 ? "-" : "";
  if (a >= 1e9) return s + "$" + (a / 1e9).toFixed(2) + "B";
  if (a >= 1e6) return s + "$" + (a / 1e6).toFixed(2) + "M";
  if (a >= 1e3) return s + "$" + (a / 1e3).toFixed(1) + "K";
  return s + "$" + a.toFixed(2);
};
const fPct = (n) => (n >= 0 ? "+" : "") + n.toFixed(2) + "%";

const sparkline = (base, pts = 30, vol = 0.015) => {
  let v = base;
  return Array.from({ length: pts }, (_, i) => {
    v += v * (Math.random() - 0.48) * vol;
    return { x: i, v: Math.max(v * 0.9, v) };
  });
};

// ═══ ATOMIC COMPONENTS ═══

function GlassCard({ children, style, onClick, hoverable }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => hoverable && setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: P.card, backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)",
        border: `1px solid ${hov ? P.borderLight : P.border}`, borderRadius: 20,
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        transform: hov ? "translateY(-1px)" : "none",
        cursor: onClick ? "pointer" : "default", ...style,
      }}>{children}</div>
  );
}

function MiniChart({ data, color = P.green, height = 40, width = 90 }) {
  const id = useMemo(() => "mc_" + Math.random().toString(36).slice(2, 8), []);
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

function PriceTag({ label, value, change, color, spark }) {
  const up = change >= 0;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${P.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color }}>{label.slice(0, 2)}</span>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: P.text }}>{label}</div>
          <div style={{ fontSize: 12, color: up ? P.green : P.red, fontWeight: 600, fontFamily: mono }}>{fPct(change)}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {spark && <MiniChart data={spark} color={up ? P.green : P.red} />}
        <div style={{ fontSize: 16, fontWeight: 700, color: P.text, fontFamily: mono, minWidth: 75, textAlign: "right" }}>
          {value > 999 ? "$" + Math.round(value).toLocaleString() : "$" + value.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

function BottomSheet({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }} />
      <div style={{ position: "relative", background: P.surface, borderRadius: "28px 28px 0 0", maxHeight: "88vh", overflow: "auto", animation: "sheetUp 0.35s cubic-bezier(0.32,0.72,0,1)" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: P.textFaint }} />
        </div>
        <div style={{ padding: "12px 24px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: P.text, letterSpacing: -0.3 }}>{title}</span>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 16, background: P.elevated, border: "none", color: P.textSecondary, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: "8px 24px 40px" }}>{children}</div>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, type = "text", prefix, placeholder, isMono }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: P.textSecondary, marginBottom: 8, letterSpacing: 0.2 }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", background: P.bg, border: `1px solid ${P.border}`, borderRadius: 14, overflow: "hidden", transition: "border-color 0.2s" }}>
        {prefix && <span style={{ padding: "0 0 0 16px", color: P.textMuted, fontSize: 14, fontFamily: mono, userSelect: "none" }}>{prefix}</span>}
        <input value={value} onChange={e => onChange(e.target.value)} type={type} placeholder={placeholder}
          style={{ flex: 1, background: "transparent", border: "none", color: P.text, fontSize: 15, padding: prefix ? "14px 16px 14px 8px" : "14px 16px", outline: "none", fontFamily: isMono ? mono : ff, width: "100%" }} />
      </div>
    </div>
  );
}

function FormSelect({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: P.textSecondary, marginBottom: 8, letterSpacing: 0.2 }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", background: P.bg, border: `1px solid ${P.border}`, borderRadius: 14, color: P.text, fontSize: 15, padding: "14px 16px", outline: "none", appearance: "none", fontFamily: ff }}>
        {options.map(o => <option key={o.value || o} value={o.value || o} style={{ background: P.surface }}>{o.label || o}</option>)}
      </select>
    </div>
  );
}

function PrimaryButton({ children, onClick, full, variant = "gold" }) {
  const styles = {
    gold: { background: `linear-gradient(135deg, ${P.gold}, #B8912E)`, color: "#0B0F1A", boxShadow: `0 4px 20px rgba(212,168,67,0.25)` },
    ghost: { background: "transparent", color: P.textSecondary, border: `1px solid ${P.border}` },
    danger: { background: P.redSoft, color: P.red, border: `1px solid rgba(248,113,113,0.2)` },
  };
  return <button onClick={onClick} style={{ border: "none", borderRadius: 16, padding: "16px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", width: full ? "100%" : "auto", fontFamily: ff, letterSpacing: -0.2, transition: "all 0.2s", ...(styles[variant] || styles.gold) }}>{children}</button>;
}

// ═══ HOLDING CARD ═══

function HoldingCard({ item, type, spotPrice, onTap }) {
  const ozMap = { "1 oz": 1, "1/2 oz": 0.5, "1/4 oz": 0.25, "1/10 oz": 0.1, "1 kg": 32.151, "10 oz": 10, "100 oz": 100, "Gram": 0.03215 };
  const val = type === "metal" ? item.qty * (ozMap[item.unit] || 1) * (spotPrice || item.spot || 0)
    : type === "crypto" ? item.qty * (spotPrice || item.price || 0)
    : type === "synd" ? item.invested || 0 : item.value || 0;
  const cost = type === "metal" ? item.qty * (item.costPerUnit || 0)
    : type === "crypto" ? item.qty * (item.avgCost || 0) : item.invested || val;
  const gain = val - cost;
  const pct = cost > 0 ? (gain / cost) * 100 : 0;
  const up = gain >= 0;
  const spark = useMemo(() => sparkline(cost || val, 25, 0.012), [cost, val]);

  return (
    <GlassCard hoverable onClick={onTap} style={{ padding: "18px 20px", marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: P.text, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {item.name || item.metal || item.coin}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {type === "metal" && item.unit && <span style={{ fontSize: 11, color: P.textMuted, background: P.goldSoft, padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>{item.unit}</span>}
            {type === "synd" && item.strategy && <span style={{ fontSize: 11, color: P.blue, background: P.blueSoft, padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>{item.strategy}</span>}
            {type === "synd" && item.sponsor && <span style={{ fontSize: 11, color: P.textMuted }}>{item.sponsor}</span>}
            {type === "crypto" && <span style={{ fontSize: 11, color: P.purple, background: P.purpleSoft, padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>{item.coin}</span>}
            {type === "metal" && <span style={{ fontSize: 11, color: P.textMuted }}>×{item.qty}</span>}
            {type === "crypto" && <span style={{ fontSize: 11, color: P.textMuted }}>{item.qty?.toFixed(4)}</span>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MiniChart data={spark} color={up ? P.green : P.red} height={32} width={60} />
          <div style={{ textAlign: "right", minWidth: 80 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: P.text, fontFamily: mono, letterSpacing: -0.5 }}>{fmt(val)}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: up ? P.green : P.red, fontFamily: mono }}>{up ? "+" : ""}{fmt(gain)}</div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ═══ ADD FORMS ═══

function AddMetalForm({ onAdd, onClose, prices }) {
  const [f, sF] = useState({ metal: "Gold", unit: "1 oz", qty: "", costPerUnit: "", notes: "" });
  const spot = { Gold: prices.gold, Silver: prices.silver, Platinum: prices.platinum, Palladium: prices.palladium };
  return (
    <>
      <FormSelect label="Metal" value={f.metal} onChange={v => sF({ ...f, metal: v })} options={["Gold", "Silver", "Platinum", "Palladium"]} />
      <FormSelect label="Unit Size" value={f.unit} onChange={v => sF({ ...f, unit: v })} options={["1 oz", "1/2 oz", "1/4 oz", "1/10 oz", "1 kg", "10 oz", "100 oz", "Gram"]} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Quantity" value={f.qty} onChange={v => sF({ ...f, qty: v })} type="number" isMono />
        <FormField label="Cost / Unit" value={f.costPerUnit} onChange={v => sF({ ...f, costPerUnit: v })} type="number" prefix="$" isMono />
      </div>
      {spot[f.metal] && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: P.goldSoft, borderRadius: 12, marginBottom: 16, border: `1px solid ${P.goldMed}` }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: P.gold }} />
          <span style={{ fontSize: 13, color: P.textSecondary }}>Live spot</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: P.gold, fontFamily: mono, marginLeft: "auto" }}>${spot[f.metal]?.toFixed(2)}<span style={{ fontSize: 11, color: P.textMuted }}>/oz</span></span>
        </div>
      )}
      <FormField label="Notes" value={f.notes} onChange={v => sF({ ...f, notes: v })} placeholder="Optional" />
      <PrimaryButton full onClick={() => { if (f.qty) { onAdd({ ...f, qty: +f.qty, costPerUnit: +f.costPerUnit, spot: spot[f.metal] || 0, name: f.metal + " " + f.unit, id: Date.now() }); onClose(); } }}>Add Holding</PrimaryButton>
    </>
  );
}

function AddSyndForm({ onAdd, onClose }) {
  const [f, sF] = useState({ name: "", sponsor: "", invested: "", expectedRate: "", strategy: "Multifamily", risk: "5", status: "Active" });
  return (
    <>
      <FormField label="Deal Name" value={f.name} onChange={v => sF({ ...f, name: v })} placeholder="e.g. Pinnacle West" />
      <FormField label="Sponsor" value={f.sponsor} onChange={v => sF({ ...f, sponsor: v })} placeholder="e.g. Bergman" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Invested" value={f.invested} onChange={v => sF({ ...f, invested: v })} type="number" prefix="$" isMono />
        <FormField label="Expected %" value={f.expectedRate} onChange={v => sF({ ...f, expectedRate: v })} type="number" prefix="%" isMono />
      </div>
      <FormSelect label="Strategy" value={f.strategy} onChange={v => sF({ ...f, strategy: v })} options={["Multifamily","Office","Retail","Industrial","Hotel","BTR","Self-Storage","Student Housing","Senior Living","Mixed Use","Land","Data Center","Warehouse","Other"]} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormSelect label="Risk" value={f.risk} onChange={v => sF({ ...f, risk: v })} options={[...Array(10)].map((_,i)=>({value:String(i+1),label:`${i+1}`}))} />
        <FormSelect label="Status" value={f.status} onChange={v => sF({ ...f, status: v })} options={["Active","Pending","Exited","Default"]} />
      </div>
      <PrimaryButton full onClick={() => { if(f.name && f.invested){ onAdd({...f, invested:+f.invested, expectedRate:+f.expectedRate, risk:+f.risk, id:Date.now()}); onClose(); } }}>Add Syndication</PrimaryButton>
    </>
  );
}

function AddCryptoForm({ onAdd, onClose, prices }) {
  const [f, sF] = useState({ coin: "BTC", qty: "", avgCost: "" });
  const spot = { BTC: prices.btc, ETH: prices.eth, SOL: prices.sol };
  return (
    <>
      <FormSelect label="Coin" value={f.coin} onChange={v => sF({ ...f, coin: v })} options={["BTC","ETH","SOL","ADA","DOT","AVAX","LINK","MATIC","XRP","DOGE","ATOM","UNI","AAVE"]} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Quantity" value={f.qty} onChange={v => sF({ ...f, qty: v })} type="number" isMono />
        <FormField label="Avg Cost" value={f.avgCost} onChange={v => sF({ ...f, avgCost: v })} type="number" prefix="$" isMono />
      </div>
      {spot[f.coin] && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: P.purpleSoft, borderRadius: 12, marginBottom: 16, border: `1px solid rgba(167,139,250,0.15)` }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: P.purple }} />
          <span style={{ fontSize: 13, color: P.textSecondary }}>Live price</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: P.purple, fontFamily: mono, marginLeft: "auto" }}>${Math.round(spot[f.coin]).toLocaleString()}</span>
        </div>
      )}
      <PrimaryButton full onClick={() => { if(f.qty){ onAdd({...f, qty:+f.qty, avgCost:+f.avgCost, coin:f.coin, name:f.coin, price: spot[f.coin]||+f.avgCost, id:Date.now()}); onClose(); } }}>Add Coin</PrimaryButton>
    </>
  );
}

// ═══ DEAL ANALYZER ═══

function DealAnalyzer() {
  const [d, sD] = useState({ price:"", rent:"", tax:"", insurance:"", maintenance:"", vacancy:"8", mgmt:"10", downPct:"25", rate:"7", term:"30" });
  const price=+d.price||0, rent=+d.rent||0, tax=+d.tax||0, ins=+d.insurance||0, maint=+d.maintenance||0;
  const vacPct=+d.vacancy/100, mgmtPct=+d.mgmt/100, down=price*(+d.downPct/100), loan=price-down;
  const mr=(+d.rate/100)/12, n=+d.term*12;
  const mortgage=mr>0?loan*(mr*Math.pow(1+mr,n))/(Math.pow(1+mr,n)-1):0;
  const gross=rent*12, vac=gross*vacPct, eff=gross-vac, mgmtC=eff*mgmtPct;
  const noi=eff-tax-ins-(maint*12)-mgmtC, cf=noi-(mortgage*12), mcf=cf/12;
  const cap=price>0?(noi/price)*100:0, coc=down>0?(cf/down)*100:0, dscr=mortgage>0?noi/(mortgage*12):0;

  const tests=[
    {name:"Cap Rate",val:cap.toFixed(1)+"%",pass:cap>=6,tgt:"≥ 6%"},
    {name:"CoC Return",val:coc.toFixed(1)+"%",pass:coc>=8,tgt:"≥ 8%"},
    {name:"DSCR",val:dscr.toFixed(2),pass:dscr>=1.25,tgt:"≥ 1.25"},
    {name:"Monthly CF",val:fmt(mcf),pass:mcf>0,tgt:"> $0"},
  ];

  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ fontSize: 13, color: P.textSecondary, marginBottom: 20, lineHeight: 1.5 }}>Analyze rental property deals with instant cash flow projections and pass/fail metrics.</div>
      <GlassCard style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: P.text, marginBottom: 16, letterSpacing: 0.3 }}>Property Details</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
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
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {tests.map((t,i) => (
              <GlassCard key={i} style={{ padding: "16px 18px", borderColor: t.pass ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: P.textSecondary, fontWeight: 500 }}>{t.name}</span>
                  <span style={{ fontSize: 10, color: P.textMuted }}>{t.tgt}</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: t.pass ? P.green : P.red, fontFamily: mono, letterSpacing: -0.5 }}>{t.val}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: t.pass ? P.green : P.red, marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 14, height: 14, borderRadius: 7, background: t.pass ? P.greenSoft : P.redSoft, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>{t.pass ? "✓" : "✗"}</span>
                  {t.pass ? "Pass" : "Fail"}
                </div>
              </GlassCard>
            ))}
          </div>

          <GlassCard style={{ padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: P.text, marginBottom: 14 }}>Cash Flow Summary</div>
            {[["Gross Income",gross],["Vacancy Loss",-vac],["NOI",noi,true],["Mortgage/yr",-(mortgage*12)],["Annual CF",cf,true],["Monthly CF",mcf,true]].map(([l,v,bold],i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: bold ? `1px solid ${P.border}` : "none" }}>
                <span style={{ fontSize: 13, color: bold ? P.text : P.textSecondary, fontWeight: bold ? 600 : 400 }}>{l}</span>
                <span style={{ fontSize: 14, fontWeight: bold ? 700 : 500, color: v >= 0 ? (bold ? P.green : P.text) : P.red, fontFamily: mono }}>{fmt(v)}</span>
              </div>
            ))}
          </GlassCard>
        </>
      )}
    </div>
  );
}

// ═══ PORTFOLIO VIEW ═══

function PortfolioView({ metals, syndications, crypto, prices }) {
  const ozMap = {"1 oz":1,"1/2 oz":0.5,"1/4 oz":0.25,"1/10 oz":0.1,"1 kg":32.151,"10 oz":10,"100 oz":100,"Gram":0.03215};
  const spotMap = {Gold:prices.gold,Silver:prices.silver,Platinum:prices.platinum,Palladium:prices.palladium};
  const cryptoSpot = {BTC:prices.btc,ETH:prices.eth,SOL:prices.sol};

  const mTotal = metals.reduce((s,m) => s + m.qty*(ozMap[m.unit]||1)*(spotMap[m.metal]||m.spot||0), 0);
  const sTotal = syndications.reduce((s,x) => s + (x.invested||0), 0);
  const cTotal = crypto.reduce((s,x) => s + x.qty*(cryptoSpot[x.coin]||x.price||0), 0);
  const total = mTotal + sTotal + cTotal;

  const alloc = [
    { name: "Precious Metals", value: mTotal, color: P.gold, pct: total ? (mTotal/total*100) : 0 },
    { name: "Real Estate", value: sTotal, color: P.blue, pct: total ? (sTotal/total*100) : 0 },
    { name: "Crypto", value: cTotal, color: P.purple, pct: total ? (cTotal/total*100) : 0 },
  ].filter(d => d.value > 0);

  const totalCost = metals.reduce((s,m) => s + m.qty*(m.costPerUnit||0), 0) + syndications.reduce((s,x) => s + (x.invested||0), 0) + crypto.reduce((s,x) => s + x.qty*(x.avgCost||0), 0);
  const totalGain = total - totalCost;
  const totalPct = totalCost > 0 ? (totalGain/totalCost*100) : 0;

  const annualIncome = syndications.reduce((s,x) => s + (x.invested*(x.expectedRate||0)/100), 0);
  const avgRisk = (() => { const r = syndications.filter(x=>x.risk); return r.length ? (r.reduce((s,x)=>s+ +x.risk,0)/r.length).toFixed(1) : "—"; })();

  const histData = useMemo(() => sparkline(totalCost || total * 0.85, 60, 0.008), [totalCost, total]);

  return (
    <div style={{ paddingBottom: 120 }}>
      {/* Net Worth Hero */}
      <div style={{ textAlign: "center", padding: "8px 0 24px" }}>
        <div style={{ fontSize: 13, color: P.textSecondary, fontWeight: 500, marginBottom: 8 }}>Total Portfolio</div>
        <div style={{ fontSize: 42, fontWeight: 800, color: P.text, fontFamily: mono, letterSpacing: -2, lineHeight: 1 }}>{fmt(total)}</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, padding: "6px 14px", borderRadius: 20, background: totalGain >= 0 ? P.greenSoft : P.redSoft }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: totalGain >= 0 ? P.green : P.red, fontFamily: mono }}>
            {totalGain >= 0 ? "↑" : "↓"} {fmt(Math.abs(totalGain))} ({fPct(totalPct)})
          </span>
        </div>
      </div>

      {/* Portfolio Chart */}
      <GlassCard style={{ padding: "16px 8px 4px", marginBottom: 16 }}>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={histData} margin={{top:0,right:0,bottom:0,left:0}}>
            <defs><linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={P.gold} stopOpacity={0.25}/>
              <stop offset="100%" stopColor={P.gold} stopOpacity={0}/>
            </linearGradient></defs>
            <Area type="monotone" dataKey="v" stroke={P.gold} strokeWidth={2} fill="url(#portGrad)" dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Key Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Income/yr", value: fmt(annualIncome), color: P.green },
          { label: "Avg Risk", value: avgRisk + "/10", color: P.orange },
          { label: "Assets", value: String(metals.length + syndications.length + crypto.length), color: P.blue },
        ].map((m, i) => (
          <GlassCard key={i} style={{ padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: P.textMuted, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>{m.label}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: m.color, fontFamily: mono, letterSpacing: -0.5 }}>{m.value}</div>
          </GlassCard>
        ))}
      </div>

      {/* Allocation */}
      {alloc.length > 0 && (
        <GlassCard style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: P.text, marginBottom: 16 }}>Allocation</div>
          <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 16 }}>
            {alloc.map((d, i) => <div key={i} style={{ flex: d.value, background: d.color, transition: "flex 0.5s" }} />)}
          </div>
          {alloc.map((d, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < alloc.length - 1 ? `1px solid ${P.border}` : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: 4, background: d.color }} />
                <span style={{ fontSize: 14, color: P.text, fontWeight: 500 }}>{d.name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: P.text, fontFamily: mono }}>{fmt(d.value)}</span>
                <span style={{ fontSize: 12, color: P.textMuted, fontFamily: mono, minWidth: 42, textAlign: "right" }}>{d.pct.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </GlassCard>
      )}

      {/* Donut */}
      {alloc.length > 0 && (
        <GlassCard style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 160, height: 160, position: "relative" }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={alloc} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={4} strokeWidth={0} cornerRadius={4}>
                    {alloc.map((d,i) => <Cell key={i} fill={d.color}/>)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 10, color: P.textMuted, fontWeight: 600, letterSpacing: 0.5 }}>TOTAL</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: P.text, fontFamily: mono }}>{fmt(total)}</div>
              </div>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

// ═══ MAIN APP ═══

export default function HardAssets() {
  const [view, setView] = useState("splash");
  const [tab, setTab] = useState("portfolio");
  const [sheet, setSheet] = useState(null);
  const [detailItem, setDetailItem] = useState(null);

  const [metals, setMetals] = useState([
    { id:1, metal:"Gold", name:"American Eagle 1oz", unit:"1 oz", qty:10, costPerUnit:1950, spot:3015, risk:2 },
    { id:2, metal:"Gold", name:"100oz Gold Bar", unit:"100 oz", qty:2, costPerUnit:185000, spot:3015, risk:2 },
    { id:3, metal:"Silver", name:"Silver Maple Leaf", unit:"1 oz", qty:500, costPerUnit:26, spot:33.8, risk:3 },
    { id:4, metal:"Platinum", name:"Platinum Eagle", unit:"1 oz", qty:20, costPerUnit:920, spot:1015, risk:4 },
  ]);
  const [synds, setSynds] = useState([
    { id:1, name:"Pinnacle West", sponsor:"Bergman", invested:100000, expectedRate:8, strategy:"Multifamily", risk:5, status:"Active" },
    { id:2, name:"Avery Portorosa", sponsor:"Klein", invested:300000, expectedRate:12, strategy:"Hotel", risk:7, status:"Active" },
    { id:3, name:"Takoma Towers", sponsor:"Biderman", invested:150000, expectedRate:6, strategy:"Multifamily", risk:8, status:"Active" },
  ]);
  const [crypto, setCrypto] = useState([
    { id:1, coin:"BTC", name:"Bitcoin", qty:1.5, avgCost:42000, price:87240 },
    { id:2, coin:"ETH", name:"Ethereum", qty:12, avgCost:2800, price:2050 },
    { id:3, coin:"SOL", name:"Solana", qty:100, avgCost:95, price:140 },
  ]);
  const [prices] = useState({
    gold:3015, silver:33.8, platinum:1015, palladium:985,
    goldChg:0.42, silverChg:1.1, platChg:-0.3, palChg:0.6,
    btc:87240, eth:2050, sol:140, btcChg:2.1, ethChg:-0.8, solChg:3.4,
  });

  const goldSpark = useMemo(() => sparkline(2850, 30, 0.008), []);
  const silverSpark = useMemo(() => sparkline(30, 30, 0.012), []);
  const btcSpark = useMemo(() => sparkline(78000, 30, 0.02), []);
  const ethSpark = useMemo(() => sparkline(2400, 30, 0.018), []);

  useEffect(() => { if (view === "splash") setTimeout(() => setView("app"), 2000); }, [view]);

  if (view === "splash") return (
    <div style={{ fontFamily: ff, background: P.bg, color: P.text, minHeight: "100vh", maxWidth: 430, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <style>{FONT_INJECT}{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}} @keyframes rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ width: 72, height: 72, borderRadius: 22, background: `linear-gradient(145deg, ${P.gold}, #B8912E)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 900, color: P.bg, boxShadow: `0 12px 40px rgba(212,168,67,0.3)`, marginBottom: 28, animation: "pulse 2s ease-in-out infinite" }}>H</div>
      <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, animation: "rise 0.6s ease 0.2s both" }}>HardAssets</div>
      <div style={{ fontSize: 12, color: P.textMuted, letterSpacing: 3.5, textTransform: "uppercase", marginTop: 6, animation: "rise 0.6s ease 0.4s both" }}>Portfolio Intelligence</div>
    </div>
  );

  const NAV = [
    { key: "portfolio", label: "Portfolio", paths: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { key: "metals", label: "Metals", paths: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
    { key: "realestate", label: "Real Estate", paths: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    { key: "crypto", label: "Crypto", paths: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { key: "analyzer", label: "Analyzer", paths: "M9 7h6m0 10v-3m-3 3v-6m-3 6v-1m6-9a2 2 0 012 2v8a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2" },
  ];

  const renderContent = () => {
    switch (tab) {
      case "portfolio":
        return <PortfolioView metals={metals} syndications={synds} crypto={crypto} prices={prices} />;
      case "metals":
        return (
          <div style={{ paddingBottom: 120 }}>
            <GlassCard style={{ padding: "16px 20px", marginBottom: 16 }}>
              <PriceTag label="Gold" value={prices.gold} change={prices.goldChg} color={P.gold} spark={goldSpark} />
              <PriceTag label="Silver" value={prices.silver} change={prices.silverChg} color={P.textSecondary} spark={silverSpark} />
              <PriceTag label="Platinum" value={prices.platinum} change={prices.platChg} color={P.cyan} />
            </GlassCard>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: P.text }}>Holdings</span>
              <button onClick={() => setSheet("addMetal")} style={{ background: P.goldSoft, border: `1px solid ${P.goldMed}`, borderRadius: 10, padding: "7px 14px", color: P.gold, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: ff }}>+ Add</button>
            </div>
            {metals.map(m => <HoldingCard key={m.id} item={m} type="metal" spotPrice={({Gold:prices.gold,Silver:prices.silver,Platinum:prices.platinum,Palladium:prices.palladium})[m.metal]} onTap={() => setDetailItem({...m,_type:"metal"})} />)}
          </div>
        );
      case "realestate":
        return (
          <div style={{ paddingBottom: 120 }}>
            {synds.length > 0 && (() => {
              const by = {}; synds.forEach(s => { by[s.strategy] = (by[s.strategy]||0) + s.invested; });
              const data = Object.entries(by).map(([name,value],i) => ({name:name.slice(0,8),value,fill:PIE[i%PIE.length]}));
              return (
                <GlassCard style={{ padding: "16px 12px", marginBottom: 16 }}>
                  <ResponsiveContainer width="100%" height={100}>
                    <BarChart data={data} margin={{top:0,right:0,bottom:0,left:0}}>
                      <XAxis dataKey="name" tick={{fontSize:10,fill:P.textMuted}} axisLine={false} tickLine={false}/>
                      <Tooltip contentStyle={{background:P.elevated,border:`1px solid ${P.border}`,borderRadius:12,fontSize:12,fontFamily:mono}} formatter={v=>fmt(v)}/>
                      <Bar dataKey="value" radius={[6,6,0,0]}>{data.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </GlassCard>
              );
            })()}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: P.text }}>Syndications</span>
              <button onClick={() => setSheet("addSynd")} style={{ background: P.blueSoft, border: `1px solid rgba(96,165,250,0.15)`, borderRadius: 10, padding: "7px 14px", color: P.blue, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: ff }}>+ Add</button>
            </div>
            {synds.map(s => <HoldingCard key={s.id} item={s} type="synd" onTap={() => setDetailItem({...s,_type:"synd"})} />)}
          </div>
        );
      case "crypto":
        return (
          <div style={{ paddingBottom: 120 }}>
            <GlassCard style={{ padding: "16px 20px", marginBottom: 16 }}>
              <PriceTag label="Bitcoin" value={prices.btc} change={prices.btcChg} color={P.orange} spark={btcSpark} />
              <PriceTag label="Ethereum" value={prices.eth} change={prices.ethChg} color={P.blue} spark={ethSpark} />
              <PriceTag label="Solana" value={prices.sol} change={prices.solChg} color={P.purple} />
            </GlassCard>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: P.text }}>Holdings</span>
              <button onClick={() => setSheet("addCrypto")} style={{ background: P.purpleSoft, border: `1px solid rgba(167,139,250,0.15)`, borderRadius: 10, padding: "7px 14px", color: P.purple, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: ff }}>+ Add</button>
            </div>
            {crypto.map(c => <HoldingCard key={c.id} item={c} type="crypto" spotPrice={({BTC:prices.btc,ETH:prices.eth,SOL:prices.sol})[c.coin]} onTap={() => setDetailItem({...c,_type:"crypto"})} />)}
          </div>
        );
      case "analyzer":
        return <DealAnalyzer />;
      default: return null;
    }
  };

  return (
    <div style={{ fontFamily: ff, background: P.bg, color: P.text, minHeight: "100vh", maxWidth: 430, margin: "0 auto", position: "relative", overflow: "hidden" }}>
      <style>{FONT_INJECT}{`
        @keyframes sheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        ::-webkit-scrollbar{display:none}
        input::placeholder{color:${P.textFaint}}
        select option{background:${P.surface}}
      `}</style>

      {/* Status bar */}
      <div style={{ height: 54, display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 24px 8px", background: P.bg }}>
        <span style={{ fontSize: 15, fontWeight: 700, fontFamily: mono, color: P.text }}>9:41</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <svg width="17" height="12" viewBox="0 0 17 12" fill="none"><rect x="0" y="6" width="3" height="6" rx="1" fill={P.text}/><rect x="4.5" y="4" width="3" height="8" rx="1" fill={P.text}/><rect x="9" y="1.5" width="3" height="10.5" rx="1" fill={P.text}/><rect x="13.5" y="0" width="3" height="12" rx="1" fill={P.text}/></svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke={P.textSecondary} strokeWidth="1"/><rect x="22.5" y="3.5" width="2" height="5" rx="1" fill={P.textSecondary}/><rect x="2" y="2" width="15" height="8" rx="1.5" fill={P.green}/></svg>
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: "4px 24px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(145deg, ${P.gold}, #B8912E)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 900, color: P.bg, boxShadow: `0 4px 16px rgba(212,168,67,0.2)` }}>H</div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, color: P.text, letterSpacing: -0.4 }}>HardAssets</div>
            <div style={{ fontSize: 10, color: P.textMuted, letterSpacing: 2, textTransform: "uppercase", fontWeight: 500 }}>Portfolio Intelligence</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: 4, background: P.green, boxShadow: `0 0 8px ${P.green}` }} />
          <div style={{ width: 36, height: 36, borderRadius: 12, background: `linear-gradient(145deg, ${P.elevated}, ${P.surface})`, border: `1px solid ${P.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: P.gold }}>C</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "0 20px", overflow: "auto", height: "calc(100vh - 54px - 60px - 84px)", WebkitOverflowScrolling: "touch" }}>
        {renderContent()}
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430,
        background: "rgba(11,15,26,0.85)", backdropFilter: "blur(40px) saturate(1.8)", WebkitBackdropFilter: "blur(40px) saturate(1.8)",
        borderTop: `1px solid ${P.border}`, padding: "8px 12px 28px", display: "flex", justifyContent: "space-around", zIndex: 100,
      }}>
        {NAV.map(n => {
          const active = tab === n.key;
          return (
            <button key={n.key} onClick={() => setTab(n.key)} style={{
              background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 6px", minWidth: 52,
            }}>
              <div style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: active ? P.goldSoft : "transparent", transition: "all 0.25s" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? P.gold : P.textMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={n.paths}/></svg>
              </div>
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? P.gold : P.textMuted, letterSpacing: 0.2 }}>{n.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Sheets */}
      <BottomSheet open={sheet==="addMetal"} onClose={()=>setSheet(null)} title="Add Metal">
        <AddMetalForm prices={prices} onAdd={m=>setMetals(p=>[...p,m])} onClose={()=>setSheet(null)}/>
      </BottomSheet>
      <BottomSheet open={sheet==="addSynd"} onClose={()=>setSheet(null)} title="Add Syndication">
        <AddSyndForm onAdd={s=>setSynds(p=>[...p,s])} onClose={()=>setSheet(null)}/>
      </BottomSheet>
      <BottomSheet open={sheet==="addCrypto"} onClose={()=>setSheet(null)} title="Add Crypto">
        <AddCryptoForm prices={prices} onAdd={c=>setCrypto(p=>[...p,c])} onClose={()=>setSheet(null)}/>
      </BottomSheet>

      {/* Detail Sheet */}
      <BottomSheet open={!!detailItem} onClose={()=>setDetailItem(null)} title={detailItem?.name||detailItem?.metal||detailItem?.coin||""}>
        {detailItem && (
          <div>
            {(() => {
              const ozMap={"1 oz":1,"1/2 oz":0.5,"1/4 oz":0.25,"1/10 oz":0.1,"1 kg":32.151,"10 oz":10,"100 oz":100,"Gram":0.03215};
              const spotMap={Gold:prices.gold,Silver:prices.silver,Platinum:prices.platinum,Palladium:prices.palladium};
              const cryptoSpot={BTC:prices.btc,ETH:prices.eth,SOL:prices.sol};
              const t=detailItem._type;
              const val=t==="metal"?detailItem.qty*(ozMap[detailItem.unit]||1)*(spotMap[detailItem.metal]||detailItem.spot||0):t==="crypto"?detailItem.qty*(cryptoSpot[detailItem.coin]||detailItem.price||0):detailItem.invested||0;
              const cost=t==="metal"?detailItem.qty*(detailItem.costPerUnit||0):t==="crypto"?detailItem.qty*(detailItem.avgCost||0):detailItem.invested||val;
              const gain=val-cost;
              const pct=cost>0?(gain/cost*100):0;
              return (
                <div style={{ textAlign: "center", padding: "8px 0 20px" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: P.text, fontFamily: mono, letterSpacing: -1 }}>{fmt(val)}</div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, padding: "4px 12px", borderRadius: 16, background: gain >= 0 ? P.greenSoft : P.redSoft }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: gain >= 0 ? P.green : P.red, fontFamily: mono }}>{gain >= 0 ? "+" : ""}{fmt(gain)} ({fPct(pct)})</span>
                  </div>
                </div>
              );
            })()}

            <GlassCard style={{ padding: 16, marginBottom: 16 }}>
              {Object.entries(detailItem).filter(([k])=>!k.startsWith("_")&&k!=="id").map(([k,v],i,arr)=>(
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i<arr.length-1 ? `1px solid ${P.border}` : "none" }}>
                  <span style={{ fontSize: 13, color: P.textSecondary, textTransform: "capitalize" }}>{k.replace(/([A-Z])/g," $1")}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: P.text, fontFamily: typeof v==="number" ? mono : ff }}>{typeof v==="number"?(v>100?fmt(v):v):String(v)}</span>
                </div>
              ))}
            </GlassCard>

            <div style={{ display: "flex", gap: 10 }}>
              <PrimaryButton variant="danger" full onClick={() => {
                const t=detailItem._type;
                if(t==="metal") setMetals(p=>p.filter(x=>x.id!==detailItem.id));
                if(t==="synd") setSynds(p=>p.filter(x=>x.id!==detailItem.id));
                if(t==="crypto") setCrypto(p=>p.filter(x=>x.id!==detailItem.id));
                setDetailItem(null);
              }}>Remove</PrimaryButton>
              <PrimaryButton variant="ghost" full onClick={()=>setDetailItem(null)}>Done</PrimaryButton>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}