// src/page/login/LoginForm
import { TextField, Button } from "@mui/material";
import { useForm } from "react-hook-form";
import React from "react";

const LoginForm = ({ onSubmitAttempt }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    onSubmitAttempt(data.username, data.password);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      style={{ width: "100%" }}
    >
      <div>
        <TextField
          label="ユーザー名"
          fullWidth
          margin="normal"
          // フィールド名, {ルール}
          {...register("username", {
            required: "ユーザー名は必須です",
            maxLength: 30,
          })}
          {...register("username")}
          error={!!errors.username}
          helperText={errors.username?.message}
          sx={{
            "& .MuiOutlinedInput-root": {
              fontSize: "16px", // スマホでのズーム防止
            },
          }}
        />
      </div>
      <div>
        <TextField
          label="パスワード"
          type="password"
          fullWidth
          margin="normal"
          {...register("password", { required: "パスワードは必須です" })}
          {...register("password")}
          error={!!errors.password}
          helperText={errors.password?.message}
          sx={{
            "& .MuiOutlinedInput-root": {
              fontSize: "16px", // スマホでのズーム防止
            },
          }}
        />
      </div>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        style={{ marginTop: 15 }}
        fullWidth
        sx={{
          fontSize: "16px",
          padding: "12px",
        }}
      >
        ログイン
      </Button>
    </form>
  );
};

export default LoginForm;
