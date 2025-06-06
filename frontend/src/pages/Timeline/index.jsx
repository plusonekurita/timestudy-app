// TimelineView.jsx
import React, { useRef, useState } from "react";
import { Box } from "@mui/material";
import dayjs from "dayjs";

import { useTimelineRecords } from "../../hooks/useTimelineRecords";
import { useNowIndicator } from "./hooks/useNowIndicator";
import TimelineHeader from "./components/TimelineHeader";
import TimelineItems from "./components/TimelineItems";
import HourLabels from "./components/HourLabels";
import NowLine from "./components/NowLine";

const TimelineView = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [hasScrolledToNow, setHasScrolledToNow] = useState(false);
  const timelineRef = useRef(null);

  const records = useTimelineRecords(selectedDate);
  const { grouped, hourHeights, nowTop } = useNowIndicator(records);

  return (
    <Box>
      <TimelineHeader
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
      <Box
        ref={timelineRef}
        sx={{
          display: "flex",
          position: "relative",
          overflowY: "auto",
          height: "100vh",
          backgroundColor: "#f8f8f8",
        }}
      >
        {nowTop !== null && (
          <NowLine
            nowTop={nowTop}
            hourHeights={hourHeights}
            hasScrolledToNow={hasScrolledToNow}
            refObj={timelineRef}
            setHasScrolledToNow={setHasScrolledToNow}
          />
        )}
        <HourLabels grouped={grouped} />
        <TimelineItems grouped={grouped} />
      </Box>
    </Box>
  );
};

export default TimelineView;
