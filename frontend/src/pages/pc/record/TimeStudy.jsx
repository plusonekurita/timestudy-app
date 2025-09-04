import React, { useState, useMemo } from "react";
import { Box, Stack } from "@mui/material";

import FilterControlsSingle from "../../../components/FilterControlsSingle/FilterControlsSingle";
import FilterControlsRange from "../../../components/FilterControlsRange/FilterControlsRange";
import PageSectionLayout from "../../../components/PageSectionLayout/PageSectionLayout";
import GraphSelector from "./components/GraphSelector";
import GraphViewer from "./components/GraphViewer";
import { GRAPH_OPTIONS } from "./GraphOptions";


const TimeStudy = () => {
  const [graphType, setGraphType] = useState("dailyCategoryStacked");

  // 選択しているグラフの dateMode を参照（未定義なら range）
  const dateMode = useMemo(
    () => GRAPH_OPTIONS.find((o) => o.value === graphType)?.dateMode ?? "range",
    [graphType]
  );

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
          {/* 日付選択 グラフに応じて変化 */}
          {dateMode === "single" ? (
            <FilterControlsSingle />
          ) : (
            <FilterControlsRange />
          )}

          {/* セレクタ（画面上部） */}
          <Box sx={{ display: "flex" }}>
            <Box sx={{ ml: "auto", width: { xs: "100%", sm: 320 } }}>
              <GraphSelector value={graphType} onChange={setGraphType} />
            </Box>
          </Box>

          {/* ビュアー */}
          <Box sx={{ width: "100%", height: 460 }}>
            <GraphViewer type={graphType} height={460} />
          </Box>
        </Stack>
      </Box>
    </PageSectionLayout>
  );
};

export default TimeStudy;
