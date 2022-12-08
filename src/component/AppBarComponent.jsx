import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { appBarColor } from "../values/Colors";
import { title } from "../values/Constant";

const AppBarComponent = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        style={{
          backgroundColor: appBarColor,
        }}
      >
        <Toolbar>
          {/* <IconButton size="large" edge="start" aria-label="menu" sx={{ mr: 2, color: "black" }}>
            <MenuIcon />
          </IconButton> */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: "black" }}>
            {title}
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default AppBarComponent;
