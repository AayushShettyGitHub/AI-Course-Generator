import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../MainComponents/NavBar";
import Footer from "../MainComponents/Footer";
import axiosInstance from "../../utils/axiosInstance";
import { useUser } from "../../context/UserContext";
import { toast } from "react-hot-toast";

const CourseView = () => {
  const { user } = useUser();
  const [courses, setCourses] = useState([]);
  const [isCoursesLoading, setIsCoursesLoading] = useState(true);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?._id) {
      axiosInstance.get(`/api/getCourse/${user._id}`)
        .then((res) => {
          if (res.data && res.data.length > 0) {
            setCourses(res.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching courses:", error);
        })
        .finally(() => {
          setIsCoursesLoading(false);
        });
    }
  }, [user]);

  const handleGenerateCourse = (course) => {
    navigate("/viewlayout", { state: { course } });
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;
    try {
      const response = await axiosInstance.delete(`/api/deleteCourse/${courseToDelete}`);

      if (response.status === 200) {
        toast.success("Course Deleted Locally");
        const res = await axiosInstance.get(`/api/getCourse/${user?._id}`);
        setCourses(res.data || []);
        setCourseToDelete(null);
      } else {
        toast.error("Failed to delete course");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Error deleting course");
    }
  };

  if (isCoursesLoading) return <p className="text-center text-xl font-semibold mt-32">Loading...</p>;

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
                    onClick={() => setCourseToDelete(course._id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1-1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
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

        {courseToDelete && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center z-[110] p-6 animate-in fade-in duration-300">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-sm text-center animate-in zoom-in-95 duration-300 border border-slate-100">
              <div className="w-20 h-20 bg-error/10 text-error rounded-3xl flex items-center justify-center text-4xl mb-6 mx-auto">🗑️</div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Delete Path?</h3>
              <p className="text-slate-500 mb-8 text-sm">This will remove this private course from your learning dashboard. Any version you've published to the community will remain active.</p>
              <div className="flex gap-3">
                <button 
                  className="btn btn-ghost flex-1 rounded-2xl font-bold"
                  onClick={() => setCourseToDelete(null)}
                >
                  Keep It
                </button>
                <button 
                  className="btn btn-error flex-1 rounded-2xl font-bold text-white shadow-lg shadow-error/20"
                  onClick={confirmDeleteCourse}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CourseView;
