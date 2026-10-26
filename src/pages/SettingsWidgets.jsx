
import { useEffect, useId } from "react";
import { X } from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from "recharts";

export function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="ss-toggle">
      <div>
        <strong>{label}</strong>
        {description && <small>{description}</small>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`ss-switch ${checked ? "on" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <i />
      </button>
    </div>
  );
}

const CX = 80;
const CY = 80;
const R = 58;
const SW = 21;
const START = 150;
const SWEEP = 240;

const point = (degrees) => {
  const angle = (degrees * Math.PI) / 180;
  return [
    CX + R * Math.cos(angle),
    CY + R * Math.sin(angle)
  ];
};

const ARC = (() => {
  const [x1, y1] = point(START);
  const [x2, y2] = point(START + SWEEP);
  return `M ${x1} ${y1} A ${R} ${R} 0 1 1 ${x2} ${y2}`;
})();

const GAUGE_COLORS = {
  cpu: ["#0B63FF", "#0B63FF"],
  memory: ["#0E8A4F", "#0E8A4F"],
  latency: ["#F59E0B", "#F59E0B"],
  network: ["#0B63FF", "#10A37F"]
};

export function Gauge({ gauge }) {
  const uid = useId().replace(/:/g, "");
  const frac = Math.max(0, Math.min(1, gauge.value / gauge.max));
  const [c1, c2] = GAUGE_COLORS[gauge.key] || GAUGE_COLORS.cpu;
  const needle = -SWEEP / 2 + SWEEP * frac;

  return (
    <div className="ss-gauge">
      <svg viewBox="0 0 160 126" role="img"
        aria-label={`${gauge.label}: ${gauge.display}`}>
        <defs>
          <linearGradient id={`g${uid}`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor={c1} />
            <stop offset="1" stopColor={c2} />
          </linearGradient>
        </defs>
        <path d={ARC} fill="none" stroke="#D3D9E2"
          strokeWidth={SW} pathLength="100" />
        <path d={ARC} fill="none" stroke={`url(#g${uid})`}
          strokeWidth={SW} pathLength="100"
          strokeDasharray={`${frac * 100} 100`}
          className="ss-gauge-fill" />
        <g className="ss-needle" style={{
          transform: `rotate(${needle}deg)`,
          transformOrigin: `${CX}px ${CY}px`
        }}>
          <polygon
            points={`${CX - 4.5},${CY} ${CX + 4.5},${CY} ${CX},${CY - 45}`}
            fill="#101B4D"
          />
        </g>
        <circle cx={CX} cy={CY} r="7" fill="#101B4D" />
        <text x={CX} y="113" textAnchor="middle" className="ss-gauge-val"
          style={gauge.display.length > 5 ? { fontSize: 17 } : undefined}>
          {gauge.display}
        </text>
      </svg>
      <div className="ss-gauge-label">{gauge.label}</div>
      <span className={`ss-chip ${gauge.tone}`}>
        {gauge.note} <b>{gauge.dir === "up" ? "↑" : "↓"} {gauge.pct}%</b>
      </span>
    </div>
  );
}

function TrendTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="ss-tip">
      <strong>{label}</strong>
      {payload.map((item) => (
        <div key={item.dataKey}>
          <i style={{ background: item.stroke }} />
          {item.name}: <b>{Number(item.value).toFixed(1)}K</b>
        </div>
      ))}
    </div>
  );
}

export function TrendChart({ data, tickEvery, show }) {
  const ticks = data
    .filter((_, index) => index % tickEvery === 0)
    .map((item) => item.t);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 22, left: -14, bottom: 0 }}>
        <defs>
          <linearGradient id="ssArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0B63FF" stopOpacity="0.22" />
            <stop offset="1" stopColor="#0B63FF" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#E9EFF6" vertical={false} />
        <XAxis dataKey="t" ticks={ticks} tickLine={false}
          axisLine={{ stroke: "#DCE5F0" }}
          tick={{ fontSize: 10.5, fill: "#465477" }} interval={0} />
        <YAxis domain={[0, 30]} ticks={[0, 10, 20, 30]}
          tickFormatter={(value) => `${value}K`}
          tickLine={false} axisLine={false}
          tick={{ fontSize: 10.5, fill: "#465477" }} width={44} />
        <Tooltip content={<TrendTip />}
          cursor={{ stroke: "#9DB9E8", strokeDasharray: "3 3" }} />
        {show.cpu && (
          <Area type="linear" dataKey="cpu" name="Global CPU Usage"
            stroke="#1D5FD1" strokeWidth={2} fill="url(#ssArea)"
            dot={{ r: 2.6, fill: "#1D5FD1", stroke: "#1D5FD1" }}
            activeDot={{ r: 4.5 }} isAnimationActive={false} />
        )}
        {show.db && (
          <Area type="linear" dataKey="db" name="Database Latency"
            stroke="#7FB0F5" strokeWidth={1.5} fill="none"
            dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function Modal({ title, onClose, wide = false, children }) {
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="ss-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className={`ss-modal ${wide ? "wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <h3>{title}</h3>
          <button type="button" className="icon-btn"
            aria-label="Close" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        <div className="ss-modal-body">{children}</div>
      </section>
    </div>
  );
}
