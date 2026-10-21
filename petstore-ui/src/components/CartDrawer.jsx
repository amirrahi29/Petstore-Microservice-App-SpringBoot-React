import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from "@mui/icons-material/Remove";
import { Alert, Box, Button, Drawer, IconButton, Typography } from "@mui/material";
import { getSession, money, orderApi } from "../api";
import { clearCart, removeItem, selectCartItems, selectCartTotal, setQuantity } from "../store/cartSlice";
import BusyButton from "./BusyButton";

export const OPEN_CART = "open-cart";

export function openCartDrawer() {
  window.dispatchEvent(new Event(OPEN_CART));
}

export default function CartDrawer({ open, onClose, onNeedLogin }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function checkout() {
    if (!getSession("shop").token) {
      onNeedLogin();
      return;
    }
    setBusy(true);
    setError("");
    try {
      await orderApi.post("/api/orders/checkout", {
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
      });
      dispatch(clearCart());
      onClose();
      navigate("/account/orders");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 420 }, display: "flex", flexDirection: "column" } }}
    >
      <Box sx={{ px: 2.5, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e7e1d6" }}>
        <Typography variant="h6">Cart</Typography>
        <IconButton aria-label="Close cart" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ flex: 1, overflow: "auto", px: 2.5, py: 2, display: "grid", alignContent: "start", gap: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        {items.length === 0 && (
          <Typography color="text.secondary">Your cart is empty.</Typography>
        )}
        {items.map((item) => (
          <Box key={item.id} sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            {item.imageUrl ? (
              <Box component="img" src={item.imageUrl} alt="" sx={{ width: 64, height: 64, objectFit: "cover", borderRadius: 1.5, flexShrink: 0 }} />
            ) : (
              <Box sx={{ width: 64, height: 64, borderRadius: 1.5, bgcolor: "#e7f2eb", flexShrink: 0 }} />
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography fontWeight={700} noWrap>{item.name}</Typography>
              <Typography variant="body2" color="text.secondary">{money(item.price)}</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                <IconButton size="small" disabled={busy} aria-label="Decrease quantity" onClick={() => dispatch(setQuantity({ id: item.id, quantity: item.quantity - 1 }))}>
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Typography sx={{ minWidth: 20, textAlign: "center", fontWeight: 700 }}>{item.quantity}</Typography>
                <IconButton size="small" disabled={busy} aria-label="Increase quantity" onClick={() => dispatch(setQuantity({ id: item.id, quantity: item.quantity + 1 }))}>
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography fontWeight={700}>{money(Number(item.price) * item.quantity)}</Typography>
              <Button size="small" color="secondary" disabled={busy} onClick={() => dispatch(removeItem(item.id))}>Remove</Button>
            </Box>
          </Box>
        ))}
      </Box>
      <Box sx={{ px: 2.5, py: 2, borderTop: "1px solid #e7e1d6" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 1.5 }}>
          <Typography color="text.secondary">Total</Typography>
          <Typography variant="h6">{money(total)}</Typography>
        </Box>
        <BusyButton variant="contained" fullWidth size="large" onClick={checkout} loading={busy} disabled={items.length === 0}>
          {busy ? "Placing order…" : "Checkout"}
        </BusyButton>
      </Box>
    </Drawer>
  );
}
