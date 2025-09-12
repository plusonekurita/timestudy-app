import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Box, Typography, useTheme } from "@mui/material";
import { useSelector } from "react-redux";
// src/components/Charts/DailyCategoryStackedChart.jsx
import React, { useMemo } from "react";
import dayjs from "dayjs";
import { menuCategories } from "../../../../constants/menu";
import ZeroHidingTooltip from "./ZeroHidingTooltip";

/** 既知カテゴリの色（足りない分はテーマ色で埋めます） */
const PRESET_COLORS = {
  "移動・移乗・体位交換": "#c62828",
  "入浴・整容・更衣": "#1976d2",
  行動上の問題への対応: "#ef5350",
  入浴業務の準備等: "#90caf9",
  "排泄介助・支援": "#26c6da",
  "休憩・待機・仮眠": "#ffb74d",
  "アセスメント・情報収集": "#ab47bc",
  "機能訓練・医療的処置": "#5c6bc0",
  その他の直接介護: "#8e24aa",
  "介護計画の作成・見直し": "#43a047",
  食事支援: "#ffa726",
  その他: "#9e9e9e",
};

function minutesFrom(item) {
  // duration(秒) があればそれを使う。無ければ start/end から算出
  const sec =
    (typeof item.duration === "number" ? item.duration : null) ??
    (item.startTime && item.endTime
      ? dayjs(item.endTime).diff(dayjs(item.startTime), "second")
      : 0);
  // 0 で埋まるのを避けるため、0.5分未満は切り捨て
  const min = sec / 60;
  return Math.round(min * 10) / 10; // 小数1桁
}

function pickLabel(it) {
  return it?.label || it?.name || it?.type || "その他";
}

export default function DailyCategoryStackedChart({ height = 820 }) {
  const theme = useTheme();
  // Redux からデータを取得
  const { officeRecords = [], record = [] } = useSelector(
    (s) => s.timeRecord || {}
  );

  // データ源を決定（全員取得があればそれを優先。無ければ個人の配列）
  const source = useMemo(
    () => (officeRecords?.length ? officeRecords : record) || [],
    [officeRecords, record]
  );

  // 変換：日付(YYYY-MM-DD) × カテゴリ の合計（分）
  const { chartData, categories } = useMemo(() => {
    const byDay = new Map(); // key: 'YYYY-MM-DD' -> obj { date, catA: xx, catB: yy, total: zz }
    const cats = new Set();

    source.forEach((rec) => {
      const d = dayjs(rec.record_date).format("YYYY-MM-DD");
      if (!byDay.has(d)) byDay.set(d, { date: d, total: 0 });

      const items = Array.isArray(rec.record) ? rec.record : [];
      items.forEach((it) => {
        const label = pickLabel(it);
        const m = minutesFrom(it);
        if (m <= 0) return;
        cats.add(label);
        const row = byDay.get(d);
        row[label] = (row[label] || 0) + m;
        row.total += m;
      });
    });

    // 並び：日付昇順
    const data = Array.from(byDay.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    return { chartData: data, categories: Array.from(cats) };
  }, [source]);

  // カラー割当（足りない分はテーマ色とグレー系で循環）
  const dynamicPalette = useMemo(
    () => [
      theme.palette.primary.main,
      theme.palette.secondary?.main || "#7b1fa2",
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      "#546e7a",
      "#ef6c00",
      "#00897b",
      "#3949ab",
    ],
    [theme.palette]
  );
  // メニュー定義から「項目ラベル → グラフカラー」のマップを作成
  const MENU_COLOR_MAP = useMemo(() => {
    const map = {};
    (menuCategories || []).forEach((cat) => {
      (cat?.items || []).forEach((it) => {
        if (it?.label && it?.graphColor) {
          map[it.label] = it.graphColor;
        }
      });
    });
    return map;
  }, []);
  const colorMap = useMemo(() => {
    const map = {};
    categories.forEach((c, i) => {
      map[c] =
        MENU_COLOR_MAP[c] ||
        PRESET_COLORS[c] ||
        dynamicPalette[i % dynamicPalette.length];
    });
    return map;
  }, [categories, MENU_COLOR_MAP, dynamicPalette]);

  if (!source.length) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          データがありません。日付範囲と職員を選択してください。
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 16, right: 24, left: 8, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => dayjs(d).format("M/D")}
            tickMargin={8}
          />
          <YAxis
            label={{
              value: "分",
              angle: -90,
              position: "insideLeft",
              offset: 10,
            }}
            allowDecimals={false}
            width={48}
          />
          <Tooltip
            content={
              <ZeroHidingTooltip
                min={0.05}
                valueFormatter={(v) => `${Math.round(v * 10) / 10} 分`}
                displayOf={(name) => name}
              />
            }
            labelFormatter={(d) => dayjs(d).format("YYYY年M月D日")}
          />
          <Legend />
          {/* 積み上げバー（カテゴリ） */}
          {categories.map((c) => (
            <Bar
              key={c}
              dataKey={c}
              stackId="total"
              fill={colorMap[c]}
              isAnimationActive={false}
              maxBarSize={150}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
}
