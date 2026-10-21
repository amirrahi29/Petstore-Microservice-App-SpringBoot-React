import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import catalogReducer from "./catalogSlice";

const KEY = "petstore_cart";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    catalog: catalogReducer,
  },
});

store.subscribe(() => {
  localStorage.setItem(KEY, JSON.stringify(store.getState().cart.items));
});
