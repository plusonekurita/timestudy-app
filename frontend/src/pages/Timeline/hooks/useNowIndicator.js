// hooks/useNowIndicator.js
import { useEffect, useState } from "react";

const CARD_HEIGHT = 48;
const CARD_MARGIN_Y = 4;

export const getHourBlockHeight = (count) =>
  count > 0 ? count * (CARD_HEIGHT + CARD_MARGIN_Y * 2) : CARD_HEIGHT;

export const groupByHour = (records) => {
  const map = {};
  for (const rec of records) {
    const hour = new Date(rec.startTime).getHours().toString();
    if (!map[hour]) map[hour] = [];
    map[hour].push(rec);
  }
  return map;
};

export const useNowIndicator = (records) => {
  const [nowTop, setNowTop] = useState(null);
  const [hourHeights, setHourHeights] = useState([]);

  const grouped = groupByHour(records);

  useEffect(() => {
    const map = Array.from({ length: 24 }, (_, hour) => {
      const count = (grouped[hour.toString()] || []).length;
      return getHourBlockHeight(count);
    });
    setHourHeights(map);
  }, [records]);

  useEffect(() => {
    if (hourHeights.length !== 24) return;

    const updateNowTop = () => {
      const now = new Date();
      const hour = now.getHours();
      const min = now.getMinutes();
      const baseTop = hourHeights.slice(0, hour).reduce((sum, h) => sum + h, 0);
      const offset = (min / 60) * (hourHeights[hour] || CARD_HEIGHT);
      setNowTop(baseTop + offset);
    };

    updateNowTop();
    const timer = setInterval(updateNowTop, 60000);
    return () => clearInterval(timer);
  }, [hourHeights.join(",")]);

  return { grouped, hourHeights, nowTop };
};
