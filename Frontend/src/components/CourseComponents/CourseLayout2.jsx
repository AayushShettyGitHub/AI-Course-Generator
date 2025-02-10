import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavBar from "../MainComponents/NavBar";
import Footer from "../MainComponents/Footer";

const CourseLayout2 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { course } = location.state;

  const handleChapterClick = (chapter) => {
    navigate("/viewcontent", { state: { chapter } });
  };

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
          {course.chapters.map((chapter) => (
            console.log(chapter),
            <div
              key={chapter.chapterNumber}
              className="p-4 border rounded-lg shadow-sm bg-gray-50"
            >
              <h3 className="text-lg font-medium text-gray-900">
                Chapter {chapter.chapterNumber}: {chapter.chapterName}
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
