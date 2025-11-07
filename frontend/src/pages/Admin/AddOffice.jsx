// src/pages/Admin/AddOffice.jsx
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";
import { getValue } from "../../utils/localStorageUtils";
import { showSnackbar } from "../../store/slices/snackbarSlice";
import "./style.scss";
import { performLogout } from "../../utils/auth";
import { Home, Dashboard, PersonAddAlt1, Logout, AddBusiness, LightMode, DarkMode } from "@mui/icons-material";

const AddOfficePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone_number: "",
    email: "",
    is_active: true,
  });
  const [nameError, setNameError] = useState("");
  const [knownOffices, setKnownOffices] = useState([]);

  React.useEffect(() => {
    // 既存の事業所一覧をローカルから読み込み（なければAPI）
    const local = getValue("offices", []);
    if (Array.isArray(local) && local.length > 0) {
      setKnownOffices(local);
    } else {
      apiFetch("/offices").then((list) => setKnownOffices(list || [])).catch(() => {});
    }
  }, []);

  const handleCreateOffice = async (e) => {
    e.preventDefault();
    const inputName = form.name.trim();
    if (!inputName) {
      dispatch(
        showSnackbar({ message: "事業所名を入力してください", severity: "warning" })
      );
      return;
    }
    // 重複チェック（完全一致・前後空白無視）
    const isDup = knownOffices.some((o) => (o?.name || "").trim() === inputName);
    if (isDup) {
      setNameError("すでに登録されています");
      return;
    } else {
      setNameError("");
    }
    try {
      setLoading(true);
      await apiFetch("/offices", { method: "POST", body: form });
      dispatch(
        showSnackbar({ message: "事業所を登録しました", severity: "success" })
      );
      navigate("/admin", { replace: true });
    } catch (err) {
      dispatch(
        showSnackbar({
          message: err.message || "登録に失敗しました",
          severity: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    performLogout(dispatch);
    navigate("/login");
  };

  const [theme, setTheme] = useState(
    typeof window !== "undefined" ? localStorage.getItem("theme") || "dark" : "dark"
  );
  useEffect(() => {
    // 管理画面のコンテナにのみテーマを適用（グローバルに影響しないように）
    const adminLayout = document.querySelector(".admin-layout");
    if (adminLayout) {
      if (theme === "light") {
        adminLayout.classList.add("theme-light");
      } else {
        adminLayout.classList.remove("theme-light");
      }
    }
    localStorage.setItem("theme", theme);
    
    // クリーンアップ：コンポーネントがアンマウントされる際にテーマクラスを削除
    return () => {
      const adminLayout = document.querySelector(".admin-layout");
      if (adminLayout) {
        adminLayout.classList.remove("theme-light");
      }
    };
  }, [theme]);

  return (
    <div className="admin-layout">
      {/* 左メニュー（管理画面共通） */}
      <aside className="admin-sidebar">
        <div className="sidebar-header" style={{ gap: 8 }}>
          <div className="app-logo">m</div>
          <span className="app-name">mina</span>
          <button className="theme-toggle" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            {theme === "light" ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" />}
          </button>
        </div>
        <nav className="sidebar-nav">
          <Link className="nav-item" to="/admin">
            <Home className="nav-icon" />
            <span className="nav-label">トップ</span>
          </Link>
          <Link className="nav-item" to="/admin#dashboard">
            <Dashboard className="nav-icon" />
            <span className="nav-label">ダッシュボード</span>
          </Link>
          <Link className="nav-item" to="/admin/staffs">
            <PersonAddAlt1 className="nav-icon" />
            <span className="nav-label">スタッフ管理</span>
          </Link>
          <Link className="nav-item" to="/admin/offices/new">
            <AddBusiness className="nav-icon" />
            <span className="nav-label">事業所追加</span>
          </Link>
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <Logout className="nav-icon" />
            <span className="nav-label">ログアウト</span>
          </button>
        </div>
      </aside>

      <main className="admin-content" style={{ maxWidth: 980, margin: "0 auto" }}>
        <h1>事業所追加</h1>
        <div className="card" style={{ marginBottom: 16 }}>
          <form onSubmit={handleCreateOffice} className="office-form">
            <label>
              名称（必須）
              <input
                type="text"
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  if (nameError) setNameError("");
                }}
                required
                className={nameError ? "input-error" : undefined}
              />
              {nameError && <span className="error-text">{nameError}</span>}
            </label>
            <label>
              住所
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </label>
            <label>
              電話番号（半角数字のみ・ハイフン不要）
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value.replace(/[^0-9]/g, "") })}
              />
            </label>
            <label>
              メール
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              有効
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="switch-btn active" disabled={loading}>
                保存
              </button>
              <button
                type="button"
                className="switch-btn"
                onClick={() => navigate("/admin")}
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddOfficePage;


