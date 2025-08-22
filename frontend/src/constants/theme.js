// カラーの指定
export const colors = {
  primary: "#1976d2", // プライマリカラー
  loginTheme: "#ffffff", // ログイン画面のテーマから

  // 一般カラー
  accent: "#ffeb3b", // 例: アクセントカラー
  background: "#ffffff", // 背景色
  text: "#333333", // テキストカラー
  error: "#f44336", // エラーカラー

  // カテゴリごとの色 (menu.jsx で使用)
  directCare: "#E74C3C", // 直接介護
  indirectWork: "#27AE60", // 間接業務
  break: "#F1C40F", // 休憩
  other: "#818181", // その他
  directCareBackground: "rgba(231, 77, 60, 0.1)",
  indirectWorkBackground: "rgba(39, 174, 96, 0.1)",
  breakBackground: "rgba(241, 196, 15, 0.1)",
  otherBackground: "rgba(129, 129, 129, 0.1)",

  // プランカラー
  pro: "#2196F3", // #E0F7FA
  basic: "#607D8B",
};

// グラフに使用される色
export const graphColors = {
  items: {
    // 直接介護
    transfer: "#C62828",
    haisetu: "#6D4C41",
    nyuyoku: "#0277BD",
    communication: "#6A1B9A",
    dailyLifeSupport: "#2E7D32",
    behavioralIssue: "#e76e6eff",
    mealSupport: "#EF6C00",
    rehabMedical: "#1565C0",
    otherDirectCare: "#8E24AA",
    // 間接業務
    move: "#00796B",
    recordCoordination: "#455A64",
    assessmentInfo: "#7B1FA2",
    monitoringDevice: "#00838F",
    robot: "#039BE5",
    staffTraining: "#AD1457",
    mealServing: "rgba(255, 152, 121, 1)",
    bathingPrep: "#00ACC1",
    bedmaking: "#FF8F00",
    cleaning: "#558B2F",
    disinfection: "#B71C1C",
    otherIndirectWork: "#616161",
    // 休憩・その他
    break: "#F39C12",
    other: "#757575",
    bufferTime: "#546E7A",
  },
  fallbackByType: {
    directCare: "#E74C3C",
    indirectWork: "#27AE60",
    break: "#F1C40F",
    other: "#818181",
  },
  default: "#9e9e9e",
};
