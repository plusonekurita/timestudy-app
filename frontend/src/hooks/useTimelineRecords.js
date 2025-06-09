import { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import dayjs from "dayjs";

import { showSnackbar } from "../store/slices/snackbarSlice";
import { menuCategories } from "../constants/menu";
import { apiFetch } from "../utils/api";

// メタ情報取得
const getActivityMeta = (type, name) => {
  for (const category of menuCategories) {
    for (const item of category.items) {
      if (item.type === type && item.name === name) {
        return {
          color: item.color,
          icon: item.icon,
          label: item.label,
          backgroundColor: category.background || "#f0f0f0",
        };
      }
    }
  }
  return {
    color: "#ccc",
    icon: null,
    label: name,
    backgroundColor: "#f9f9f9",
  };
};

export const useTimelineRecords = (date) => {
  const [records, setRecords] = useState([]);
  const dispatch = useDispatch();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const dateKey = dayjs(date).format("YYYY-MM-DD");
    const todayKey = dayjs().format("YYYY-MM-DD");

    const isToday = dateKey === todayKey;

    const loadData = async () => {
      if (isToday) {
        // ローカルストレージから取得
        try {
          const raw = localStorage.getItem(`dailyTimeStudyRecords_${userId}`);
          const parsed = raw ? JSON.parse(raw) : {};
          const todayRecords = parsed[dateKey] || [];
          setRecords(todayRecords);
        } catch (err) {
          console.error("ローカルストレージ読み込み失敗:", err);
          setRecords([]);
        }
      } else {
        // DBから取得
        try {
          const data = await apiFetch("/get-time-records", {
            method: "POST",
            body: {
              user_id: localStorage.getItem("userId"),
              start_date: dateKey,
              end_date: dateKey,
            },
          });

          const fetchedRecords = data.records?.[0]?.record || [];

          if (fetchedRecords.length === 0) {
            dispatch(
              showSnackbar({
                message: "記録は見つかりませんでした。",
                severity: "info",
              })
            );
          } else {
            // dispatch(
            //   showSnackbar({
            //     message: `${fetchedRecords.length}件の記録を取得しました。`,
            //     severity: "success",
            //   })
            // );
          }

          setRecords(fetchedRecords);
        } catch (err) {
          console.error("サーバー取得エラー:", err);
          dispatch(
            showSnackbar({
              message: "記録の取得に失敗しました。",
              severity: "error",
            })
          );
          setRecords([]);
        }
      }
    };

    loadData();
  }, [date, dispatch, userId]);

  // 🔹 メタ情報を付加したデータを返す
  const enrichedRecords = useMemo(() => {
    return records.map((r) => ({
      ...r,
      ...getActivityMeta(r.type, r.name),
    }));
  }, [records]);

  return enrichedRecords;
};
