import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Grid,
  Button,
  Select,
  MenuItem,
  InputLabel,
  TextField,
} from "@mui/material";
import React, { useState } from "react";

const years = Array.from({ length: 100 }, (_, i) => i); // 0〜40年
const months = Array.from({ length: 12 }, (_, i) => i); // 0〜11ヶ月

const Section1 = ({ onNext }) => {
  const [role, setRole] = useState(""); // 選択された役割
  const [otherRoleText, setOtherRoleText] = useState(""); // その他の入力内容

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" align="left" mb={3}>
        1. 職員情報
      </Typography>

      {/* 性別 */}
      <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
        <FormLabel align="left">性別</FormLabel>
        <RadioGroup row name="gender">
          <FormControlLabel value="male" control={<Radio />} label="1:男" />
          <FormControlLabel value="female" control={<Radio />} label="2:女" />
        </RadioGroup>
      </FormControl>

      {/* 年齢層 */}
      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <FormLabel align="left">年齢階級</FormLabel>
        <RadioGroup row name="age">
          {[
            "10歳代",
            "20歳代",
            "30歳代",
            "40歳代",
            "50歳代",
            "60歳代",
            "70歳代～",
          ].map((age) => (
            <FormControlLabel
              key={age}
              value={age}
              control={<Radio />}
              label={age}
            />
          ))}
        </RadioGroup>
      </FormControl>

      {/* 役割 */}
      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <FormLabel align="left">役割</FormLabel>
        <RadioGroup
          row
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <FormControlLabel
            value="manager"
            control={<Radio />}
            label="1:管理者"
          />
          <FormControlLabel
            value="leader"
            control={<Radio />}
            label="2:管理者リーダー"
          />
          <FormControlLabel
            value="worker"
            control={<Radio />}
            label="3:一般職員"
          />
          <FormControlLabel
            value="other"
            control={<Radio />}
            label="4:その他"
          />
        </RadioGroup>

        {/* その他を選んだ場合のみ表示 */}
        {role === "other" && (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="その他の役割を入力"
              value={otherRoleText}
              onChange={(e) => setOtherRoleText(e.target.value)}
              fullWidth
            />
          </Box>
        )}
      </FormControl>

      {/* 勤続年数 */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" align="left" sx={{ mb: 1 }}>
          現在の職種での経験年数
        </Typography>
        <Grid container spacing={2}>
          <Grid size={6}>
            <FormControl fullWidth>
              <InputLabel>年</InputLabel>
              <Select defaultValue="">
                {years.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y} 年
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={6}>
            <FormControl fullWidth>
              <InputLabel>月</InputLabel>
              <Select defaultValue="">
                {months.map((m) => (
                  <MenuItem key={m} value={m}>
                    {m} ヶ月
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* 次へボタン */}
      <Box sx={{ mt: 4, textAlign: "right" }}>
        <Button variant="contained" onClick={onNext}>
          次へ
        </Button>
      </Box>
    </Box>
  );
};

export default Section1;
