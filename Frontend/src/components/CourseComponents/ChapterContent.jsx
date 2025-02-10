import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import NavBar from "../MainComponents/NavBar";
import Footer from "../MainComponents/Footer";

const ChapterContent = () => {
  const location = useLocation();
  const { chapter } = location.state;
  const [generatedContent, setGeneratedContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateContent = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(chapter);
      const response = await axios.post("http://localhost:8082/api/geminiContent", { chapter });

      // Ensure response is an array
      setGeneratedContent(Array.isArray(response.data.content) ? response.data.content : []);

    } catch (err) {
      setError("Error generating content. Please try again.");
      console.error("Error generating content:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <NavBar />
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-16 mb-20">
        <h1 className="text-3xl text-center font-bold text-gray-800 mb-6">
          {chapter.chapterName}
        </h1>
        <p className="text-gray-700 mt-2">{chapter.content}</p>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-6"
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
              <div key={index} className="p-4 border rounded-lg shadow-sm bg-gray-50 mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                <p className="text-gray-700 mt-2">{item.explanation}</p>
                {item.code && item.code.trim() !== "" && (
                  <pre className="bg-gray-200 p-4 rounded-md mt-2 overflow-auto">
                    <code>{item.code}</code>
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ChapterContent;
