import { Box, Typography } from "@mui/material";

export default function PageHeading({ title, subtitle, action }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        mb: 3,
        flexWrap: "wrap",
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h4" sx={{ lineHeight: 1.15 }}>{title}</Typography>
        {subtitle && (
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>{subtitle}</Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}
