// utils/checkAndResetTimeStudyRecords
import { getValue, setItem } from "./localStorageUtils";

// 日付が変わるとローカルのデータを削除する関数
export const checkAndResetTimeStudyRecords = () => {
  try {
    const now = new Date();
    const currentJstDateString = now.toLocaleDateString("sv-SE", {
      timeZone: "Asia/Tokyo",
    });

    const existingRecords = getValue("timeStudyRecords", []);
    if (existingRecords.length > 0) {
      const lastRecord = existingRecords[existingRecords.length - 1];
      if (lastRecord && lastRecord.startTime) {
        const lastRecordDate = new Date(lastRecord.startTime);
        const lastRecordJstDateString = lastRecordDate.toLocaleDateString(
          "sv-SE",
          { timeZone: "Asia/Tokyo" }
        );

        if (currentJstDateString !== lastRecordJstDateString) {
          // TODO: コメント削除
          console.log("日付が変わったので前日の記録をリセットします。");
          setItem("timeStudyRecords", []);
        }
      }
    }
  } catch (error) {
    // TODO: ユーザーにエラー通知
    console.error(
      "日付チェックまたは記録リセット中にエラーが発生しました:",
      error
    );
  }
};
