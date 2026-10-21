import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, Chip, Dialog, IconButton, Typography } from "@mui/material";
import { money } from "../api";

export default function ProductDetailsDialog({ product, onClose, onAdd }) {
  return (
    <Dialog
      open={Boolean(product)}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="pet-details-title"
      PaperProps={{
        sx: {
          borderRadius: "12px",
          overflow: "hidden",
          m: 2,
          width: "min(880px, calc(100% - 32px))",
          maxHeight: "calc(100vh - 32px)",
          bgcolor: "#fffcf8",
          boxShadow: "0 24px 60px rgba(28, 43, 36, 0.18)",
        },
      }}
    >
      {product && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "minmax(0, 1.15fr) minmax(260px, 0.85fr)" },
            height: { sm: "min(540px, calc(100vh - 48px))" },
          }}
        >
          <Box sx={{ position: "relative", minHeight: { xs: 230, sm: 0 }, bgcolor: "#e7f2eb" }}>
            {product.imageUrl ? (
              <Box
                component="img"
                src={product.imageUrl}
                alt={product.name}
                sx={{
                  position: { sm: "absolute" },
                  inset: 0,
                  width: "100%",
                  height: { xs: 230, sm: "100%" },
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <Box sx={{ height: "100%", minHeight: 230, display: "grid", placeItems: "center" }}>
                <Typography variant="h2" color="primary">{product.name.slice(0, 1)}</Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0, p: { xs: 2.5, sm: 3.5 } }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
              <Chip label={product.category} sx={{ bgcolor: "#e7f2eb", color: "primary.dark", fontWeight: 700 }} />
              <IconButton aria-label="Close" onClick={onClose} sx={{ mr: -1 }}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Typography id="pet-details-title" variant="h4" sx={{ mt: 2, fontSize: { xs: 28, sm: 34 }, lineHeight: 1.15 }}>
              {product.name}
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ mt: 1.5, lineHeight: 1.7, overflow: "auto", flex: 1, pr: 0.5, overflowWrap: "anywhere" }}
            >
              {product.description || "This pet is ready for a new home."}
            </Typography>
            <Box
              sx={{
                mt: 2.5,
                pt: 2.5,
                borderTop: "1px solid #efeae2",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Box>
                <Typography variant="overline" color="text.secondary">Price</Typography>
                <Typography variant="h4" sx={{ color: "primary.dark", lineHeight: 1.1 }}>{money(product.price)}</Typography>
              </Box>
              <Button variant="contained" size="large" onClick={() => onAdd(product)} sx={{ minWidth: 168 }}>
                Add to cart
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Dialog>
  );
}
