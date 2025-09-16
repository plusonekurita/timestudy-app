import { Box, Typography } from "@mui/material";
import React from "react";

import PageSectionLayout from "../../../components/PageSectionLayout/PageSectionLayout";
import HourStackedGraph from "./components/HourStackedGraph";
import FilterControlsSingle from "./components/FilterControlsSingle";

const TimeStudySurvey = () => {
  return (
    <PageSectionLayout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
        gap={6}
      >
        <FilterControlsSingle />

        {/* ビュアー */}
        <Box display="flex" justifyContent="center" alignItems="center">
          <HourStackedGraph height={430} />
        </Box>
      </Box>
    </PageSectionLayout>
  );
};

export default TimeStudySurvey;
