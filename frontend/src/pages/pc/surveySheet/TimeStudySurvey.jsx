import { Box, Typography } from "@mui/material";
import React from "react";

import FilterControlsSingle from "../../../components/FilterControlsSingle/FilterControlsSingle";
import PageSectionLayout from "../../../components/PageSectionLayout/PageSectionLayout";
import HourStackedGraph from "./components/HourStackedGraph";

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
