import {
  Dashboard as DashboardIcon,
  PersonAddAlt1 as PersonAddAlt1Icon,
  Group as GroupIcon,
  TapAndPlay as TapAndPlayIcon,
  Logout as LogoutIcon,
  Download as DownloadIcon,
  SignalCellularAlt as SignalCellularAltIcon,
  AccessTime as AccessTimeIcon,
  GroupAdd as GroupAddIcon,
  Person as PersonIcon,
  Leaderboard as LeaderboardIcon,
  Description as DescriptionIcon,
  ManageAccounts as ManageAccountsIcon,
  Assignment as AssignmentIcon,
  Create as CreateIcon,
} from "@mui/icons-material";

// import ConnectedUserListPage from "../pages/Admin/components/ConnectedUserListPage";
// import DashboardPage from "../pages/Admin/components/DashboardPage";
// import UserListPage from "../pages/Admin/components/UserListPage";
// import UserAddPage from "../pages/Admin/components/UserAddPage";

// 管理者用ドロワーメニュー
export const adminMenuItems = (setLoading) => [
  // {
  //   label: "ダッシュボード",
  //   icon: <DashboardIcon />,
  //   content: <DashboardPage setLoading={setLoading} />,
  // },
  // {
  //   label: "利用者追加",
  //   icon: <PersonAddAlt1Icon />,
  //   content: <UserAddPage setLoading={setLoading} />,
  // },
  // {
  //   label: "利用者一覧",
  //   icon: <GroupIcon />,
  //   content: <UserListPage setLoading={setLoading} />,
  // },
  // {
  //   label: "接続者一覧",
  //   icon: <TapAndPlayIcon />,
  //   content: <ConnectedUserListPage setLoading={setLoading} />,
  // },
  // {
  //   label: "設定",
  //   icon: <SettingsIcon />,
  //   content: <Typography sx={{ p: 2 }}>設定ページ</Typography>,
  // },
];

// デスクトップ用ドロワーメニュー
export const managementMenuItems = () => [
  {
    id: "survey-sheet-list",
    label: "調査票一覧",
    icon: DescriptionIcon,
    color: "#3B82F6",
    children: [
      {
        id: "time",
        label: "タイムスタディ調査票",
        icon: AccessTimeIcon,
        path: "/survey-sheet/time",
      },
      // {
      //   id: "staff",
      //   label: "職員向け調査票",
      //   icon: GroupIcon,
      //   path: "/survey-sheet/staff",
      // },
      // {
      //   id: "user",
      //   label: "利用者向け調査票",
      //   icon: PersonIcon,
      //   path: "/survey-sheet/user",
      // },
    ],
  },
  {
    id: "records",
    label: "記録確認",
    icon: LeaderboardIcon,
    color: "#64748B",
    children: [
      {
        id: "timeRcoed",
        label: "タイムスタディ",
        icon: AccessTimeIcon,
        path: "/record/time",
      },
    ],
  },
  {
    id: "report",
    label: "実績報告書",
    icon: AssignmentIcon,
    color: "#10B981",
    isAdmin: true,
    children: [
      {
        id: "create",
        label: "報告書作成",
        icon: CreateIcon,
        path: "/report/create",
      },
    ],
  },
  {
    id: "management",
    label: "管理",
    icon: ManageAccountsIcon,
    color: "#F59E0B",
    isAdmin: true,
    children: [
      {
        id: "list",
        label: "職員一覧",
        icon: GroupIcon,
        path: "/management/list",
      },
      {
        id: "add",
        label: "職員追加",
        icon: PersonAddAlt1Icon,
        path: "/management/add",
      },
    ],
  },
];
