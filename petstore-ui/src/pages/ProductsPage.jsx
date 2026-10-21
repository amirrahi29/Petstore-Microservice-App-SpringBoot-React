import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, CardMedia, Chip, Pagination, Paper, Skeleton, Typography } from "@mui/material";
import { getSession, money } from "../api";
import { openCartDrawer } from "../components/CartDrawer";
import ProductDetailsDialog from "../components/ProductDetailsDialog";
import { addItem } from "../store/cartSlice";
import { fetchProducts, PAGE_SIZE, setPage } from "../store/catalogSlice";
import LoginDialog from "../components/LoginDialog";

export default function ProductsPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { content, page, status, error } = useSelector((state) => state.catalog);
  const [category, setCategory] = useState("All");
  const [notice, setNotice] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [pending, setPending] = useState(null);
  const [selected, setSelected] = useState(null);
  const loading = status === "loading" && content.length === 0;
  const categories = [...new Set(content.map((item) => item.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const filtered = category === "All" ? content : content.filter((item) => item.category === category);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    const id = location.state?.productId;
    if (!id || status === "loading" || status === "idle") {
      return;
    }
    setSelected(content.find((item) => String(item.id) === String(id)) || null);
    navigate("/", { replace: true, state: null });
  }, [location.state, content, status, navigate]);

  function addToCart(product) {
    if (!getSession("shop").token) {
      setPending(product);
      setLoginOpen(true);
      return;
    }
    dispatch(addItem(product));
    setSelected(null);
    openCartDrawer();
    setNotice(`${product.name} added to cart`);
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 2, mb: 2.5 }}>
        <Typography variant="h5">Pets</Typography>
        <Typography variant="body2" color="text.secondary">
          {loading ? "Loading…" : content.length === 0 ? "The catalog is empty" : `${filtered.length} ${category === "All" ? "pets" : `in ${category}`}`}
        </Typography>
      </Box>
      {!loading && categories.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
          {["All", ...categories].map((name) => {
            const selected = category === name;
            return (
              <Chip
                key={name}
                label={name}
                clickable
                onClick={() => {
                  setCategory(name);
                  dispatch(setPage(0));
                }}
                sx={{
                  height: 36,
                  px: 0.5,
                  fontWeight: 600,
                  borderRadius: "8px",
                  bgcolor: selected ? "primary.main" : "#fffcf8",
                  color: selected ? "#fff" : "text.primary",
                  border: "1px solid",
                  borderColor: selected ? "primary.main" : "#e4e8e6",
                  "&:hover": { bgcolor: selected ? "primary.dark" : "#f6f7f6" },
                }}
              />
            );
          })}
        </Box>
      )}
      {loading && (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 2.5 }}>
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={340} sx={{ borderRadius: "8px" }} />
          ))}
        </Box>
      )}
      {!loading && content.length === 0 && !error && (
        <Paper sx={{ p: { xs: 4, md: 6 }, textAlign: "center", border: "1px solid #efeae2", boxShadow: "none", borderRadius: 3 }}>
          <Typography variant="h6">No pets listed yet</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 420, mx: "auto" }}>
            New pets show up in this row as soon as they are added, each one with a photo.
          </Typography>
        </Paper>
      )}
      {!loading && content.length > 0 && filtered.length === 0 && (
        <Paper sx={{ p: { xs: 4, md: 6 }, textAlign: "center", border: "1px solid #efeae2", boxShadow: "none", borderRadius: "8px" }}>
          <Typography variant="h6">No pets in {category}</Typography>
          <Button sx={{ mt: 2 }} onClick={() => { setCategory("All"); dispatch(setPage(0)); }}>Show all pets</Button>
        </Paper>
      )}
      {!loading && filtered.length > 0 && (
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 2.5 }}>
        {visible.map((product) => (
          <Card
            key={product.id}
            sx={{
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              borderRadius: "8px",
              border: "1px solid #efeae2",
              boxShadow: "0 10px 30px rgba(28, 43, 36, 0.05)",
              transition: "transform 0.18s ease, box-shadow 0.18s ease",
              "&:hover": { transform: "translateY(-3px)", boxShadow: "0 16px 36px rgba(28, 43, 36, 0.1)" },
            }}
          >
            {product.imageUrl ? (
              <CardMedia
                component="img"
                height="210"
                image={product.imageUrl}
                alt={product.name}
                onClick={() => setSelected(product)}
                sx={{ objectFit: "cover", cursor: "pointer" }}
              />
            ) : (
              <Box onClick={() => setSelected(product)} sx={{ height: 210, bgcolor: "#e7f2eb", display: "grid", placeItems: "center", cursor: "pointer" }}>
                <Typography color="primary" variant="h4">{product.name.slice(0, 1)}</Typography>
              </Box>
            )}
            <CardContent sx={{ flexGrow: 1, p: 2, pb: 1.5 }}>
              <Chip size="small" label={product.category} sx={{ mb: 1, bgcolor: "#e7f2eb", color: "primary.dark", fontWeight: 600 }} />
              <Typography variant="h6" sx={{ lineHeight: 1.3 }}>{product.name}</Typography>
              <Typography
                color="text.secondary"
                variant="body2"
                sx={{
                  mt: 0.75,
                  minHeight: 40,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {product.description || " "}
              </Typography>
              <Typography sx={{ mt: 1.5, fontWeight: 700, color: "primary.dark", fontSize: 18 }}>{money(product.price)}</Typography>
            </CardContent>
            <Box sx={{ display: "flex", gap: 1, px: 2, pb: 2 }}>
              <Button variant="outlined" fullWidth onClick={() => setSelected(product)}>Details</Button>
              <Button variant="contained" fullWidth onClick={() => addToCart(product)}>Add to cart</Button>
            </Box>
          </Card>
        ))}
      </Box>
      )}
      <ProductDetailsDialog
        product={selected}
        onClose={() => setSelected(null)}
        onAdd={addToCart}
      />
      <LoginDialog
        title="Sign in to add this item"
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => {
          if (pending) {
            dispatch(addItem(pending));
            openCartDrawer();
            setNotice(`${pending.name} added to cart`);
          }
          setPending(null);
          setSelected(null);
          setLoginOpen(false);
        }}
      />
      {pageCount > 1 && filtered.length > 0 && (
        <Pagination
          sx={{ mt: 4, display: "flex", justifyContent: "center" }}
          page={page + 1}
          count={pageCount}
          onChange={(_, value) => dispatch(setPage(value - 1))}
        />
      )}
    </Box>
  );
}
