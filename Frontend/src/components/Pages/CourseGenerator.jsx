import React, { useState, useEffect } from "react";
import NavBar from "../MainComponents/NavBar";
import Footer from "../MainComponents/Footer";
import GenerateCourse from "../CourseComponents/GenerateCourse";
import Layout from "../CourseComponents/Layout"; // Import Layout.jsx

const CourseGenerator = () => {
  const [showLayout, setShowLayout] = useState(false);

  // Check if the layout has been generated from localStorage
  useEffect(() => {
    const storedLayoutState = localStorage.getItem("showLayout");
    if (storedLayoutState === "true") {
      setShowLayout(true); // Set to true if it was previously saved
    }
  }, []);

  const handleGenerate = () => {
    setShowLayout(true);
    localStorage.setItem("showLayout", "true"); // Store the state in localStorage
  };

  return (
    <div>
      <NavBar />
      {showLayout ? (
        <Layout />
      ) : (
        <GenerateCourse onGenerate={handleGenerate} />
      )}
      <Footer />
    </div>
  );
};

export default CourseGenerator;
