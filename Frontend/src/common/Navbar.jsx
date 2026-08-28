import {
  ChevronDown,
  LogIn,
  LogOut,
  Settings,
  UserPlus,
  UserRound,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

import { useState } from "react";

import useUserStore from "@/store/useUserStore";

import { logoutUser } from "@/api/auth.api";

import logo from "@/assets/vite.svg";

const navLinks = ["Skills", "Careers", "Roadmap", "Projects"];

const Navbar = () => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const { user, isAuthenticated, clearUser } = useUserStore();

  const getInitials = () => {
    if (!user?.email) {
      return "U";
    }

    return user.email.substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      clearUser();

      setMenuOpen(false);

      navigate("/login");
    }
  };

  return (
    <nav className="app-navbar" aria-label="Primary navigation">
      <NavLink to="/" className="brand-mark">
        <img src={logo} alt="SkillPath" className="size-10"/>
        <strong>SkillPath</strong>
      </NavLink>

      <div className="navbar-links">
        {navLinks.map((link) => (
          <NavLink
            key={link}
            to={`/${link.toLowerCase()}`}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {link}
          </NavLink>
        ))}
      </div>

      {/* NOT LOGGED IN */}

      {!isAuthenticated && (
        <div className="navbar-auth-actions">
          <NavLink to="/login" className="navbar-login">
            <LogIn size={15} />
            Login
          </NavLink>

          <NavLink to="/register" className="navbar-register">
            <UserPlus size={15} />
            Register
          </NavLink>
        </div>
      )}

      {/* LOGGED IN */}

      {isAuthenticated && (
        <div className="profile-menu-wrap">
          <button
            className="profile-trigger"
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Open profile menu"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className="nav-avatar">{getInitials()}</span>

            <ChevronDown size={15} className={menuOpen ? "rotate" : ""} />
          </button>

          {menuOpen && (
            <div className="profile-menu" role="menu">
              <div className="menu-user">
                <span className="nav-avatar large">{getInitials()}</span>

                <span>
                  <strong>{user?.email?.split("@")[0]}</strong>

                  <small>{user?.email}</small>
                </span>
              </div>

              <div className="menu-divider" />

              <NavLink
                to="/dashboard"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                <UserRound size={16} />
                Profile
              </NavLink>

              <NavLink
                to="/settings"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                <Settings size={16} />
                User settings
              </NavLink>

              <div className="menu-divider" />

              <button
                type="button"
                className="menu-action"
                role="menuitem"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
