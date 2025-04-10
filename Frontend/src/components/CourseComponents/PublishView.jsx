import React from "react";
import { useLocation } from "react-router-dom";

const PublishView = () => {
  const location = useLocation();
  const course = location.state?.course;
  console.log("Course received:", course);

  if (!course) {
    return <div className="text-center text-red-500">No course data available.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">{course.courseName}</h1>
      <p className="text-gray-700 mb-4">Category: {course.category}</p>
      <p className="text-gray-600 mb-6">{course.description || "No description available"}</p>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Chapters:</h2>
      {course.chapters && course.chapters.length > 0 ? (
        <ul className="space-y-4">
          {course.chapters.map((chapter, index) => (
            <li
              key={index}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <h3 className="text-xl font-medium">{chapter.title}</h3>
              <p className="text-gray-600">{chapter.content}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No chapters available.</p>
      )}
    </div>
  );
};

export default PublishView;
