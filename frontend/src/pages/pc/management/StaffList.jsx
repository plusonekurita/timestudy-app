import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  TablePagination,
  Stack,
  Tooltip,
  LinearProgress,
  Alert,
  Grid,
  TableSortLabel,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { visuallyHidden } from "@mui/utils";
import { useDispatch } from "react-redux";

import { showSnackbar } from "../../../store/slices/snackbarSlice";
import { getValue } from "../../../utils/localStorageUtils";
import { apiFetch } from "../../../utils/api";

const statusChip = (is_active) => {
  if (is_active) return <Chip size="small" label="稼働中" color="success" />;
  return <Chip size="small" label="停止" color="default" />;
};

// ---------- comparator 群 ----------
function descendingComparator(a, b, orderBy) {
  const getVal = (row) => {
    if (orderBy === "status") return row.is_active ? 1 : 0;
    if (orderBy === "admin") return row.is_admin ? 1 : 0;
    return row[orderBy] ?? "";
  };
  const va = getVal(a);
  const vb = getVal(b);
  const collator = new Intl.Collator("ja", {
    numeric: true,
    sensitivity: "base",
  });
  const cmp =
    typeof va === "number" && typeof vb === "number"
      ? vb - va
      : collator.compare(String(vb), String(va));
  if (cmp < 0) return -1;
  if (cmp > 0) return 1;
  return 0;
}
function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// ---------- ヘッダ ----------
const headCells = [
  { id: "name", label: "氏名" },
  { id: "code", label: "職員コード", width: 100 },
  { id: "title", label: "役職" },
  { id: "status", label: "ステータス", width: 98 },
  { id: "admin", label: "管理者", width: 70 },
];

function EnhancedTableHead({ order, orderBy, onRequestSort }) {
  const createSortHandler = (property) => (event) =>
    onRequestSort(event, property);
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ width: headCell.width }}
            align={headCell.id === "admin" ? "right" : "left"}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              hideSortIcon={false}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id && (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              )}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell align="right" sx={{ width: 70 }}>
          操作
        </TableCell>
      </TableRow>
    </TableHead>
  );
}

// =================== 本体 ===================
const StaffList = () => {
  const dispatch = useDispatch();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // 削除UI用
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetRow, setTargetRow] = useState(null);
  const [toast, setToast] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  // フィルタ
  const [q, setQ] = useState("");
  const [dep, setDep] = useState("all");
  const [st, setSt] = useState("all");

  // ページネーション
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ソート
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");

  const user = getValue("user");
  const office = user?.office;

  // 初期取得
  useEffect(() => {
    if (!office) return;
    let abort = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await apiFetch(`/offices/${office?.id}/staffs`);
        const mapped = Array.isArray(data)
          ? data.map((d) => ({
              id: String(d.id),
              name: d.name || "",
              code: d.staff_code || "",
              title: d.job || "",
              email: "",
              is_active: !!d.is_active,
              is_admin: !!d.is_admin,
            }))
          : [];
        if (!abort) setRows(mapped);
      } catch (e) {
        if (e?.status === 404) {
          if (!abort) setRows([]);
        } else {
          if (!abort) setErr(e?.message || "データ取得に失敗しました");
        }
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => {
      abort = true;
    };
  }, [office?.id]);

  // フィルタ
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const hitQ =
        !q || r.name.includes(q) || r.code.includes(q) || r.title.includes(q);
      const hitDep = dep === "all";
      const hitSt =
        st === "all" ||
        (st === "active" && r.is_active) ||
        (st === "inactive" && !r.is_active);
      return hitQ && hitDep && hitSt;
    });
  }, [rows, q, dep, st]);

  // 可視行
  const visibleRows = useMemo(() => {
    return [...filtered]
      .sort(getComparator(order, orderBy))
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filtered, order, orderBy, page, rowsPerPage]);

  const handleRequestSort = (_event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };
  const handleChangePage = (_e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const onEdit = (row) => {
    console.log("edit", row);
  };

  //-------- 削除実装（フロント）--------
  const onDeleteClick = (row) => {
    setTargetRow(row);
    setConfirmOpen(true);
  };

  // 既にある onDelete をこうしておく
  // onDelete は引数なしでOK
  const onDelete = async () => {
    if (!targetRow || !office?.id) return;

    try {
      await apiFetch(`/offices/${office.id}/staffs`, {
        method: "DELETE",
        body: {
          id: Number(targetRow.id),
          staff_code: targetRow.code,
        },
      });

      // 成功時: stateから削除
      setRows((prev) =>
        prev.filter(
          (r) =>
            !(
              String(r.id) === String(targetRow.id) && r.code === targetRow.code
            )
        )
      );

      dispatch(showSnackbar({ message: "削除しました", severity: "success" }));
    } catch (e) {
      dispatch(
        showSnackbar({
          message: e?.message || "削除に失敗しました",
          severity: "error",
        })
      );
    } finally {
      setConfirmOpen(false);
      setTargetRow(null);
    }
  };

  // 自分の行かどうか
  const isSelf = (row) => {
    if (!user) return false;
    if (user.id && String(row.id) === String(user.id)) return true;
    if (user.staff_code && row.code && row.code === user.staff_code)
      return true;
    if (user.name && row.name && row.name === user.name) return true;
    if (user.userName && row.name && row.name === user.userName) return true;
    return false;
  };

  return (
    <Paper elevation={1}>
      {loading && <LinearProgress />}

      {err && (
        <Box sx={{ px: 2, pt: 2 }}>
          <Alert severity="error">{err}</Alert>
        </Box>
      )}

      {/* フィルタ行 */}
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="検索（氏名・コード・役職）"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="ステータス"
              value={st}
              onChange={(e) => {
                setSt(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="all">すべて</MenuItem>
              <MenuItem value="active">稼働中</MenuItem>
              <MenuItem value="inactive">停止</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {/* テーブル */}
      <TableContainer>
        <Table size="small" stickyHeader>
          <EnhancedTableHead
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
          />
          <TableBody>
            {visibleRows.map((row) => (
              <TableRow hover key={`${row.id}-${row.code}`}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.code}</TableCell>
                <TableCell>{row.title}</TableCell>
                <TableCell>{statusChip(row.is_active)}</TableCell>
                <TableCell align="right">
                  {row.is_admin ? <Chip size="small" label="管理者" /> : "-"}
                </TableCell>
                <TableCell align="right">
                  {isSelf(row) ? (
                    "" // 自分の行は編集/削除を非表示
                  ) : (
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <Tooltip title="編集">
                        <IconButton
                          size="small"
                          onClick={() => onEdit?.(row)}
                          aria-label="edit"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="削除">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDeleteClick(row)}
                          aria-label="delete"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {visibleRows.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box
                    sx={{ py: 6, textAlign: "center", color: "text.secondary" }}
                  >
                    データがありません
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        rowsPerPageOptions={[10, 25, 50]}
        count={filtered.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* 削除確認ダイアログ */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>削除の確認</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {targetRow
              ? `「${targetRow.name}（コード: ${targetRow.code}）」を削除します。よろしいですか？`
              : "このレコードを削除します。よろしいですか？"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>キャンセル</Button>
          <Button color="error" onClick={onDelete} autoFocus>
            削除する
          </Button>
        </DialogActions>
      </Dialog>

      {/* トースト */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        message={toast.msg}
      />
    </Paper>
  );
};

export default StaffList;
