import { Navigate } from "react-router-dom";

export default function RequireAuth({ children, role }) {
  const isAuth = sessionStorage.getItem("isAuth") === "true" || localStorage.getItem("isAuth") === "true";
  const rawRole = sessionStorage.getItem("role") || localStorage.getItem("role") || "";
  const userRole = rawRole.toLowerCase().trim();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // Chuẩn hóa role
  const normalizedUserRole = (userRole === "rescuer" || userRole === "rescue") ? "rescueteam" : userRole;
  const normalizedRequiredRole = (role === "rescuer" || role === "rescue") ? "rescueteam" : (role || "").toLowerCase().trim();

  if (role && normalizedUserRole !== normalizedRequiredRole) {
    const redirectByRole = {
      admin: "/admin/user",
      manager: "/manager",
      coordinator: "/coordinator",
      rescueteam: "/rescueTeam",
    };

    return (
      <Navigate
        to={redirectByRole[normalizedUserRole] || "/login"}
        replace
      />
    );
  }

  return children;
}
