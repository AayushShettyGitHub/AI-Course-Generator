import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../MainComponents/NavBar";
import Footer from "../MainComponents/Footer";
import Cookies from "js-cookie";

const CourseView = () => {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const decodeJWT = (token) => {
    const payload = token.split('.')[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  };

  useEffect(() => {
    const token = Cookies.get("jwt");

    if (token) {
      try {
        const decodedToken = decodeJWT(token);
        const userId = decodedToken?.userId;

        if (userId) {
          
          fetch(`http://localhost:8082/api/getUser?id=${userId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }, 
          })
            .then((response) => response.json())
            .then((data) => {
              if (data) {
                setUser(data);
              }
              setIsLoading(false);
            })
            .catch((error) => {
              console.error("Error fetching user data:", error);
              setIsLoading(false);
            });

       
          fetch(`http://localhost:8082/api/getCourse/${userId}`,{
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }, 
          })
            .then((response) => response.json())
            .then((data) => {
              if (data && data.length > 0) {
                console.log("Fetched courses:", data);
                setCourses(data);
              }
            })
            .catch((error) => {
              console.error("Error fetching courses:", error);
            });
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        setIsLoading(false);
      }
    }
  }, []);

  const handleGenerateCourse = (course) => {
    
    navigate("/viewlayout", { state: { course } });
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      const response = await fetch(`http://localhost:8082/api/deleteCourse/${courseId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        alert("Course Deleted");
  
   
        const updatedCourses = await fetch(`http://localhost:8082/api/getCourse/${user?._id}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }).then((res) => res.json());
  
        setCourses(updatedCourses);
      } else {
        console.error("Failed to delete course");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };
  

  if (isLoading) return <p className="text-center text-xl font-semibold">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold text-blue-600 mb-4">Welcome, {user?.name}</h2>
        <h3 className="text-2xl text-gray-800 mb-6">Your Courses:</h3>

        {courses.length > 0 ? (
          <div className="space-y-6">
            {courses.map((course) => (
              <div key={course._id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{course.courseName}</h4>
                <p className="text-gray-600 mb-4">Category: <span className="font-medium">{course.category}</span></p>
                <p className="text-gray-500 mb-4">{course.description || 'No description available'}</p>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-2"
                  onClick={() => handleGenerateCourse(course)}
                >
                  Start Course
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-lg"
                  onClick={() => handleDeleteCourse(course._id)}
                >
                  Delete
                </button>
               
              </div>
            ))}
          </div>
        ) : (
          <p className="text-lg text-gray-600 mt-4">No courses found.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CourseView;
