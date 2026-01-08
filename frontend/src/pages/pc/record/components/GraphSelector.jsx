import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
// src/components/Charts/GraphSelector.jsx
import React from "react";

export default function GraphSelector({ value, onChange, options = [], sx }) {
  return (
    <Box sx={sx}>
      <FormControl size="small" fullWidth>
        <InputLabel id="graph-type-label">グラフ種類</InputLabel>
        <Select
          labelId="graph-type-label"
          label="グラフ種類"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          sx={{ backgroundColor: "white" }}
        >
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
