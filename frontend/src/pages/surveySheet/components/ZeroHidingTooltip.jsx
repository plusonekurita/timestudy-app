// ZeroHidingTooltip.jsx
import React from "react";

export default function ZeroHidingTooltip(props) {
  const {
    active,
    label,
    payload,
    min = 0.05,
    displayOf = (n) => n, // name→表示名（未指定なら name を表示）
  } = props || {};

  if (!active || !payload) return null;

  const items = payload
    .filter((p) => Math.abs(Number(p.value) || 0) >= min)
    .map((p) => ({
      key: p.dataKey,
      color: p.color,
      value: Number(p.value),
    }));

  if (items.length === 0) return null;

  return (
    <div
      style={{
        background: "rgba(32,32,37,0.92)",
        color: "#fff",
        padding: "10px 12px",
        borderRadius: 8,
        boxShadow: "0 8px 24px rgba(0,0,0,.25)",
        backdropFilter: "saturate(160%) blur(6px)",
        maxWidth: 280,
        fontSize: 12,
        lineHeight: 1.5,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {items.map((it) => (
        <div
          key={it.key}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              background: it.color,
              borderRadius: "50%",
              flex: "0 0 auto",
            }}
          />
          <span
            style={{
              flex: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={displayOf(it.key)}
          >
            {displayOf(it.key)}
          </span>
          <span style={{ color: "#d9d9d9" }}>{it.value.toFixed(1)}分</span>
        </div>
      ))}
    </div>
  );
}
