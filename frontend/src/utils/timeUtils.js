// src/utils/timeUtils

/**
 * 合計分数を「X時間Y分」または「Y分」の形式にフォーマット
 * @param {number} totalMinutes - 合計分数
 * @returns {string} フォーマットされた時間文字列
 */
export const formatDurationFromMinutes = (totalMinutes) => {
  if (isNaN(totalMinutes) || totalMinutes < 0) {
    return "0分";
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60); // 分は丸める（小数点以下がある場合）

  if (hours > 0 && minutes > 0) {
    return `${hours}時間${minutes}分`;
  } else if (hours > 0) {
    return `${hours}時間`;
  } else {
    return `0時間${minutes}分`;
  }
};

/**
 * 時間を HH:MM:SS 形式にフォーマットするヘルパー関数
 * @param {*} totalSeconds
 * @returns {string} フォーマットされた時間文字列
 */
export const formatTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
};

/**
 * タイムラインの合計表示時間を返す関数
 * @param {*} seconds
 * @returns {string} フォーマットされた｛時間：分｝を返す
 */
export const formatDurationFromTimes = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diff = Math.floor((end - start) / 1000); // 秒単位

  const mins = Math.floor(diff / 60);
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;

  return `${String(hrs).padStart(2, "0")}:${String(remMins).padStart(2, "0")}`;
};
