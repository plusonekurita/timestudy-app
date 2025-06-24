import { Grid, Card, CardActionArea, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import React from "react";

import { menuItems } from "../../constants/menu";

const TopMenu = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        メインメニュー
      </Typography>
      <Grid container spacing={3} padding={4}>
        {menuItems.map((item, index) => (
          <Grid size={6} key={index}>
            <Box position="relative" width="100%" paddingTop="100%">
              <Card
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  borderRadius: "20px",
                  border: "3px solid rgb(75, 75, 75)", // 枠線で輪郭をはっきり
                  boxShadow: 3,
                }}
              >
                <CardActionArea
                  sx={{ height: "100%", width: "100%", position: "relative" }}
                  onClick={() => navigate(item.path)}
                >
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    height="100%"
                  >
                    <Box sx={{ width: 60, height: 60, mb: 2 }}>{item.icon}</Box>
                    <Typography variant="body2">{item.label}</Typography>
                  </Box>
                </CardActionArea>
              </Card>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TopMenu;
