const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY; 
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

exports.generateLayout = async (req, res) => {
  try {
    const { category, topic, difficulty, duration, noOfChapters } = req.body;

   
    if (!category || !topic || !difficulty || !duration || !noOfChapters) {
      return res.status(400).json({
        message: "Please provide all required fields: category, topic, difficulty, duration, noOfChapters",
      });
    }

    
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

   
    const result = await model.generateContent(prompt);
    console.log(result)

   
    let responseText = await result.response.text();
    console.log("The ans:")
    console.log(responseText)

    
    responseText = responseText.replace(/```json|```|`/g, '').trim();

   
    try {
      const generatedLayout = JSON.parse(responseText);

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

exports.generateContent = async (req, res) => {
  try {
    const { chapter } = req.body;

    if (!chapter) {
      return res.status(400).json({ message: "Please provide a chapter to generate content" });
    }

    const prompt = `
      Provide a **highly detailed** and **comprehensive** explanation for the topic:  
      **Chapter: ${chapter.chapterName}**.  
      
      The core concept is:  
      **${chapter.content}**  
      
      The response should:
      - Explain the topic **from fundamental principles to advanced concepts**.
      - Include **historical context, real-world applications, and use cases**.
      - Provide **technical details, mathematical formulations (if applicable), and step-by-step explanations**.
      - Break down complex topics into **clear, structured sections**.
      - **Compare** this concept with similar or related concepts.
      - If applicable, include **common misconceptions, pitfalls, and best practices**.
      - Use simple analogies when necessary to enhance understanding.
      - If code examples are relevant, provide **fully functional** and **well-documented** code snippets.
      - Ensure examples include **expected outputs**.
      
      **Response Format:**  
      Return the response **strictly in JSON format** as an array of objects,  
      where each object contains the following fields:
      - **title** (A clear section title)
      - **explanation** (A thorough and in-depth explanation)
      - **code** (If applicable, provide fully formatted code, without using <precode> tags)
    `;

    const result = await model.generateContent(prompt);
    responseText = await result.response.text();
    
    responseText = responseText.replace(/```json|```|`/g, '').trim();
    console.log(responseText);

    let content;
    try {
      content = JSON.parse(responseText);
      console.log(content);
    } catch (parseError) {
      console.error("Error parsing AI model response:", parseError);
      return res.status(500).json({ message: "Failed to parse generated content", error: parseError.message });
    }

    res.status(200).json({ content });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ message: "Failed to generate content", error: error.message });
  }
};



