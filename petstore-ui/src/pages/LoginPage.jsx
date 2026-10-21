import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { orderApi, saveSession } from "../api";
import BusyButton from "../components/BusyButton";

export default function LoginPage({ next = "/", requireAdmin = false }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await orderApi.post("/api/auth/login", form);
      if (requireAdmin && data.role !== "ADMIN") {
        setError("Use the admin account for this page");
        return;
      }
      saveSession(data, "admin");
      navigate(requireAdmin ? "/admin" : next);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", px: 2, bgcolor: requireAdmin ? "#f3f5f4" : "transparent" }}>
      <Paper elevation={requireAdmin ? 0 : 1} sx={{ p: { xs: 3, sm: 4 }, width: "min(420px, 100%)", border: requireAdmin ? "1px solid #e4e8e6" : 0 }}>
        <Typography variant="overline" color="primary">PetStore</Typography>
        <Typography variant="h4" sx={{ mt: 0.5, lineHeight: 1.2 }}>{requireAdmin ? "Admin sign in" : "Sign in"}</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          {requireAdmin ? "Sign in to manage pets, categories, and orders." : "Shop products, keep a cart, and check out."}
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stack component="form" spacing={2.5} onSubmit={submit}>
          <TextField label="Username" name="username" value={form.username} onChange={update} required fullWidth />
          <TextField label="Password" name="password" type="password" value={form.password} onChange={update} required fullWidth />
          <BusyButton type="submit" variant="contained" loading={busy} fullWidth>
            {busy ? "Signing in…" : "Sign in"}
          </BusyButton>
        </Stack>
        {!requireAdmin && (
          <Button component={Link} to="/register" sx={{ mt: 2 }}>Need an account? Register</Button>
        )}
      </Paper>
    </Box>
  );
}
