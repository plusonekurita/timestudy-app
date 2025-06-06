// src/pages/Login/index
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import React, { useEffect } from "react";

import { getValue, setItem } from "../../utils/localStorageUtils";
import { showSnackbar } from "../../store/slices/snackbarSlice";
import { login } from "../../store/slices/authSlice";
import { colors } from "../../constants/theme";
import LoginForm from "./LoginForm";

const updateThemeColor = (color) => {
  let metaTag = document.querySelector("meta[name='theme-color']");
  if (metaTag) {
    metaTag.setAttribute("content", color);
  } else {
    metaTag = document.createElement("meta");
    metaTag.setAttribute("name", "theme-color");
    metaTag.setAttribute("content", color);
    document.getElementsByTagName("head")[0].appendChild(metaTag);
  }
};

const LoginPage = () => {
  useEffect(() => {
    // ログインページ表示時にテーマカラーを白に設定
    updateThemeColor(colors.loginTheme);

    // ページを離れる（アンマウント時）にデフォルトのテーマカラーに戻す
    return () => {
      updateThemeColor(colors.primary);
    };
  }, []); // このeffectはマウント時とアンマウント時にのみ実行

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 本日以外の日付の記録を処理する関数
  const processOldRecords = async (userId) => {
    const todayKey = new Date().toISOString().split("T")[0];
    const allDailyRecords = getValue(`dailyTimeStudyRecords_${userId}`, {});
    const remainingRecords = {};

    // 本日以外の記録だけを抽出してサーバーに送るための準備処理
    for (const dateKey in allDailyRecords) {
      if (dateKey === todayKey) {
        // 本日の記録をローカルストレージに残す用の処理
        remainingRecords[dateKey] = allDailyRecords[dateKey];
      } else {
        // 当日以外の記録をDBに保存
        try {
          const accessToken = getValue("access_token");
          const userId = getValue("userId");

          const response = await fetch("/api/save-time-records", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`, // 必要なら
            },
            body: JSON.stringify({
              user_id: userId,
              record_date: dateKey,
              record: allDailyRecords[dateKey],
            }),
          });

          if (!response.ok) {
            throw new Error("DB保存に失敗");
          }

          // 成功したらローカルから削除
          console.log(`${dateKey} の記録をDBに保存しました`);
        } catch (err) {
          console.error(`${dateKey} の記録保存に失敗:`, err);
          dispatch(
            showSnackbar({
              message: `${dateKey} の記録保存に失敗しました。`,
              severity: "error",
            })
          );
          return; // 失敗したら処理中断
        }
      }
    }

    // すべて成功したらローカルを更新
    setItem(`dailyTimeStudyRecords_${userId}`, remainingRecords);
    dispatch(
      showSnackbar({
        message: "過去の記録をすべてサーバーに保存しました。",
        severity: "info",
      })
    );
  };

  // LoginForm: ログイン試行関数
  const handleLoginAttempt = async (uid, password) => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, password }),
      });

      if (!response.ok) {
        throw new Error("ログイン失敗");
      }

      const data = await response.json();

      // アクセストークンを保存
      setItem("access_token", data.access_token);
      setItem("userId", data.id);
      setItem("userName", data.name);
      setItem("version", data.version);

      dispatch(
        showSnackbar({
          message: `ようこそ ${data.name} さん`,
          severity: "success",
        })
      );
      dispatch(
        login({
          id: data.id,
          name: data.name,
          version: data.version,
        })
      );

      await processOldRecords(data.id);
      navigate("/main");
      return true;
    } catch {
      dispatch(
        showSnackbar({
          message:
            "ログインに失敗しました。UIDまたはパスワードをご確認ください。",
          severity: "error",
        })
      );
      return false;
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>ログイン</h1>
      <LoginForm onSubmitAttempt={handleLoginAttempt} />
    </div>
  );
};

export default LoginPage;
