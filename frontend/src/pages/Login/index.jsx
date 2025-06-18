// src/pages/Login/index
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import React, { useEffect } from "react";

import { getValue, setItem } from "../../utils/localStorageUtils";
import { showSnackbar } from "../../store/slices/snackbarSlice";
import { login } from "../../store/slices/authSlice";
import { colors } from "../../constants/theme";
import { apiFetch } from "../../utils/api";
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
    let saveCount = 0; // 保存件数をカウント

    // 本日以外の記録だけを抽出してサーバーに送るための準備処理
    for (const dateKey in allDailyRecords) {
      if (dateKey === todayKey) {
        // 本日の記録をローカルストレージに残す用の処理
        remainingRecords[dateKey] = allDailyRecords[dateKey];
      } else {
        // 当日以外の記録をDBに保存
        try {
          const userId = getValue("userId");

          await apiFetch("/save-time-records", {
            method: "POST",
            body: {
              user_id: userId,
              record_date: dateKey,
              record: allDailyRecords[dateKey],
            },
          });

          saveCount++; // 保存成功したらカウント
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
    if (saveCount > 0) {
      dispatch(
        showSnackbar({
          message: "過去の記録をすべてサーバーに保存しました。",
          severity: "info",
        })
      );
    }
  };

  // LoginForm: ログイン試行関数
  const handleLoginAttempt = async (uid, password) => {
    try {
      const mockUsers = {
        demo: {
          id: 2,
          name: "デモユーザー",
          version: "1",
          role: "user",
          password: "1964101001",
        },
        plusone: {
          id: 3,
          name: "プラスワン",
          version: "1",
          role: "user",
          password: "1964101001",
        },
        // admin: {
        //   id: 1,
        //   name: "管理者",
        //   version: "1",
        //   role: "admin",
        //   password: "1964101001",
        // },
      };

      const user = mockUsers[uid];

      if (!user || user.password !== password) {
        throw new Error("ユーザーIDまたはパスワードが間違っています。");
      }

      // アクセストークンを保存
      localStorage.setItem("access_token", "dummy-token");
      setItem("userId", user.id);
      setItem("userName", user.name);
      setItem("version", user.version);
      setItem("role", user.role);

      dispatch(
        showSnackbar({
          message: `ようこそ ${user.name} さん`,
          severity: "success",
        })
      );
      dispatch(
        login({
          id: user.id,
          name: user.name,
          version: user.version,
        })
      );

      if (user.role !== "admin") {
        await processOldRecords(user.id);
      }

      // 管理者なら admin ページへ遷移
      navigate(user.role === "admin" ? "/admin" : "/main");
      return true;
    } catch (err) {
      console.log(err);
      dispatch(
        showSnackbar({
          message: err.message,
          severity: "error",
        })
      );
      return false;
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>ログイン</h1>
      <h2>(デモ版)</h2>
      <LoginForm onSubmitAttempt={handleLoginAttempt} />
    </div>
  );
};

export default LoginPage;
