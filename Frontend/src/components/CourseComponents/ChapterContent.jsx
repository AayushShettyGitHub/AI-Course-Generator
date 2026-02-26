import { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import NavBar from "../MainComponents/NavBar";
import Footer from "../MainComponents/Footer";
import { ChevronDown, ChevronUp } from "lucide-react";

const ChapterContent = () => {
  const location = useLocation();
  const { chapter } = location.state;
  console.log("Chapter received:", chapter);

  const [generatedContent, setGeneratedContent] = useState([]);
  const [generatedVideos, setGeneratedVideos] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [activeTab, setActiveTab] = useState("content"); // "content", "videos", "quiz"

  const toggleSection = (index) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const generateContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "http://localhost:8082/api/geminiContent",
        { chapter },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );
      setGeneratedContent(Array.isArray(response.data.content) ? response.data.content : []);
      setGeneratedVideos(Array.isArray(response.data.videos) ? response.data.videos : []);
      setActiveTab("content");
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
        "http://localhost:8082/api/quiz",
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

  return (
    <div className="min-h-screen bg-gray-100 pt-[25vh]">
      <NavBar />
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-16 mb-20">
        <h1 className="text-3xl text-center font-bold text-gray-800 mb-6">{chapter.chapterName}</h1>

        {/* Chapter content */}
        {renderChapterContent()}

        {/* Generate Detailed Content Button */}
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mt-6 transition-all"
          onClick={generateContent}
          disabled={loading}
        >
          {loading && activeTab === "content" ? "Generating..." : "Generate Detailed Content"}
        </button>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        {/* Tabs */}
        <div className="flex gap-4 mt-6">
          <button
            className={`px-4 py-2 rounded-lg ${activeTab === "content" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setActiveTab("content")}
          >
            Content
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${activeTab === "videos" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setActiveTab("videos")}
          >
            Videos
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${activeTab === "quiz" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={generateQuiz}
            disabled={loading}
          >
            {loading && activeTab === "quiz" ? "Generating..." : "Quiz"}
          </button>
        </div>

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
                <div key={index} className="p-4 border rounded-lg shadow-sm bg-gray-50 mb-4">
                  <p className="font-semibold text-gray-800">{index + 1}. {q.question}</p>
                  <ul className="mt-2 list-disc list-inside">
                    {q.options.map((opt, i) => {
                      const isSelected = selected === opt;
                      const isCorrect = selected && opt === q.answer;
                      const isWrong = selected && isSelected && opt !== q.answer;

                      return (
                        <li
                          key={i}
                          className={`text-gray-700 cursor-pointer p-1 rounded-md ${isCorrect ? "bg-green-200" : isWrong ? "bg-red-200" : "hover:bg-gray-200"
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
              <div className="mt-4 p-4 border rounded-lg bg-gray-100">
                <p className="font-semibold text-gray-800">
                  You scored {computeScore()} / {quizQuestions.length}
                </p>
                <button
                  className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                  onClick={generateQuiz}
                >
                  Retry Quiz
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
