import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Layout = () => {
  const [courseData, setCourseData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedData = localStorage.getItem("courseData");
    if (storedData) {
      setCourseData(JSON.parse(storedData));
    }
  }, []);

  const saveCourse = async () => {
    try {
      await axios.post("http://localhost:8082/api/saveCourse", courseData);
      
      // Remove courseData and set showLayout to false
      localStorage.removeItem("courseData");
      localStorage.setItem("showLayout", "false");

      navigate("/viewcourse"); 
    } catch (error) {
      console.error("Error saving course:", error);
    }
  };

  if (!courseData) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-40 mb-20 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
      <h1 className="text-3xl text-center font-bold text-gray-800 mb-6">{courseData.courseName}</h1>
      <p className="text-gray-600 text-sm mb-4">{courseData.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <p><span className="font-semibold">Category:</span> {courseData.category}</p>
        <p><span className="font-semibold">Difficulty:</span> {courseData.difficulty}</p>
        <p><span className="font-semibold">Duration:</span> {courseData.duration} hours</p>
        <p><span className="font-semibold">Chapters:</span> {courseData.noOfChapters}</p>
      </div>

      <h2 className="text-2xl font-semibold mb-3">Course Chapters</h2>
      <div className="space-y-4">
        {courseData.chapters.map((chapter) => (
          <div key={chapter.chapterNumber} className="p-4 border rounded-lg shadow-sm bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">
              Chapter {chapter.chapterNumber}: {chapter.chapterName}
            </h3>
            <p className="text-gray-700 mt-2">{chapter.content}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-6">
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg" onClick={saveCourse}>
          Save and Create
        </button>
        <button 
          className="bg-red-500 text-white px-4 py-2 rounded-lg"
          onClick={() => {
            localStorage.removeItem("courseData");
            localStorage.setItem("showLayout", "false");
            navigate("/generatepage");
          }}
        >
          Discard
        </button>
      </div>
    </div>
  );
};

export default Layout;
