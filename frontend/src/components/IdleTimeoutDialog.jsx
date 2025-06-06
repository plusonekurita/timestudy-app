// src/components/IdleTimeoutDialog
import DialogContentText from "@mui/material/DialogContentText";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import React from "react";

const IdleTimeoutDialog = ({ isOpen, onConfirm }) => {
  return (
    <Dialog
      open={isOpen}
      aria-labelledby="idle-timeout-dialog-title"
      aria-describedby="idle-timeout-dialog-description"
      disableEscapeKeyDown // Escキーでのクローズを無効化
    >
      <DialogTitle id="idle-timeout-dialog-title">
        セッションタイムアウト
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="idle-timeout-dialog-description">
          一定時間操作がなかったため、自動的にログアウトします。
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onConfirm} autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IdleTimeoutDialog;
