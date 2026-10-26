import { getSession, orderApi } from "../api";
import { replaceItems } from "./cartSlice";

const LEGACY_KEY = "petstore_cart";

let booted = false;
let activeToken;
let hydrating = false;
let timer = null;
let lastSent = "";

function shopToken() {
  return getSession("shop").token;
}

function shopAuth() {
  return { headers: { Authorization: `Bearer ${shopToken()}` } };
}

function takeLegacy() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LEGACY_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  } finally {
    localStorage.removeItem(LEGACY_KEY);
  }
}

function toServer(items) {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    price: Number(item.price),
    image: item.imageUrl || item.image || "",
    category: item.category || "",
    quantity: item.quantity,
  }));
}

function fromServer(items) {
  return (items || []).map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    imageUrl: item.image || item.imageUrl || "",
    category: item.category || "",
    quantity: item.quantity,
  }));
}

function merge(serverItems, localItems) {
  const byId = new Map();
  for (const item of [...serverItems, ...localItems]) {
    const existing = byId.get(item.id);
    if (!existing) {
      byId.set(item.id, { ...item });
    } else {
      existing.quantity += item.quantity;
      existing.price = item.price;
      existing.name = item.name;
      existing.imageUrl = item.imageUrl || existing.imageUrl;
      existing.category = item.category || existing.category;
    }
  }
  return [...byId.values()];
}

export function startCartSync(store) {
  async function pushNow() {
    if (!shopToken()) {
      return;
    }
    const payload = toServer(store.getState().cart.items);
    const body = JSON.stringify(payload);
    if (body === lastSent) {
      return;
    }
    await orderApi.put("/api/cart", { items: payload }, shopAuth());
    lastSent = body;
  }

  async function pull() {
    const token = shopToken();
    let legacy = [];
    if (!booted) {
      booted = true;
      legacy = takeLegacy();
    } else if (token === activeToken) {
      return;
    }
    if (!token) {
      hydrating = true;
      if (activeToken) {
        store.dispatch(replaceItems([]));
      } else if (legacy.length) {
        store.dispatch(replaceItems(legacy));
      }
      hydrating = false;
      activeToken = null;
      return;
    }

    let serverItems = [];
    try {
      const { data } = await orderApi.get("/api/cart", shopAuth());
      serverItems = fromServer(data.items);
    } catch {
      return;
    }
    const memory = activeToken ? [] : store.getState().cart.items;
    const extras = legacy.length ? legacy : memory;
    const merged = extras.length ? merge(serverItems, extras) : serverItems;
    hydrating = true;
    lastSent = JSON.stringify(toServer(serverItems));
    store.dispatch(replaceItems(merged));
    hydrating = false;
    activeToken = token;
    try {
      await pushNow();
    } catch {
      lastSent = JSON.stringify(toServer(serverItems));
    }
  }

  store.subscribe(() => {
    if (hydrating || !shopToken()) {
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      pushNow().catch(() => {
        lastSent = "";
      });
    }, 300);
  });

  window.addEventListener("auth-changed", () => {
    pull();
  });
  pull();
}
