import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Alert, Box, Button, IconButton, Paper, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { money, orderApi } from "../api";
import { clearCart, removeItem, selectCartItems, selectCartTotal, setQuantity } from "../store/cartSlice";
import BusyButton from "../components/BusyButton";
import PageHeading from "../components/PageHeading";

export default function CartPage() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function checkout() {
    setBusy(true);
    setError("");
    try {
      await orderApi.post("/api/orders/checkout", {
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
      });
      dispatch(clearCart());
      navigate("/orders");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box>
      <PageHeading title="Cart" subtitle="Review the pets you picked, then check out." />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {items.length === 0 ? (
        <Paper sx={{ p: { xs: 4, md: 6 }, textAlign: "center", border: "1px dashed #d7d0c4", boxShadow: "none", bgcolor: "transparent" }}>
          <Typography variant="h6">Your cart is empty</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75, mb: 2.5 }}>Pets you add will wait here.</Typography>
          <Button component={RouterLink} to="/" variant="contained">Browse pets</Button>
        </Paper>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 300px" }, gap: 3, alignItems: "start" }}>
          <Box sx={{ display: "grid", gap: 1.5 }}>
            {items.map((item) => (
              <Paper key={item.id} sx={{ p: 2, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", border: "1px solid #efeae2" }}>
                {item.imageUrl ? (
                  <Box component="img" src={item.imageUrl} alt="" sx={{ width: 72, height: 72, objectFit: "cover", borderRadius: 2, flexShrink: 0 }} />
                ) : (
                  <Box sx={{ width: 72, height: 72, borderRadius: 2, bgcolor: "#e7f2eb", flexShrink: 0 }} />
                )}
                <Box sx={{ flex: 1, minWidth: 140 }}>
                  <Typography fontWeight={700}>{item.name}</Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ mt: 0.25 }}>
                    {money(item.price)} each
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <IconButton size="small" disabled={busy} aria-label="Decrease quantity" onClick={() => dispatch(setQuantity({ id: item.id, quantity: item.quantity - 1 }))}>
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography sx={{ minWidth: 24, textAlign: "center", fontWeight: 700 }}>{item.quantity}</Typography>
                  <IconButton size="small" disabled={busy} aria-label="Increase quantity" onClick={() => dispatch(setQuantity({ id: item.id, quantity: item.quantity + 1 }))}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography fontWeight={700} sx={{ minWidth: 88, textAlign: "right" }}>{money(Number(item.price) * item.quantity)}</Typography>
                <Button color="secondary" onClick={() => dispatch(removeItem(item.id))} disabled={busy} sx={{ flexShrink: 0 }}>Remove</Button>
              </Paper>
            ))}
          </Box>
          <Paper sx={{ p: 3, border: "1px solid #efeae2", position: { md: "sticky" }, top: 96 }}>
            <Typography color="text.secondary" variant="body2">Total</Typography>
            <Typography variant="h4" sx={{ color: "primary.dark", mt: 0.5, mb: 2 }}>{money(total)}</Typography>
            <BusyButton variant="contained" fullWidth size="large" onClick={checkout} loading={busy}>
              {busy ? "Placing order…" : "Checkout"}
            </BusyButton>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
