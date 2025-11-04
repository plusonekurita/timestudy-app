// src/pages/Admin/Staffs.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { apiFetch } from "../../utils/api";
import { showSnackbar } from "../../store/slices/snackbarSlice";
import { performLogout } from "../../utils/auth";
import { Home, Dashboard, PersonAddAlt1, Logout, AddBusiness, LightMode, DarkMode } from "@mui/icons-material";
import "./style.scss";

const StaffsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [tab, setTab] = useState("add"); // add | list
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [selectedOfficeId, setSelectedOfficeId] = useState(null);
  const [staffs, setStaffs] = useState([]);
  const [theme, setTheme] = useState(
    typeof window !== "undefined" ? localStorage.getItem("theme") || "dark" : "dark"
  );
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") root.classList.add("theme-light");
    else root.classList.remove("theme-light");
    localStorage.setItem("theme", theme);
  }, [theme]);
  const [showEdit, setShowEdit] = useState(false);
  const [edit, setEdit] = useState(null);

  const [form, setForm] = useState({
    office_id: "",
    login_id: "",
    password: "",
    name: "",
    staff_code: "",
    job: "",
  });

  const handleLogout = () => { performLogout(dispatch); navigate("/login"); };

  const fetchOffices = async () => {
    setLoading(true); setShowLoader(true);
    try {
      const list = await apiFetch("/offices");
      setOffices(list || []);
      if (!selectedOfficeId && list?.length) setSelectedOfficeId(list[0].id);
    } finally { setLoading(false); setTimeout(() => setShowLoader(false), 600); }
  };

  const fetchStaffsByOffice = async (officeId) => {
    if (!officeId) { setStaffs([]); return; }
    setLoading(true); setShowLoader(true);
    setStaffs([]); // 事業所変更時に一旦クリア
    try {
      const list = await apiFetch(`/offices/${officeId}/staffs`);
      setStaffs(Array.isArray(list) ? list : []);
    } catch (_e) {
      setStaffs([]); // 404などの場合は空表示
    } finally { setLoading(false); setTimeout(() => setShowLoader(false), 600); }
  };

  useEffect(() => { fetchOffices(); }, []);
  useEffect(() => {
    if (tab !== "add") fetchStaffsByOffice(selectedOfficeId);
  }, [selectedOfficeId, tab]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const alnum8 = /^[A-Za-z0-9]{8,}$/;
    if (!form.office_id) { dispatch(showSnackbar({ message: "事業所を選択してください", severity: "warning" })); return; }
    if (!alnum8.test(form.login_id || "") || !alnum8.test(form.password || "") || !String(form.name || "").trim()) {
      dispatch(showSnackbar({ message: "必須項目を正しく入力してください（半角英数8文字以上など）", severity: "warning" }));
      return;
    }
    try {
      setLoading(true); setShowLoader(true);
      await apiFetch(`/offices/${form.office_id}/staffs`, { method: "POST", body: {
        name: form.name,
        staff_code: form.staff_code || undefined,
        login_id: form.login_id,
        password: form.password,
        job: form.job || undefined,
        is_active: true,
        is_admin: false,
      }});
      dispatch(showSnackbar({ message: "スタッフを登録しました", severity: "success" }));
      setForm({ office_id: offices[0]?.id || "", login_id: "", password: "", name: "", staff_code: "", job: "" });
      await fetchStaffsByOffice(selectedOfficeId || form.office_id);
      setTab("list");
    } catch (err) {
      dispatch(showSnackbar({ message: err.message || "登録に失敗しました", severity: "error" }));
    } finally { setLoading(false); setTimeout(() => setShowLoader(false), 600); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!edit?.id || !selectedOfficeId) return;
    const alnum8 = /^[A-Za-z0-9]{8,}$/;
    if (!alnum8.test(edit.login_id || "") || !String(edit.name || "").trim()) {
      dispatch(showSnackbar({ message: "必須項目を正しく入力してください", severity: "warning" }));
      return;
    }
    try {
      setLoading(true); setShowLoader(true);
      await apiFetch(`/offices/${selectedOfficeId}/staffs/${edit.id}`, {
        method: "PUT",
        body: {
          name: edit.name,
          staff_code: edit.staff_code || undefined,
          email: edit.email || undefined,
          phone_number: edit.phone_number || undefined,
          job: edit.job || undefined,
          is_active: !!edit.is_active,
          is_admin: !!edit.is_admin,
          password: edit.password || undefined,
        },
      });
      await fetchStaffsByOffice(selectedOfficeId);
      dispatch(showSnackbar({ message: "更新しました", severity: "success" }));
      setShowEdit(false);
    } catch (err) {
      dispatch(showSnackbar({ message: err.message || "更新に失敗しました", severity: "error" }));
    } finally { setLoading(false); setTimeout(() => setShowLoader(false), 600); }
  };

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

      <main className="admin-content" style={{ maxWidth: 980, margin: "0 auto" }}>
        <div className={`top-loader ${showLoader ? "show" : ""}`}></div>
        <h1>スタッフ管理</h1>

        <div className="tabs">
          <button className={`tab-btn ${tab === "add" ? "active" : ""}`} onClick={() => setTab("add")}>追加</button>
          <button className={`tab-btn ${tab === "list" ? "active" : ""}`} onClick={() => setTab("list")}>一覧</button>
        </div>

        {tab === "add" && (
          <div className="card" style={{ marginTop: 12 }}>
            <form onSubmit={handleCreate} className="office-form">
              <label>
                事業所（必須）
                <select value={form.office_id} onChange={(e) => setForm({ ...form, office_id: e.target.value })} className="year-select">
                  <option value="">選択してください</option>
                  {offices.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </label>
              <div className="staff-grid">
                <label>
                  ログインID（必須）
                  <input type="text" placeholder="半角英数8文字以上" pattern="[A-Za-z0-9]{8,}" minLength={8} required value={form.login_id} onChange={(e)=>setForm({ ...form, login_id: e.target.value })} />
                </label>
                <label>
                  パスワード（必須）
                  <input type="password" placeholder="半角英数8文字以上" pattern="[A-Za-z0-9]{8,}" minLength={8} required value={form.password} onChange={(e)=>setForm({ ...form, password: e.target.value })} />
                </label>
                <label>
                  氏名（必須）
                  <input type="text" required value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} />
                </label>
                <label>
                  職員コード
                  <input type="text" value={form.staff_code} onChange={(e)=>setForm({ ...form, staff_code: e.target.value })} />
                </label>
                <label>
                  役職
                  <input type="text" value={form.job} onChange={(e)=>setForm({ ...form, job: e.target.value })} />
                </label>
              </div>
              <div style={{ display:"flex", gap: 8 }}>
                <button type="submit" className="switch-btn active" disabled={loading}>保存</button>
                <button type="button" className="switch-btn" onClick={()=>setForm({ office_id: "", login_id:"", password:"", name:"", staff_code:"", job:"" })}>クリア</button>
              </div>
            </form>
          </div>
        )}

        {tab === "list" && (
          <div className="card" style={{ marginTop: 12 }}>
            <div className="card-title" style={{ display:"flex", alignItems:"center", gap:8 }}>
              一覧
              <select className="year-select" value={selectedOfficeId || ""} onChange={(e)=>setSelectedOfficeId(Number(e.target.value))}>
                {offices.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
            <div className="office-list">
              {staffs?.length ? (
                <table className="office-table">
                  <thead>
                    <tr><th>ID</th><th>氏名</th><th>職員コード</th><th>ログインID</th><th>役職</th><th>状態</th><th></th></tr>
                  </thead>
                  <tbody>
                    {staffs.map((s) => (
                      <tr key={s.id} onClick={() => { setEdit({ ...s }); setShowEdit(true); }}>
                        <td>{s.id}</td>
                        <td>{s.name}</td>
                        <td>{s.staff_code || "-"}</td>
                        <td>{s.login_id}</td>
                        <td>{s.job || "-"}</td>
                        <td>{s.is_active ? "有効" : "無効"}</td>
                        <td>
                          <button className="switch-btn" onClick={(e) => { e.stopPropagation(); setEdit({ ...s }); setShowEdit(true); }}>編集</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ margin: 0 }}>データがありません。</p>
              )}
            </div>
          </div>
        )}

        {showEdit && edit && (
          <div className="modal-backdrop" onClick={() => setShowEdit(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">スタッフを編集</div>
              <form onSubmit={handleUpdate} className="office-form">
                <label>
                  氏名（必須）
                  <input type="text" required value={edit.name || ""} onChange={(e)=>setEdit({ ...edit, name: e.target.value })} />
                </label>
                <div className="staff-grid">
                  <label>
                    ログインID（変更不可）
                    <input type="text" value={edit.login_id || ""} readOnly />
                  </label>
                  <label>
                    パスワード（変更時のみ）
                    <input type="password" placeholder="半角英数8文字以上" pattern="[A-Za-z0-9]{8,}" minLength={8} value={edit.password || ""} onChange={(e)=>setEdit({ ...edit, password: e.target.value })} />
                  </label>
                  <label>
                    職員コード
                    <input type="text" value={edit.staff_code || ""} onChange={(e)=>setEdit({ ...edit, staff_code: e.target.value })} />
                  </label>
                  <label>
                    役職
                    <input type="text" value={edit.job || ""} onChange={(e)=>setEdit({ ...edit, job: e.target.value })} />
                  </label>
                  <label className="checkbox">
                    <input type="checkbox" checked={!!edit.is_active} onChange={(e)=>setEdit({ ...edit, is_active: e.target.checked })} /> 有効
                  </label>
                </div>
                <div className="modal-actions">
                  <button type="button" className="switch-btn" onClick={() => setShowEdit(false)}>キャンセル</button>
                  <button type="submit" className="switch-btn active" disabled={loading}>更新</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 事業所別タブは削除 */}
      </main>
    </div>
  );
};

export default StaffsPage;


