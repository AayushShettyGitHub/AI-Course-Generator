import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "../MainComponents/NavBar";
import Footer from "../MainComponents/Footer";
import { ChevronDown, ChevronUp } from "lucide-react";
import config from "../../config";

const ChapterContent = () => {
  const location = useLocation();
  const { chapter, courseId, isPublished } = location.state || {};
  const navigate = useNavigate();

  const [generatedContent, setGeneratedContent] = useState([]);
  const [generatedVideos, setGeneratedVideos] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [activeTab, setActiveTab] = useState("content"); // "content", "videos", "quiz"

  useEffect(() => {
    if (chapter?.detailedContent?.length > 0) {
      setGeneratedContent(chapter.detailedContent);
    }
    if (chapter?.videos?.length > 0) {
      setGeneratedVideos(chapter.videos);
    }
  }, [chapter]);

  const handleExit = () => {
    navigate(-1);
  };

  const generateContent = async () => {
    // If already generated, don't call API again (except for Quiz as per user request)
    if (generatedContent.length > 0) {
      setActiveTab("content");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${config.API_BASE_URL}/api/geminiContent`,
        { chapter },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );
      
      const newContent = Array.isArray(response.data.content) ? response.data.content : [];
      const newVideos = Array.isArray(response.data.videos) ? response.data.videos : [];
      
      setGeneratedContent(newContent);
      setGeneratedVideos(newVideos);
      setActiveTab("content");

      // SAVE to Database
      if (courseId && chapter?._id) {
        const updateEndpoint = isPublished 
          ? `${config.API_BASE_URL}/api/courses/updateChapter` 
          : `${config.API_BASE_URL}/api/updateChapter`;
        
        await axios.post(updateEndpoint, {
          courseId,
          chapterId: chapter._id,
          detailedContent: newContent,
          videos: newVideos
        }, { withCredentials: true });
      }

    } catch (err) {
      setError("Error generating content. Please try again.");
      console.error("Error generating content:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${config.API_BASE_URL}/api/quiz`,
        { topic: chapter.chapterName, difficulty: "medium", noOfQuestions: 5 },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );
      setQuizQuestions(Array.isArray(response.data.quiz) ? response.data.quiz : []);
      setSelectedOptions({});
      setQuizCompleted(false);
      setActiveTab("quiz");
    } catch (err) {
      setError("Error generating quiz. Please try again.");
      console.error("Error generating quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (qIndex, option) => {
    setSelectedOptions((prev) => ({ ...prev, [qIndex]: option }));
    // Check if all questions are answered
    if (Object.keys(selectedOptions).length + 1 === quizQuestions.length) {
      setQuizCompleted(true);
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return "";
    let videoId = "";
    if (url.includes("v=")) {
      videoId = url.split("v=")[1]?.split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };


  // Format chapter content dynamically: paragraphs, bullets, bold (**text**)
  const renderChapterContent = () => {
    if (!chapter || !chapter.content) return <p className="text-slate-400 italic">No summary available.</p>;
    return chapter.content
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line, idx) => {
        const isBullet = line.trim().startsWith("-") || line.trim().startsWith("*");
        const formattedLine = line.replace(/\*\*(.*?)\*\*/g, (_, p1) => `<strong>${p1}</strong>`);
        if (isBullet) {
          return (
            <li
              key={idx}
              className="text-gray-700 leading-relaxed list-disc list-inside"
              dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[-*]\s*/, "") }}
            />
          );
        } else {
          return (
            <p
              key={idx}
              className="text-gray-700 mt-4 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formattedLine }}
            />
          );
        }
      });
  };

  // Compute quiz score
  const computeScore = () => {
    let score = 0;
    quizQuestions.forEach((q, i) => {
      if (selectedOptions[i] === q.answer) score++;
    });
    return score;
  };

  const toggleSection = (index) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (!chapter) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-10">
        <div className="text-center p-12 bg-white rounded-3xl shadow-xl border border-slate-100 max-w-sm">
           <div className="text-primary text-5xl mb-6">⚠️</div>
           <h3 className="text-2xl font-black text-slate-800 mb-2">No Content</h3>
           <p className="text-slate-500 mb-8">This chapter data is missing. Please go back and try again.</p>
           <button onClick={() => navigate("/")} className="btn btn-primary btn-block">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-[15vh]">
      <NavBar />
      <div className="max-w-4xl mx-auto p-10 bg-white shadow-xl rounded-3xl mt-16 mb-20 border border-slate-100 animate-in fade-in duration-700">
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={handleExit}
            className="btn btn-ghost btn-sm text-slate-400 hover:text-primary gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Path
          </button>
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
            {isPublished ? "Public Course" : "Private Draft"}
          </div>
        </div>
        
        <h1 className="text-4xl text-center font-extrabold text-slate-900 mb-8 tracking-tight">{chapter.chapterName}</h1>

        {/* Chapter content */}
        <div className="prose prose-slate max-w-none mb-10 text-slate-700 leading-relaxed">
          {renderChapterContent()}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-6 border-t border-slate-100 pt-8 mt-10">
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
            <button
              className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${activeTab === "content" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              onClick={() => setActiveTab("content")}
            >
              Content
            </button>
            <button
              className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${activeTab === "videos" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              onClick={() => setActiveTab("videos")}
            >
              Videos
            </button>
            <button
              className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${activeTab === "quiz" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              onClick={generateQuiz}
              disabled={loading}
            >
              {loading && activeTab === "quiz" ? <span className="loading loading-spinner loading-xs"></span> : "Quiz"}
            </button>
          </div>

          <button
            className={`btn rounded-xl shadow-lg px-8 transition-all ${generatedContent.length > 0 ? "btn-ghost text-primary hover:bg-primary/5" : "btn-primary shadow-primary/20"}`}
            onClick={generateContent}
            disabled={loading}
          >
            {loading && activeTab === "content" ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : generatedContent.length > 0 ? "Content Loaded" : "Generate Detailed Content"}
          </button>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-error/10 text-error rounded-xl border border-error/20 text-sm">
            {error}
          </div>
        )}

        {/* Content Tab */}
        {activeTab === "content" && generatedContent.length > 0 && (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-3">Generated Content</h2>
            {generatedContent.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg shadow-sm bg-gray-50 mb-4 transition-all">
                <button
                  className="w-full flex justify-between items-center text-lg font-semibold text-gray-800 focus:outline-none"
                  onClick={() => toggleSection(index)}
                >
                  {item.title}
                  {openSections[index] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {openSections[index] && (
                  <div className="mt-3 prose max-w-none">
                    {item.explanation.split("\n").map((line, lIdx) => {
                      const trimmedLine = line.trim();
                      if (trimmedLine.startsWith("###")) {
                        return <h3 key={lIdx} className="text-xl font-bold mt-4 mb-2 text-gray-800">{trimmedLine.replace(/^###\s*/, "")}</h3>;
                      }
                      const isBullet = trimmedLine.startsWith("-") || trimmedLine.startsWith("*");
                      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, (_, p1) => `<strong>${p1}</strong>`);

                      if (isBullet) {
                        return (
                          <li
                            key={lIdx}
                            className="text-gray-700 leading-relaxed list-disc list-inside ml-2"
                            dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[-*]\s*/, "") }}
                          />
                        );
                      }
                      return (
                        <p
                          key={lIdx}
                          className="text-gray-700 mt-2 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: formattedLine }}
                        />
                      );
                    })}
                    {item.code?.trim() && (
                      <div className="relative group">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-md mt-4 overflow-auto text-sm shadow-inner">
                          <code>{item.code}</code>
                        </pre>
                        <button
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white text-xs px-2 py-1 rounded"
                          onClick={() => navigator.clipboard.writeText(item.code)}
                        >
                          Copy
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === "videos" && generatedVideos.length > 0 && (
          <div className="mt-6">
            {generatedVideos.map((video, index) => (
              <div key={index} className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800">{video.videoTitle}</h3>
                <iframe
                  className="w-full h-64 rounded-lg mt-2 border border-gray-300"
                  src={getEmbedUrl(video.videoUrl)}
                  title={video.videoTitle}
                  allowFullScreen
                ></iframe>
              </div>
            ))}
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === "quiz" && quizQuestions.length > 0 && (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-3">Quiz</h2>
            {quizQuestions.map((q, index) => {
              const selected = selectedOptions[index];
              return (
                <div key={index} className="p-6 border border-slate-100 rounded-2xl shadow-sm bg-slate-50/50 mb-6 transition-all hover:bg-slate-50">
                  <p className="font-bold text-slate-800 text-lg mb-4">{index + 1}. {q.question}</p>
                  <ul className="grid grid-cols-1 gap-3">
                    {q.options.map((opt, i) => {
                      const isSelected = selected === opt;
                      const isCorrect = selected && opt === q.answer;
                      const isWrong = selected && isSelected && opt !== q.answer;

                      return (
                        <li
                          key={i}
                          className={`cursor-pointer p-4 rounded-xl border transition-all font-medium ${
                            isCorrect 
                              ? "bg-success/10 border-success text-success shadow-sm shadow-success/10" 
                              : isWrong 
                                ? "bg-error/10 border-error text-error shadow-sm shadow-error/10" 
                                : isSelected 
                                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                                  : "bg-white border-slate-200 text-slate-600 hover:border-primary/50 hover:bg-slate-50"
                          }`}
                          onClick={() => !selected && handleOptionSelect(index, opt)}
                        >
                          {opt}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}

            {/* Score and Retry */}
            {quizCompleted && (
              <div className="mt-10 p-8 rounded-3xl bg-primary/5 border border-primary/10 text-center animate-in zoom-in duration-500">
                <div className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Quiz Completed</div>
                <p className="text-3xl font-extrabold text-slate-900 mb-6">
                  You scored <span className="text-primary italic">{computeScore()}</span> / {quizQuestions.length}
                </p>
                <button
                  className="btn btn-primary px-10 rounded-xl shadow-lg shadow-primary/20"
                  onClick={generateQuiz}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ChapterContent;
