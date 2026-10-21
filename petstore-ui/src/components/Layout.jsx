import { useEffect, useState } from "react";
import PetsIcon from "@mui/icons-material/Pets";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { AppBar, Badge, Box, Button, Toolbar, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { Link as RouterLink, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { getSession } from "../api";
import { selectCartCount } from "../store/cartSlice";
import CartDrawer, { OPEN_CART } from "./CartDrawer";
import LoginDialog from "./LoginDialog";

const navSx = {
  "&.active": { bgcolor: "#e7f2eb", color: "primary.dark" },
};

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = useSelector(selectCartCount);
  const adminPage = location.pathname.startsWith("/admin");
  const [session, setSession] = useState(getSession("shop"));
  const [loginOpen, setLoginOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const refresh = () => setSession(getSession("shop"));
    window.addEventListener("auth-changed", refresh);
    return () => window.removeEventListener("auth-changed", refresh);
  }, []);

  useEffect(() => {
    const open = () => setCartOpen(true);
    window.addEventListener(OPEN_CART, open);
    return () => window.removeEventListener(OPEN_CART, open);
  }, []);

  useEffect(() => {
    if (!location.state?.cart) {
      return;
    }
    setCartOpen(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    const mode = location.state?.register ? "register" : location.state?.login ? "login" : "";
    if (!mode) {
      return;
    }
    setAuthMode(mode);
    setLoginOpen(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  function openAuth(mode) {
    setAuthMode(mode);
    setLoginOpen(true);
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "rgba(255,252,248,0.9)",
          color: "text.primary",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid #e7e1d6",
        }}
      >
        <Box sx={{ px: { xs: 2, md: 4 } }}>
          <Toolbar disableGutters sx={{ minHeight: 76, py: 1.5, gap: 2, alignItems: "center" }}>
            <Box
              component={RouterLink}
              to="/"
              sx={{ display: "flex", alignItems: "center", gap: 1.25, color: "inherit", textDecoration: "none", mr: "auto" }}
            >
              <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "primary.main", color: "white", display: "grid", placeItems: "center" }}>
                <PetsIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, lineHeight: 1.1, letterSpacing: -0.3 }}>PetStore</Typography>
                <Typography variant="caption" color="text.secondary">Companions for sale</Typography>
              </Box>
            </Box>
            {session.token ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <Button color="inherit" onClick={() => setCartOpen(true)} startIcon={
                  <Badge color="secondary" badgeContent={cartCount || null} sx={{ "& .MuiBadge-badge": { top: 2, right: -2 } }}>
                    <ShoppingBagOutlinedIcon fontSize="small" />
                  </Badge>
                }>
                  Cart
                </Button>
                <Button
                  color="inherit"
                  component={NavLink}
                  to="/account/orders"
                  sx={{ ...navSx, textAlign: "left" }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.1 }}>{session.username}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.2 }}>My account</Typography>
                  </Box>
                </Button>
              </Box>
            ) : (
              !adminPage && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <Button color="inherit" onClick={() => openAuth("register")}>Register</Button>
                  <Button variant="contained" onClick={() => openAuth("login")}>Login</Button>
                </Box>
              )
            )}
          </Toolbar>
        </Box>
      </AppBar>
      <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 }, flex: 1, width: "100%" }}>
        <Outlet />
      </Box>
      <Box component="footer" sx={{ borderTop: "1px solid #e7e1d6", bgcolor: "#fffcf8", py: 2.5 }}>
        <Box sx={{ px: { xs: 2, md: 4 }, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PetsIcon sx={{ fontSize: 18, color: "primary.main" }} />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>PetStore</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">Pets with a photo, a price, and a home waiting.</Typography>
        </Box>
      </Box>
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onNeedLogin={() => openAuth("login")}
      />
      <LoginDialog
        key={loginOpen ? authMode : "closed"}
        open={loginOpen}
        initialMode={authMode}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => setLoginOpen(false)}
      />
    </Box>
  );
}
