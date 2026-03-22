import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import config from "../../config";

const decodeJWT = (token) => {
  const payload = token.split('.')[1];
  const decodedPayload = atob(payload);
  return JSON.parse(decodedPayload);
};

function GenerateCourse({ onGenerate }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    category: "",
    topic: "",
    difficulty: "",
    duration: "",
    noOfChapters: "",
    videos: "", 
    description: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);

 
  useEffect(() => {
    const token = Cookies.get("jwt");

    if (token) {
      try {
        const decodedToken = decodeJWT(token);
        const userId = decodedToken?.userId;
        setUserId(userId); 
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      console.error("No JWT found in cookies");
    }
    setIsLoading(false); 
  }, []);

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

      const finalFormData = { ...formData, userId };
  
      console.log("Request Data:", finalFormData);
  
      const response = await axios.post(`${config.API_BASE_URL}/api/geminiLayout`, finalFormData,{
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      
      
      const courseDataWithUserId = { ...response.data, userId };
  
   
      localStorage.setItem("courseData", JSON.stringify(courseDataWithUserId));
      console.log("Response:", response.data);
  
      onGenerate();
    } catch (error) {
      console.error("Error generating course:", error);
    }
  };
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-6 pt-28">
        <div className="flex justify-center mb-12">
          <ul className="steps w-full max-w-4xl">
            <li className={`step ${step >= 0 ? "step-primary font-bold" : "text-gray-400"}`}>Category</li>
            <li className={`step ${step >= 1 ? "step-primary font-bold" : "text-gray-400"}`}>Topic</li>
            <li className={`step ${step >= 2 ? "step-primary font-bold" : "text-gray-400"}`}>Customize</li>
          </ul>
        </div>

        <div className="max-w-3xl mx-auto">
          <form className="bg-white p-10 rounded-2xl shadow-xl border border-slate-50 transition-all">
            {step === 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <label className="block mb-3 text-lg font-semibold text-slate-800">What category does your course fall into?</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Technology, Design, Business"
                  className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 border-slate-200 transition-all"
                />
              </div>
            )}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <label className="block mb-3 text-lg font-semibold text-slate-800">What specific topic do you want to master?</label>
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  placeholder="e.g. React.js for Beginners, Advanced Physics"
                  className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 border-slate-200 transition-all"
                />
              </div>
            )}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                <label className="block mb-2 text-lg font-semibold text-slate-800">Customization</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-2">Difficulty Level</label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleChange}
                      className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 border-slate-200 transition-all bg-white"
                    >
                      <option value="">Select Level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-2">Duration (Total Hours)</label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      placeholder="e.g. 10"
                      className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 border-slate-200 transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-500 mb-2">Number of Chapters</label>
                    <input
                      type="number"
                      name="noOfChapters"
                      value={formData.noOfChapters}
                      onChange={handleChange}
                      placeholder="e.g. 5"
                      className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 border-slate-200 transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-500 mb-2">Course Description (Optional)</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Tell us more about what you want to learn... (e.g. Focus on practical examples, avoid deep math, etc.)"
                      className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 border-slate-200 transition-all h-32 resize-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </form>

          <div className="flex justify-between items-center mt-10">
            <button
              className={`btn btn-ghost px-8 rounded-xl ${step === 0 ? "opacity-0 invisible" : ""}`}
              onClick={handlePrev}
              disabled={step === 0}
            >
              Previous
            </button>
            <button 
              className="btn btn-primary btn-lg px-12 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all" 
              onClick={handleNext}
            >
              {step === 2 ? "Generate Course" : "Continue"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default GenerateCourse;
