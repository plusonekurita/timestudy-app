import {
  Typography,
  Box,
  List,
  ListItem,
  IconButton,
  Stack,
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { useState } from "react";

import { formatJSTDateTime } from "../../../utils/dateFormatter";

const ITEMS_PER_PAGE = 5;

const RecentLogins = ({ users }) => {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);

  const handlePrev = () => setPage((prev) => Math.max(prev - 1, 0));
  const handleNext = () =>
    setPage((prev) => Math.min(prev + 1, totalPages - 1));

  const start = page * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const currentPageUsers = users.slice(start, end);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        最近ログインしたユーザー
      </Typography>
      <List>
        {currentPageUsers.map((user) => (
          <ListItem key={user.uid} sx={{ pl: 0 }}>
            ・{user.name}（{formatJSTDateTime(user.last_login)}）
          </ListItem>
        ))}
      </List>

      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <IconButton onClick={handlePrev} disabled={page === 0}>
          <ChevronLeftIcon />
        </IconButton>
        <IconButton onClick={handleNext} disabled={page === totalPages - 1}>
          <ChevronRightIcon />
        </IconButton>
      </Stack>
    </Box>
  );
};

export default RecentLogins;
