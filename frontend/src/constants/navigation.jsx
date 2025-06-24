import AlignVerticalBottomIcon from "@mui/icons-material/AlignVerticalBottom";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AppsIcon from "@mui/icons-material/Apps";

export const TIME_NAV = [
  { label: "メニュー", icon: <AppsIcon />, path: "/menu" },
  { label: "計測", icon: <AccessTimeIcon />, path: "/time" },
  { label: "履歴", icon: <EventNoteIcon />, path: "/time/timeline" },
  { label: "統計", icon: <AlignVerticalBottomIcon />, path: "/time/records" },
];

export const SHEET_NAV = [
  { label: "メニュー", icon: <AppsIcon />, path: "/menu" },
  { label: "一覧", icon: <FormatListBulletedIcon />, path: "/sheetList" },
];
