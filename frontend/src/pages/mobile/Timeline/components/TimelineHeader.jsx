import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import IconButton from "@mui/material/IconButton";
import { Box } from "@mui/material";
import React from "react";

import DatePickerWithToday from "../../../../components/DatePickerWithToday";
import { colors } from "../../../../constants/theme";

const TimelineHeader = ({ selectedDate, setSelectedDate }) => {
  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        backgroundColor: "#fff",
        borderBottom: "1px solid #ddd",
        p: 1,
        paddingLeft: 3,
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <DatePickerWithToday
            value={selectedDate}
            onChange={(value) => setSelectedDate(value)}
          />
          <Box>
            <IconButton
              sx={{ color: colors.primary }}
              onClick={() => setSelectedDate((prev) => prev.subtract(1, "day"))}
            >
              <ArrowCircleLeftIcon />
            </IconButton>
            <IconButton
              sx={{ color: colors.primary }}
              onClick={() => setSelectedDate((prev) => prev.add(1, "day"))}
            >
              <ArrowCircleRightIcon />
            </IconButton>
          </Box>
        </Box>
      </LocalizationProvider>
    </Box>
  );
};

export default TimelineHeader;
