// src/components/Charts/graphOptions.js

export const GRAPH_OPTIONS_ADMIN = [
  {
    value: "dailyCategoryStacked",
    label: "日別×カテゴリ（積み上げ）",
    dateMode: "range",
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
    value: "hourStacked",
    label: "時間帯×項目別（積み上げ）",
    dateMode: "single",
  },
  {
    value: "hourCategoryHeatmap",
    label: "時間帯×カテゴリ（ヒートマップ）",
    dateMode: "range",
  },
  // { value: "paretoCategory", label: "カテゴリ別パレート", dateMode: "range" },
  // {
  //   value: "productivityQuadrant",
  //   label: "生産性クォドラント",
  //   dateMode: "range",
  // },
];

export const GRAPH_OPTIONS_MEMBER = [
  {
    value: "staffType100",
    label: "分類別100%積み上げ",
    dateMode: "single",
  },
  {
    value: "staffCategory100",
    label: "項目別100%積み上げ",
    dateMode: "single",
  },
  {
    value: "hourStacked",
    label: "時間帯×項目別（積み上げ）",
    dateMode: "single",
  },
];

// isAdmin から適切な配列を返すヘルパ
export const graphOptionsFor = (isAdmin) =>
  isAdmin ? GRAPH_OPTIONS_ADMIN : GRAPH_OPTIONS_MEMBER;
