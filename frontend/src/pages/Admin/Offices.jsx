// src/pages/Admin/Offices.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { apiFetch } from "../../utils/api";
import { showSnackbar } from "../../store/slices/snackbarSlice";
import { performLogout } from "../../utils/auth";
import {
  Home,
  Dashboard,
  PersonAddAlt1,
  Logout,
  AddBusiness,
  LightMode,
  DarkMode,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import "./style.scss";

const OfficesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [tab, setTab] = useState("add"); // add | list
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [form, setForm] = useState({
    name: "",
    jigyousyo_no: "",
    postal_code: "",
    address: "",
    phone_number: "",
    email: "",
    is_active: true,
  });
  const [nameError, setNameError] = useState("");
  const [jigyousyoNoError, setJigyousyoNoError] = useState("");
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [searchingAddressEdit, setSearchingAddressEdit] = useState(false);
  const [theme, setTheme] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("theme") || "dark"
      : "dark"
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
  const [addManager, setAddManager] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [staffForm, setStaffForm] = useState({
    login_id: "",
    password: "",
    name: "",
    staff_code: "",
    job: "",
  });

  const fetchOffices = async () => {
    setLoading(true);
    setShowLoader(true);
    try {
      const [list] = await Promise.all([
        apiFetch("/offices"),
        new Promise((resolve) => setTimeout(resolve, 0)), // テスト用ディレイ（2秒）
      ]);
      setOffices(list || []);
    } catch {
      // ignore for now
    } finally {
      setLoading(false);
      // ローディング終了後も1秒は表示
      setTimeout(() => setShowLoader(false), 1000);
    }
  };

  useEffect(() => {
    fetchOffices();
  }, []);

  const handleLogout = () => {
    performLogout(dispatch);
    navigate("/login");
  };

  const handleSearchAddress = async (postalCode, isEdit = false) => {
    if (!postalCode || postalCode.length !== 7) {
      dispatch(
        showSnackbar({ message: "郵便番号を7桁で入力してください", severity: "warning" })
      );
      return;
    }

    try {
      if (isEdit) {
        setSearchingAddressEdit(true);
      } else {
        setSearchingAddress(true);
      }
      const response = await fetch(
        `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode}`
      );
      const data = await response.json();

      if (data.status === 200 && data.results && data.results.length > 0) {
        const result = data.results[0];
        const address = `${result.address1}${result.address2}${result.address3 || ""}`;
        if (isEdit) {
          setEdit({ ...edit, address: address });
        } else {
          setForm({ ...form, address: address });
        }
        dispatch(
          showSnackbar({ message: "住所を取得しました", severity: "success" })
        );
      } else {
        dispatch(
          showSnackbar({ message: "住所が見つかりませんでした", severity: "warning" })
        );
      }
    } catch (err) {
      dispatch(
        showSnackbar({
          message: "住所検索に失敗しました",
          severity: "error",
        })
      );
    } finally {
      if (isEdit) {
        setSearchingAddressEdit(false);
      } else {
        setSearchingAddress(false);
      }
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState(null);

  const handleUpdate = async () => {
    if (!edit?.id || !String(edit.name || "").trim()) return;
    // 事業所番号のバリデーション
    const jigyousyoNo = String(edit.jigyousyo_no || "").trim();
    if (!jigyousyoNo) {
      dispatch(
        showSnackbar({ message: "事業所番号を入力してください", severity: "warning" })
      );
      return;
    }
    if (!/^\d{10}$/.test(jigyousyoNo)) {
      dispatch(
        showSnackbar({ message: "事業所番号は半角数字10桁で入力してください", severity: "warning" })
      );
      return;
    }
    try {
      setLoading(true);
      await apiFetch(`/offices/${edit.id}`, {
        method: "PUT",
        body: {
          name: edit.name,
          jigyousyo_no: edit.jigyousyo_no,
          postal_code: edit.postal_code,
          address: edit.address,
          phone_number: edit.phone_number,
          email: edit.email,
          is_active: !!edit.is_active,
        },
      });
      setShowModal(false);
      await fetchOffices();
      dispatch(showSnackbar({ message: "更新しました", severity: "success" }));
    } catch (err) {
      dispatch(
        showSnackbar({
          message: err.message || "更新に失敗しました",
          severity: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const inputName = form.name.trim();
    if (!inputName) {
      dispatch(
        showSnackbar({
          message: "事業所名を入力してください",
          severity: "warning",
        })
      );
      return;
    }
    if (offices.some((o) => (o?.name || "").trim() === inputName)) {
      setNameError("すでに登録されています");
      return;
    }
    setNameError("");
    // 事業所番号のバリデーション
    const jigyousyoNo = form.jigyousyo_no.trim();
    if (!jigyousyoNo) {
      setJigyousyoNoError("事業所番号を入力してください");
      dispatch(
        showSnackbar({ message: "事業所番号を入力してください", severity: "warning" })
      );
      return;
    }
    if (!/^\d{10}$/.test(jigyousyoNo)) {
      setJigyousyoNoError("半角数字10桁で入力してください");
      dispatch(
        showSnackbar({ message: "事業所番号は半角数字10桁で入力してください", severity: "warning" })
      );
      return;
    }
    setJigyousyoNoError("");
    // 管理スタッフ同時登録時の厳格バリデーション
    if (addManager) {
      const alnum6 = /^[A-Za-z0-9]{6,}$/; // ログインID用
      const alnum8 = /^[A-Za-z0-9]{8,}$/; // パスワード用
      if (
        !alnum6.test(staffForm.login_id || "") ||
        !alnum8.test(staffForm.password || "") ||
        !String(staffForm.name || "").trim()
      ) {
        dispatch(
          showSnackbar({
            message:
              "管理スタッフの必須項目を正しく入力してください（ログインID: 半角英数6文字以上、パスワード: 半角英数8文字以上）",
            severity: "warning",
          })
        );
        return; // スタッフ条件を満たさない場合は保存しない
      }
    }
    try {
      setLoading(true);
      let office;
      if (addManager) {
        // スタッフも同時登録する場合は、新しいエンドポイントを使用（トランザクション処理）
        office = await apiFetch("/offices/with-staff", {
          method: "POST",
          body: {
            ...form,
            staff: {
              name: staffForm.name,
              staff_code: staffForm.staff_code || undefined,
              login_id: staffForm.login_id,
              password: staffForm.password,
              job: staffForm.job || undefined,
              is_active: true,
              is_admin: true,
            },
          },
        });
      } else {
        // スタッフを登録しない場合は従来のエンドポイントを使用
        office = await apiFetch("/offices", { method: "POST", body: form });
      }
      dispatch(
        showSnackbar({ message: "事業所を登録しました", severity: "success" })
      );
      setForm({
        name: "",
        jigyousyo_no: "",
        postal_code: "",
        address: "",
        phone_number: "",
        email: "",
        is_active: true,
      });
      setAddManager(false);
      setStaffForm({
        login_id: "",
        password: "",
        name: "",
        staff_code: "",
        job: "",
      });
      await fetchOffices();
      setTab("list");
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

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header" style={{ gap: 8 }}>
          <div className="app-logo">P</div>
          <span className="app-name">プラスワン</span>
          <button
            className="theme-toggle"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? (
              <DarkMode fontSize="small" />
            ) : (
              <LightMode fontSize="small" />
            )}
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
          <Link
            className="nav-item"
            to="/admin/offices"
            onClick={() => {
              setTab("list");
              fetchOffices();
            }}
          >
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

      <main
        className="admin-content"
        style={{ maxWidth: 980, margin: "0 auto" }}
      >
        <div className={`top-loader ${showLoader ? "show" : ""}`}></div>
        <h1>事業所</h1>

        <div className="tabs">
          <button
            className={`tab-btn ${tab === "add" ? "active" : ""}`}
            onClick={() => setTab("add")}
          >
            追加
          </button>
          <button
            className={`tab-btn ${tab === "list" ? "active" : ""}`}
            onClick={() => setTab("list")}
          >
            一覧
          </button>
        </div>

        {tab === "add" && (
          <div className="two-col" style={{ marginTop: 12 }}>
            <div className="card">
              <form onSubmit={handleCreate} className="office-form">
                <label>
                  名称（必須）
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value });
                      setNameError("");
                    }}
                    required
                    className={nameError ? "input-error" : undefined}
                  />
                  {nameError && <span className="error-text">{nameError}</span>}
                </label>
                <label>
                  事業所番号（必須）
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    value={form.jigyousyo_no}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                      setForm({ ...form, jigyousyo_no: value });
                      if (jigyousyoNoError) setJigyousyoNoError("");
                    }}
                    required
                    className={jigyousyoNoError ? "input-error" : undefined}
                  />
                  {jigyousyoNoError && <span className="error-text">{jigyousyoNoError}</span>}
                </label>
                <label>
                  郵便番号（半角数字のみ・ハイフン不要）
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={7}
                      value={form.postal_code}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 7);
                        setForm({ ...form, postal_code: value });
                      }}
                      placeholder="1234567"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => handleSearchAddress(form.postal_code, false)}
                      disabled={searchingAddress || form.postal_code.length !== 7}
                      className="switch-btn"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {searchingAddress ? "検索中..." : "住所検索"}
                    </button>
                  </div>
                </label>
                <label>
                  住所
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                  />
                </label>
                <label>
                  電話番号（半角数字のみ・ハイフン不要）
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={form.phone_number}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone_number: e.target.value.replace(/[^0-9]/g, ""),
                      })
                    }
                  />
                </label>
                <label>
                  メール
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </label>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm({ ...form, is_active: e.target.checked })
                    }
                  />
                  有効
                </label>
                <div className="divider"></div>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={addManager}
                    onChange={(e) => setAddManager(e.target.checked)}
                  />
                  管理スタッフの追加（同時登録）
                </label>

                {addManager && (
                  <div className="staff-form">
                    <div className="staff-grid">
                      <label>
                        ログインID（必須）
                        <input
                          type="text"
                          placeholder="半角英数6文字以上"
                          inputMode="text"
                          pattern="[A-Za-z0-9]{6,}"
                          minLength={6}
                          required={addManager}
                          value={staffForm.login_id}
                          onChange={(e) =>
                            setStaffForm({
                              ...staffForm,
                              login_id: e.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        パスワード（必須）
                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="半角英数8文字以上"
                            autoComplete="new-password"
                            pattern="[A-Za-z0-9]{8,}"
                            minLength={8}
                            required={addManager}
                            value={staffForm.password}
                            onChange={(e) =>
                              setStaffForm({
                                ...staffForm,
                                password: e.target.value,
                              })
                            }
                            style={{ flex: 1, paddingRight: "40px" }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                              position: "absolute",
                              right: "8px",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: "4px",
                              display: "flex",
                              alignItems: "center",
                              color: "inherit",
                            }}
                            aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                          >
                            {showPassword ? (
                              <VisibilityOff fontSize="small" />
                            ) : (
                              <Visibility fontSize="small" />
                            )}
                          </button>
                        </div>
                      </label>
                      <label>
                        氏名（必須）
                        <input
                          type="text"
                          required={addManager}
                          value={staffForm.name}
                          onChange={(e) =>
                            setStaffForm({ ...staffForm, name: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        職員コード
                        <input
                          type="text"
                          value={staffForm.staff_code}
                          onChange={(e) =>
                            setStaffForm({
                              ...staffForm,
                              staff_code: e.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        役職
                        <input
                          type="text"
                          value={staffForm.job}
                          onChange={(e) =>
                            setStaffForm({ ...staffForm, job: e.target.value })
                          }
                        />
                      </label>
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="submit"
                    className="switch-btn active"
                    disabled={loading}
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    className="switch-btn"
                    onClick={() => {
                      setForm({
                        name: "",
                        jigyousyo_no: "",
                        postal_code: "",
                        address: "",
                        phone_number: "",
                        email: "",
                        is_active: true,
                      });
                      setNameError("");
                      setJigyousyoNoError("");
                    }}
                  >
                    クリア
                  </button>
                </div>
              </form>
            </div>
            <div className="card preview-card">
              <div className="card-title">登録済み（最新5件）</div>
              <ul className="office-mini-list">
                {(offices || [])
                  .slice(-5)
                  .reverse()
                  .map((o) => (
                    <li key={o.id}>{o.name || "(名称なし)"}</li>
                  ))}
                {(!offices || offices.length === 0) && (
                  <li>データがありません</li>
                )}
              </ul>
              <div className="card-title" style={{ marginTop: 8 }}>
                入力プレビュー
              </div>
              <div className="preview-box">
                <div>
                  <strong>名称:</strong> {form.name || "-"}
                </div>
                <div>
                  <strong>事業所番号:</strong> {form.jigyousyo_no || "-"}
                </div>
                <div>
                  <strong>郵便番号:</strong> {form.postal_code || "-"}
                </div>
                <div>
                  <strong>住所:</strong> {form.address || "-"}
                </div>
                <div>
                  <strong>電話:</strong> {form.phone_number || "-"}
                </div>
                <div>
                  <strong>メール:</strong> {form.email || "-"}
                </div>
                <div>
                  <strong>状態:</strong> {form.is_active ? "有効" : "無効"}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "list" && (
          <div className="card" style={{ marginTop: 12 }}>
            <div className="card-title">事業所一覧</div>
            <div className="office-list">
              {offices?.length ? (
                <table className="office-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>名称</th>
                      <th>事業所番号</th>
                      <th>郵便番号</th>
                      <th>住所</th>
                      <th>電話</th>
                      <th>メール</th>
                      <th>状態</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {offices.map((o) => (
                      <tr
                        key={o.id}
                        onClick={() => {
                          setEdit(o);
                          setShowModal(true);
                        }}
                      >
                        <td>{o.id}</td>
                        <td>{o.name}</td>
                        <td>{o.jigyousyo_no || "-"}</td>
                        <td>{o.postal_code || "-"}</td>
                        <td>{o.address || "-"}</td>
                        <td>{o.phone_number || "-"}</td>
                        <td>{o.email || "-"}</td>
                        <td>{o.is_active ? "有効" : "無効"}</td>
                        <td>
                          <button
                            className="switch-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEdit(o);
                              setShowModal(true);
                            }}
                          >
                            編集
                          </button>
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
        {/* 編集モーダル */}
        {showModal && edit && (
          <div className="modal-backdrop" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">事業所を編集</div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdate();
                }}
                className="office-form"
              >
                <label>
                  名称（必須）
                  <input
                    type="text"
                    value={edit.name || ""}
                    onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                    required
                  />
                </label>
                <label>
                  事業所番号（必須）
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    value={edit.jigyousyo_no || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                      setEdit({ ...edit, jigyousyo_no: value });
                    }}
                    required
                  />
                </label>
                <label>
                  郵便番号（半角数字のみ・ハイフン不要）
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={7}
                      value={edit.postal_code || ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 7);
                        setEdit({ ...edit, postal_code: value });
                      }}
                      placeholder="1234567"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => handleSearchAddress(edit.postal_code || "", true)}
                      disabled={searchingAddressEdit || !edit.postal_code || edit.postal_code.length !== 7}
                      className="switch-btn"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {searchingAddressEdit ? "検索中..." : "住所検索"}
                    </button>
                  </div>
                </label>
                <label>
                  住所
                  <input
                    type="text"
                    value={edit.address || ""}
                    onChange={(e) =>
                      setEdit({ ...edit, address: e.target.value })
                    }
                  />
                </label>
                <label>
                  電話番号（半角数字のみ・ハイフン不要）
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={edit.phone_number || ""}
                    onChange={(e) =>
                      setEdit({
                        ...edit,
                        phone_number: e.target.value.replace(/[^0-9]/g, ""),
                      })
                    }
                  />
                </label>
                <label>
                  メール
                  <input
                    type="email"
                    value={edit.email || ""}
                    onChange={(e) =>
                      setEdit({ ...edit, email: e.target.value })
                    }
                  />
                </label>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={!!edit.is_active}
                    onChange={(e) =>
                      setEdit({ ...edit, is_active: e.target.checked })
                    }
                  />
                  有効
                </label>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="switch-btn"
                    onClick={() => setShowModal(false)}
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="switch-btn active"
                    disabled={loading}
                  >
                    更新
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OfficesPage;
