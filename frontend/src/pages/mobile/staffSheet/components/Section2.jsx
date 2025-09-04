import { Box, Typography, RadioGroup, FormControlLabel, Radio, Button, Divider, } from "@mui/material";
import React from "react";

import { colors } from "../../../../constants/theme";


const stressItems = [
  "怒りっぽくなる",
  "悲しい気分だ",
  "なんとなく心配だ",
  "怒りを感じる",
  "泣きたい気分だ",
  "感情を抑えられない",
  "くやしい思いがする",
  "不愉快だ",
  "気持ちが沈んでいる",
  "いらいらする",
  "いろいろなことに自信がない",
  "なにもかも嫌だと思う",
  "よくないことを考える",
  "話や行動がまとまらない",
  "なぐさめてほしい",
  "根気がない",
  "ひとりでいたい気分だ",
  "何かに集中できない",
];

const scaleOptionsLabeled = [
  { value: "0", label: "全くちがう" },
  { value: "1", label: "いくらかそうだ" },
  { value: "2", label: "まあそうだ" },
  { value: "3", label: "その通りだ" },
];

const Section2 = ({ onNext, onBack }) => {
  return (
    <Box sx={{ pb: 5 }}>
      <Typography variant="h6" fontWeight="bold" align="left" mb={2}>
        2. 心理的ストレス反応（SRS-18）
      </Typography>
      <Typography variant="body2" align="left" mb={4} color={colors.text}>
        ※この設問では、普段の心理的な状態についてお伺いします。あてはまるもの1つを選択してください。
      </Typography>

      {stressItems.map((item, idx) => (
        <Box key={idx} sx={{ mb: 1 }}>
          <Typography
            variant="body1"
            align="left"
            sx={{ mb: 1, fontWeight: "medium" }}
          >
            {idx + 1}. {item}
          </Typography>
          <RadioGroup name={`stress-${idx}`} sx={{ pl: 2 }}>
            {scaleOptionsLabeled.map((opt) => (
              <FormControlLabel
                key={opt.value}
                value={opt.value}
                control={<Radio />}
                labelPlacement="start"
                label={`（${opt.value}）${opt.label}`}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              />
            ))}
          </RadioGroup>
          <Divider />
        </Box>
      ))}

      {/* 次へボタン */}
      <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
        <Button variant="contained" onClick={onBack}>
          前へ
        </Button>
        <Button variant="contained" onClick={onNext}>
          次へ
        </Button>
      </Box>
    </Box>
  );
};

export default Section2;
