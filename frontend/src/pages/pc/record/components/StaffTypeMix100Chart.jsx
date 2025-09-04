// src/components/Charts/StaffTypeMix100Chart.jsx
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
import {
  Box,
  Typography,
  // Stack,
  // ToggleButton,
  // ToggleButtonGroup,
  useTheme,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import dayjs from "dayjs";

import { menuCategories } from "../../../../constants/menu";

// このファイルはコンポーネントのみを default export（Fast Refresh 対応）
export default function StaffTypeMix100Chart({ height = 420 }) {
  const theme = useTheme();
  const {
    officeRecords = [],
    groupedByStaff = {},
    staffMeta = [],
    record = [],
  } = useSelector((s) => s.timeRecord || {});

  const isOffice =
    (officeRecords && officeRecords.length > 0) ||
    (groupedByStaff && Object.keys(groupedByStaff || {}).length > 0);

  // ---- 業務タイプ定義（固定4種） & menuCategories から色/ラベルを取り出す ----
  const TYPE_KEYS = ["directCare", "indirectWork", "break", "other"];

  const TYPE_META = useMemo(() => {
    const metaFromMenu = Object.fromEntries(
      (menuCategories || []).map((c) => [
        c.type,
        {
          label: c.label ?? c.type,
          color: c.color ?? "#9e9e9e",
        },
      ])
    );
    // 無い場合はテーマで補完
    return {
      directCare: metaFromMenu.directCare || {
        label: "直接介護",
        color: theme.palette.primary.main,
      },
      indirectWork: metaFromMenu.indirectWork || {
        label: "間接業務",
        color: theme.palette.success.main,
      },
      break: metaFromMenu.break || {
        label: "休憩・待機・仮眠",
        color: theme.palette.warning.main,
      },
      other: metaFromMenu.other || {
        label: "その他",
        color: "#9e9e9e",
      },
    };
  }, [theme.palette]);

  // ---- 集計（分→%） ----
  const dataRows = useMemo(() => {
    let staffIds = [];
    let getName = (id) => `ID:${id}`;

    if (isOffice) {
      // ★ groupedByStaff のうち “配列が空でない” ID だけを対象にする（= 記録ゼロは出さない）
      staffIds = Object.entries(groupedByStaff || {})
        .filter(([, arr]) => Array.isArray(arr) && arr.length > 0)
        .map(([sid]) => String(sid));

      const nameMap = Object.fromEntries(
        (staffMeta || []).map((s) => [String(s.id), s.name])
      );
      getName = (id) => nameMap[id] || `ID:${id}`;
    } else {
      const sid = String(record?.[0]?.staff_id ?? "0");
      staffIds = [sid];
      const name = record?.[0]?.staff_name || "スタッフ";
      getName = () => name;
    }

    const rows = staffIds.map((sid) => {
      const recs = isOffice ? groupedByStaff[String(sid)] || [] : record || [];

      // タイプ別合計（分）
      const mins = { directCare: 0, indirectWork: 0, break: 0, other: 0 };
      let totalMin = 0;

      recs.forEach((r) => {
        (Array.isArray(r.record) ? r.record : []).forEach((it) => {
          const key = TYPE_KEYS.includes(it?.type) ? it.type : "other";
          const sec =
            typeof it?.duration === "number"
              ? it.duration
              : it?.startTime && it?.endTime
              ? dayjs(it.endTime).diff(dayjs(it.startTime), "second")
              : 0;
          const m = Math.max(sec / 60, 0);
          if (!m) return;
          mins[key] += m;
          totalMin += m;
        });
      });

      // %化（合計100%に正規化して誤差を除去）
      const denom = Math.max(totalMin, 1);
      const pctObj = Object.fromEntries(
        TYPE_KEYS.map((k) => [k, (mins[k] / denom) * 100])
      );
      const sumPct = TYPE_KEYS.reduce((s, k) => s + pctObj[k], 0);
      const scale = sumPct ? 100 / sumPct : 1;
      TYPE_KEYS.forEach((k) => (pctObj[k] *= scale));

      return {
        staffId: sid,
        staffName: getName(String(sid)),
        ...pctObj, // dataKey はタイプ名（directCare 等）
        __totalMin: totalMin,
        __directPct: pctObj.directCare, // 並び替え用に保持
        __rawMin: mins, // Tooltip 用に分を保持
      };
    });

    return rows;
  }, [isOffice, staffMeta, groupedByStaff, record]);

  // 並び替え（合計時間 / 直接介護比率 / 名前）
  const [sortKey, setSortKey] = useState("total");
  const sortedRows = useMemo(() => {
    const arr = [...dataRows];
    if (sortKey === "total") arr.sort((a, b) => b.__totalMin - a.__totalMin);
    else if (sortKey === "direct")
      arr.sort((a, b) => b.__directPct - a.__directPct);
    else if (sortKey === "name")
      arr.sort((a, b) => a.staffName.localeCompare(b.staffName));
    return arr;
  }, [dataRows, sortKey]);

  if (!sortedRows.length) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          データがありません。日付範囲と職員（全員）を選択してください。
        </Typography>
      </Box>
    );
  }

  // Tooltip（%と分を表示）
  const TooltipBox = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const row = payload[0]?.payload;
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
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 0.5 }}
        >
          合計：{Math.round(row.__totalMin)} 分
        </Typography>
        {TYPE_KEYS.map((k) => (
          <Box
            key={k}
            sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
          >
            <Typography variant="caption">{TYPE_META[k].label}</Typography>
            <Typography variant="caption">
              {row[k].toFixed(1)}%（{Math.round(row.__rawMin?.[k] || 0)}分）
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

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
          <Tooltip content={<TooltipBox />} />
          <Legend />
          {/* dataKey はタイプ名、凡例名・色は menu.jsx 由来 */}
          {TYPE_KEYS.map((k) => (
            <Bar
              key={k}
              dataKey={k}
              name={TYPE_META[k].label}
              stackId="pct"
              fill={TYPE_META[k].color}
              isAnimationActive={false}
              maxBarSize={120}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
