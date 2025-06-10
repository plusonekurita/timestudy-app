import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { showSnackbar } from "../../../store/slices/snackbarSlice";
import { apiFetch } from "../../../utils/api";
import RecentLogins from "./RecentLogins";

const DashboardPage = ({ setLoading }) => {
  const dispatch = useDispatch();
  const [summary, setSummary] = useState({
    userCount: 0,
    totalRecords: 0,
    recentUsers: [],
  });

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/admin/dashboard");
      setSummary(data);
    } catch (err) {
      dispatch(showSnackbar({ message: err.message, severity: "error" }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        ダッシュボード
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1">登録ユーザー数</Typography>
              <Typography variant="h6">{summary.userCount}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1">記録件数（累計）</Typography>
              <Typography variant="h6">{summary.totalRecords}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <RecentLogins users={summary.recentUsers} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
