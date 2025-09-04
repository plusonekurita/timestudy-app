import { Box, Stack } from "@mui/material";
import { Outlet } from "react-router-dom";
import React from "react";

import PageSectionLayout from "../../../components/PageSectionLayout/PageSectionLayout";

const Management = () => {
  return (
    <PageSectionLayout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
        gap={3}
      >
        <Stack spacing={3}>
          {/* 第2のurlのパスでコンポーネントを切り替える */}
          <Outlet />
        </Stack>
      </Box>
    </PageSectionLayout>
  );
};

export default Management;
