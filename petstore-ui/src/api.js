import axios from "axios";

export const productApi = axios.create({
  baseURL: import.meta.env.VITE_PRODUCT_API || "http://localhost:8081",
});
export const orderApi = axios.create({
  baseURL: import.meta.env.VITE_ORDER_API || "http://localhost:8083",
});

const SESSIONS = {
  shop: "petstore_shop_session",
  admin: "petstore_admin_session",
};

function notifyAuth() {
  window.dispatchEvent(new Event("auth-changed"));
}

function emptySession() {
  return { token: null, username: null, role: null };
}

function areaFromPath() {
  return window.location.pathname.startsWith("/admin") ? "admin" : "shop";
}

function readSession(which) {
  try {
    const parsed = JSON.parse(localStorage.getItem(SESSIONS[which]) || "null");
    if (!parsed?.token) {
      return emptySession();
    }
    return {
      token: parsed.token,
      username: parsed.username || null,
      role: parsed.role || null,
    };
  } catch {
    return emptySession();
  }
}

function migrateLegacySession() {
  const token = localStorage.getItem("token");
  if (!token) {
    return;
  }
  const role = localStorage.getItem("role");
  const which = role === "ADMIN" ? "admin" : "shop";
  if (!localStorage.getItem(SESSIONS[which])) {
    localStorage.setItem(SESSIONS[which], JSON.stringify({
      token,
      username: localStorage.getItem("username"),
      role,
    }));
  }
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
}

migrateLegacySession();

export function saveSession(auth, which = areaFromPath()) {
  localStorage.setItem(SESSIONS[which], JSON.stringify({
    token: auth.token,
    username: auth.username,
    role: auth.role,
  }));
  notifyAuth();
}

export function clearSession(which = areaFromPath()) {
  localStorage.removeItem(SESSIONS[which]);
  notifyAuth();
}

export function getSession(which = areaFromPath()) {
  return readSession(which);
}

export function money(value) {
  return `$${Number(value).toFixed(2)}`;
}

function attach(client) {
  client.interceptors.request.use((config) => {
    const token = readSession(areaFromPath()).token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const message = error.response?.data?.message || "Request failed";
      const url = String(error.config?.url || "");
      if (error.response?.status === 401 && !url.includes("/api/auth/")) {
        const which = areaFromPath();
        clearSession(which);
        if (which === "admin") {
          if (!window.location.pathname.startsWith("/admin")) {
            window.location.assign("/admin");
          }
        } else if (window.location.pathname !== "/login") {
          window.location.assign("/login");
        }
      }
      return Promise.reject(new Error(message));
    }
  );
}

attach(productApi);
attach(orderApi);
