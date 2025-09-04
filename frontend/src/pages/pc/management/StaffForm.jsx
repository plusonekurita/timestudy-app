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
import React, { useMemo, useState } from "react";

import { getValue } from "../../../utils/localStorageUtils";
import { apiFetch } from "../../../utils/api";

const StaffForm = ({ officeId, onSuccess, onCancel }) => {
  const user = getValue("user");
  const resolvedOfficeId = officeId ?? user?.office?.id;

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
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const canSubmit = useMemo(() => {
    return (
      values.login_id.trim().length > 0 &&
      values.password.trim().length > 0 &&
      values.name.trim().length > 0 &&
      values.staff_code.trim().length > 0 &&
      !!resolvedOfficeId &&
      !submitting
    );
  }, [values, resolvedOfficeId, submitting]);

  const handleChange = (key) => (e) => {
    const v =
      e?.target?.type === "checkbox" ? e.target.checked : e.target.value;
    setValues((prev) => ({ ...prev, [key]: v }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
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
      onSuccess?.(created);
    } catch (e) {
      setErr(e?.message || "登録に失敗しました");
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
          <Grid size={{ xs: 12, md: 6 }}>
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
          </Grid>

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
