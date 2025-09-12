import React, { useState, useMemo } from "react";
import { Box, Stack } from "@mui/material";

import FilterControlsSingle from "../../../components/FilterControlsSingle/FilterControlsSingle";
import FilterControlsRange from "../../../components/FilterControlsRange/FilterControlsRange";
import PageSectionLayout from "../../../components/PageSectionLayout/PageSectionLayout";
import { getValue, setItem } from "../../../utils/localStorageUtils";
import GraphSelector from "./components/GraphSelector";
import GraphViewer from "./components/GraphViewer";
import { graphOptionsFor } from "./GraphOptions";

const LS_KEYS = {
  graphType: "ts_graph_type",
};

const TimeStudy = () => {
  const user = getValue("user");
  const isAdmin = !!user?.isAdmin;

  // 管理者用または一般用のグラフを取得
  const options = useMemo(() => graphOptionsFor(isAdmin), [isAdmin]);

  // ★ 管理者/一般でフォールバックを分ける
  const preferredFallback = isAdmin ? "dailyCategoryStacked" : "staffType100";

  // グラフの初期表示処理
  const [graphType, setGraphType] = useState(() => {
    const saved = getValue(LS_KEYS.graphType);
    if (saved && options.some((o) => o.value === saved)) return saved;
    // 役割ごとのフォールバックが使えるならそれ
    if (options.some((o) => o.value === preferredFallback))
      return preferredFallback;
    // それも無理なら options の先頭、最終手段で dailyCategoryStacked
    return options[0]?.value || "dailyCategoryStacked";
  });

  // グラフ選択変更時
  const handleGraphTypeChange = (next) => {
    setGraphType(next);
    setItem(LS_KEYS.graphType, next);
  };

  // 選択しているグラフの dateMode を参照（未定義なら range）
  const dateMode = useMemo(
    () => options.find((o) => o.value === graphType)?.dateMode ?? "range",
    [options, graphType]
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
            <FilterControlsSingle
              allowAllStaff={
                !(
                  isAdmin &&
                  (graphType === "dailyCategoryStacked" ||
                    graphType === "hourStacked")
                )
              }
            />
          ) : (
            <FilterControlsRange
              allowAllStaff={
                !(
                  isAdmin &&
                  (graphType === "dailyCategoryStacked" ||
                    graphType === "hourStacked")
                )
              }
            />
          )}

          {/* セレクタ（画面上部） */}
          <Box sx={{ display: "flex" }}>
            <Box sx={{ ml: "auto", width: { xs: "100%", sm: 500 } }}>
              <GraphSelector
                value={graphType}
                onChange={handleGraphTypeChange}
                options={options}
              />
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
