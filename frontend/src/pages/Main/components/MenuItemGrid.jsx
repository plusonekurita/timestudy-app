import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import React from "react";

const MenuItemGrid = ({ items, activeItem, onItemClick, categoryType }) => {
  return (
    <Box sx={{ paddingRight: 1.2, paddingLeft: 1.2 }}>
      <Grid container spacing={1.2} justifyContent="flex-start">
        {items.map((item) => {
          const isActive = item.name === activeItem?.name;

          let calculatedOpacity = 1; // デフォルトは不透明
          if (activeItem) {
            // 何かアイテムが選択されている場合
            if (activeItem.type === categoryType) {
              // 選択中のアイテムが、このグリッドが表示しているカテゴリと同じ場合
              if (!isActive) {
                // このアイテム自身が選択されていなければ透過
                calculatedOpacity = 0.7; // 透過度はお好みで調整してください
              }
            }
            // 選択中のアイテムのカテゴリが、このグリッドのカテゴリと異なる場合は、
            // このグリッド内のアイテムはすべて不透明 (calculatedOpacity = 1 のまま)
          }

          const paperSx = {
            position: "relative", // 疑似要素やグラデーション配置のため
            overflow: "hidden", // はみ出し防止
            width: "100%",
            color: isActive ? "white" : "", // 文字色
            borderRadius: 2,
            opacity: calculatedOpacity, // アクティブ状態の透明度
            // ★アニメーション
            backgroundSize: "200% 100%", // グラデーションのサイズ
            backgroundPosition: isActive ? "0 0" : "100% 0", // アクティブ状態に応じて位置を変更
            backgroundImage: `linear-gradient(to right, ${
              item.color || "transparent"
            } 50%, transparent 50%)`, // 右半分が透明なグラデーション
            transition:
              "background-position 0.4s ease-in-out, color 0.4s ease-in-out, opacity 0.2s ease-in-out", // 背景位置と文字色の変化をアニメーション
          };

          return (
            // 2列表示
            <Grid item size={items.length === 1 ? 12 : 6} key={item.name}>
              <Paper
                elevation={2} // 陰の強さ
                onClick={() => onItemClick(item)}
                sx={paperSx}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row", // 横並び
                    alignItems: "center", // 垂直方向中央揃え
                    textAlign: "left", // 左揃えに
                    textDecoration: "none",
                  }}
                >
                  {/* アイコン表示部分 */}
                  <Box
                    sx={{
                      mr: 1,
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: item.color, // アイコン背景色例
                      borderTopLeftRadius: 6,
                      borderBottomLeftRadius: 6,
                      padding: "12px 5px 12px 5px",
                      color: "white", // アイコン色例
                      "& img": {
                        width: "35px",
                        height: "35px",
                      },
                      "& svg": {
                        width: "35px",
                        height: "35px",
                      },
                    }}
                  >
                    {item.icon}
                  </Box>
                  {/* ラベル表示部分 */}
                  <Typography
                    variant="body2" // 文字サイズ
                    sx={{
                      flexGrow: 1,
                      paddingRight: 0.5,
                    }} // 残りのスペースを埋める
                  >
                    {item.label}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default MenuItemGrid;
