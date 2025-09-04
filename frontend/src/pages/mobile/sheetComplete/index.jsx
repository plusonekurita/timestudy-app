import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import React, { useEffect } from "react";

import { colors } from "../../../constants/theme";


const SectionCompletePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/sheetList"); // ✅ 自動で一覧ページに戻る
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        調査票の入力を完了しました
      </Typography>
      <Typography variant="body2" color={colors.text}>
        ※3秒後に一覧ページに戻ります
      </Typography>
    </Box>
  );
};

export default SectionCompletePage;
