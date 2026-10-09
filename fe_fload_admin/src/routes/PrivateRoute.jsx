

import { Navigate } from "react-router-dom";

export default function RequireAuth({ children, role }) {
  // ──────────────── Đổi hết local → session ────────────────
  const isAuth = sessionStorage.getItem("isAuth") === "true";
  const userRole = sessionStorage.getItem("role");

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    const redirectByRole = {
      admin: "/admin/user",
      manager: "/manager",
      coordinator: "/coordinator",
      rescueteam: "/rescueTeam",
    };

    return (
      <Navigate
        to={redirectByRole[userRole] || "/login"}
        replace
      />
    );
  }

  return children;
}