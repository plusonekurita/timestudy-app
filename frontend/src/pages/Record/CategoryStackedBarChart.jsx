import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
// src/components/CategoryStackedBarChart.jsx
import React from "react";

import { colors } from "../../constants/theme";

const CategoryStackedBarChart = ({ chartData }) => {
  return (
    <ResponsiveContainer width="100%" height={70}>
      <BarChart
        layout="vertical"
        data={chartData}
        margin={{ top: 0, right: 10, left: 10, bottom: 20 }}
      >
        <XAxis type="number" domain={[0, "dataMax"]} hide />
        <YAxis dataKey="name" type="category" hide />
        <Bar dataKey="directCare" stackId="a" fill={colors.directCare} />
        <Bar dataKey="indirectWork" stackId="a" fill={colors.indirectWork} />
        <Bar dataKey="break" stackId="a" fill={colors.break} />
        <Bar dataKey="other" stackId="a" fill={colors.other} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CategoryStackedBarChart;
