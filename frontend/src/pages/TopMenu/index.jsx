import useMediaQuery from "@mui/material/useMediaQuery";
import React from "react";

import TopMenuDesktop from "./TopMenuDesktop";
import TopMenuMobile from "./TopMenuMobile";

const TopMenu = () => {
  const isMobile = useMediaQuery("(max-width:600px)");

  return isMobile ? <TopMenuMobile /> : <TopMenuDesktop />;
};

export default TopMenu;
