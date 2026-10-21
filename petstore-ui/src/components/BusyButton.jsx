import { Button, CircularProgress } from "@mui/material";

export default function BusyButton({ loading, children, disabled, startIcon, ...props }) {
  return (
    <Button
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
      {...props}
    >
      {children}
    </Button>
  );
}
