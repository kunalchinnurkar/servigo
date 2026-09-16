import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 4);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleLogout() {
    logout();
    navigate("/");
  }

  const base = user?.role === "provider" ? "/provider" : "/customer";

  return (
    <nav className={"navbar" + (scrolled ? " is-scrolled" : "")}>
      <NavLink to={user ? base : "/"} className="navbar__brand">
        ServiGo
      </NavLink>
      {user && (
        <div className="navbar__right">
          <NavLink
            to={base}
            end
            className={({ isActive }) => "navbar__link" + (isActive ? " is-active" : "")}
          >
            {user.role === "provider" ? "My availability" : "Find help"}
          </NavLink>
          <NavLink
            to={`${base}/requests`}
            className={({ isActive }) => "navbar__link" + (isActive ? " is-active" : "")}
          >
            Requests
          </NavLink>
          <span className="navbar__role">{user.role}</span>
          <button className="btn btn--ghost btn--small" onClick={handleLogout}>
            Log out
          </button>
        </div>
      )}
    </nav>
  );
}
