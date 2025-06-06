import { useState, useEffect } from "react";
import dayjs from "dayjs";

import { getValue } from "../utils/localStorageUtils";
import { menuCategories } from "../constants/menu";
import { colors } from "../constants/theme";

export const useRecordData = (records = [], startDate, endDate) => {
  const [chartData, setChartData] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [detailedChartData, setDetailedChartData] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const todayKey = dayjs().format("YYYY-MM-DD");
    const startKey = dayjs(startDate).format("YYYY-MM-DD");
    const endKey = dayjs(endDate).format("YYYY-MM-DD");

    const includesToday = () => {
      const today = dayjs().startOf("day");
      return (
        dayjs(startDate).isSame(today, "day") ||
        dayjs(endDate).isSame(today, "day") ||
        (dayjs(startDate).isBefore(today) && dayjs(endDate).isAfter(today))
      );
    };

    // レコード、当日ではない場合はスキップ
    if ((!Array.isArray(records) || records.length === 0) && !includesToday()) {
      setChartData([]);
      setSummaryData([]);
      setDetailedChartData([]);
      return;
    }

    // ローカルストレージから当日記録を取得
    const allDailyRecords = getValue(`dailyTimeStudyRecords_${userId}`, {});
    const isTodaySelected = startKey === todayKey || endKey === todayKey;
    const localRecordObject =
      isTodaySelected && allDailyRecords[todayKey]?.length
        ? [
            {
              record_date: todayKey,
              record: allDailyRecords[todayKey],
            },
          ]
        : [];

    // API記録の中から当日以外を抽出
    const nonTodayRecords = records.filter(
      (rec) => rec.record_date !== todayKey
    );

    // API記録（当日以外）とローカル記録（当日）を統合
    const mergedRecords = [...nonTodayRecords, ...localRecordObject];

    // --- 集計処理 ---
    const aggregatedData = {
      name: "活動集計",
      directCare: 0,
      indirectWork: 0,
      break: 0,
      other: 0,
    };

    const detailedItemDurations = {};

    mergedRecords.forEach((day) => {
      if (!Array.isArray(day.record)) return;

      day.record.forEach((item) => {
        const duration = item.duration;

        if (aggregatedData[item.type] !== undefined) {
          aggregatedData[item.type] += duration;
        } else {
          aggregatedData.other += duration;
        }

        if (item.name) {
          detailedItemDurations[item.name] =
            (detailedItemDurations[item.name] || 0) + duration;
        }
      });
    });

    const chartFormattedData = { ...aggregatedData };
    Object.keys(chartFormattedData).forEach((key) => {
      if (typeof chartFormattedData[key] === "number" && key !== "name") {
        chartFormattedData[key] = Math.round(chartFormattedData[key]);
      }
    });
    setChartData([chartFormattedData]);

    const displayOrder = ["directCare", "indirectWork", "break", "other"];
    const totalDuration = displayOrder.reduce(
      (sum, key) => sum + (aggregatedData[key] || 0),
      0
    );

    const newSummaryData = displayOrder
      .map((key) => {
        const category = menuCategories.find((c) => c.type === key);
        const duration = aggregatedData[key] || 0;
        const percentage =
          totalDuration > 0 ? (duration / totalDuration) * 100 : 0;
        return {
          key,
          label: category?.label || key,
          color: colors[key] || "#8884d8",
          durationMinutes: parseFloat((duration / 60).toFixed(1)),
          percentage: parseFloat(percentage.toFixed(1)),
        };
      })
      .filter((d) => d.durationMinutes > 0 || d.percentage > 0);
    setSummaryData(newSummaryData);

    const allDetailedItems = [];
    menuCategories.forEach((cat) => {
      cat.items.forEach((item) => {
        const duration = detailedItemDurations[item.name] || 0;
        if (duration > 0) {
          allDetailedItems.push({
            name: item.name,
            label: item.label,
            duration,
            fill: cat.color || colors.other,
          });
        }
      });
    });
    allDetailedItems.sort((a, b) => b.duration - a.duration);
    setDetailedChartData(allDetailedItems);
  }, [records, startDate, endDate, userId]);

  return { chartData, summaryData, detailedChartData };
};
