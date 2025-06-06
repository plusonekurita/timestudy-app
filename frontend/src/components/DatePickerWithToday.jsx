// src/components/DatePickerWithToday
import { DatePicker, PickersActionBar } from "@mui/x-date-pickers";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Button, TextField } from "@mui/material";
import { useState } from "react";
import React from "react";
import dayjs from "dayjs";

import { colors } from "../constants/theme";

const CustomActionBar = (props) => {
  return (
    <PickersActionBar
      {...props}
      actions={["today"]}
      components={{
        today: () => (
          <Button
            onClick={() => {
              props.onChange(dayjs()); // 今日をセット
              props.onAccept(); // ダイアログを閉じる
            }}
          >
            今日
          </Button>
        ),
      }}
    />
  );
};

const DatePickerWithToday = ({
  label,
  value,
  onChange,
  maxDate = dayjs(),
  minDate,
  inputBorder,
}) => {
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const onHandleChange = (value) => {
    onChange(value);
    setDatePickerOpen(false);
  };

  return (
    <DatePicker
      open={datePickerOpen}
      onOpen={() => setDatePickerOpen(true)}
      onClose={() => setDatePickerOpen(false)}
      label={label}
      value={value}
      onChange={(value) => onHandleChange(value)}
      format="MMM D (ddd)"
      closeOnSelect={true}
      maxDate={maxDate}
      minDate={minDate}
      slots={{
        openPickerIcon: CalendarMonthIcon,
        actionBar: CustomActionBar,
      }}
      slotProps={{
        textField: {
          variant: "standard",
          sx: {
            width: "130px",
            fontSize: "1.1rem",
            fontWeight: "bold",
            textAlign: "center",
            border: "none",
            "& .MuiSvgIcon-root": {
              color: colors.primary,
            },
          },
          InputProps: {
            disableUnderline: !inputBorder,
          },
          onClick: () => setDatePickerOpen(true),
        },
        toolbar: { hidden: true },
      }}
    />
  );
};

export default DatePickerWithToday;
