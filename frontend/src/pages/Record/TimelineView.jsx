// src/pages/Record/TimelineView
import "react-calendar-timeline/dist/Timeline.scss";
import "moment/locale/ja"; // 日本語インポート

import Timeline, {
  TimelineHeaders,
  DateHeader,
  TimelineMarkers,
  CustomMarker,
} from "react-calendar-timeline";
import React, { useEffect, useState, useMemo, Fragment } from "react";
import { Box, IconButton, Typography, Tooltip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import moment from "moment";

import { colors as themeColors } from "../../constants/theme";
import { getValue } from "../../utils/localStorageUtils";
import { menuCategories } from "../../constants/menu";

moment.locale("ja"); // momentのロケールを日本語に設定

const TimelineView = ({ onClose }) => {
  const [groups, setGroups] = useState([]);
  const [items, setItems] = useState([]);
  const [openTooltipId, setOpenTooltipId] = useState(null);

  useEffect(() => {
    // 当日の日付キーを生成
    const todayKey = new Date().toISOString().split("T")[0];
    // 当日のデータを取得
    const allDailyRecords = getValue("dailyTimeStudyRecords", {});
    const localRecords = allDailyRecords[todayKey] || []; // 当日の記録を取得、なければ空配列

    // Y軸のグループ (0時～23時) を生成
    const newGroups = [];
    for (let i = 0; i < 24; i++) {
      newGroups.push({
        id: i,
        title: `${i}時`,
      });
    }
    setGroups(newGroups);
    const newItems = [];
    if (localRecords && localRecords.length > 0) {
      localRecords.forEach((record) => {
        const originalStartTime = moment(record.startTime);
        const originalEndTime = moment(record.endTime);

        if (
          !originalStartTime.isValid() ||
          !originalEndTime.isValid() ||
          originalStartTime.isSameOrAfter(originalEndTime)
        ) {
          console.warn(
            "Invalid or out-of-order date found in record, skipping:",
            record
          );
          return;
        }

        // menuの業務種類を取得
        const category = menuCategories.find((cat) => cat.type === record.type);
        const recordColor =
          category?.color || themeColors[record.type] || themeColors.other;

        let loopStartTime = originalStartTime.clone();
        while (loopStartTime.isBefore(originalEndTime)) {
          const currentHour = loopStartTime.hour();

          // この時間帯でのセグメントの終了時刻を計算
          const endOfCurrentHour = loopStartTime.clone().endOf("hour");
          const segmentEndTime = originalEndTime.isBefore(endOfCurrentHour)
            ? originalEndTime.clone()
            : endOfCurrentHour.clone();

          // X軸にプロットするための開始時刻 (基準日の 00:mm:ss.SSS 形式)
          const itemXStart = moment(0) // 1970-01-01 00:00:00 UTC
            .hour(0) // 今日の0時を基準とする
            .minute(loopStartTime.minute())
            .second(loopStartTime.second())
            .millisecond(loopStartTime.millisecond());

          // X軸にプロットするための終了時刻 (基準日の 00:mm:ss.SSS 形式)
          let itemXEnd = moment(0)
            .hour(0)
            .minute(segmentEndTime.minute())
            .second(segmentEndTime.second())
            .millisecond(segmentEndTime.millisecond());

          // segmentEndTimeが次の時間の00分00秒丁度の場合、itemXEndは59分59秒999ミリ秒になるべき
          if (
            segmentEndTime.hour() > currentHour &&
            segmentEndTime.minute() === 0 &&
            segmentEndTime.second() === 0 &&
            segmentEndTime.millisecond() === 0
          ) {
            itemXEnd = moment(0).hour(0).minute(59).second(59).millisecond(999);
          }

          // アイテムの期間が0または負にならないように調整
          if (itemXStart.isSameOrAfter(itemXEnd)) {
            if (itemXStart.isSame(itemXEnd)) {
              // 期間が0の場合、少しだけ時間を加算して表示できるようにする
              itemXEnd.add(1, "millisecond");
            }
            // それでもダメならスキップ
            if (itemXStart.isSameOrAfter(itemXEnd)) {
              console.warn("Skipping zero or negative duration item segment:", {
                recordId: record.id,
                group: currentHour,
                itemXStart,
                itemXEnd,
                loopStartTime,
                segmentEndTime,
              });
              loopStartTime = segmentEndTime.clone().add(1, "millisecond");
              if (loopStartTime.isSameOrAfter(originalEndTime)) break;
              continue;
            }
          }

          newItems.push({
            id: `${record.id}_${currentHour}_${loopStartTime.valueOf()}`, // ユニークID
            title: record.label || record.name || "名称未設定",
            start_time: itemXStart.valueOf(), // milliseconds
            end_time: itemXEnd.valueOf(), // milliseconds
            group: currentHour, // Y軸のグループ（時間）
            itemProps: {
              itemStyle: {
                background: recordColor,
                color: "white",
                borderColor: recordColor,
                borderRadius: "4px",
                borderStyle: "solid",
                borderWidth: "1px",
              },
              // ツールチップの内容をReact要素として定義
              tooltipTitle: (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    {record.label || record.name || "名称未設定"}
                  </Typography>
                  <Typography variant="caption" display="block">
                    {originalStartTime.format("HH:mm:ss")} ～{" "}
                    {originalEndTime.format("HH:mm:ss")}
                  </Typography>
                </Box>
              ),
            },
          });

          loopStartTime = segmentEndTime.clone().add(1, "millisecond");
          if (loopStartTime.isSameOrAfter(originalEndTime)) {
            break;
          }
        }
      });
    }
    setItems(newItems);
  }, []); // 初回マウント時のみ実行

  // X軸の表示範囲 (00:00:00 から 00:59:59)
  const defaultTimeStart = useMemo(() => moment(0).hour(0).startOf("hour"), []);
  const defaultTimeEnd = useMemo(() => moment(0).hour(0).endOf("hour"), []);

  // ツールチップ表示のためにReactTooltipと連携する場合

  // 10分ごとのグリッド線用マーカー
  const gridMarkers = useMemo(() => {
    const markers = [];
    // 0分から50分まで10分刻みでマーカーを生成
    for (let i = 0; i <= 5; i++) {
      const minutes = i * 10;
      markers.push({
        id: `grid-marker-${minutes}`,
        title: `${minutes} min mark`, // ツールチップ等で使われる場合がある（今回は非表示）
        date: moment(0).hour(0).minute(minutes).valueOf(),
      });
    }
    return markers;
  }, []);

  const handleTooltipClose = () => {
    setOpenTooltipId(null);
  };

  const handleItemSelect = (itemId, e) => {
    // 既に同じアイテムのTooltipが開いていれば閉じる（トグル動作）
    // そうでなければ新しいアイテムのTooltipを開く
    e.stopPropagation();
    setOpenTooltipId((prevOpenId) => (prevOpenId === itemId ? null : itemId));
  };

  const handleCanvasClick = (groupId, time, e) => {
    // Tooltipが開いている場合のみ閉じる
    if (openTooltipId !== null) {
      setOpenTooltipId(null);
    }
  };

  const itemRenderer = ({ item, getItemProps }) => {
    // item.itemProps からスタイルとその他のカスタムプロパティを取得
    const { itemStyle, tooltipTitle, ...otherCustomItemProps } =
      item.itemProps || {};

    // getItemProps に渡すスタイルをマージ
    const combinedStyle = {
      overflow: "hidden",
      ...itemStyle,
      textAlign: "center",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      fontSize: "12px",
      lineHeight: "20px", // アイテムの高さに合わせて調整
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };

    // getItemProps を呼び出し、key プロパティと HTMLのtitle属性を分離
    const {
      key,
      title: htmlTitle,
      ...restOfItemProps
    } = getItemProps({
      style: {
        ...combinedStyle,
        touchAction: "manipulation",
      },
      onMouseDown: (e) => {
        // Tooltip表示時にTimelineのドラッグ等が誤作動しないようにする
        e.stopPropagation();
      },
      ...otherCustomItemProps, // item.itemProps からの残りのプロパティ
    });

    return (
      // Tooltipでラップ
      <Tooltip
        title={tooltipTitle || ""}
        arrow
        placement="top"
        PopperProps={{
          modifiers: [{ name: "offset", options: { offset: [0, -8] } }], // 必要に応じてオフセット調整
        }}
        open={openTooltipId === item.id}
        onClose={handleTooltipClose}
      >
        <div key={key} {...restOfItemProps}>
          {" "}
          {/* htmlTitle を展開しないようにする */}
          <div className="rct-item-content" style={{ maxHeight: "100%" }}>
            {item.title}
          </div>
        </div>
      </Tooltip>
    );
  };

  if (groups.length === 0) {
    // データロード中やエラー時の表示
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography>タイムラインデータを準備中です...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 1,
          backgroundColor: themeColors.primary,
          color: "white",
        }}
      >
        <IconButton onClick={onClose} color="inherit">
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, textAlign: "center" }}
        >
          タイムライン
        </Typography>
        <Box sx={{ width: 40 }} />{" "}
        {/* IconButtonのバランスを取るためのスペーサー */}
      </Box>
      <Box sx={{ flexGrow: 1, width: "100%" }}>
        <Timeline
          groups={groups}
          items={items}
          defaultTimeStart={defaultTimeStart}
          defaultTimeEnd={defaultTimeEnd}
          visibleTimeStart={defaultTimeStart.valueOf()} // 表示開始時刻をミリ秒で指定
          visibleTimeEnd={defaultTimeEnd.valueOf()} // 表示終了時刻をミリ秒で指定
          sidebarWidth={50} // Y軸（時間）の幅
          lineHeight={45} // 各行の高さ
          itemHeightRatio={0.75} // アイテムの高さの割合
          canMove={false} // アイテムの移動を無効化
          canResize={false} // アイテムのリサイズを無効化
          canChangeGroup={false} // アイテムのグループ変更を無効化
          stackItems // アイテムを積み重ねる
          itemRenderer={itemRenderer}
          onItemSelect={handleItemSelect}
          onCanvasClick={handleCanvasClick}
        >
          <TimelineMarkers>
            {gridMarkers.map((marker) => (
              <CustomMarker key={marker.id} date={marker.date}>
                {({ styles }) => (
                  <div
                    style={{
                      ...styles,
                      backgroundColor: "rgba(0, 0, 0, 0.1)", // グリッド線の色
                      width: "1px", // グリッド線の太さ
                      // styles.left と styles.top はライブラリが計算してくれる
                      // 高さはTimelineの表示領域に依存するため、通常は自動で調整される
                      // もし明示的に高さを指定したい場合は、position: 'absolute', height: '100%' など
                    }}
                  />
                )}
              </CustomMarker>
            ))}
          </TimelineMarkers>
          <TimelineHeaders style={{ backgroundColor: "white" }}>
            <DateHeader
              unit="minute"
              labelFormat="m分" // X軸のラベルを「XX分」形式に
              style={{ height: 30 }}
              intervalRenderer={({ getIntervalProps, intervalContext }) => {
                // intervalContext.intervalText から分数を取得
                const minutes = parseInt(
                  intervalContext.intervalText.replace("分", ""),
                  10
                );
                // 10分刻みで、かつ0分でない時のみラベルを表示
                if (minutes % 10 === 0 && minutes !== 0) {
                  return (() => {
                    const { key, ...restIntervalProps } = getIntervalProps();
                    return (
                      <div
                        key={key}
                        {...restIntervalProps}
                        style={{
                          ...(restIntervalProps.style || {}), // 元のスタイルを安全に展開
                          display: "flex", // 中央揃えのためflexを使用
                          justifyContent: "center", // 水平方向中央揃え
                          alignItems: "center", // 垂直方向中央揃え (もし高さがある場合)
                        }}
                      >
                        {intervalContext.intervalText}
                      </div>
                    );
                  })();
                }
                // 他のラベルは非表示
                return (() => {
                  const { key, ...restIntervalProps } = getIntervalProps();
                  return (
                    <div
                      key={key}
                      {...restIntervalProps}
                      style={{
                        ...(restIntervalProps.style || {}),
                        visibility: "hidden",
                      }}
                    />
                  );
                })();
              }}
            />
          </TimelineHeaders>
        </Timeline>
      </Box>
    </Box>
  );
};

export default TimelineView;
