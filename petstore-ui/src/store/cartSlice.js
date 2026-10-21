import { createSlice } from "@reduxjs/toolkit";

const KEY = "petstore_cart";

function readCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: readCart() },
  reducers: {
    addItem(state, action) {
      const product = action.payload;
      const found = state.items.find((item) => item.id === product.id);
      if (found) {
        found.quantity += 1;
        found.price = product.price;
        found.imageUrl = product.imageUrl;
        found.name = product.name;
      } else {
        state.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          category: product.category,
          quantity: 1,
        });
      }
    },
    removeItem(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    setQuantity(state, action) {
      const { id, quantity } = action.payload;
      const found = state.items.find((item) => item.id === id);
      if (!found) {
        return;
      }
      if (quantity < 1) {
        state.items = state.items.filter((item) => item.id !== id);
      } else {
        found.quantity = quantity;
      }
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, setQuantity, clearCart } = cartSlice.actions;

export function selectCartItems(state) {
  return state.cart.items;
}

export function selectCartCount(state) {
  return state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function selectCartTotal(state) {
  return state.cart.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
}

export default cartSlice.reducer;
