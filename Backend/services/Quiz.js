const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });


exports.generateQuiz = async (req, res) => {
  try {
    const { topic, difficulty, noOfQuestions } = req.body;

    if (!topic || !difficulty || !noOfQuestions) {
      return res.status(400).json({
        message: "Please provide all required fields: topic, difficulty, noOfQuestions",
      });
    }

    const prompt = `
    Generate a quiz in JSON format for the topic "${topic}" with difficulty "${difficulty}".
    The quiz should contain exactly ${noOfQuestions} questions. Each question should have:
    - "question": The question text
    - "options": An array of 4 options
    - "answer": The correct option (must match one of the options)

    Ensure the JSON is strictly valid and looks like this:
    {
      "quiz": [
        {
          "question": "Question text",
          "options": ["option1", "option2", "option3", "option4"],
          "answer": "option1"
        }
      ]
    }
    `;

    const result = await model.generateContent(prompt);
    let responseText = await result.response.text();
    responseText = responseText.replace(/```json|```/g, "").trim();

    let generatedQuiz;
    try {
      generatedQuiz = JSON.parse(responseText);
      res.status(200).json(generatedQuiz);
    } catch (parseError) {
      console.error("Error parsing generated quiz:", parseError);
      res.status(500).json({
        message: "Failed to parse generated quiz",
        error: parseError.message,
      });
    }

  } catch (error) {
    console.error("Error generating quiz:", error);
    res.status(500).json({
      message: "Failed to generate quiz",
      error: error.message,
    });
  }
};
