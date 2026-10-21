import { useEffect, useState } from "react";
import { Alert, Box, Paper, Stack, TextField } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { productApi } from "../api";
import BusyButton from "../components/BusyButton";
import PageHeading from "../components/PageHeading";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  function load() {
    setLoading(true);
    return productApi.get("/api/categories")
      .then((response) => setCategories(response.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function add(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      await productApi.post("/api/categories", { name });
      setName("");
      setNotice("Category added");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    setError("");
    setNotice("");
    setDeletingId(id);
    try {
      await productApi.delete(`/api/categories/${id}`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Box>
      <PageHeading title="Categories" subtitle="Create categories first. They appear in the pet form." />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack component="form" direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} onSubmit={add}>
          <TextField
            label="Category name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            fullWidth
            disabled={saving}
            sx={{ flex: 1 }}
          />
          <BusyButton type="submit" variant="contained" loading={saving} sx={{ px: 3, height: 56, minWidth: 140 }}>
            {saving ? "Adding…" : "Add"}
          </BusyButton>
        </Stack>
      </Paper>
      <Box>
        <DataGrid
          autoHeight
          rows={categories}
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
          localeText={{ noRowsLabel: "No categories yet." }}
          sx={{ width: "100%", bgcolor: "background.paper", borderRadius: "8px" }}
          columns={[
            { field: "name", headerName: "Category", flex: 1, minWidth: 180 },
            {
              field: "actions",
              headerName: "Actions",
              width: 140,
              align: "right",
              headerAlign: "right",
              sortable: false,
              filterable: false,
              renderCell: ({ row }) => (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", width: "100%" }}>
                  <BusyButton size="small" color="secondary" loading={deletingId === row.id} disabled={deletingId != null && deletingId !== row.id} onClick={() => remove(row.id)}>
                    Delete
                  </BusyButton>
                </Box>
              ),
            },
          ]}
        />
      </Box>
    </Box>
  );
}
