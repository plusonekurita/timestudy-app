import "./TopMenuDesktop.scss";

import { Box, Typography, Grid, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import React from "react";
import useMediaQuery from "@mui/material/useMediaQuery";

import { managementMenuItems } from "../../constants/drawerMenuItem";
import { DashboardCard } from "./DashboardCard/DashboardCard";
import { getValue } from "../../utils/localStorageUtils";


const TopMenuDesktop = () => {
  const navigate = useNavigate();
  const isNarrow = useMediaQuery("(max-width:790px)");

  const user = getValue("user");

  const renderContent = () => {
    const menuItems = managementMenuItems().filter(
      (section) => !section.isAdmin || user.isAdmin
    );

    return (
      <Box className="content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isNarrow ? (
            // 790px以下: 縦並び（以前のレイアウト）
            <Box display="flex" flexDirection="column">
              {menuItems.map((section) => (
                <Box key={section.id} sx={{ pb: 3 }}>
                  {/* 見出し */}
                  <Typography
                    variant="h5"
                    className="content__header"
                    gutterBottom
                    sx={{ color: '#000000' }}
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
              ))}
            </Box>
          ) : (
            // 790px以上: 2カラムレイアウト
            <>
              {(() => {
                // セクションを2列に分割
                const leftColumn = menuItems.filter((_, index) => index % 2 === 0);
                const rightColumn = menuItems.filter((_, index) => index % 2 === 1);

                return (
                  <Grid container spacing={4}>
                    {/* 左カラム */}
                    <Grid size={6}>
                      {leftColumn.map((section) => (
                        <Box key={section.id} sx={{ pb: 3 }}>
                          {/* 見出し */}
                          <Typography
                            variant="h5"
                            className="content__header"
                            gutterBottom
                            sx={{ color: '#000000' }}
                          >
                            {section.label}
                          </Typography>

                          <Divider sx={{ mb: 2.5 }} />

                          {/* グリッドでDashboardCardを配置 */}
                          <Grid container spacing={3} className="content__button">
                            {section.children?.map((child) => (
                              <Grid size={6} key={child.id} className="icon-button">
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
                      ))}
                    </Grid>

                    {/* 右カラム */}
                    <Grid size={6}>
                      {rightColumn.map((section) => (
                        <Box key={section.id} sx={{ pb: 3 }}>
                          {/* 見出し */}
                          <Typography
                            variant="h5"
                            className="content__header"
                            gutterBottom
                            sx={{ color: '#000000' }}
                          >
                            {section.label}
                          </Typography>

                          <Divider sx={{ mb: 2.5 }} />

                          {/* グリッドでDashboardCardを配置 */}
                          <Grid container spacing={3} className="content__button">
                            {section.children?.map((child) => (
                              <Grid size={6} key={child.id} className="icon-button">
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
                      ))}
                    </Grid>
                  </Grid>
                );
              })()}
            </>
          )}
        </motion.div>
      </Box>
    );
  };

  return (
    <div className="p-8" style={{ color: '#000000' }}>
      {renderContent()}
    </div>
  );
};

export default TopMenuDesktop;
