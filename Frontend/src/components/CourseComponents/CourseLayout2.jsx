import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import NavBar from "../MainComponents/NavBar";
import Footer from "../MainComponents/Footer";
import config from "../../config";

const CourseLayout2 = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();


  const [course, setCourse] = useState(location.state?.course || null);
  const [loading, setLoading] = useState(!course);
  const [error, setError] = useState(null);

  const isPublished = location.state?.source === "publishedRes" || location.state?.source === "othersRes";
  const actualCourseId = course?._id;

  useEffect(() => {
    if (!course && courseId) {
      const endpoint = isPublished ? `/api/courses/mine` : `/api/getCourse/some-id`; // This logic might need refinement depending on how we fetch a single course by ID
      // Actually, let's keep it simple for now as it's usually passed via state
    }
  }, [course, courseId]);

  const handleChapterClick = (chapter) => {
    navigate("/viewcontent", { state: { chapter, courseId: actualCourseId, isPublished } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32">
        <NavBar />
        <div className="max-w-4xl mx-auto p-10 text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32">
        <NavBar />
        <div className="max-w-4xl mx-auto p-10">
          <div className="alert alert-error shadow-lg rounded-2xl">
            <span>{error}</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32">
        <NavBar />
        <div className="max-w-4xl mx-auto p-10 text-center">
          <h2 className="text-2xl font-bold text-slate-400">Course not found.</h2>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 overflow-hidden">
      <NavBar />
      <div className="max-w-5xl mx-auto p-10 bg-white shadow-xl rounded-[2.5rem] mb-20 border border-slate-100 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-12">
          <span className="bg-primary/10 text-primary text-xs font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-6 inline-block">
            Course Curriculum
          </span>
          <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">
            {course.courseName}
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed italic">
            "{course.description}"
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 p-8 bg-slate-50 rounded-3xl border border-slate-100">
          <div className="text-center">
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</span>
            <span className="font-bold text-slate-800">{course.category}</span>
          </div>
          <div className="text-center">
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Level</span>
            <span className="font-bold text-slate-800">{course.difficulty}</span>
          </div>
          <div className="text-center">
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Duration</span>
            <span className="font-bold text-slate-800">{course.duration} Hours</span>
          </div>
          <div className="text-center">
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Chapters</span>
            <span className="font-bold text-slate-800">{course.noOfChapters} Units</span>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <span className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center text-sm">↓</span>
            Learning Path
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {course.chapters.map((chapter, index) => (
              <div
                key={chapter._id || index}
                className="group p-8 border border-slate-100 rounded-3xl bg-white hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="text-primary font-black text-xs uppercase tracking-widest">Chapter 0{index + 1}</span>
                       <div className="h-px bg-slate-100 flex-1"></div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 group-hover:text-primary transition-colors">
                      {chapter.chapterName}
                    </h3>
                    <p className="text-slate-500 mt-3 text-sm leading-relaxed line-clamp-2 italic">
                      {chapter.content}
                    </p>
                  </div>
                  <button
                    className="btn btn-primary rounded-2xl px-8 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-xs font-black uppercase tracking-widest"
                    onClick={() => handleChapterClick(chapter)}
                  >
                    Dive In
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CourseLayout2;
