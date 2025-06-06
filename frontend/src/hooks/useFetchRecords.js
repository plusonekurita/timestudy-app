import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import dayjs from "dayjs";

import { showSnackbar } from "../store/slices/snackbarSlice";

export const useFetchRecords = (startDate, endDate) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

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
        const accessToken = localStorage.getItem("access_token");
        const res = await fetch("/api/get-time-records", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            user_id: localStorage.getItem("userId"),
            start_date: startKey,
            end_date: endKey,
          }),
        });

        if (!res.ok) throw new Error("記録取得に失敗しました");

        const data = await res.json();
        if (data.records?.length === 0) {
          setRecords([]);
          dispatch(
            showSnackbar({
              message: "記録は見つかりませんでした。",
              severity: "info",
            })
          );
        } else {
          setRecords(data.records);
          dispatch(
            showSnackbar({
              message: `${data.records.length}件の記録を取得しました。`,
              severity: "success",
            })
          );
        }
      } catch (err) {
        console.error("記録取得エラー:", err);
        dispatch(
          showSnackbar({
            message: "記録取得に失敗しました。",
            severity: "error",
          })
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, dispatch]);

  return { records, loading };
};
