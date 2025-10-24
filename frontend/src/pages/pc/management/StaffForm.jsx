import {
  Box,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  Paper,
  Stack,
  Grid,
} from "@mui/material";
// src/features/staff/StaffForm.jsx
import React, { useMemo, useState } from "react";
import { useDispatch } from "react-redux";

import { showSnackbar } from "../../../store/slices/snackbarSlice";
import { setStaffList } from "../../../store/slices/staffSlice";
import { getValue } from "../../../utils/localStorageUtils";
import { apiFetch } from "../../../utils/api";

const StaffForm = ({ officeId, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const user = getValue("user");
  const resolvedOfficeId = officeId ?? user?.office?.id;

  // 全角→半角（英数字）
  const toHalfWidthEN = (str = "") =>
    String(str).replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
      String.fromCharCode(s.charCodeAt(0) - 0xfee0)
    );

  // ルール
  const reAlnum8 = /^[A-Za-z0-9]{8,}$/; // 半角英数字のみ・8文字以上
  const reDigits = /^[0-9]+$/; // 半角数字のみ

  const [values, setValues] = useState({
    // 認証
    login_id: "",
    password: "",
    // 基本
    name: "",
    staff_code: "",
    // 業務
    job: "",
    // 連絡先
    email: "",
    phone_number: "",
    // フラグ
    is_active: true,
    is_admin: false,
  });

  const [errors, setErrors] = useState({
    login_id: "",
    password: "",
    staff_code: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  // 単項目バリデーション
  const validateField = (key, v) => {
    if (key === "login_id") {
      if (!v) return "必須項目です";
      if (!reAlnum8.test(v)) return "半角英数字8文字以上で入力してください";
    }
    if (key === "password") {
      if (!v) return "必須項目です";
      if (!reAlnum8.test(v)) return "半角英数字8文字以上で入力してください";
    }
    if (key === "staff_code") {
      if (!v) return "必須項目です";
      if (!reDigits.test(v)) return "半角数字のみで入力してください";
    }
    return "";
  };

  // 全体バリデーション
  const validateAll = (vals) => {
    const e = {
      login_id: validateField("login_id", vals.login_id),
      password: validateField("password", vals.password),
      staff_code: validateField("staff_code", vals.staff_code),
    };
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  // 入力ハンドラ（対象は半角化＆空白除去）
  const handleChange = (key) => (e) => {
    const raw =
      e?.target?.type === "checkbox" ? e.target.checked : e.target.value;
    let v = raw;

    if (["login_id", "password", "staff_code"].includes(key)) {
      v = toHalfWidthEN(String(raw)).replace(/\s/g, "");
    }

    setValues((prev) => {
      const next = { ...prev, [key]: v };
      if (["login_id", "password", "staff_code"].includes(key)) {
        setErrors((pe) => ({ ...pe, [key]: validateField(key, v) }));
      }
      return next;
    });
  };

  // 送信可否
  const canSubmit = useMemo(() => {
    const requiredFilled =
      values.login_id.trim().length > 0 &&
      values.password.trim().length > 0 &&
      values.name.trim().length > 0 &&
      values.staff_code.trim().length > 0 &&
      !!resolvedOfficeId;

    const noFieldError = !Object.values(errors).some(Boolean);
    return Boolean(requiredFilled && noFieldError && !submitting);
  }, [values, errors, resolvedOfficeId, submitting]);

  const resetForm = () => {
    setValues({
      login_id: "",
      password: "",
      name: "",
      staff_code: "",
      job: "",
      email: "",
      phone_number: "",
      is_active: true,
      is_admin: false,
    });
    setErrors({ login_id: "", password: "", staff_code: "" });
  };

  // スタッフリストを再取得する関数
  const refreshStaffList = async () => {
    try {
      const staffList = await apiFetch(`/offices/${resolvedOfficeId}/staffs`);
      dispatch(setStaffList(staffList));
    } catch (error) {
      console.warn("スタッフリストの再取得に失敗しました", error);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    // クライアント側最終チェック
    if (!validateAll(values)) {
      dispatch(
        showSnackbar({
          message: "入力内容を確認してください",
          severity: "warning",
        })
      );
      return;
    }

    if (!canSubmit) return;

    setSubmitting(true);
    setErr("");
    try {
      const created = await apiFetch(`/offices/${resolvedOfficeId}/staffs`, {
        method: "POST",
        body: {
          // 認証
          login_id: values.login_id,
          password: values.password, // ハッシュはサーバ側
          // 基本
          name: values.name,
          staff_code: values.staff_code || null,
          // 業務
          job: values.job || null,
          // 連絡先
          email: values.email || null,
          phone_number: values.phone_number || null,
          // フラグ
          is_active: values.is_active,
          is_admin: values.is_admin,
        },
      });

      // フォーム初期化
      resetForm();

      // スタッフリストを再取得
      await refreshStaffList();

      // 成功通知
      dispatch(
        showSnackbar({ message: "スタッフを登録しました", severity: "success" })
      );

      onSuccess?.(created);
    } catch (e) {
      const msg = e?.message || "登録に失敗しました";
      setErr(msg);
      // エラー通知
      dispatch(showSnackbar({ message: msg, severity: "error" }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 2, maxWidth: 900, mx: "auto" }}>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        {err && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {err}
          </Alert>
        )}

        {/* フォーム本体：md以上で2カラム、xsでは1カラム */}
        <Grid container spacing={2}>
          {/* 認証 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="ログインID *"
              value={values.login_id}
              onChange={handleChange("login_id")}
              size="small"
              required
              fullWidth
              autoFocus
              autoComplete="username"
              error={Boolean(errors.login_id)}
              helperText={errors.login_id}
              inputProps={{ inputMode: "latin", pattern: "[A-Za-z0-9]*" }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="パスワード *"
              value={values.password}
              onChange={handleChange("password")}
              size="small"
              required
              fullWidth
              type="password"
              autoComplete="new-password"
              error={Boolean(errors.password)}
              helperText={errors.password}
              inputProps={{ inputMode: "latin", pattern: "[A-Za-z0-9]*" }}
            />
          </Grid>

          {/* 基本情報 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="氏名 *"
              value={values.name}
              onChange={handleChange("name")}
              size="small"
              required
              fullWidth
              autoComplete="name"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="職員コード *"
              value={values.staff_code}
              onChange={handleChange("staff_code")}
              size="small"
              required
              fullWidth
              error={Boolean(errors.staff_code)}
              helperText={errors.staff_code}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            />
          </Grid>

          {/* 業務情報 / 連絡先 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="役職"
              value={values.job}
              onChange={handleChange("job")}
              size="small"
              fullWidth
            />
          </Grid>
          {/* メールアドレスと電話番号を一時的に非表示 */}
          {/* <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="メールアドレス"
              value={values.email}
              onChange={handleChange("email")}
              size="small"
              type="email"
              fullWidth
              autoComplete="email"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="電話番号"
              value={values.phone_number}
              onChange={handleChange("phone_number")}
              size="small"
              type="tel"
              fullWidth
              autoComplete="tel"
            />
          </Grid> */}

          {/* フラグ（横並び） */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack
              direction="row"
              spacing={3}
              alignItems="center"
              sx={{ height: 1 }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={values.is_active}
                    onChange={handleChange("is_active")}
                  />
                }
                label="稼働中"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={values.is_admin}
                    onChange={handleChange("is_admin")}
                  />
                }
                label="管理者権限"
              />
            </Stack>
          </Grid>

          {/* 操作ボタン（右寄せ） */}
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              {onCancel && (
                <Button variant="text" onClick={onCancel} disabled={submitting}>
                  キャンセル
                </Button>
              )}
              <Button type="submit" variant="contained" disabled={!canSubmit}>
                {submitting ? "登録中..." : "登録"}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default StaffForm;
