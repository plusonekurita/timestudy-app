import { Box, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import React, { useEffect } from "react";

import PageSectionLayout from "../../components/PageSectionLayout/PageSectionLayout";
import FilterControls from "../../components/FilterControls/FilterControls";

const TimeStudySurvey = () => {
  const timeStudyRecord = useSelector((state) => state.timeRecord.record);

  console.log(timeStudyRecord);

  return (
    <PageSectionLayout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
        gap={2}
      >
        <FilterControls />

        {/* ビュアー */}
        <Box display="flex" justifyContent="center" alignItems="center">
          <Typography sx={{ flexGrow: 1 }}>
            {JSON.stringify(timeStudyRecord)}
          </Typography>
        </Box>
      </Box>
    </PageSectionLayout>
  );
};

export default TimeStudySurvey;
