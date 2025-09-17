import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, authReady, logout } = useContext(AuthContext); 
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="border-b border-gray-200 bg-blue-50 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-700 tracking-tight">
          🩺 DR-VIPS
        </Link>

        <div className="flex items-center gap-4">
          {!authReady ? (
            // placeholder para evitar el flash
            <div className="h-9 w-28 rounded-md bg-gray-200 animate-pulse" />
          ) : user ? (
            <>
              <Link to="/patients" className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                Patients
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                Login
              </Link>
              <Link to="/register" className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
