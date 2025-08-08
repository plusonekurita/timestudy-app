import { useState, useEffect, useRef, useCallback } from "react";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import dayjs from "dayjs";

import { getValue, setItem } from "../utils/localStorageUtils";

dayjs.extend(utc);
dayjs.extend(timezone);
const JST = "Asia/Tokyo";

export const useStopwatch = () => {
  const [activeItem, setActiveItem] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0); // 経過時間（秒）
  const intervalRef = useRef(null);
  const user = getValue("user");

  // 日付キーの取得
  const getRecordDate = (time = Date.now()) => {
    return dayjs(time).tz(JST).format("YYYY-MM-DD");
  };

  // タイマーの更新ロジック
  useEffect(() => {
    if (isRunning && startTime !== null) {
      // 既にインターバルがあればクリア
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // 新しいインターバルを開始
      intervalRef.current = setInterval(() => {
        // 経過時間を秒単位で計算・更新
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000); // 1秒ごとに更新
    } else if (intervalRef.current) {
      // isRunningがfalseになったらインターバルをクリア
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // コンポーネントのアンマウント時や依存配列の変更前にクリア
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, startTime]);

  // タイマーを開始する関数 既にタイマーが開始してあれば記録する
  const startTimer = useCallback(
    (item) => {
      // activeItem と startTime が存在すれば（前のタイマーが動いていた場合）
      if (activeItem && startTime) {
        const endTime = Date.now(); // 現在時刻を終了時刻とする
        const duration = Math.floor((endTime - startTime) / 1000); // 経過時間（秒）
        // 前回の記録
        const record = {
          id: `record-${startTime}-${Math.random().toString(36).substr(2, 9)}`, // ユニークID
          type: activeItem.type, // アイテムのタイプ
          name: activeItem.name, // アイテムの名前
          label: activeItem.label, // アイテムのラベル
          // startTime: startTime, // アイテムの開始時刻
          // endTime: endTime, // 終了時刻（新しいタイマーの開始時刻）
          startTime: dayjs(startTime).tz(JST).toISOString(),
          endTime: dayjs(endTime).tz(JST).toISOString(),
          duration, // 経過時間（秒）
        };

        try {
          const recordDateKey = getRecordDate(startTime);
          const key = `dailyTimeStudyRecords_${user.id}`;
          const dailyRecords = getValue(key, {}); // 新しいキー

          // 記録する日付のキーがあるか確認
          if (!dailyRecords[recordDateKey]) {
            dailyRecords[recordDateKey] = [];
          }
          // 記録を配列に追加(日付ごとに)
          dailyRecords[recordDateKey].push(record);
          setItem(key, dailyRecords);
        } catch (error) {
          console.error("ローカルストレージへの記録保存に失敗しました:", error);
          // TODO:ユーザーにエラー通知
        }
      }

      // 既に動いているタイマーがあればタイマークリア
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setActiveItem(item);
      setStartTime(Date.now()); // 現在の時刻をセット
      setElapsedTime(0); // 経過時間をリセット
      setIsRunning(true);
    },
    [activeItem, startTime, user]
  ); // activeItemに依存しないように修正

  // タイマーを一時停止する関数
  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  // タイマーを再開する関数
  const resumeTimer = useCallback(() => {
    // 一時停止までの経過時間を考慮して startTime を再設定
    setStartTime(Date.now() - elapsedTime * 1000);
    setIsRunning(true);
  }, [elapsedTime]);

  const cloaseTimer = useCallback(() => {
    setIsRunning(false);
    setActiveItem(null);
    setElapsedTime(0);
    setStartTime(null); // startTimeもリセット
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // タイマーを停止しリセットする関数
  const stopTimer = useCallback(() => {
    // isRunning と activeItem が存在し、startTimeが記録されていれば記録を保存
    if (isRunning && activeItem && startTime !== null) {
      const currentEndTime = startTime + elapsedTime * 1000; // startTimeはミリ秒、elapsedTimeは秒
      const durationSeconds = elapsedTime;
      const durationMinutes = Math.ceil(elapsedTime / 60); // 秒 → 分（切り上げ）

      const record = {
        id: `record-${startTime}-${Math.random().toString(36).substr(2, 9)}`, // ユニークID
        type: activeItem.type,
        name: activeItem.name,
        label: activeItem.label,
        startTime: dayjs(startTime).tz(JST).toISOString(),
        endTime: dayjs(currentEndTime).tz(JST).toISOString(),
        duration: durationSeconds,
        minutes: durationMinutes,
      };

      try {
        const dailyKey = `dailyTimeStudyRecords_${user.id}`;
        const recordDateKey = getRecordDate(startTime);
        const dailyRecords = getValue(dailyKey, {});
        if (!dailyRecords[recordDateKey]) {
          dailyRecords[recordDateKey] = [];
        }
        dailyRecords[recordDateKey].push(record);
        setItem(dailyKey, dailyRecords);
      } catch (error) {
        // TODO: ユーザーにエラー通知
        console.error("ローカルストレージへの記録保存に失敗しました:", error);
      }
    }
    cloaseTimer();
  }, [activeItem, cloaseTimer, elapsedTime, isRunning, startTime, user]);

  return {
    activeItem,
    isRunning,
    elapsedTime,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    cloaseTimer,
  };
};
