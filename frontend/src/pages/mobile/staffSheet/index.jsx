import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import { Box, MobileStepper, Button, Typography } from "@mui/material";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

import Section3 from "./components/Section3";
import Section2 from "./components/Section2";
import Section1 from "./components/Section1";


const StaffSheet = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () =>
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const handleFinish = () => navigate("/sheetList/complete");

  const steps = [
    { label: "職員情報", component: <Section1 onNext={handleNext} /> },
    {
      label: "心理的ストレス反応",
      component: <Section2 onNext={handleNext} onBack={handleBack} />,
    },
    {
      label: "テクノロジーの導入",
      component: <Section3 onFinish={handleFinish} onBack={handleBack} />,
    },
  ];

  return (
    <Box sx={{ px: 2 }}>
      {/* 上部進捗テキスト */}
      <Typography
        variant="body2"
        align="center"
        color="text.secondary"
        sx={{ mt: 1 }}
      >
        {activeStep + 1} / {steps.length}
      </Typography>

      {/* 上部進捗バー */}
      <MobileStepper
        variant="progress"
        steps={steps.length}
        position="static"
        activeStep={activeStep}
        sx={{ mb: 2, pt: 0 }}
        nextButton={
          activeStep === steps.length - 1 ? (
            <Button size="small" onClick={handleFinish}>
              完了
              <KeyboardArrowRight />
            </Button>
          ) : (
            <Button size="small" onClick={handleNext}>
              次へ
              <KeyboardArrowRight />
            </Button>
          )
        }
        backButton={
          <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
            <KeyboardArrowLeft />
            前へ
          </Button>
        }
      />

      {/* セクション表示 */}
      <Box>{steps[activeStep].component}</Box>
    </Box>
  );
};

export default StaffSheet;
