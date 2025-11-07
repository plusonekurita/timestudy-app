// src/pages/Admin/index.jsx
import React from "react";
import "./style.scss";
import {
  Home,
  Dashboard,
  PersonAddAlt1,
  Logout,
  AddBusiness,
  LightMode,
  DarkMode,
} from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { performLogout } from "../../utils/auth";
import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";
import { setItem } from "../../utils/localStorageUtils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
// import { showSnackbar } from "../../store/slices/snackbarSlice";

const AdminPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [error, setError] = useState(null);
  const [chartMode, setChartMode] = useState("cumulative"); // 'cumulative' | 'monthly'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [yearOptions, setYearOptions] = useState([new Date().getFullYear()]);
  const [displayCount, setDisplayCount] = useState(0);
  const [theme, setTheme] = useState(
    typeof window !== "undefined" ? localStorage.getItem("theme") || "dark" : "dark"
  );

  const handleLogout = () => {
    performLogout(dispatch);
    navigate("/login");
  };

  const fetchOffices = async () => {
    setLoading(true);
    setShowLoader(true);
    setError(null);
    try {
      const list = await apiFetch("/offices");
      setOffices(list || []);
      // 他のページでも使えるよう保存
      setItem("offices", list || []);
      // 利用可能な年のリストを作成
      const years = Array.from(
        new Set(
          (list || [])
            .map((o) => {
              const d = new Date(String(o.created_at).replace(" ", "T"));
              return isNaN(d.getTime()) ? null : d.getFullYear();
            })
            .filter((v) => v !== null)
        )
      ).sort((a, b) => a - b);
      if (years.length > 0) {
        setYearOptions(years);
        if (!years.includes(selectedYear))
          setSelectedYear(years[years.length - 1]);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setTimeout(() => setShowLoader(false), 1000);
    }
  };

  useEffect(() => {
    fetchOffices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

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

  // 事業所数のカウントアップ演出
  useEffect(() => {
    const target = offices?.length || 0;
    if (loading) {
      setDisplayCount(0);
      return;
    }
    let frame = 0;
    const durationMs = 800;
    const fps = 60;
    const totalFrames = Math.max(1, Math.round((durationMs / 1000) * fps));
    const timer = setInterval(() => {
      frame += 1;
      const progress = Math.min(1, frame / totalFrames);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayCount(Math.round(target * eased));
      if (progress >= 1) {
        clearInterval(timer);
        setDisplayCount(target);
      }
    }, Math.round(1000 / fps));
    return () => clearInterval(timer);
  }, [offices?.length, loading]);

  // 事業所追加フォームは別ページへ移動

  // 月別「累積」件数データ（YYYY-MM）- X軸は当年の1〜12月
  const monthlyData = (() => {
    if (!offices?.length) return [];
    const counts = new Map();

    const toValidDate = (value) => {
      if (!value) return null;
      if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
      let s = String(value);
      if (s.includes(" ") && !s.includes("T")) s = s.replace(" ", "T");
      let d = new Date(s);
      if (!isNaN(d.getTime())) return d;
      const trimmed = s.split("+")[0].split(".")[0];
      d = new Date(trimmed.replace(" ", "T"));
      return isNaN(d.getTime()) ? null : d;
    };

    // 単月件数を集計
    for (const o of offices) {
      const dt = toValidDate(o.created_at);
      if (!dt) continue;
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    // 年に応じた月配列を作成（今年は当月まで、過去年は12月まで）
    const months = [];
    const now = new Date();
    const isCurrentYear = selectedYear === now.getFullYear();
    const endMonth = isCurrentYear ? now.getMonth() + 1 : 12; // 1-12
    for (let m = 1; m <= endMonth; m++) {
      months.push(`${selectedYear}-${String(m).padStart(2, "0")}`);
    }

    // 累積に変換
    const data = [];
    let cumulative = 0;
    for (const key of months) {
      const monthly = counts.get(key) || 0;
      cumulative += monthly;
      data.push({ month: key, monthly, cumulative });
    }
    return data;
  })();

  // 今月追加件数（現在の年・月）
  const addedThisMonth = (() => {
    if (!offices?.length) return 0;
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const toValidDate = (value) => {
      if (!value) return null;
      if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
      let s = String(value);
      if (s.includes(" ") && !s.includes("T")) s = s.replace(" ", "T");
      let d = new Date(s);
      if (!isNaN(d.getTime())) return d;
      const trimmed = s.split("+")[0].split(".")[0];
      d = new Date(trimmed.replace(" ", "T"));
      return isNaN(d.getTime()) ? null : d;
    };
    return offices.reduce((acc, o) => {
      const dt = toValidDate(o.created_at);
      if (dt && dt.getFullYear() === y && dt.getMonth() === m) return acc + 1;
      return acc;
    }, 0);
  })();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header" style={{ gap: 8 }}>
          <div className="app-logo">P</div>
          <span className="app-name">プラスワン</span>
          <button className="theme-toggle" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            {theme === "light" ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" />}
          </button>
        </div>
        <nav className="sidebar-nav">
          <a className="nav-item" href="#top">
            <Home className="nav-icon" />
            <span className="nav-label">トップ</span>
          </a>
          <a className="nav-item" href="#dashboard">
            <Dashboard className="nav-icon" />
            <span className="nav-label">ダッシュボード</span>
          </a>
          <Link className="nav-item" to="/admin/staffs">
            <PersonAddAlt1 className="nav-icon" />
            <span className="nav-label">スタッフ管理</span>
          </Link>
          <Link className="nav-item" to="/admin/offices">
            <AddBusiness className="nav-icon" />
            <span className="nav-label">事業所</span>
          </Link>
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <Logout className="nav-icon" />
            <span className="nav-label">ログアウト</span>
          </button>
        </div>
      </aside>
      <main className="admin-content">
        <div className={`top-loader ${showLoader ? "show" : ""}`}></div>
        <h1>管理画面</h1>
        {/* 事業所追加フォームは別ページに移動しました */}
        <div className="cards">
          <div className="card">
            <div className="card-title">登録事業所数</div>
            <div
              className="card-value"
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "center",
                gap: 12,
              }}
            >
              {loading ? "..." : displayCount}
              <span className="increase-badge">▲ {addedThisMonth}</span>
            </div>
          </div>
        </div>
        {error && <p style={{ color: "#f66" }}>{error}</p>}

        <div className="chart-card">
          <div className="chart-title">
            月別登録推移
            <div className="chart-switch">
              <select
                className="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <button
                className={`switch-btn ${
                  chartMode === "cumulative" ? "active" : ""
                }`}
                onClick={() => setChartMode("cumulative")}
              >
                累計
              </button>
              <button
                className={`switch-btn ${
                  chartMode === "monthly" ? "active" : ""
                }`}
                onClick={() => setChartMode("monthly")}
              >
                月別件数
              </button>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={monthlyData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5a5df0" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#5a5df0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="rgba(255,255,255,0.08)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="#9aa0a6"
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                  tickFormatter={(v) => {
                    if (typeof v !== "string") return v;
                    const part = v.split("-")[1] || v;
                    const num = parseInt(part, 10);
                    return isNaN(num) ? part : num;
                  }}
                  allowDecimals={false}
                  interval={0}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="#9aa0a6"
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1a1a1d",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={
                    chartMode === "cumulative" ? "cumulative" : "monthly"
                  }
                  name={chartMode === "cumulative" ? "累計" : "月別件数"}
                  stroke="#7f82ff"
                  fill="url(#colorCount)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
