const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY; // Ensure the API key is set in your environment variables
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

exports.generateLayout = async (req, res) => {
  try {
    const { category, topic, difficulty, duration, noOfChapters } = req.body;

    // Validate required fields
    if (!category || !topic || !difficulty || !duration || !noOfChapters) {
      return res.status(400).json({
        message: "Please provide all required fields: category, topic, difficulty, duration, noOfChapters",
      });
    }

    // Create a clear and concise prompt
    const prompt = `
    Generate a course tutorial layout in JSON format with the following details:
{
  "courseName": "Provide a suitable course name",
  "description": "Provide a detailed course description",
  "category": "${category}",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "duration": "${duration}",
  "noOfChapters": "${noOfChapters}",
  "chapters": [
    {
      "chapterNumber": 1,
      "chapterName": "Provide a chapter name",
      "content": "Detailed content for the chapter"
    }
  ]
}
Please ensure that:
1. All strings are enclosed in double quotes.
2. No comments are included in the JSON.
3. The format strictly adheres to valid JSON syntax.
4. Each chapter includes a chapter number, name, and content.`

    // Generate the content using model
    const result = await model.generateContent(prompt);
    console.log(result)

    // Get the raw response text
    let responseText = await result.response.text();
    console.log("The ans:")
    console.log(responseText)

    // Clean up unwanted characters like ```json or extra backticks
    responseText = responseText.replace(/```json|```|`/g, '').trim();

    // Ensure the response is valid JSON
    try {
      const generatedLayout = JSON.parse(responseText);

      // Return the parsed JSON response
      res.status(200).json(generatedLayout);
    } catch (parseError) {
      console.error("Error parsing the generated layout:", parseError);
      res.status(500).json({
        message: "Failed to parse generated layout",
        error: parseError.message,
      });
    }
  } catch (error) {
    console.error("Error generating layout:", error);
    res.status(500).json({
      message: "Failed to generate layout",
      error: error.message,
    });
  }
};


