import { Box, Typography, Divider } from "@mui/material";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion"; // ← import修正

import { getSectionLabelFromPath } from "../../utils/getSectionLabelFromPath";

const MotionBox = motion(Box);

const PageSectionLayout = ({ children }) => {
  const location = useLocation();
  const title = getSectionLabelFromPath(location.pathname);

  return (
    <Box display="flex" flexDirection="column" className="content">
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Typography variant="h5" sx={{ textAlign: "start" }} gutterBottom>
          {title}
        </Typography>
        <Divider sx={{ mb: 2.5 }} />
        {children}
      </MotionBox>
    </Box>
  );
};

export default PageSectionLayout;
