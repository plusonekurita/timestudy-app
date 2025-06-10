import { Box, TextField, Button, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import React, { useState } from "react";

import { showSnackbar } from "../../../store/slices/snackbarSlice";
import { apiFetch } from "../../../utils/api";

const UserAddPage = ({ setLoading }) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    uid: "",
    name: "",
    password: "",
    version: 0,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    const alphanum = /^[a-zA-Z0-9]+$/;

    if (!form.uid) newErrors.uid = "UIDは必須です";
    else if (!alphanum.test(form.uid)) newErrors.uid = "半角英数字のみ";
    else if (form.uid.length > 40) newErrors.uid = "40文字以内";

    if (!form.name) newErrors.name = "名前は必須です";
    else if (form.name.length > 40) newErrors.name = "40文字以内";

    if (!form.password) newErrors.password = "パスワードは必須です";
    else if (!alphanum.test(form.password))
      newErrors.password = "半角英数字のみ";
    else if (form.password.length > 40) newErrors.password = "40文字以内";

    // versionのバリデーションを数値比較に変更
    const versionNum = Number(form.version);
    if (isNaN(versionNum) || (versionNum !== 0 && versionNum !== 1))
      newErrors.version = "0または1の数値を入力してください";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // versionフィールドの場合、入力値を数値に変換してバリデーションエラーをクリアする試み
    if (e.target.name === "version") {
      setErrors({ ...errors, version: undefined });
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await apiFetch("/admin/users/create", {
        method: "POST",
        body: { ...form, version: Number(form.version), role: "user" },
        auth: true,
      });
      dispatch(
        showSnackbar({
          message: "ユーザーを作成しました",
          severity: "success",
        })
      );
      setForm({ uid: "", name: "", password: "", version: 0 });
      setErrors({});
      setLoading(false);
    } catch (err) {
      setLoading(false);
      dispatch(
        showSnackbar({
          message: "ユーザー作成に失敗しました: " + err.message,
          severity: "error",
        })
      );
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        ユーザー追加
      </Typography>

      <TextField
        fullWidth
        label="UID"
        name="uid"
        value={form.uid}
        onChange={handleChange}
        margin="normal"
        error={!!errors.uid}
        helperText={errors.uid}
      />

      <TextField
        fullWidth
        label="名前"
        name="name"
        value={form.name}
        onChange={handleChange}
        margin="normal"
        error={!!errors.name}
        helperText={errors.name}
      />

      <TextField
        fullWidth
        label="パスワード"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        margin="normal"
        error={!!errors.password}
        helperText={errors.password}
      />

      <TextField
        fullWidth
        label="権限（固定: user）"
        name="role"
        value="user"
        margin="normal"
        InputProps={{ readOnly: true }}
      />

      <TextField
        fullWidth
        label="バージョン（0=free, 1=pro）"
        type="number"
        name="version"
        value={form.version}
        onChange={handleChange}
        margin="normal"
        inputProps={{ min: 0, max: 1 }} // 最小値と最大値
        error={!!errors.version}
        helperText={errors.version}
      />

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleSubmit}
      >
        登録
      </Button>
    </Box>
  );
};

export default UserAddPage;
