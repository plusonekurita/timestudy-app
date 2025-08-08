import { managementMenuItems } from "../constants/drawerMenuItem";

// 現在のパスからセクション名を取得
export const getSectionLabelFromPath = (pathname) => {
  const menus = managementMenuItems();
  for (const section of menus) {
    for (const child of section.children || []) {
      if (child.path === pathname) {
        return child.label;
      }
    }
  }
  return null;
};
