import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import NavBar from "../MainComponents/NavBar";
import Footer from "../MainComponents/Footer";

const CourseLayout2 = () => {
  const { courseId } = useParams(); 
  const location = useLocation();
  const navigate = useNavigate();

 
  const [course, setCourse] = useState(location.state?.course || null);
  const [loading, setLoading] = useState(!course);
  const [error, setError] = useState(null);
  console.log("Course from location state:", course.chapters);
  useEffect(() => {

    if (!course && courseId) {
      axios
        .get(`http://localhost:8082/api/courses/${courseId}`)
        .then((res) => {
          setCourse(res.data);
        })
        .catch((err) => {
          console.error("Error fetching course:", err);
          setError("Error fetching course. Please try again.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [course, courseId]);

  const handleChapterClick = (chapter) => {
    navigate("/viewcontent", { state: { chapter } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 pt-20">
        <NavBar />
        <div className="max-w-4xl mx-auto p-6">
          <p>Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 pt-20">
        <NavBar />
        <div className="max-w-4xl mx-auto p-6">
          <p className="text-red-500">{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-100 pt-20">
        <NavBar />
        <div className="max-w-4xl mx-auto p-6">
          <p>Course not found.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <NavBar />
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-16 mb-20">
        <h1 className="text-3xl text-center font-bold text-gray-800 mb-6">
          {course.courseName}
        </h1>
        <p className="text-gray-600 text-sm mb-4">{course.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <p>
            <span className="font-semibold">Category:</span> {course.category}
          </p>
          <p>
            <span className="font-semibold">Difficulty:</span> {course.difficulty}
          </p>
          <p>
            <span className="font-semibold">Duration:</span> {course.duration} hours
          </p>
          <p>
            <span className="font-semibold">Chapters:</span> {course.noOfChapters}
          </p>
        </div>

        <h2 className="text-2xl font-semibold mb-3">Course Chapters</h2>
        <div className="space-y-4">
        {course.chapters.map((chapter, index) => (
         
  <div
    key={chapter.chapterNumber || index}
    className="p-4 border rounded-lg shadow-sm bg-gray-50"
  >
    
    <h3 className="text-lg font-medium text-gray-900">
      Chapter {chapter.chapterNumber || index + 1}: {chapter.chapterName}
    </h3>
    <p className="text-gray-700 mt-2">{chapter.content}</p>
    <button
      className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
      onClick={() => handleChapterClick(chapter)}
    >
      View Chapter
    </button>
  </div>
))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CourseLayout2;
