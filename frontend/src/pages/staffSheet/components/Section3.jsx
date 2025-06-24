import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Divider,
} from "@mui/material";
import React from "react";

import { colors } from "../../../constants/theme";

const techImpactItems = [
  "テクノロジーの導入により職員の働きやすさが向上した",
  "テクノロジーの導入により業務の効率が上がった",
];

const techValues = ["-3", "-2", "-1", "0", "+1", "+2", "+3"];

const Section3 = ({ onFinish, onBack }) => {
  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" align="left" mb={2}>
        3. テクノロジーの導入による変化
      </Typography>
      <Typography variant="body2" align="left" mb={4} color={colors.text}>
        ※この設問では、テクノロジーの導入等の前後のモチベーションの変化についてお伺いします。
      </Typography>

      {techImpactItems.map((item, idx) => (
        <Box key={idx} sx={{ mb: 4 }}>
          <Typography
            variant="body1"
            fontWeight="medium"
            align="left"
            sx={{ mb: 1 }}
          >
            {idx + 1}. {item}
          </Typography>

          {/* 上部ラベル */}
          <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="caption">← 減少したと感じる</Typography>
            <Typography variant="caption">増加したと感じる →</Typography>
          </Box>

          <RadioGroup
            row
            name={`tech-${idx}`}
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            {techValues.map((val) => (
              <FormControlLabel
                key={val}
                value={val}
                control={<Radio />}
                label={val}
                labelPlacement="top"
                sx={{
                  flex: 1,
                  mx: 0.5,
                  textAlign: "center",
                }}
              />
            ))}
          </RadioGroup>
          <Divider sx={{ mt: 2 }} />
        </Box>
      ))}

      <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
        <Button variant="contained" onClick={onBack}>
          前へ
        </Button>
        <Button variant="contained" onClick={onFinish}>
          完了
        </Button>
      </Box>
    </Box>
  );
};

export default Section3;
