// src/components/Charts/StaffCategory100Chart.jsx
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { Box, Typography, useTheme } from "@mui/material";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import dayjs from "dayjs";

import { menuCategories } from "../../../../constants/menu";
import ZeroHidingTooltip from "./ZeroHidingTooltip";

/** 表示用（色決定には使わない） */
const pickLabel = (it) => it?.label || it?.name || it?.type || "その他";

/** 秒→分（start/end or duration） */
const minutesFrom = (item) => {
  const sec =
    (typeof item?.duration === "number" ? item.duration : null) ??
    (item?.startTime && item?.endTime
      ? dayjs(item.endTime).diff(dayjs(item.startTime), "second")
      : 0);
  const m = sec / 60;
  return m > 0 ? m : 0;
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0]?.payload || {};
  const totalMin = row.__totalMin || 0;
  const entries = Object.entries(row.__rawMins || {}).sort(
    (a, b) => b[1] - a[1]
  );
  return (
    <Box
      sx={{
        p: 1,
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        {row.staffName}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        合計: {Math.round(totalMin)} 分
      </Typography>
      {entries.map(([cat, min]) => (
        <Box
          key={cat}
          sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
        >
          <Typography variant="caption">{cat}</Typography>
          <Typography variant="caption">
            {Math.round((min / Math.max(totalMin, 1)) * 1000) / 10}%（
            {Math.round(min)}分）
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export default function StaffCategory100Chart({ height = 420 }) {
  const theme = useTheme();
  const {
    officeRecords = [],
    groupedByStaff = {},
    staffMeta = [],
    record = [],
  } = useSelector((s) => s.timeRecord || {});

  /** 1) (type,name) → graphColor の辞書を生成（color は絶対に使わない） */
  const TYPE_NAME_COLOR = useMemo(() => {
    const map = {};
    (menuCategories || []).forEach((cat) => {
      const t = cat?.type;
      (cat.items || []).forEach((it) => {
        const n = it?.name;
        if (t && n && it?.graphColor) {
          map[`${t}::${n}`] = it.graphColor;
        }
      });
    });
    return map;
  }, []);

  /** 2) モード判定（実データ参照は groupedByStaff / record） */
  const isOffice =
    (officeRecords && officeRecords.length > 0) ||
    (groupedByStaff && Object.keys(groupedByStaff || {}).length > 0);

  /** 3) グループ準備：記録があるスタッフのみ */
  const groups = useMemo(() => {
    if (isOffice) {
      const idsWithData = Object.entries(groupedByStaff || {})
        .filter(([, arr]) => Array.isArray(arr) && arr.length > 0)
        .map(([sid]) => String(sid));
      const nameMap = Object.fromEntries(
        (staffMeta || []).map((s) => [String(s.id), s.name])
      );
      return {
        staffIds: idsWithData,
        getName: (id) => nameMap[id] || `ID:${id}`,
        grouped: groupedByStaff,
      };
    } else {
      const sid = String(record?.[0]?.staff_id ?? "0");
      const name = record?.[0]?.staff_name || "スタッフ";
      return {
        staffIds: [sid],
        getName: () => name,
        grouped: { [sid]: record || [] },
      };
    }
  }, [isOffice, groupedByStaff, staffMeta, record]);

  /** 4) 集計：label は表示用。色判定用に label→{type,name} を保持 */
  const { dataRows, categories, labelToTypeName } = useMemo(() => {
    const cats = new Set();
    const labelKeyMap = {}; // label -> { type, name }

    const rows = groups.staffIds.map((sid) => {
      const recs = groups.grouped[String(sid)] || [];
      const minsByCat = {};
      let total = 0;

      recs.forEach((r) => {
        const items = Array.isArray(r.record) ? r.record : [];
        items.forEach((it) => {
          const label = pickLabel(it); // 表示用
          const t = it?.type || "other";
          const n = it?.name || "other";
          const m = minutesFrom(it);
          if (m <= 0) return;

          cats.add(label);
          if (!labelKeyMap[label]) labelKeyMap[label] = { type: t, name: n }; // 最初の出現で固定
          minsByCat[label] = (minsByCat[label] || 0) + m;
          total += m;
        });
      });

      // %化して合計100%に補正
      const pct = {};
      const denom = Math.max(total, 1);
      Object.keys(minsByCat).forEach(
        (k) => (pct[k] = (minsByCat[k] / denom) * 100)
      );
      const sumPct = Object.values(pct).reduce((s, v) => s + v, 0);
      const scale = sumPct ? 100 / sumPct : 1;
      Object.keys(pct).forEach((k) => (pct[k] *= scale));

      return {
        staffId: sid,
        staffName: groups.getName(String(sid)),
        ...pct,
        // ...minsByCat,
        __totalMin: total,
        __rawMins: minsByCat,
      };
    });

    return {
      dataRows: rows,
      categories: Array.from(cats),
      labelToTypeName: labelKeyMap,
    };
  }, [groups]);

  /** 5) 並び替え（任意） */
  const [sortKey] = useState("total");
  const sortedRows = useMemo(() => {
    const arr = [...dataRows];
    if (sortKey === "total") arr.sort((a, b) => b.__totalMin - a.__totalMin);
    else if (sortKey === "name")
      arr.sort((a, b) => a.staffName.localeCompare(b.staffName, "ja"));
    return arr;
  }, [dataRows, sortKey]);

  /** 6) 色決定： (type,name) 一致の graphColor のみ使用（見つからなければフォールバック） */
  const colorMap = useMemo(() => {
    const fallback = [
      theme.palette.primary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      "#546e7a",
      "#ef6c00",
      "#00897b",
      "#3949ab",
    ];
    const map = {};
    categories.forEach((label, i) => {
      const tn = labelToTypeName?.[label]; // {type, name}
      const key = tn ? `${tn.type}::${tn.name}` : "";
      map[label] =
        (key && TYPE_NAME_COLOR[key]) || fallback[i % fallback.length];
    });
    return map;
  }, [categories, labelToTypeName, TYPE_NAME_COLOR, theme.palette]);

  if (!sortedRows.length) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          データがありません。日付と職員を選択してください。
        </Typography>
      </Box>
    );
  }

  /** 7) 描画（label は表示専用、色は (type,name) → graphColor） */
  return (
    <Box sx={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedRows}
          layout="vertical"
          margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            domain={[0, 100]}
            ticks={[0, 20, 40, 60, 80, 100]}
            tickFormatter={(v) => `${Math.round(v)}%`}
          />
          {/* <XAxis カラムを分にする場合
            type="number"
            domain={[0, "dataMax"]}          // データの最大値まで自動
            tickFormatter={(v) => `${Math.round(v)}分`} // 単位は分
          /> */}
          <YAxis type="category" dataKey="staffName" width={50} />
          <Tooltip
            content={
              <ZeroHidingTooltip
                min={0.05}
                displayOf={(name) => name}
                valueFormatter={(v) => `${v.toFixed(1)}%`}
              />
            }
          />
          <Legend />
          {categories.map((label) => (
            <Bar
              key={label}
              dataKey={label}
              stackId="pct"
              fill={colorMap[label]}
              isAnimationActive={false}
              maxBarSize={120}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
