import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
// src/components/Charts/GraphSelector.jsx
import React from "react";

import { GRAPH_OPTIONS } from "../GraphOptions";


export default function GraphSelector({ value, onChange, sx }) {
  return (
    <Box sx={sx}>
      <FormControl size="small" fullWidth>
        <InputLabel id="graph-type-label">グラフ種類</InputLabel>
        <Select
          labelId="graph-type-label"
          label="グラフ種類"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        >
          {GRAPH_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
