import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerRequests from "./pages/CustomerRequests";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ProviderDashboard from "./pages/ProviderDashboard";
import ProviderRequests from "./pages/ProviderRequests";
import Register from "./pages/Register";

function RequireRole({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return <Navigate to={user.role === "provider" ? "/provider" : "/customer"} replace />;
  }
  return children;
}

function Shell({ children }) {
  const { user } = useAuth();
  return (
    <div className="app-shell">
      {user && <Navbar />}
      {children}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Shell>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/customer"
              element={
                <RequireRole role="customer">
                  <CustomerDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/customer/requests"
              element={
                <RequireRole role="customer">
                  <CustomerRequests />
                </RequireRole>
              }
            />
            <Route
              path="/provider"
              element={
                <RequireRole role="provider">
                  <ProviderDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/provider/requests"
              element={
                <RequireRole role="provider">
                  <ProviderRequests />
                </RequireRole>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Shell>
      </Router>
    </AuthProvider>
  );
}
