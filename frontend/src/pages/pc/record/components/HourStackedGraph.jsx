// src/components/Charts/HourStackedGraph.jsx
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
  LabelList,
} from "recharts";
import { useSelector } from "react-redux";
import React, { useMemo } from "react";
import { Box } from "@mui/material";
import dayjs from "dayjs";

import { graphColors } from "../../../../constants/theme";
import ZeroHidingTooltip from "./ZeroHidingTooltip";

/**
 * ISO文字列をそのままローカル時間として解釈するためのパーサ
 * - 末尾が"Z"（UTC）の場合、明示的にfallbackOffset（既定: +09:00）を付与してローカル相当へ
 * - それ以外は dayjs に委譲
 */
const parseAsIs = (iso, fallbackOffset = "+09:00") =>
  typeof iso === "string" && /Z$/.test(iso)
    ? dayjs(iso.replace(/Z$/, fallbackOffset))
    : dayjs(iso);

/**
 * 開始〜終了の範囲を1時間ごとのスロットに分割して返す
 */
function buildHourSlots(startLocal, endLocal) {
  const start = startLocal.startOf("hour");
  const end = endLocal.endOf("hour");
  const slots = [];
  let cur = start.clone();
  while (cur.isBefore(end) || cur.isSame(end)) {
    const s = cur.clone();
    slots.push({ key: s.format("HH:00"), start: s, end: s.endOf("hour") });
    cur = cur.add(1, "hour");
  }
  return slots;
}

/**
 * レコード群を「1時間ごと」に集計（binning）
 */
function binByHourAsIs(records, opts) {
  const showEmptyHours = opts?.showEmptyHours ?? false;
  if (!records?.length) return { data: [], keys: [] };

  const starts = records.map((r) => parseAsIs(r.startTime));
  const ends = records.map((r) => parseAsIs(r.endTime));
  const minStart = starts.reduce((a, b) => (a.isBefore(b) ? a : b));
  const maxEnd = ends.reduce((a, b) => (a.isAfter(b) ? a : b));
  const slots = buildHourSlots(minStart, maxEnd);

  // 表示系列（凡例）順を records の name 登場順で確定
  const keys = [];
  for (const r of records) if (!keys.includes(r.name)) keys.push(r.name);

  const buckets = {};
  for (const s of slots) {
    const base = { hour: s.key, _total: 0 };
    keys.forEach((k) => (base[k] = 0));
    buckets[s.key] = base;
  }

  // レコード×スロットで重なり時間（分）を加算
  for (const rec of records) {
    const rs = parseAsIs(rec.startTime);
    const re = parseAsIs(rec.endTime);
    for (const s of slots) {
      const overlapStart = rs.isAfter(s.start) ? rs : s.start;
      const overlapEnd = re.isBefore(s.end) ? re : s.end;
      if (overlapEnd.isAfter(overlapStart)) {
        const sec = overlapEnd.diff(overlapStart, "second");
        const min = sec / 60;
        buckets[s.key][rec.name] += min;
        buckets[s.key]._total += min;
      }
    }
  }

  // 表示用に丸め＆空スロット除外
  let rows = Object.values(buckets);
  if (!showEmptyHours) rows = rows.filter((r) => r._total > 0.0001);
  rows = rows.map((r) => {
    const out = { hour: r.hour, _total: 0 };
    keys.forEach((k) => {
      const v = Math.round(r[k] * 10) / 10;
      out[k] = v;
      out._total += v;
    });
    return out;
  });

  return { data: rows, keys };
}

const MIN_HEIGHT_PX = 16;
const PADDING_X = 6;
const FONT_BASE = 11;
const FONT_MIN = 9;

// キャンバスでテキスト幅を測る
const _canvas =
  typeof document !== "undefined" ? document.createElement("canvas") : null;
const _ctx = _canvas ? _canvas.getContext("2d") : null;
const measure = (text, font) => {
  if (!_ctx) return text.length * 10;
  _ctx.font = font;
  return _ctx.measureText(text).width;
};

/**
 * バー幅に収まるように、フォントサイズ調整＆必要なら末尾を「…」で省略
 */
const fitOrEllipsize = (label, maxW) => {
  for (let fs = FONT_BASE; fs >= FONT_MIN; fs--) {
    const font = `600 ${fs}px sans-serif`;
    if (measure(label, font) <= maxW) return { text: label, fontSize: fs };
    let cut = label;
    const ell = "…";
    while (cut.length > 1) {
      cut = cut.slice(0, -1);
      if (measure(cut + ell, font) <= maxW)
        return { text: cut + ell, fontSize: fs };
    }
  }
  return null;
};

/**
 * スタックセグメント内に表示するラベル
 */
const renderSegmentLabel = (props, shownText) => {
  const { x, y, width, height, value } = props;
  if (!value || height < MIN_HEIGHT_PX) return null;
  const maxW = width - PADDING_X * 2;
  if (maxW <= 0) return null;
  const fitted = fitOrEllipsize(shownText, maxW);
  if (!fitted) return null;
  const cx = x + width / 2;
  const cy = y + height / 2;
  return (
    <text
      x={cx}
      y={cy}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={fitted.fontSize}
      fontWeight={600}
      fill="#fff"
      style={{ pointerEvents: "none" }}
      title={shownText}
    >
      {fitted.text}
    </text>
  );
};

// グラフの色の取得
const getGraphColorByName = (name, type) =>
  (graphColors.items && graphColors.items[name]) ||
  (graphColors.fallbackByType && graphColors.fallbackByType[type]) ||
  graphColors.default;

/**
 * 引数は高さのみ。データは Redux の groupedByStaff から取得し、
 * 全スタッフ分の item をフラットにして元のロジックに渡す。
 * （見た目・挙動は元コードから一切変更なし）
 */
export default function HourStackedGraph({ height = 380 }) {
  const { groupedByStaff = {} } = useSelector((s) => s.timeRecord || {});

  // groupedByStaff: { [staffId]: Array<staffRecord> }
  // staffRecord.record: Array<item({ name,label?,type,startTime,endTime,... })>
  const records = useMemo(() => {
    const all = [];
    Object.values(groupedByStaff || {}).forEach((staffRecs) => {
      (staffRecs || []).forEach((sr) => {
        const items = Array.isArray(sr?.record) ? sr.record : [];
        items.forEach((it) => all.push(it));
      });
    });
    return all;
  }, [groupedByStaff]);

  // グラフ用データ
  const { data, keys } = useMemo(
    () => binByHourAsIs(records, { showEmptyHours: false }),
    [records]
  );

  // name → 表示ラベル
  const nameToLabel = useMemo(() => {
    const m = {};
    for (const r of records) m[r.name] = r.label || r.name;
    return m;
  }, [records]);

  // name → タイプ（色決定用）
  const nameToType = useMemo(() => {
    const m = {};
    for (const r of records) m[r.name] = r.type;
    return m;
  }, [records]);

  if (!records.length) {
    return <Box sx={{ p: 1.5, color: "#595959ff" }}>データがありません</Box>;
  }

  const displayOf = (name) => nameToLabel[name] || name;
  const yMaxMinutes = 60; // 元の既定値を維持

  return (
    <Box sx={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" tick={{ fontSize: 16 }} />
          <YAxis
            width={44}
            domain={[0, yMaxMinutes]}
            ticks={[0, 10, 20, 30, 40, 50, yMaxMinutes]}
            tickFormatter={(v) => `${v}`}
            label={{
              value: "分",
              angle: 0,
              position: "insideTopLeft",
              offset: 0,
            }}
          />
          <Tooltip
            content={<ZeroHidingTooltip min={0.05} displayOf={displayOf} />}
          />
          <Legend />
          {keys.map((name) => (
            <Bar
              key={name}
              dataKey={name}
              stackId="total"
              fill={getGraphColorByName(name, nameToType[name])}
              name={displayOf(name)}
              maxBarSize={150}
            >
              <LabelList
                dataKey={name}
                content={(p) => renderSegmentLabel(p, displayOf(name))}
              />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
