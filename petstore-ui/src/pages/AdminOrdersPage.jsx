import { useEffect, useState } from "react";
import { Alert, Box } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { money, orderApi } from "../api";
import BusyButton from "../components/BusyButton";
import PageHeading from "../components/PageHeading";

function toRow(order) {
  return {
    id: order.id,
    customer: order.userId,
    items: order.items.map((item) => `${item.quantity} × ${item.productName}`).join(", "),
    total: Number(order.totalAmount),
    status: order.status,
    placed: new Date(order.orderDate).toLocaleString(),
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  function load() {
    setLoading(true);
    return (async () => {
      const first = await orderApi.get("/api/orders", { params: { page: 0, size: 50 } });
      let all = first.data.content || [];
      const pages = first.data.totalPages || 1;
      for (let page = 1; page < pages; page += 1) {
        const next = await orderApi.get("/api/orders", { params: { page, size: 50 } });
        all = all.concat(next.data.content || []);
      }
      setOrders(all.map(toRow));
    })()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id) {
    setError("");
    setDeletingId(id);
    try {
      await orderApi.delete(`/api/orders/${id}`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Box>
      <PageHeading title="Orders" subtitle="Every order placed in the store." />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <DataGrid
        autoHeight
        rows={orders}
        loading={loading || deletingId != null}
        disableRowSelectionOnClick
        rowHeight={64}
        columnHeaderHeight={48}
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
          sorting: { sortModel: [{ field: "id", sort: "desc" }] },
        }}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 300 } },
        }}
        localeText={{ noRowsLabel: "No orders yet." }}
        sx={{ width: "100%", bgcolor: "background.paper", borderRadius: "8px" }}
        columns={[
          { field: "id", headerName: "Order", width: 100, valueFormatter: (value) => `#${value}` },
          { field: "customer", headerName: "Customer", width: 120 },
          { field: "items", headerName: "Items", flex: 1.4, minWidth: 220 },
          { field: "total", headerName: "Total", width: 120, valueFormatter: (value) => money(value) },
          { field: "status", headerName: "Status", width: 120 },
          { field: "placed", headerName: "Placed", flex: 0.8, minWidth: 180 },
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
                <BusyButton
                  size="small"
                  color="secondary"
                  loading={deletingId === row.id}
                  disabled={deletingId != null && deletingId !== row.id}
                  onClick={() => remove(row.id)}
                >
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
