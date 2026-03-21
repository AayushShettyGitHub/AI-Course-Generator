import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../MainComponents/NavBar";
import Footer from "../MainComponents/Footer";
import Cookies from "js-cookie";
import config from "../../config";

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

          fetch(`${config.API_BASE_URL}/api/getUser?id=${userId}`, {
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


          fetch(`${config.API_BASE_URL}/api/getCourse/${userId}`, {
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
      const response = await fetch(`${config.API_BASE_URL}/api/deleteCourse/${courseId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert("Course Deleted");


        const updatedCourses = await fetch(`${config.API_BASE_URL}/api/getCourse/${user?._id}`, {
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
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="container mx-auto px-6 py-16 pt-32">
        <div className="mb-12">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-2">My <span className="text-primary italic">Learning.</span></h2>
          <p className="text-slate-500">Pick up where you left off or dive into a new subject.</p>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course._id} className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                      {course.category}
                    </span>
                  </div>
                  <h4 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {course.courseName}
                  </h4>
                  <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {course.description || 'Access high-quality, AI-curated content designed specifically for your learning goals.'}
                  </p>
                </div>
                <div className="flex gap-3 pt-4 border-t border-slate-50">
                  <button
                    className="btn btn-primary flex-1 shadow-lg shadow-primary/20"
                    onClick={() => handleGenerateCourse(course)}
                  >
                    Start
                  </button>
                  <button
                    className="btn btn-ghost text-red-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteCourse(course._id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-xl text-slate-400 mb-6 font-medium">No courses found yet.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate("/generatepage")}
            >
              Generate Your First Course
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CourseView;
