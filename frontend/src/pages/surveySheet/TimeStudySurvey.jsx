import { Box, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import React, { useEffect } from "react";

import PageSectionLayout from "../../components/PageSectionLayout/PageSectionLayout";
import FilterControls from "../../components/FilterControls/FilterControls";
import HourStackedGraph from "./components/HourStackedGraph";

const TimeStudySurvey = () => {
  const timeStudyRecord = useSelector((state) => state.timeRecord.record);

  return (
    <PageSectionLayout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
        gap={6}
      >
        <FilterControls />

        {/* ビュアー */}
        <Box display="flex" justifyContent="center" alignItems="center">
          <HourStackedGraph
            day={timeStudyRecord?.length > 0 ? timeStudyRecord[0] : {}}
            timezone="Asia/Tokyo"
            yMaxMinutes={60} // 左メモリ
            showEmptyHours={true} // 範囲内の空時間も表示する
          />
        </Box>
      </Box>
    </PageSectionLayout>
  );
};

export default TimeStudySurvey;
