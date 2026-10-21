import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { productApi } from "../api";

export const PAGE_SIZE = 12;

function shuffle(list) {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export const fetchProducts = createAsyncThunk("catalog/fetchProducts", async () => {
  const first = await productApi.get("/api/products", { params: { page: 0, size: 50 } });
  let all = first.data.content || [];
  const pages = first.data.totalPages || 1;
  for (let page = 1; page < pages; page += 1) {
    const next = await productApi.get("/api/products", { params: { page, size: 50 } });
    all = all.concat(next.data.content || []);
  }
  return shuffle(all);
});

const catalogSlice = createSlice({
  name: "catalog",
  initialState: {
    content: [],
    page: 0,
    totalPages: 0,
    status: "idle",
    error: "",
  },
  reducers: {
    setPage(state, action) {
      state.page = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.content = action.payload;
        state.page = 0;
        state.totalPages = Math.ceil(action.payload.length / PAGE_SIZE) || 0;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Could not load pets";
      });
  },
});

export const { setPage } = catalogSlice.actions;
export default catalogSlice.reducer;
