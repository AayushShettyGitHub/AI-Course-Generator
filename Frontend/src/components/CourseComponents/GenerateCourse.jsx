import { useState } from "react";
import axios from "axios";

function GenerateCourse({ onGenerate }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    category: "",
    topic: "",
    difficulty: "",
    duration: "",
    noOfChapters: "",
    videos: "", // Added videos field
  });

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else if (step === 2) {
      generate();
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const generate = async () => {
    try {
      console.log("Request Data:", formData);
   
      const response = await axios.post("http://localhost:8082/api/geminiLayout", formData);
      console.log("Response:", response.data);
      onGenerate();  // Trigger the layout rendering once the generation is complete
    } catch (error) {
      console.error("Error generating course:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-6 pt-28">
        {/* Steps Navigation */}
        <div className="flex justify-center mb-10">
          <ul className="steps steps-horizontal lg:steps-horizontal w-full max-w-3xl">
            <li className={`step ${step >= 0 ? "step-primary" : ""}`}>Category</li>
            <li className={`step ${step >= 1 ? "step-primary" : ""}`}>Topic</li>
            <li className={`step ${step >= 2 ? "step-primary" : ""}`}>Customize</li>
          </ul>
        </div>

        {/* Form Section */}
        <form className="bg-gray-100 p-6 rounded-lg shadow-md">
          {step === 0 && (
            <div>
              <label className="block mb-2 font-medium text-gray-700">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Enter Category"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          {step === 1 && (
            <div>
              <label className="block mb-2 font-medium text-gray-700">Topic</label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder="Enter Topic"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          {step === 2 && (
            <div>
              <label className="block mb-2 font-medium text-gray-700">Customize Options</label>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Difficulty</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Duration (in hours)</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="Enter Duration"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Number of Chapters</label>
                <input
                  type="number"
                  name="noOfChapters"
                  value={formData.noOfChapters}
                  onChange={handleChange}
                  placeholder="Enter Number of Chapters"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Add Videos (Optional)</label>
                <input
                  type="text"
                  name="videos"
                  value={formData.videos}
                  onChange={handleChange}
                  placeholder="Add Video URLs (comma-separated)"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </form>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            className={`btn btn-primary ${step === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handlePrev}
            disabled={step === 0}
          >
            Prev
          </button>
          <button className="btn btn-primary" onClick={handleNext}>
            {step === 2 ? "Generate" : "Next"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default GenerateCourse;
