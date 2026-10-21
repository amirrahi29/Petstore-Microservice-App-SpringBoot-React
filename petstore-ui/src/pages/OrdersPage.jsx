import { useEffect, useState } from "react";
import { Alert, Box } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { money, orderApi } from "../api";
import PageHeading from "../components/PageHeading";

function toRow(order) {
  return {
    id: order.id,
    items: order.items.map((item) => `${item.quantity} × ${item.productName}`).join(", "),
    total: Number(order.totalAmount),
    status: order.status,
    placed: new Date(order.orderDate).toLocaleString(),
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      const first = await orderApi.get("/api/orders", { params: { page: 0, size: 50 } });
      let all = first.data.content || [];
      const pages = first.data.totalPages || 1;
      for (let page = 1; page < pages; page += 1) {
        const next = await orderApi.get("/api/orders", { params: { page, size: 50 } });
        all = all.concat(next.data.content || []);
      }
      return all.map(toRow);
    })()
      .then((rows) => {
        if (active) {
          setOrders(rows);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Box>
      <PageHeading title="Order history" subtitle="Orders you have checked out." />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <DataGrid
        autoHeight
        rows={orders}
        loading={loading}
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
          { field: "items", headerName: "Items", flex: 1.4, minWidth: 200 },
          { field: "total", headerName: "Total", width: 120, valueFormatter: (value) => money(value) },
          { field: "status", headerName: "Status", width: 120 },
          { field: "placed", headerName: "Placed", flex: 0.8, minWidth: 180 },
        ]}
      />
    </Box>
  );
}
