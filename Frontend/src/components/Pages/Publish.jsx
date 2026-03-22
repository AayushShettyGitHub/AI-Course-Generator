import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import NavBar from "../MainComponents/NavBar";
import Footer from "../MainComponents/Footer";
import config from "../../config";

const Publish = () => {
  const [user, setUser] = useState(null);
  const [publishedCourses, setPublishedCourses] = useState([]);
  const [unpublishedCourses, setUnpublishedCourses] = useState([]);
  const [otherCourses, setOtherCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("gallery"); // "gallery", "dashboard"
  const [filterCategory, setFilterCategory] = useState("");

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
    const socket = io(config.API_BASE_URL);
    const token = Cookies.get("jwt");
    if (!token) return setIsLoading(false);

    const decodedToken = decodeJWT(token);
    const userId = decodedToken?.userId;
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const userRes = await axios.get(`${config.API_BASE_URL}/api/getUser?id=${userId}`, { withCredentials: true });
        setUser(userRes.data);

        const publishedRes = await axios.get(`${config.API_BASE_URL}/api/courses/mine?userId=${userId}`, { withCredentials: true });
        setPublishedCourses(publishedRes.data || []);

        const otherRes = await axios.get(`${config.API_BASE_URL}/api/courses/others?userId=${userId}`, { withCredentials: true });
        setOtherCourses(otherRes.data || []);

        const unpublishedRes = await axios.get(`${config.API_BASE_URL}/api/getCourse/${userId}`, { withCredentials: true });
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
      } else {
        setOtherCourses((prev) => [...prev, newCourse]);
      }
    });

    return () => socket.off("coursePublished");
  }, []);

  const handleRateCourse = async (courseId, rating) => {
    try {
      const response = await axios.post(`${config.API_BASE_URL}/api/courses/rate`, {
        courseId,
        userId: user._id,
        rating
      }, { withCredentials: true });
      
      const { averageRating } = response.data;
      setOtherCourses(prev => prev.map(c => c._id === courseId ? { ...c, averageRating } : c));
      alert("Thanks for rating!");
    } catch (error) {
      alert(error.response?.data?.message || "Error rating course");
    }
  };

  const handleIncrementViews = async (courseId) => {
    try {
      await axios.post(`${config.API_BASE_URL}/api/courses/view`, { courseId }, { withCredentials: true });
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
  };

  const handlePublishCourse = async (course) => {
    if (!course) return;

    // Check if all chapters have detailed content
    const allGenerated = course.chapters.every(ch => ch.detailedContent && ch.detailedContent.length > 0);
    if (!allGenerated) {
      alert("⚠️ You must generate detailed content for ALL chapters before publishing. Go to your courses and complete the learning path first!");
      return;
    }

    try {
      const requestData = {
        userId: user._id,
        courseName: course.courseName,
        category: course.category,
        description: course.description,
        difficulty: course.difficulty,
        duration: course.duration,
        noOfChapters: course.noOfChapters,
        topic: course.topic,
        chapters: course.chapters,
      };

      const response = await axios.post(`${config.API_BASE_URL}/api/courses/add`, requestData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (response.status === 201) {
        setShowPublishModal(false);
        alert("🎉 Course published to the community gallery!");
        setPublishedCourses(prev => [...prev, response.data.course]);
        setUnpublishedCourses(prev => prev.filter(c => c._id !== course._id));
      }
    } catch (error) {
      console.error("Error publishing course:", error);
      alert(error.response?.data?.message || "Error publishing course");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course from the community gallery?")) return;
    try {
      await axios.delete(`${config.API_BASE_URL}/api/courses/delete/${courseId}`, { withCredentials: true });
      setPublishedCourses(prev => prev.filter(c => c._id !== courseId));
    } catch (error) {
       console.error(error);
    }
  };

  const filteredOtherCourses = otherCourses.filter(course => 
    course.category?.toLowerCase().includes(filterCategory.toLowerCase())
  );

  const filteredPublishedCourses = publishedCourses.filter(course => 
    course.category?.toLowerCase().includes(filterCategory.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="container mx-auto px-6 pt-32 pb-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <h2 className="text-5xl font-[1000] text-slate-900 mb-3 tracking-tighter">
              The <span className="text-primary italic">Coursify</span> Hub.
            </h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-xl">
              Discover, rate, and share high-quality AI courses crafted by a global community of learners.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-right duration-700">
            {/* Search Input */}
            <div className="relative group">
              <input 
                type="text"
                placeholder="Search Category..."
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input input-lg bg-slate-200/50 border-none rounded-2xl w-full sm:w-64 pl-12 font-bold placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="tabs tabs-boxed bg-slate-200/50 p-1.5 rounded-[1.5rem] gap-1 self-start">
              <button 
                className={`tab tab-lg font-black transition-all rounded-2xl ${activeTab === "gallery" ? "tab-active bg-white text-primary shadow-sm" : "text-slate-500"}`}
                onClick={() => setActiveTab("gallery")}
              >
                Gallery
              </button>
              <button 
                className={`tab tab-lg font-black transition-all rounded-2xl ${activeTab === "dashboard" ? "tab-active bg-white text-primary shadow-sm" : "text-slate-500"}`}
                onClick={() => setActiveTab("dashboard")}
              >
                My Dashboard
              </button>
            </div>
            
            <button
              onClick={() => setShowPublishModal(true)}
              className="btn btn-primary btn-lg rounded-[1.5rem] shadow-2xl shadow-primary/30 h-16 px-10 border-none hover:scale-105 active:scale-95 transition-all font-black uppercase tracking-widest text-xs"
            >
              <span className="text-xl mr-2">+</span>
              New Publish
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-50">
            <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Curating Hub...</p>
          </div>
        ) : activeTab === "gallery" ? (
          <CourseSection
            title="Community Gallery"
            courses={filteredOtherCourses}
            expandedCourse={expandedCourse}
            setExpandedCourse={setExpandedCourse}
            handleRate={handleRateCourse}
            handleView={handleIncrementViews}
            currentUser={user}
            isMine={false}
          />
        ) : (
          <CourseSection
            title="My Published Content"
            courses={filteredPublishedCourses}
            expandedCourse={expandedCourse}
            setExpandedCourse={setExpandedCourse}
            handleDeleteCourse={handleDeleteCourse}
            currentUser={user}
            isMine={true}
          />
        )}

        {showPublishModal && (
          <Modal title="Choose Course to Share" onClose={() => setShowPublishModal(false)}>
            {unpublishedCourses.length === 0 ? (
              <div className="text-center py-20 px-6">
                <div className="text-slate-100 text-8xl mb-6">🏜️</div>
                <h3 className="text-xl font-black text-slate-800 mb-2">Workspace Empty</h3>
                <p className="text-slate-400 mb-10 text-sm leading-relaxed">You haven't generated any private courses yet. Create one building your first path.</p>
                <button 
                  className="btn btn-primary btn-block h-16 rounded-3xl font-black"
                  onClick={() => navigate("/generatepage")}
                >
                  Start Creating Now
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar p-2">
                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4 px-2">Your Private Drafts</div>
                {unpublishedCourses.map((course) => (
                  <div key={course._id} className="p-6 border border-slate-100 rounded-[2rem] bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-black text-slate-800 text-lg group-hover:text-primary transition-colors">{course.courseName}</h4>
                       <span className="text-[10px] bg-primary/10 text-primary font-black px-3 py-1 rounded-full uppercase">{course.category}</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-6 italic leading-relaxed">"{course.description}"</p>
                    <button
                      onClick={() => handlePublishCourse(course)}
                      className="btn btn-primary btn-md btn-block rounded-2xl shadow-lg shadow-primary/10 font-black uppercase text-[10px] tracking-widest"
                    >
                      Go Public
                    </button>
                  </div>
                ))}
              </div>
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
  handleRate,
  handleView,
  currentUser,
  isMine,
}) => (
  <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
    {courses.length === 0 ? (
      <div className="py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-center shadow-inner">
        <div className="text-slate-200 text-7xl mb-4">📭</div>
        <p className="text-slate-300 font-black uppercase tracking-widest text-xs">Wow, such empty.</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {courses.map((course, index) => (
          <CourseCard
            key={course._id || index}
            course={course}
            expandedCourse={expandedCourse}
            setExpandedCourse={setExpandedCourse}
            handleDeleteCourse={handleDeleteCourse}
            handleRate={handleRate}
            handleView={handleView}
            currentUser={currentUser}
            isMine={isMine}
          />
        ))}
      </div>
    )}
  </section>
);

const CourseCard = ({
  course,
  expandedCourse,
  setExpandedCourse,
  handleDeleteCourse,
  handleRate,
  handleView,
  currentUser,
  isMine = false,
}) => {
  const navigate = useNavigate();

  const handleViewCourse = () => {
    if (handleView) handleView(course._id);
    navigate("/viewlayout", { state: { course, source: isMine ? "publishedRes" : "othersRes" } });
  };

  const isExpanded = expandedCourse === course._id;

  return (
    <div className="group bg-white p-10 rounded-[3rem] shadow-sm hover:shadow-2xl border border-slate-100 transition-all duration-500 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 flex flex-col items-end pointer-events-none">
        <div className="text-[10px] font-black text-slate-200 leading-none mb-1">VIEWS</div>
        <div className="text-xl font-black text-slate-100 leading-none">{course.views || 0}</div>
      </div>

      <div className="mb-8">
        <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-6 inline-block">
          {course.category}
        </span>
        <h4 className="text-3xl font-black text-slate-900 mb-4 group-hover:text-primary transition-colors leading-none tracking-tighter italic">
          {course.courseName}
        </h4>
        
        {/* Creator Info */}
        <div className="flex items-center gap-3 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
            {course.userId?.name?.[0] || "?"}
          </div>
          <div>
            <div className="text-[8px] font-black text-slate-300 uppercase">Creator</div>
            <div className="text-[10px] font-bold text-slate-600 line-clamp-1">{course.userId?.name || "Anonymous"}</div>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <p className="text-slate-400 text-sm mb-10 leading-relaxed line-clamp-3 italic font-medium">
          "{course.description}"
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Rating Stars UI */}
        <div className="flex items-center justify-between px-4 py-2 border border-slate-100 rounded-2xl mb-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                disabled={isMine}
                onClick={() => handleRate && handleRate(course._id, s)}
                className={`text-lg transition-all ${s <= (course.averageRating || 0) ? "text-yellow-400" : "text-slate-100"}`}
              >
                ★
              </button>
            ))}
          </div>
          <span className="text-[10px] font-black text-slate-300 uppercase">
             {course.averageRating?.toFixed(1) || "0.0"} / 5.0
          </span>
        </div>

        <button
          className="btn btn-primary btn-lg rounded-2xl shadow-xl shadow-primary/20 h-16 font-black uppercase tracking-widest text-[10px]"
          onClick={handleViewCourse}
        >
          Explore Pathway
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => setExpandedCourse(isExpanded ? null : course._id)}
            className="btn btn-ghost btn-sm flex-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-all rounded-xl"
          >
            {isExpanded ? "Collapse" : "Curriculum"}
          </button>

          {isMine && (
            <button
              onClick={() => handleDeleteCourse(course._id)}
              className="btn btn-ghost btn-sm text-error/30 hover:text-error hover:bg-error/10 transition-all rounded-xl"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-8 pt-8 border-t border-slate-50 animate-in slide-in-from-top-4 duration-500">
          <div className="grid grid-cols-2 gap-6 mb-8 text-[10px] font-black uppercase tracking-widest">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <span className="block text-slate-300 mb-1">Level</span>
              <span className="text-slate-800">{course.difficulty}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <span className="block text-slate-300 mb-1">Time</span>
              <span className="text-slate-800">{course.duration}H</span>
            </div>
          </div>
          
          <h5 className="font-black text-slate-900 text-[10px] uppercase tracking-widest mb-4 px-2">Knowledge Graph</h5>
          <div className="space-y-3 px-2">
            {course.chapters.slice(0, 5).map((chapter, idx) => (
              <div key={chapter._id || idx} className="flex gap-4 text-xs font-bold text-slate-500 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/30"></span>
                <span className="line-clamp-1">{chapter.chapterName}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center z-[100] p-6 animate-in fade-in duration-500">
    <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl w-full max-w-xl animate-in zoom-in-95 duration-500 border border-white/20">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-3xl font-[1000] text-slate-900 tracking-tighter italic">{title}</h3>
        <button 
          onClick={onClose}
          className="btn btn-ghost btn-circle text-slate-300 hover:text-error hover:bg-error/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default Publish;
