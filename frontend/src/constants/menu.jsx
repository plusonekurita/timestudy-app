import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SettingsIcon from "@mui/icons-material/Settings";
import BarChartIcon from "@mui/icons-material/BarChart";

import { customIcons } from "../assets/icons";
import { colors } from "./theme";

const imageSize = {
  width: "35px",
  height: "35px",
};

// TODO: いずれDBに格納
export const menuCategories = [
  {
    type: "directCare",
    label: "直接介護",
    color: colors.directCare,
    background: colors.directCareBackground,
    items: [
      {
        type: "directCare",
        label: "移動・移乗・体位交換",
        name: "transfer",
        icon: (
          <img
            src={customIcons.transfer}
            alt="移動・移乗・体位交換"
            style={imageSize}
          />
        ),
        color: colors.directCare,
      },
      {
        type: "directCare",
        label: "排泄介助・支援",
        name: "haisetu",
        icon: (
          <img
            src={customIcons.toilet}
            alt="排泄介助・支援"
            style={imageSize}
          />
        ),
        color: colors.directCare,
      },
      {
        type: "directCare",
        label: "入浴・整容・更衣",
        name: "nyuyoku",
        icon: (
          <img
            src={customIcons.nyuyoku}
            alt="入浴・整容・更衣"
            style={imageSize}
          />
        ),
        color: colors.directCare, //TODO: アイコンを準備
      },
      {
        type: "directCare",
        label: "利用者コミュニケーション",
        name: "communication",
        icon: (
          <img
            src={customIcons.communication}
            alt="利用者とのコミュニケーション"
            style={imageSize}
          />
        ),
        color: colors.directCare,
      },
      {
        type: "directCare",
        label: "日常生活自立支援",
        name: "dailyLifeSupport",
        icon: (
          <img
            src={customIcons.jiritu}
            alt="日常生活自立支援"
            style={imageSize}
          />
        ),
        color: colors.directCare,
      },
      {
        type: "directCare",
        label: "行動上の問題への対応",
        name: "behavioralIssue",
        icon: (
          <img
            src={customIcons.mondai}
            alt="行動上の問題への対応"
            style={imageSize}
          />
        ),
        color: colors.directCare,
      },
      {
        type: "directCare",
        label: "食事支援",
        name: "mealSupport",
        icon: <img src={customIcons.meal} alt="食事支援" style={imageSize} />,
        color: colors.directCare,
      },
      {
        type: "directCare",
        label: "機能訓練・医療的処置",
        name: "rehabMedical",
        icon: (
          <img
            src={customIcons.iryou}
            alt="機能訓練・医療的処置"
            style={imageSize}
          />
        ),
        color: colors.directCare,
      },
      {
        type: "directCare",
        label: "その他の直接介護",
        name: "otherDirectCare",
        icon: <AddCircleOutlineIcon fontSize="large" />,
        color: colors.directCare,
      },
    ],
  },
  {
    type: "indirectWork",
    label: "間接業務",
    color: colors.indirectWork,
    items: [
      {
        type: "indirectWork",
        label: "巡回・移動",
        name: "move",
        icon: <img src={customIcons.work} alt="巡回・移動" style={imageSize} />,
        color: colors.indirectWork,
      },
      {
        type: "indirectWork",
        label: "記録・文章作成・連絡調整等",
        name: "recordCoordination",
        icon: (
          <img
            src={customIcons.record}
            alt="記録・文章作成・連絡調整等"
            style={imageSize}
          />
        ),
        color: colors.indirectWork,
      },
      {
        type: "indirectWork",
        label: "アセスメント・情報収集",
        name: "assessmentInfo",
        icon: (
          <img
            src={customIcons.assesment}
            alt="アセスメント・情報収集"
            style={imageSize}
          />
        ),
        color: colors.indirectWork,
      },
      {
        type: "indirectWork",
        label: "介護計画の作成・見直し",
        name: "carePlan",
        icon: (
          <img
            src={customIcons.kaigoKiroku}
            alt="介護計画の作成・見直し"
            style={imageSize}
          />
        ),
        color: colors.indirectWork,
      },
      {
        type: "indirectWork",
        label: "見守り機器の使用・確認",
        name: "monitoringDevice",
        icon: <BarChartIcon fontSize="large" />,
        color: colors.indirectWork,
      },
      {
        type: "indirectWork",
        label: "ロボ・ICT準備片付け",
        name: "robot",
        icon: <BarChartIcon fontSize="large" />,
        color: colors.indirectWork,
      },
      {
        type: "indirectWork",
        label: "職員に対する指導・教育",
        name: "staffTraining",
        icon: <BarChartIcon fontSize="large" />,
        color: colors.indirectWork,
      },
      {
        type: "indirectWork",
        label: "食事・おやつの配膳・下膳",
        name: "mealServing",
        icon: (
          <img
            src={customIcons.haizen}
            alt="食事・おやつの配膳・下膳など"
            style={imageSize}
          />
        ),
        color: colors.indirectWork,
      },
      {
        type: "indirectWork",
        label: "入浴業務の準備等",
        name: "bathingPrep",
        icon: <BarChartIcon fontSize="large" />,
        color: colors.indirectWork,
      },
      {
        type: "indirectWork",
        label: "リネン交換・ベッドメイク",
        name: "bedmaking",
        icon: (
          <img
            src={customIcons.bedMaking}
            alt="リネン交換・ベッドメイク"
            style={imageSize}
          />
        ),
        color: colors.indirectWork,
      },
      {
        type: "indirectWork",
        label: "居室清掃・片付け",
        name: "cleaning",
        icon: (
          <img
            src={customIcons.clean}
            alt="居室清掃・片付け"
            style={imageSize}
          />
        ),
        color: colors.indirectWork,
      },
      {
        type: "indirectWork",
        label: "消毒などの感染症対応",
        name: "disinfection",
        icon: (
          <img
            src={customIcons.disinfection}
            alt="消毒などの感染症対応"
            style={imageSize}
          />
        ),
        color: colors.indirectWork,
      },
      {
        type: "indirectWork",
        label: "その他の間接業務",
        name: "otherIndirectWork",
        icon: <BarChartIcon fontSize="large" />,
        color: colors.indirectWork,
      },
    ],
  },
  {
    type: "break",
    label: "休憩",
    color: colors.break,
    items: [
      {
        type: "break",
        label: "休憩・待機・仮眠",
        name: "break",
        icon: (
          <img
            src={customIcons.break}
            alt="休憩・待機・仮眠"
            style={imageSize}
          />
        ),
        color: colors.break,
      },
    ],
  },
  {
    type: "other",
    label: "その他",
    color: colors.other,
    items: [
      {
        type: "other",
        label: "その他",
        name: "other",
        icon: <SettingsIcon fontSize="large" />,
        color: colors.other,
      },
      {
        type: "other",
        label: "余裕時間",
        name: "bufferTime",
        icon: <HelpOutlineIcon fontSize="large" />,
        color: colors.other,
      },
    ],
  },
];
