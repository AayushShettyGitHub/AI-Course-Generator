import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import NavBar from "../MainComponents/NavBar";
import Footer from "../MainComponents/Footer";

const Publish = () => {
  const [user, setUser] = useState(null);
  const [publishedCourses, setPublishedCourses] = useState([]);
  const [unpublishedCourses, setUnpublishedCourses] = useState([]);
  const [otherCourses, setOtherCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const navigate = useNavigate();

  const decodeJWT = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload || null;
    } catch (error) {
      console.error("Invalid token:", error);
      return null;
    }
  };

  useEffect(() => {
    const socket = io("http://localhost:8082");
    socket.on("connect", () => {
      console.log("Connected to Socket.IO server with ID:", socket.id);
    });
  
    socket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
    });
    
    const token = Cookies.get("jwt");
    if (!token) return setIsLoading(false);

    const decodedToken = decodeJWT(token);
    const userId = decodedToken?.userId;
    console.log(userId);
    if (!userId) {
      console.error("Invalid token: No userId found.");
      setIsLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const userRes = await axios.get(`http://localhost:8082/api/getUser?id=${userId}`, { withCredentials: true });
        setUser(userRes.data);


        const publishedRes = await axios.get(`http://localhost:8082/api/courses/mine?userId=${userId}`, { withCredentials: true });
        setPublishedCourses(publishedRes.data || []);
        console.log("Published:", publishedRes.data);

        const otherRes = await axios.get(`http://localhost:8082/api/courses/others?userId=${userId}`, { withCredentials: true });
        setOtherCourses(otherRes.data || []);
        console.log("Other:", otherRes.data);
        const unpublishedRes = await axios.get(`http://localhost:8082/api/getCourse/${userId}`, { withCredentials: true });
        setUnpublishedCourses(unpublishedRes.data?.filter(course => !course.published) || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();

    socket.on("coursePublished", (newCourse) => {
      if (newCourse.userId === userId) {
        setPublishedCourses((prev) => [...prev, newCourse]);
        setUnpublishedCourses((prev) => prev.filter((c) => c._id !== newCourse._id));
      }
    });

    return () => socket.off("coursePublished");
  }, []);

  const handleDeleteCourse = async (courseId) => {
    if (!courseId) {
      alert("Error: Course ID is missing.");
      return;
    }
  
    try {
      console.log("Deleting course:", courseId);
      const response = await axios.delete(`http://localhost:8082/api/courses/delete/${courseId}`, {
        withCredentials: true,
      });
  
      if (response.status === 200) {
        alert("Course deleted successfully!");
        setPublishedCourses((prev) => prev.filter((course) => course._id !== courseId));
        setUnpublishedCourses((prev) => prev.filter((course) => course._id !== courseId));
        setOtherCourses((prev) => prev.filter((course) => course._id !== courseId));
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("An unexpected error occurred.");
    }
  };

  const handlePublishCourse = async (course) => {
    if (!course) {
      alert("Error: Course data is missing.");
      return;
    }
  
    try {
      const requestData = {
        userId: course.userId,
        courseName: course.courseName,
        category: course.category,
        description: course.description,
        difficulty: course.difficulty,
        duration: course.duration,
        noOfChapters: course.noOfChapters,
        topic: course.topic,
        chapters: course.chapters || [],
      };
  
      const response = await axios.post("http://localhost:8082/api/courses/add", requestData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
  
      if (response.status === 201) {
        setShowPublishModal(false);
        alert("Course published successfully!");

        const updatedPublishedCourses = await axios.get(
          `http://localhost:8082/api/courses/mine?userId=${course.userId._id}`,
          { withCredentials: true }
        );
        setPublishedCourses(updatedPublishedCourses.data || []);
        setUnpublishedCourses((prev) => prev.filter((c) => c._id !== course._id));
      }
    } catch (error) {
      console.error("Error publishing course:", error);
      if (error.response && error.response.status === 400) {
        alert(error.response.data.message);
      } else {
        alert("An unexpected error occurred.");
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <div className="container mx-auto px-6 pt-24 pb-16">
        {isLoading ? <p>Loading...</p> : <h2 className="text-3xl font-semibold text-blue-600 mb-4">Welcome, {user?.name}</h2>}

        <div className="mb-6 text-center">
          <button
            onClick={() => setShowPublishModal(true)}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-all"
          >
            Publish
          </button> 
        </div>


        <CourseSection
          title="My Published Courses"
          courses={publishedCourses}
          expandedCourse={expandedCourse}
          setExpandedCourse={setExpandedCourse}
          handleDeleteCourse={handleDeleteCourse}
          isMine={true}
        />
        <CourseSection
          title="Other Courses"
          courses={otherCourses}
          expandedCourse={expandedCourse}
          setExpandedCourse={setExpandedCourse}
          handleDeleteCourse={handleDeleteCourse}
          isMine={false}
        />
        {showPublishModal && (
          <Modal title="Unpublished Courses" onClose={() => setShowPublishModal(false)}>
            {unpublishedCourses.length === 0 ? (
              <p>No unpublished courses available.</p>
            ) : (
              unpublishedCourses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  expandedCourse={expandedCourse}
                  setExpandedCourse={setExpandedCourse}
                >
                  <button
                    onClick={() => handlePublishCourse(course)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all mt-2"
                  >
                    Publish
                  </button>
                </CourseCard>
              ))
            )}
          </Modal>
        )}
      </div>
      <Footer />
    </div>
  );
};

const CourseSection = ({
  title,
  courses,
  expandedCourse,
  setExpandedCourse,
  handleDeleteCourse,
  isMine, 
}) => (
  <div className="mb-8">
    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h3>
    {courses.length === 0 ? (
      <p>No courses available.</p>
    ) : (
      courses.map((course, index) => (
        <CourseCard
          key={course._id || index}
          course={course}
          expandedCourse={expandedCourse}
          setExpandedCourse={setExpandedCourse}
          handleDeleteCourse={handleDeleteCourse}
          isMine={isMine} 
        />
      ))
    )}
  </div>
);

const CourseCard = ({
  course,
  expandedCourse,
  setExpandedCourse,
  handleDeleteCourse,
  isMine = false,
  children,
}) => {
  const navigate = useNavigate();

  const handleViewCourse = () => {
    if (isMine) {

      navigate("/viewlayout", { state: { course, source: "publishedRes" } });
    } else {
   
      navigate("/viewlayout", { state: { course, source: "othersRes" } });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-4">
      <h4 className="text-xl font-semibold text-gray-900">{course.courseName}</h4>
      <p className="text-gray-600">Category: {course.category}</p>
      <p className="text-gray-500">{course.description}</p>

      <button
        onClick={() =>
          setExpandedCourse(expandedCourse === course._id ? null : course._id)
        }
        className="text-blue-600 hover:underline"
      >
        {expandedCourse === course._id ? "Hide Details" : "View More"}
      </button>


      {isMine && (
        <button
          onClick={() => handleDeleteCourse(course._id)}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all mt-2 ml-2"
        >
          Delete
        </button>
      )}

      {course.chapters && course.chapters.length > 0 && (
        <button
          className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-all mt-2 ml-2"
          onClick={handleViewCourse}
        >
          View Course
        </button>
      )}

      {expandedCourse === course._id && (
        <div className="mt-4">
          <p>
            <strong>Difficulty:</strong> {course.difficulty}
          </p>
          <p>
            <strong>Duration:</strong> {course.duration} weeks
          </p>
          <p>
            <strong>Topics:</strong> {course.topic}
          </p>
          <h5 className="font-bold mt-2">Chapters:</h5>
          {course.chapters.map((chapter) => (
            <p key={chapter._id} className="text-gray-700">
              • {chapter.content}
            </p>
          ))}
        </div>
      )}
      {children}
    </div>
  );
};

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 max-h-[80vh] overflow-y-auto">
      <h3 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
      <button
        onClick={onClose}
        className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-all"
      >
        Close
      </button>
    </div>
  </div>
);

export default Publish;
