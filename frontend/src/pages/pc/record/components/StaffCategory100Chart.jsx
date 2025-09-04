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

// メニューの色定義（パスはあなたの環境に合わせて）
import { menuCategories } from "../../../../constants/menu";

/** “直介護”とみなすラベル（指標用・必要に応じて調整） */
const DIRECT_CARE_LABELS = new Set([
  "移動・移乗・体位交換",
  "入浴・整容・更衣",
  "排泄介助・支援",
  "食事支援",
  "機能訓練・医療的処置",
  "その他の直接介護",
]);

const minutesFrom = (item) => {
  const sec =
    (typeof item?.duration === "number" ? item.duration : null) ??
    (item?.startTime && item?.endTime
      ? dayjs(item.endTime).diff(dayjs(item.startTime), "second")
      : 0);
  const m = sec / 60;
  return m > 0 ? m : 0;
};
const pickLabel = (it) => it?.label || it?.name || it?.type || "その他";

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0]?.payload || {};
  const totalMin = row.__totalMin || 0;
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
      {Object.entries(row.__rawMins || {}).map(([cat, min]) => (
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

  // 1) メニューから「カテゴリ名 → 色（graphColor）」の辞書
  const LABEL_COLOR = useMemo(() => {
    const map = {};
    (menuCategories || []).forEach((cat) => {
      (cat.items || []).forEach((it) => {
        if (it?.label) {
          map[it.label] = it.graphColor || it.color || cat.color;
        }
      });
    });
    if (!map["その他"]) map["その他"] = "#9e9e9e";
    return map;
  }, []);

  // 2) オフィスか個人か
  const isOffice =
    (officeRecords && officeRecords.length > 0) ||
    (groupedByStaff && Object.keys(groupedByStaff || {}).length > 0);

  // 3) 対象スタッフの決定：★ grouped_by_staff に実データがある人だけ
  const groups = useMemo(() => {
    if (isOffice) {
      const idsWithData = Object.entries(groupedByStaff || {})
        .filter(([, arr]) => Array.isArray(arr) && arr.length > 0) // 記録ゼロは除外
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

  // 4) 集計：スタッフ×カテゴリ → 分 → %（合計100%に正規化）
  const { dataRows, categories } = useMemo(() => {
    const cats = new Set();
    const rows = groups.staffIds.map((sid) => {
      const recs = groups.grouped[String(sid)] || [];
      const minsByCat = {};
      let total = 0;

      recs.forEach((r) => {
        const items = Array.isArray(r.record) ? r.record : [];
        items.forEach((it) => {
          const cat = pickLabel(it);
          const m = minutesFrom(it);
          if (m <= 0) return;
          cats.add(cat);
          minsByCat[cat] = (minsByCat[cat] || 0) + m;
          total += m;
        });
      });

      // %化 → 合計100%にスケーリング（浮動小数誤差対策）
      const pct = {};
      const denom = Math.max(total, 1);
      Object.keys(minsByCat).forEach((k) => {
        pct[k] = (minsByCat[k] / denom) * 100;
      });
      const sumPct = Object.values(pct).reduce((s, v) => s + v, 0);
      const scale = sumPct ? 100 / sumPct : 1;
      Object.keys(pct).forEach((k) => (pct[k] *= scale));

      return {
        staffId: sid,
        staffName: groups.getName(String(sid)),
        ...pct,
        __totalMin: total,
        __rawMins: minsByCat,
        __directRatio:
          total > 0
            ? (Object.entries(minsByCat)
                .filter(([k]) => DIRECT_CARE_LABELS.has(k))
                .reduce((s, [, v]) => s + v, 0) /
                total) *
              100
            : 0,
      };
    });

    return {
      dataRows: rows, // idsWithData でゼロは既に除外済み
      categories: Array.from(cats),
    };
  }, [groups]);

  // 5) 並び替え（必要に応じて）
  const [sortKey] = useState("total");
  const sortedRows = useMemo(() => {
    const arr = [...dataRows];
    if (sortKey === "total") arr.sort((a, b) => b.__totalMin - a.__totalMin);
    else if (sortKey === "direct")
      arr.sort((a, b) => b.__directRatio - a.__directRatio);
    else if (sortKey === "name")
      arr.sort((a, b) => a.staffName.localeCompare(b.staffName));
    return arr;
  }, [dataRows, sortKey]);

  // 6) 色割り当て（menu の graphColor を最優先）
  const colorMap = useMemo(() => {
    const fallback = [
      theme.palette.primary.main,
      theme.palette.secondary?.main || "#7b1fa2",
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
      map[label] = LABEL_COLOR[label] || fallback[i % fallback.length];
    });
    return map;
  }, [categories, LABEL_COLOR, theme.palette]);

  if (!sortedRows.length) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          データがありません。日付と職員を選択してください。
        </Typography>
      </Box>
    );
  }

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
          <YAxis type="category" dataKey="staffName" width={50} />
          <Tooltip content={<CustomTooltip />} />
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
