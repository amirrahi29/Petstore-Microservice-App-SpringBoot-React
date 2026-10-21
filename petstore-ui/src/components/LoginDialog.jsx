import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
  Box,
  Button,
  Dialog,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { orderApi, saveSession } from "../api";
import BusyButton from "./BusyButton";

const empty = { username: "", email: "", password: "" };

export default function LoginDialog({ open, onClose, onSuccess, title = "Sign in", initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const register = mode === "register";

  useEffect(() => {
    if (!open) {
      return;
    }
    setMode(initialMode);
    setForm(empty);
    setError("");
  }, [open, initialMode]);

  function close() {
    setMode("login");
    setForm(empty);
    setError("");
    onClose();
  }

  function switchMode(next) {
    setError("");
    setMode(next);
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const path = register ? "/api/auth/register" : "/api/auth/login";
      const body = register ? form : { username: form.username, password: form.password };
      const { data } = await orderApi.post(path, body);
      saveSession(data, "shop");
      if (data.role === "ADMIN") {
        saveSession(data, "admin");
      }
      setForm(empty);
      setMode("login");
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      maxWidth="xs"
      scroll="paper"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <Box sx={{ position: "relative", px: 3.5, pt: 3, pb: 3 }}>
        <IconButton aria-label="Close" onClick={close} sx={{ position: "absolute", top: 16, right: 16 }}>
          <CloseIcon />
        </IconButton>
        <Typography variant="overline" color="primary">PetStore</Typography>
        <Typography variant="h5" sx={{ mt: 0.5 }}>{register ? "Create your account" : "Welcome back"}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, pr: 4 }}>
          {register
            ? "Register to save pets in your cart and check out."
            : title === "Sign in"
              ? "Sign in to shop, keep a cart, and check out."
              : title}
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 0.5,
            p: 0.5,
            mt: 2.5,
            borderRadius: 2,
            bgcolor: "action.hover",
          }}
        >
          <Button
            type="button"
            variant={register ? "text" : "contained"}
            disableElevation
            onClick={() => switchMode("login")}
          >
            Sign in
          </Button>
          <Button
            type="button"
            variant={register ? "contained" : "text"}
            disableElevation
            onClick={() => switchMode("register")}
          >
            Register
          </Button>
        </Box>

        <Stack component="form" spacing={2} onSubmit={submit} sx={{ mt: 2.5 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            fullWidth
            size="small"
            label="Username"
            autoComplete="username"
            value={form.username}
            onChange={(event) => setForm({ ...form, username: event.target.value })}
            required
          />
          {register && (
            <TextField
              fullWidth
              size="small"
              label="Email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          )}
          <TextField
            fullWidth
            size="small"
            label="Password"
            type="password"
            autoComplete={register ? "new-password" : "current-password"}
            helperText={register ? "At least 6 characters" : undefined}
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
            inputProps={register ? { minLength: 6 } : undefined}
          />
          <BusyButton type="submit" variant="contained" loading={busy} fullWidth sx={{ mt: 0.5 }}>
            {busy ? "Please wait…" : register ? "Create account" : "Sign in"}
          </BusyButton>
        </Stack>
      </Box>
    </Dialog>
  );
}
