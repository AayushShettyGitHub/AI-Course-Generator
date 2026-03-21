import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../config";

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
      await axios.post(`${config.API_BASE_URL}/api/saveCourse`, courseData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });


      localStorage.removeItem("courseData");
      localStorage.setItem("showLayout", "false");

      navigate("/viewcourse");
    } catch (error) {
      console.error("Error saving course:", error);
    }
  };

  const handleDiscard = () => {
    localStorage.removeItem("courseData");
    localStorage.setItem("showLayout", "false");
    window.location.reload(); // Simplest way to reset the page state in this structure
  };

  if (!courseData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-32">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-5xl mx-auto p-10 bg-white shadow-2xl rounded-[3rem] border border-slate-100 animate-in fade-in slide-in-from-bottom-10 duration-700">
        <div className="text-center mb-12">
          <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full mb-6 inline-block">
            Preview Curriculum
          </span>
          <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight italic">
            {courseData.courseName}
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
            "{courseData.description}"
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 p-8 bg-slate-50 rounded-3xl border border-slate-100">
          <div className="text-center">
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</span>
            <span className="font-bold text-slate-800">{courseData.category}</span>
          </div>
          <div className="text-center">
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Difficulty</span>
            <span className="font-bold text-slate-800">{courseData.difficulty}</span>
          </div>
          <div className="text-center">
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Est. Time</span>
            <span className="font-bold text-slate-800">{courseData.duration} Hours</span>
          </div>
          <div className="text-center">
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Structure</span>
            <span className="font-bold text-slate-800">{courseData.noOfChapters} Units</span>
          </div>
        </div>

        <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
          <span className="w-8 h-8 bg-primary/20 text-primary rounded-lg flex items-center justify-center text-sm font-black">L</span>
          Generated Layout
        </h2>
        
        <div className="space-y-4 mb-12">
          {courseData.chapters.map((chapter) => (
            <div 
              key={chapter.chapterNumber} 
              className="p-6 border border-slate-100 rounded-2xl bg-white hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group"
            >
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors flex items-center gap-4">
                <span className="text-slate-300 font-black text-xs">U{chapter.chapterNumber}</span>
                {chapter.chapterName}
              </h3>
              <p className="text-slate-500 mt-2 text-sm italic leading-relaxed">
                {chapter.content}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center items-center border-t border-slate-100 pt-10">
          <button 
            className="btn btn-primary btn-lg rounded-2xl px-12 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all w-full md:w-auto font-black uppercase tracking-widest text-xs" 
            onClick={saveCourse}
          >
            Confirm & Save Course
          </button>
          <button
            className="btn btn-ghost text-error hover:bg-error/10 hover:text-error rounded-2xl px-12 w-full md:w-auto font-black uppercase tracking-widest text-xs"
            onClick={handleDiscard}
          >
            Discard Draft
          </button>
        </div>
      </div>
    </div>
  );
};

export default Layout;
