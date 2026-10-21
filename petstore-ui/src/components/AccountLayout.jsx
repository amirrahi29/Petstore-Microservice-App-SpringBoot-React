import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { Box, Button, Typography } from "@mui/material";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearSession, getSession } from "../api";

const itemSx = {
  justifyContent: "flex-start",
  color: "text.primary",
  borderRadius: 2,
  px: 1.5,
  minHeight: 44,
  textTransform: "none",
  fontWeight: 600,
  "& .MuiButton-startIcon": { mr: 1.25 },
  "&.active": { bgcolor: "#e7f2eb", color: "primary.dark" },
};

export default function AccountLayout() {
  const navigate = useNavigate();
  const session = getSession("shop");

  function logout() {
    clearSession("shop");
    navigate("/");
  }

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "240px 1fr" }, gap: { xs: 3, md: 4 }, alignItems: "start" }}>
      <Box
        component="nav"
        sx={{
          position: { md: "sticky" },
          top: { md: 96 },
          p: 2,
          border: "1px solid #e7e1d6",
          borderRadius: "8px",
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="overline" color="text.secondary">My account</Typography>
        <Typography variant="h6" sx={{ mb: 2, lineHeight: 1.2 }}>{session.username}</Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Button component={NavLink} to="/account/orders" startIcon={<ReceiptLongOutlinedIcon fontSize="small" />} sx={itemSx}>
            Orders
          </Button>
          <Button onClick={logout} startIcon={<LogoutOutlinedIcon fontSize="small" />} sx={itemSx}>
            Log out
          </Button>
        </Box>
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
