// src/pages/Login/index
import "./style.scss";

import useMediaQuery from "@mui/material/useMediaQuery";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { getValue, setItem } from "../../utils/localStorageUtils";
import { showSnackbar } from "../../store/slices/snackbarSlice";
import LoadingOverlay from "../../components/LoadingOverlay";
import { setStaffList } from "../../store/slices/staffSlice";
import { login } from "../../store/slices/authSlice";
import LoginForm from "./components/LoginForm";
import { colors } from "../../constants/theme";
import { apiFetch } from "../../utils/api";

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
  const [loading, setLoading] = useState(false); // ログイン中のローディング
  const [error, setError] = useState(null); // ログイン時のエラーメッセージ

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
  const processOldRecords = async (user) => {
    const todayKey = new Date().toISOString().split("T")[0];
    const allDailyRecords = getValue(`dailyTimeStudyRecords_${user.id}`, {});
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
          await apiFetch("/save-time-records", {
            method: "POST",
            body: {
              staff: user,
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
    setItem(`dailyTimeStudyRecords_${user.id}`, remainingRecords);
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
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/login", {
        method: "POST",
        body: { uid, password },
        auth: false,
      });

      // 職員一覧の取得
      if (data.isAdmin && data.officeId) {
        try {
          // 権限が管理者であれば，紐づく事業所の利用者一覧を取得する
          const staffList = await apiFetch(`/offices/${data.officeId}/staffs`);

          // 必要ならstateやReduxに保存
          dispatch(setStaffList(staffList));
        } catch (error) {
          console.warn("職員リストの取得に失敗しました", error);
        }
      }

      // アクセストークンを保存
      localStorage.setItem("access_token", data.access_token);
      const user = {
        id: data.id,
        uid: data.uid,
        userName: data.name,
        staffCode: data.staffCode,
        job: data.job,
        officeId: data.officeId,
        office: data.office,
        isAdmin: data.isAdmin,
      };

      // ローカルに保存
      setItem("user", user);

      dispatch(
        showSnackbar({
          message: `ようこそ ${data.name} さん`,
          severity: "success",
        })
      );
      dispatch(
        login({
          id: data.id,
          uid: data.uid,
          name: data.name,
          version: data.version,
          role: data.role,
        })
      );

      if (data.role !== "admin") {
        await processOldRecords(data);
      }

      // 管理者なら admin ページへ遷移
      navigate(user.role === "admin" ? "/admin" : "/menu");
      return true;
    } catch (err) {
      console.log(err);
      setError(err.message);
      dispatch(
        showSnackbar({
          message: err.message,
          severity: "error",
        })
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <LoadingOverlay loading={loading} />
      <h1>ログイン</h1>
      <LoginForm onSubmitAttempt={handleLoginAttempt} />
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default LoginPage;
