import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";

const MainMenuTabs = ({ categories, selectedTab, onChange }) => {
  return (
    <Box sx={{ mb: 2, width: "100%", maxWidth: 600 }}>
      <Grid
        container
        spacing={1} // ボタン間のスペース
        justifyContent="center" // 中央揃え
      >
        {categories.map((category, index) => (
          <Grid key={index}>
            <Button
              fullWidth // 幅いっぱいに広げる
              variant={selectedTab === index ? "contained" : "outlined"} // 選択中かどうかでスタイルを変更
              onClick={(event) => onChange(event, index)} // クリック時に onChange を呼び出す
              sx={{
                textTransform: "none", // ラベルの大文字変換を無効化
                fontWeight: selectedTab === index ? "bold" : "medium", // 選択中の文字を太く
                borderRadius: 8,
                ...(selectedTab === index
                  ? {
                      // 選択中（強調）
                      backgroundColor: category.color || "primary.main",
                      color: "white",
                    }
                  : {
                      // 非選択中
                      borderColor: category.color || "primary.main",
                      color: category.color || "primary.main",
                    }),
              }}
            >
              {category.label}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MainMenuTabs;
