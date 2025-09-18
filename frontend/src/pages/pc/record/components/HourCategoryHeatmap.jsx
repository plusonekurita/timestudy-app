import React, { useMemo, useRef, useState, useCallback } from "react";
import { Box, Typography, useTheme, Paper } from "@mui/material";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { menuCategories } from "../../../../constants/menu";

function minutesFrom(item) {
  const sec =
    (typeof item?.duration === "number" ? item.duration : null) ??
    (item?.startTime && item?.endTime
      ? dayjs(item.endTime).diff(dayjs(item.startTime), "second")
      : 0);
  return Math.max(sec / 60, 0);
}

function pickLabel(it) {
  return it?.label || it?.name || it?.type || "その他";
}

export default function HourCategoryHeatmap() {
  const theme = useTheme();
  const { officeRecords = [], record = [] } = useSelector(
    (s) => s.timeRecord || {}
  );

  // 管理者想定（範囲）。データ源：全員データがあれば優先
  const source = useMemo(
    () => (officeRecords?.length ? officeRecords : record) || [],
    [officeRecords, record]
  );

  // カテゴリ配列（メニュー順）とラベル→行インデックス
  const categoryLabels = useMemo(() => {
    const labels = [];
    (menuCategories || []).forEach((cat) => {
      (cat?.items || []).forEach((it) => {
        if (it?.label) labels.push(it.label);
      });
    });
    // 重複除去（メニューに重複は基本無いが保険）
    return Array.from(new Set(labels));
  }, []);

  const labelToRow = useMemo(
    () => Object.fromEntries(categoryLabels.map((l, i) => [l, i])),
    [categoryLabels]
  );

  // ヒートマップ用データ行列 [rows = categories][cols = 24h]
  const { matrix, maxValue } = useMemo(() => {
    const rows = categoryLabels.length;
    const cols = 24;
    const m = Array.from({ length: rows }, () => Array(cols).fill(0));
    let maxV = 0;

    source.forEach((rec) => {
      const items = Array.isArray(rec.record) ? rec.record : [];
      items.forEach((it) => {
        const label = pickLabel(it);
        const row = labelToRow[label];
        if (row === undefined) return;

        // 時間帯割付：開始時刻の時間を代表としてカウント（duration が長いケースは近似）
        const start = it?.startTime ? dayjs(it.startTime) : null;
        const hour = start?.isValid() ? start.hour() : null;
        if (hour === null || hour < 0 || hour > 23) return;

        const min = minutesFrom(it);
        if (!min) return;
        m[row][hour] += min;
        if (m[row][hour] > maxV) maxV = m[row][hour];
      });
    });

    return { matrix: m, maxValue: maxV };
  }, [source, labelToRow, categoryLabels.length]);

  // カラースケール（値に応じて不透明度を変える）
  const baseColor = theme.palette.primary.main;
  const colorOf = (v) => {
    if (maxValue <= 0) return "transparent";
    const t = Math.max(0, Math.min(1, v / maxValue));
    const alpha = 0.08 + 0.72 * Math.pow(t, 0.8); // 目感調整
    // rgba 生成（簡易）：#RRGGBB → r,g,b
    const hex = baseColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const cellSize = 22; // px（高さはスクロールで吸収）
  const gap = 8; // px (gap: 2 = 8px)
  const hourLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  // ドラッグでスクロール（パン）用
  const scrollRef = useRef(null);
  const [drag, setDrag] = useState({
    active: false,
    startX: 0,
    startY: 0,
    left: 0,
    top: 0,
  });
  const handleMouseDown = useCallback((e) => {
    const el = scrollRef.current;
    if (!el) return;
    setDrag({
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      left: el.scrollLeft,
      top: el.scrollTop,
    });
  }, []);
  const handleMouseMove = useCallback(
    (e) => {
      if (!drag.active) return;
      e.preventDefault();
      const el = scrollRef.current;
      if (!el) return;
      const dx = e.clientX - drag.startX;
      // 横方向のスクロールのみ（縦方向は無効）
      el.scrollLeft = drag.left - dx;
    },
    [drag]
  );
  const endDrag = useCallback(
    () => setDrag((d) => ({ ...d, active: false })),
    []
  );

  if (!source.length) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          データがありません。日付範囲と職員を選択してください。
        </Typography>
      </Box>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, height: "930px" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 2,
          height: "100%",
        }}
      >
        {/* Y 軸（カテゴリ名） - 固定 */}
        <Box
          sx={{
            display: "grid",
            gridAutoRows: `${cellSize}px`,
            rowGap: 2,
            position: "sticky",
            left: 0,
            backgroundColor: "background.paper",
            zIndex: 2,
            height: "100%",
          }}
        >
          <Box sx={{ height: cellSize, width: 80 }} />
          {categoryLabels.map((label) => (
            <Box
              key={label}
              sx={{
                height: cellSize,
                width: 180,
                pr: 1,
                display: "flex",
                alignItems: "center",
                marginTop: "-4px",
              }}
            >
              <Typography
                variant="caption"
                noWrap
                title={label}
                sx={{ color: "text.secondary" }}
              >
                {label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* スクロール可能なメインエリア */}
        <Box
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          sx={{
            flex: 1,
            overflowX: "auto",
            overflowY: "hidden",
            cursor: drag.active ? "grabbing" : "grab",
            userSelect: drag.active ? "none" : undefined,
            WebkitUserSelect: drag.active ? "none" : undefined,
            MsUserSelect: drag.active ? "none" : undefined,
            scrollbarWidth: "none", // Firefox
            "&::-webkit-scrollbar": {
              display: "none", // Chrome, Safari, Edge
            },
          }}
        >
          {/* X 軸（時間） */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(24, ${cellSize}px)`,
              columnGap: 2,
              mb: 1,
              position: "sticky",
              top: 0,
              backgroundColor: "background.paper",
              zIndex: 3,
              height: cellSize,
            }}
          >
            {hourLabels.map((h) => (
              <Box key={h} sx={{ width: cellSize }}>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {h}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* マトリクス */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(24, ${cellSize}px)`,
              gridAutoRows: `${cellSize}px`,
              columnGap: 2,
              rowGap: 2,
              height: `${categoryLabels.length * (cellSize + gap)}px`, // 行数に応じた固定高さ
              alignContent: "start", // 上端揃え
            }}
          >
            {matrix.map((row, ri) =>
              row.map((v, ci) => (
                <Box
                  key={`${ri}-${ci}`}
                  title={`${categoryLabels[ri]} / ${ci}:00\n${Math.round(
                    v
                  )} 分`}
                  sx={{
                    width: cellSize,
                    height: cellSize,
                    borderRadius: 1,
                    backgroundColor: colorOf(v),
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                />
              ))
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
