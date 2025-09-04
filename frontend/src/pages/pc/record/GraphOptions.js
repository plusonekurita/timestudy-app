// src/components/Charts/graphOptions.js

export const GRAPH_OPTIONS = [
  {
    value: "dailyCategoryStacked",
    label: "日別×カテゴリ（積み上げ）",
    dateMode: "single",
  }, // ← 単日
  {
    value: "staffType100",
    label: "スタッフ別・業務タイプ構成比（100%）",
    dateMode: "single",
  },
  {
    value: "staffCategory100",
    label: "スタッフ別構成比（100%積み上げ）",
    dateMode: "single",
  },
  {
    value: "hourCategoryHeatmap",
    label: "時間帯×カテゴリ（ヒートマップ）",
    dateMode: "range",
  },
  { value: "paretoCategory", label: "カテゴリ別パレート", dateMode: "range" },
  {
    value: "productivityQuadrant",
    label: "生産性クォドラント",
    dateMode: "range",
  },
];
