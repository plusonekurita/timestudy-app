import { customIcons, topMenuIcons } from "../assets/icons";
import { colors, graphColors } from "./theme";

// メニュー画面アイコン
export const menuItems = [
  {
    label: "タイムスタディ",
    icon: <img src={topMenuIcons.time} />,
    path: "/time",
  },
  // {
  //   label: "調査票",
  //   icon: <img src={topMenuIcons.sheet} />,
  //   path: "/sheetList",
  // },
];

// TODO: いずれマスターとしてDBに格納
export const menuCategories = [
  {
    type: "directCare",
    label: "直接介護",
    color: colors.directCare,
    background: colors.directCareBackground,
    items: [
      {
        no: 1,
        type: "directCare",
        label: "移動・移乗・体位交換",
        name: "transfer",
        icon: <img src={customIcons.transfer} alt="移動・移乗・体位交換" />,
        color: colors.directCare,
        graphColor: graphColors.items.transfer,
      },
      {
        no: 2,
        type: "directCare",
        label: "排泄介助・支援",
        name: "haisetu",
        icon: <img src={customIcons.toilet} alt="排泄介助・支援" />,
        color: colors.directCare,
        graphColor: graphColors.items.haisetu,
      },
      {
        no: 3,
        type: "directCare",
        label: "入浴・整容・更衣",
        name: "nyuyoku",
        icon: <img src={customIcons.nyuyoku} alt="入浴・整容・更衣" />,
        color: colors.directCare, //TODO: アイコンを準備
        graphColor: graphColors.items.nyuyoku,
      },
      {
        no: 4,
        type: "directCare",
        label: "利用者コミュニケーション",
        name: "communication",
        icon: (
          <img
            src={customIcons.communication}
            alt="利用者とのコミュニケーション"
          />
        ),
        color: colors.directCare,
        graphColor: graphColors.items.communication,
      },
      {
        no: 5,
        type: "directCare",
        label: "日常生活自立支援",
        name: "dailyLifeSupport",
        icon: <img src={customIcons.jiritu} alt="日常生活自立支援" />,
        color: colors.directCare,
        graphColor: graphColors.items.dailyLifeSupport,
      },
      {
        no: 6,
        type: "directCare",
        label: "行動上の問題への対応",
        name: "behavioralIssue",
        icon: <img src={customIcons.mondai} alt="行動上の問題への対応" />,
        color: colors.directCare,
        graphColor: graphColors.items.behavioralIssue,
      },
      {
        no: 7,
        type: "directCare",
        label: "食事支援",
        name: "mealSupport",
        icon: <img src={customIcons.meal} alt="食事支援" />,
        color: colors.directCare,
        graphColor: graphColors.items.mealSupport,
      },
      {
        no: 8,
        type: "directCare",
        label: "機能訓練・医療的処置",
        name: "rehabMedical",
        icon: <img src={customIcons.iryou} alt="機能訓練・医療的処置" />,
        color: colors.directCare,
        graphColor: graphColors.items.rehabMedical,
      },
      {
        no: 9,
        type: "directCare",
        label: "その他の直接介護",
        name: "otherDirectCare",
        icon: <img src={customIcons.careOther} alt="その他の直接介護" />,
        color: colors.directCare,
        graphColor: graphColors.items.otherDirectCare,
      },
    ],
  },
  {
    type: "indirectWork",
    label: "間接業務",
    color: colors.indirectWork,
    items: [
      {
        no: 10,
        type: "indirectWork",
        label: "巡回・移動",
        name: "move",
        icon: <img src={customIcons.work} alt="巡回・移動" />,
        color: colors.indirectWork,
        graphColor: graphColors.items.move,
      },
      {
        no: 11,
        type: "indirectWork",
        label: "記録・文章作成・連絡調整等",
        name: "recordCoordination",
        icon: <img src={customIcons.record} alt="記録・文章作成・連絡調整等" />,
        color: colors.indirectWork,
        graphColor: graphColors.items.recordCoordination,
      },
      {
        no: 12,
        type: "indirectWork",
        label: "アセス・情報収集・計画",
        name: "assessmentInfo",
        icon: <img src={customIcons.assesment} alt="アセス・情報収集・計画" />,
        color: colors.indirectWork,
        graphColor: graphColors.items.assessmentInfo,
      },
      {
        no: 13,
        type: "indirectWork",
        label: "見守り機器の使用・確認",
        name: "monitoringDevice",
        icon: <img src={customIcons.mimamori} alt="見守り機器の使用・確認" />,
        color: colors.indirectWork,
        graphColor: graphColors.items.monitoringDevice,
      },
      {
        no: 14,
        type: "indirectWork",
        label: "ロボ・ICT準備片付け",
        name: "robot",
        icon: <img src={customIcons.robo} alt="ロボ・ICT準備片付け" />,
        color: colors.indirectWork,
        graphColor: graphColors.items.robot,
      },
      {
        no: 15,
        type: "indirectWork",
        label: "職員に対する指導・教育",
        name: "staffTraining",
        icon: <img src={customIcons.kyouiku} alt="職員に対する指導・教育" />,
        color: colors.indirectWork,
        graphColor: graphColors.items.staffTraining,
      },
      {
        no: 16,
        type: "indirectWork",
        label: "食事・おやつの配膳・下膳",
        name: "mealServing",
        icon: (
          <img src={customIcons.haizen} alt="食事・おやつの配膳・下膳など" />
        ),
        color: colors.indirectWork,
        graphColor: graphColors.items.mealServing,
      },
      {
        no: 17,
        type: "indirectWork",
        label: "入浴業務の準備等",
        name: "bathingPrep",
        icon: <img src={customIcons.cleanBath} alt="入浴業務の準備等" />,
        color: colors.indirectWork,
        graphColor: graphColors.items.bathingPrep,
      },
      {
        no: 18,
        type: "indirectWork",
        label: "リネン交換・ベッドメイク",
        name: "bedmaking",
        icon: (
          <img src={customIcons.bedMaking} alt="リネン交換・ベッドメイク" />
        ),
        color: colors.indirectWork,
        graphColor: graphColors.items.bedmaking,
      },
      {
        no: 19,
        type: "indirectWork",
        label: "居室清掃・片付け",
        name: "cleaning",
        icon: <img src={customIcons.clean} alt="居室清掃・片付け" />,
        color: colors.indirectWork,
        graphColor: graphColors.items.cleaning,
      },
      {
        no: 20,
        type: "indirectWork",
        label: "消毒などの感染症対応",
        name: "disinfection",
        icon: <img src={customIcons.disinfection} alt="消毒などの感染症対応" />,
        color: colors.indirectWork,
        graphColor: graphColors.items.disinfection,
      },
      {
        no: 21,
        type: "indirectWork",
        label: "その他の間接業務",
        name: "otherIndirectWork",
        icon: <img src={customIcons.workOther} alt="その他の間接業務" />,
        color: colors.indirectWork,
        graphColor: graphColors.items.otherIndirectWork,
      },
    ],
  },
  {
    type: "break",
    label: "休憩",
    color: colors.break,
    items: [
      {
        no: 22,
        type: "break",
        label: "休憩・待機・仮眠",
        name: "break",
        icon: <img src={customIcons.break} alt="休憩・待機・仮眠" />,
        color: colors.break,
        graphColor: graphColors.items.break,
      },
    ],
  },
  {
    type: "other",
    label: "その他",
    color: colors.other,
    items: [
      {
        no: 23,
        type: "other",
        label: "その他",
        name: "other",
        icon: <img src={customIcons.other} alt="その他" />,
        color: colors.other,
        graphColor: graphColors.items.other,
      },
      {
        no: 24,
        type: "other",
        label: "余裕時間",
        name: "bufferTime",
        icon: <img src={customIcons.yoyuu} alt="余裕時間" />,
        color: colors.other,
        graphColor: graphColors.items.bufferTime,
      },
    ],
  },
];
