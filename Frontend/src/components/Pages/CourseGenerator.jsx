import React, { useState, useEffect } from "react";
import NavBar from "../MainComponents/NavBar";
import Footer from "../MainComponents/Footer";
import GenerateCourse from "../CourseComponents/GenerateCourse";
import Layout from "../CourseComponents/Layout"; 

const CourseGenerator = () => {
  const [showLayout, setShowLayout] = useState(false);

  useEffect(() => {
    const storedLayoutState = localStorage.getItem("showLayout");
    if (storedLayoutState === "true") {
      setShowLayout(true); 
    }
   
  }, []);

  const handleGenerate = () => {
    setShowLayout(true);
    localStorage.setItem("showLayout", "true");
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
