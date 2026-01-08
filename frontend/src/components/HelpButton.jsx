import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { colors } from "../constants/theme";

const HelpButton = () => {
    const handleClick = () => {
        // パスの先頭に / を付けてルートから参照するように明示
        window.open("/manual/manual_pc.pdf", "_blank");
    };

    return (
        <Tooltip title="マニュアルを開く">
            <IconButton
                onClick={handleClick}
                sx={{
                    position: "absolute",
                    top: "18px",
                    right: "35px",
                    zIndex: 1200, // DrawerやHeaderよりは下だがコンテンツよりは上
                    color: colors.primary || "#1976d2", // テーマカラーに合わせる
                }}
            >
                <HelpOutlineIcon />
            </IconButton>
        </Tooltip>
    );
};

export default HelpButton;
