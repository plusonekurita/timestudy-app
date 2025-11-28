import { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";

import { getValue } from "../utils/localStorageUtils";
import { apiFetch } from "../utils/api";

export const useFetchRecords = (startDate, endDate) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = useMemo(() => getValue("user"), []);

  useEffect(() => {
    if (!startDate || !endDate) return;

    const todayKey = dayjs().format("YYYY-MM-DD");
    const startKey = dayjs(startDate).format("YYYY-MM-DD");
    const endKey = dayjs(endDate).format("YYYY-MM-DD");

    const isTodayOnly = startKey === todayKey && endKey === todayKey;
    if (isTodayOnly) {
      setRecords([]);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await apiFetch("/get-time-records", {
          method: "POST",
          body: {
            staff_id: user.id,
            start_date: startKey,
            end_date: endKey,
          },
        });

        if (data.records?.length === 0) {
          setRecords([]);
        } else {
          setRecords(data.records);
        }
      } catch (err) {
        console.error("記録取得エラー:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, user]);

  return { records, loading };
};
