import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Link, useNavigate } from 'react-router-dom';

function NavBar() {
  const [updatedUser, setUpdatedUser] = useState(null);
  const navigate = useNavigate(); // Initialize the navigate function

  const decodeJWT = (token) => {
    const payload = token.split('.')[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  };

  const handleLogout = () => {
    Cookies.remove("jwt"); // Remove the cookie
    console.log("User logged out successfully");
    navigate("/login"); // Redirect to login page
  };

  useEffect(() => {
    const token = Cookies.get("jwt");

    if (token) {
      try {
        const decodedToken = decodeJWT(token);
        const userId = decodedToken?.userId;

        if (userId) {
          fetch(`http://localhost:8082/api/auth/getUser?id=${userId}`)
            .then((response) => response.json())
            .then((data) => {
              if (data) {
                setUpdatedUser(data);
              }
            })
            .catch((error) => {
              console.error("Error fetching user data:", error);
            });
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  return (
    <div className="navbar bg-base-100">
      {/* Drawer Toggle */}
      <div className="drawer drawer-end">
        <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex items-center">
          {/* Hamburger Icon for Drawer (Visible only on smaller screens) */}
          <label
            htmlFor="my-drawer-4"
            className="drawer-button btn btn-ghost lg:hidden mr-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </label>
          {/* Header Title */}
          <a className="btn btn-ghost text-xl">daisyUI</a>

          {/* Navigation Menu (Visible only on larger screens) */}
          <div className="navbar-center hidden lg:flex flex-1 justify-center">
            <ul className="menu menu-horizontal px-1">
              <li><a>Item 1</a></li>
              <li>
                <details>
                  <summary>Parent</summary>
                  <ul className="p-2">
                    <li><a>Submenu 1</a></li>
                    <li><a>Submenu 2</a></li>
                  </ul>
                </details>
              </li>
              <li><a>Item 3</a></li>
            </ul>
          </div>
        </div>

        {/* Drawer Sidebar */}
        <div className="drawer-side">
          <label htmlFor="my-drawer-4" className="drawer-overlay"></label>
          <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
            {/* Sidebar Navigation Items */}
            <li><a>Item 1</a></li>
            <li>
              <details>
                <summary>Parent</summary>
                <ul className="p-2">
                  <li><a>Submenu 1</a></li>
                  <li><a>Submenu 2</a></li>
                </ul>
              </details>
            </li>
            <li><a>Item 3</a></li>
          </ul>
        </div>
      </div>

      {/* Navbar Right Side */}
      <div className="flex-none gap-2">
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar"
          >
            <div className="w-10 rounded-full">
              <img
                alt="Tailwind CSS Navbar component"
                src={updatedUser?.profileImage || "/default-avatar.png"}
              />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            <li>
              <Link to="/profilepage" className="justify-between">
                Profile
                <span className="badge">New</span>
              </Link>
            </li>
            <li><a>Courses</a></li>
            <li>
              <button onClick={handleLogout} className="justify-between">
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
