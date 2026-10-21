import { useEffect, useState } from "react";
import { Alert, Box, Button, MenuItem, Paper, TextField, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { money, productApi } from "../api";
import BusyButton from "../components/BusyButton";
import PageHeading from "../components/PageHeading";

const empty = { id: null, name: "", category: "", description: "", price: "" };

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(empty);
  const [image, setImage] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  function load() {
    setLoading(true);
    return Promise.all([
      productApi.get("/api/products", { params: { page: 0, size: 50 } }),
      productApi.get("/api/categories"),
    ])
      .then(([productsResponse, categoriesResponse]) => {
        setProducts(productsResponse.data.content);
        setCategories(categoriesResponse.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function closeForm() {
    setForm(empty);
    setImage(null);
    setFileKey((value) => value + 1);
    setFormOpen(false);
  }

  async function save(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!form.id && !image) {
      setError("Choose an image for the new pet");
      return;
    }
    const body = { name: form.name, category: form.category, description: form.description, price: Number(form.price) };
    let createdId = null;
    setSaving(true);
    try {
      const saved = form.id
        ? (await productApi.put(`/api/products/${form.id}`, body)).data
        : (await productApi.post("/api/products", body)).data;
      if (!form.id) {
        createdId = saved.id;
      }
      if (image) {
        const fileData = new FormData();
        fileData.append("file", image);
        await productApi.post(`/api/products/${saved.id}/image`, fileData);
      }
      setNotice(image ? "Pet saved with image" : "Pet updated");
      closeForm();
      load();
    } catch (err) {
      if (createdId) {
        await productApi.delete(`/api/products/${createdId}`).catch(() => {});
      }
      setError(err.message);
      load();
    } finally {
      setSaving(false);
    }
  }

  function edit(product) {
    setImage(null);
    setForm({
      id: product.id,
      name: product.name,
      category: product.category || "",
      description: product.description || "",
      price: product.price,
    });
    setFormOpen(true);
  }

  async function remove(id) {
    setError("");
    setDeletingId(id);
    try {
      await productApi.delete(`/api/products/${id}`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Box>
      <PageHeading
        title="Pets"
        subtitle="Pets for sale. A photo is required for a new pet."
        action={
          <Button variant={formOpen ? "outlined" : "contained"} onClick={() => (formOpen ? closeForm() : setFormOpen(true))}>
            {formOpen ? "Hide form" : "Add pet"}
          </Button>
        }
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}
      {formOpen && (
        <Paper component="form" onSubmit={save} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2.5 }}>{form.id ? "Update pet" : "New pet"}</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, columnGap: 2, rowGap: 2.5, alignItems: "center" }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required disabled={saving} />
            <TextField
              select
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
              disabled={saving}
              helperText={categories.length === 0 ? "Add a category from the Categories page first." : undefined}
            >
              <MenuItem value="" disabled>Select a category</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.name}>{category.name}</MenuItem>
              ))}
            </TextField>
            <TextField sx={{ gridColumn: { md: "1 / -1" } }} label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline minRows={2} disabled={saving} />
            <TextField label="Price" type="number" inputProps={{ min: "0.01", step: "0.01" }} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required disabled={saving} />
            <Button component="label" variant="outlined" disabled={saving} sx={{ justifySelf: "start", height: 56, px: 2.5 }}>
              {image ? image.name : form.id ? "Replace image" : "Choose image"}
              <input
                key={fileKey}
                hidden
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
            </Button>
            <Box sx={{ gridColumn: "1 / -1", display: "flex", gap: 1.5 }}>
              <BusyButton type="submit" variant="contained" loading={saving}>
                {saving ? "Saving…" : form.id ? "Save changes" : "Add pet"}
              </BusyButton>
              <Button type="button" onClick={closeForm} disabled={saving}>Cancel</Button>
            </Box>
          </Box>
        </Paper>
      )}
      <DataGrid
        autoHeight
        rows={products}
        loading={loading || saving || deletingId != null}
        disableRowSelectionOnClick
        rowHeight={64}
        columnHeaderHeight={48}
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 300 } },
        }}
        localeText={{ noRowsLabel: "No pets yet." }}
        sx={{ width: "100%", bgcolor: "background.paper", borderRadius: "8px" }}
        columns={[
          {
            field: "imageUrl",
            headerName: "Photo",
            width: 80,
            sortable: false,
            filterable: false,
            align: "center",
            headerAlign: "center",
            renderCell: ({ row }) => row.imageUrl
              ? <Box component="img" src={row.imageUrl} alt="" sx={{ width: 40, height: 40, objectFit: "cover", borderRadius: 1 }} />
              : <Typography color="text.secondary">—</Typography>,
          },
          { field: "name", headerName: "Name", flex: 1, minWidth: 140 },
          { field: "category", headerName: "Category", flex: 0.7, minWidth: 120 },
          { field: "description", headerName: "Description", flex: 1.2, minWidth: 180 },
          {
            field: "price",
            headerName: "Price",
            width: 110,
            valueFormatter: (value) => money(value),
          },
          {
            field: "actions",
            headerName: "Actions",
            width: 180,
            align: "right",
            headerAlign: "right",
            sortable: false,
            filterable: false,
            renderCell: ({ row }) => (
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5, width: "100%" }}>
                <Button size="small" onClick={() => edit(row)} disabled={saving || deletingId != null}>Edit</Button>
                <BusyButton size="small" color="secondary" loading={deletingId === row.id} disabled={deletingId != null && deletingId !== row.id} onClick={() => remove(row.id)}>
                  Delete
                </BusyButton>
              </Box>
            ),
          },
        ]}
      />
    </Box>
  );
}
