import "./TopMenuDesktop.scss";

import { Box, Typography, Grid, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import React from "react";

import { managementMenuItems } from "../../constants/drawerMenuItem";
import { DashboardCard } from "./DashboardCard/DashboardCard";
import { getValue } from "../../utils/localStorageUtils";


const TopMenuDesktop = () => {
  const navigate = useNavigate();

  const user = getValue("user");

  const renderContent = () => {
    const menuItems = managementMenuItems();

    return (
      <Box display="flex" flexDirection="column" className="content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {menuItems.map((section) => {
            if (section.isAdmin && !user.isAdmin) return;
            return (
              <Box key={section.id} sx={{ pb: 3 }}>
                {/* 見出し */}
                <Typography
                  variant="h5"
                  className="content__header"
                  gutterBottom
                >
                  {section.label}
                </Typography>

                <Divider sx={{ mb: 2.5 }} />

                {/* グリッドでDashboardCardを配置 */}
                <Grid container spacing={4} className="content__button">
                  {section.children?.map((child) => (
                    <Grid size={3} key={child.id} className="icon-button">
                      <DashboardCard
                        title={child.label}
                        icon={child.icon}
                        onClick={() => navigate(child.path)}
                        classname="card"
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            );
          })}
        </motion.div>
      </Box>
    );
  };

  return <div className="p-8">{renderContent()}</div>;
};

export default TopMenuDesktop;
