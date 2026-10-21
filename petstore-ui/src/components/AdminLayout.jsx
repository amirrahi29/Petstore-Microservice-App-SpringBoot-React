import PetsIcon from "@mui/icons-material/Pets";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PetsOutlinedIcon from "@mui/icons-material/PetsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { Avatar, Box, Button, Typography } from "@mui/material";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearSession, getSession } from "../api";

const items = [
  { to: "/admin/categories", label: "Categories", icon: CategoryOutlinedIcon },
  { to: "/admin/products", label: "Pets", icon: PetsOutlinedIcon },
  { to: "/admin/orders", label: "Orders", icon: ReceiptLongOutlinedIcon },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const session = getSession("admin");
  const initial = (session.username || "A").slice(0, 1).toUpperCase();

  function logout() {
    clearSession("admin");
    navigate("/");
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f3f5f4" }}>
      <Box
        component="nav"
        sx={{
          width: 248,
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          bgcolor: "#10281c",
          color: "white",
          display: "flex",
          flexDirection: "column",
          px: 2,
          py: 2.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 1, mb: 3 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#1f7a4d", display: "grid", placeItems: "center" }}>
            <PetsIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, lineHeight: 1.1 }}>PetStore</Typography>
            <Typography variant="caption" sx={{ color: "#9dceb4" }}>Admin</Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.to}
                component={NavLink}
                to={item.to}
                startIcon={<Icon fontSize="small" />}
                sx={{
                  justifyContent: "flex-start",
                  color: "rgba(255,255,255,0.78)",
                  borderRadius: 2,
                  px: 1.5,
                  minHeight: 44,
                  textTransform: "none",
                  fontWeight: 600,
                  "& .MuiButton-startIcon": { mr: 1.25 },
                  "&.active": {
                    color: "white",
                    bgcolor: "rgba(255,255,255,0.12)",
                  },
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>
        <Box sx={{ mt: "auto", pt: 2, borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 1, mb: 1.5 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "#1f7a4d", fontSize: 14 }}>{initial}</Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{session.username}</Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>Administrator</Typography>
            </Box>
          </Box>
          <Button
            color="inherit"
            component={NavLink}
            to="/"
            startIcon={<StorefrontOutlinedIcon fontSize="small" />}
            sx={{ justifyContent: "flex-start", color: "rgba(255,255,255,0.78)", textTransform: "none", width: "100%", minHeight: 40, "& .MuiButton-startIcon": { mr: 1.25 } }}
          >
            View store
          </Button>
          <Button
            color="inherit"
            onClick={logout}
            startIcon={<LogoutOutlinedIcon fontSize="small" />}
            sx={{ justifyContent: "flex-start", color: "rgba(255,255,255,0.78)", textTransform: "none", width: "100%", minHeight: 40, "& .MuiButton-startIcon": { mr: 1.25 } }}
          >
            Log out
          </Button>
        </Box>
      </Box>
      <Box component="main" sx={{ flex: 1, minWidth: 0, px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 } }}>
        <Outlet />
      </Box>
    </Box>
  );
}
