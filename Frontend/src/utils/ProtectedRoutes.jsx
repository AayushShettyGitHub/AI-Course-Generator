import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const ProtectedRoute = () => {
  const isAuthenticated = Cookies.get("jwt");
  console.log("Checking authentication status:", isAuthenticated);


  if (!isAuthenticated) {
   
    console.log("User is not authenticated, redirecting to login.");
    return <Navigate to="/login" />;
  }

  return (
    <>
      <Outlet />
    </>
  );
};

export default ProtectedRoute;
