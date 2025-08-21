import useMediaQuery from "@mui/material/useMediaQuery";
import React, { useMemo } from "react";

import TopMenuDesktop from "./TopMenuDesktop";
import TopMenuMobile from "./TopMenuMobile";


const TopMenu = () => {
  // 画面幅が狭い（スマホ想定）
  const isPhoneWidth = useMediaQuery("(max-width:600px)");
  // タッチ主体デバイス（マウスhover不可 & 指タップの粗いポインタ）
  const isCoarsePrimary = useMediaQuery("(hover: none) and (pointer: coarse)");
  // スマホUAの簡易判定（iPad等は除外）
  const isMobileUA = useMemo(
    () => /Android.+Mobile|iPhone|iPod/i.test(navigator.userAgent),
    []
  );

  // ★スマホ判定：幅が狭く、かつ タッチ主体 or スマホUA
  const isSmartphone = isPhoneWidth && (isCoarsePrimary || isMobileUA);

  return isSmartphone ? <TopMenuMobile /> : <TopMenuDesktop />;
};

export default TopMenu;
