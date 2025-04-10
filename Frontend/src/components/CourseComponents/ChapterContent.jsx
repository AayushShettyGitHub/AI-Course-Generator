import React, { useState } from "react";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [showVideos, setShowVideos] = useState(false);

  const toggleSection = (index) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleVideos = () => setShowVideos((prev) => !prev);

  const generateContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "http://localhost:8082/api/geminiContent",
        { chapter },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      console.log(response.data)
      setGeneratedContent(Array.isArray(response.data.content) ? response.data.content : []);
      setGeneratedVideos(Array.isArray(response.data.videos) ? response.data.videos : []);
    } catch (err) {
      setError("Error generating content. Please try again.");
      console.error("Error generating content:", err);
    } finally {
      setLoading(false);
    }
  };

  const getEmbedUrl = (url) => {
    const videoId = url.split("v=")[1]?.split("&")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-[25vh]">
      <NavBar />
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-16 mb-20">
        <h1 className="text-3xl text-center font-bold text-gray-800 mb-6">{chapter.chapterName}</h1>
        <p className="text-gray-700 mt-2">{chapter.content}</p>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mt-6 transition-all"
          onClick={generateContent}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Detailed Content"}
        </button>
        {error && <p className="text-red-500 mt-4">{error}</p>}

       
        {generatedContent.length > 0 && (
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
                  <div className="mt-3">
                    <p className="text-gray-700">{item.explanation}</p>
                    {item.code?.trim() && (
                      <pre className="bg-gray-200 p-4 rounded-md mt-2 overflow-auto">
                        <code>{item.code}</code>
                      </pre>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}


        {generatedVideos.length > 0 && (
          <div className="mt-10">
            <button
              className="w-full flex justify-between items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all"
              onClick={toggleVideos}
            >
              {showVideos ? "Hide Videos" : "Show Videos"}
              {showVideos ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {showVideos && (
              <div className="mt-4">
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
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ChapterContent;
