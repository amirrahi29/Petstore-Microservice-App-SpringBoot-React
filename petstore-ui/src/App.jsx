import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { getSession } from "./api";
import AccountLayout from "./components/AccountLayout";
import AdminLayout from "./components/AdminLayout";
import Layout from "./components/Layout";
import AdminCategoriesPage from "./pages/AdminCategoriesPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import LoginPage from "./pages/LoginPage";
import OrdersPage from "./pages/OrdersPage";
import ProductsPage from "./pages/ProductsPage";

function OpenProduct() {
  const { id } = useParams();
  return <Navigate to="/" replace state={{ productId: id }} />;
}
function RequireAuth({ children }) {
  const location = useLocation();
  if (!getSession("shop").token) {
    return <Navigate to="/" replace state={{ login: true, from: location.pathname }} />;
  }
  return children;
}

function AdminRoute({ children }) {
  const [session, setSession] = useState(getSession("admin"));

  useEffect(() => {
    const refresh = () => setSession(getSession("admin"));
    window.addEventListener("auth-changed", refresh);
    return () => window.removeEventListener("auth-changed", refresh);
  }, []);

  if (!session.token) {
    return <LoginPage next="/admin" requireAdmin />;
  }
  if (session.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<ProductsPage />} />
        <Route path="/products/:id" element={<OpenProduct />} />
        <Route path="/account" element={<RequireAuth><AccountLayout /></RequireAuth>}>
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<OrdersPage />} />
        </Route>
        <Route path="/cart" element={<Navigate to="/" replace state={{ cart: true }} />} />
        <Route path="/orders" element={<Navigate to="/account/orders" replace />} />
      </Route>
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<Navigate to="products" replace />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
      </Route>
      <Route path="/login" element={<Navigate to="/" replace state={{ login: true }} />} />
      <Route path="/register" element={<Navigate to="/" replace state={{ register: true }} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
