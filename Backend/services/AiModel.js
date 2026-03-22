const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: { responseMimeType: "application/json" }
});
const youtubeKey = process.env.youtubeKey || process.env.YOUTUBE_API_KEY;


exports.generateLayout = async (req, res) => {
  try {
    const { category, topic, difficulty, duration, noOfChapters, description } = req.body;

    if (!category || !topic || !difficulty || !duration || !noOfChapters) {
      return res.status(400).json({
        message: "Please provide all required fields: category, topic, difficulty, duration, noOfChapters",
      });
    }

    const prompt = `
    Generate a course tutorial layout in strictly valid JSON format with the following details:
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
    
    ${description ? `Additional User Context for this course: "${description}"` : ""}

    IMPORTANT: 
    1. Your response MUST be a single valid JSON object.
    2. Do not include any markdown formatting like \`\`\`json.
    3. Ensure all special characters (newlines, quotes, backslashes) in strings are properly escaped as per JSON standards.
    `;

    const result = await model.generateContent(prompt);
    let responseText = await result.response.text();
    // Fallback for cases where markdown might still be present
    const responseText2 = responseText.replace(/```json|```/g, "").trim();

    try {
      const generatedLayout = JSON.parse(responseText2);
      res.status(200).json(generatedLayout);
    } catch (parseError) {
      console.error("Error parsing the generated layout:", parseError);
      res.status(500).json({
        message: "Failed to parse generated layout. The AI returned an invalid format.",
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

    const contentPrompt = `
    Provide a **highly detailed** and **comprehensive** explanation for the topic:  
    **Chapter: ${chapter.chapterName}**.  

    The core concept is:  
    **${chapter.content}**  

    Also, generate exactly **3 relevant keywords** for finding YouTube videos on this topic.
    
    RESPONSE REQUIREMENT:
    Return your response as a strictly valid JSON object. 
    Escape all special characters (especially backslashes in code snippets and double quotes) correctly.
    Do not use markdown code blocks.

    JSON Structure:
    {
      "content": [
        {
          "title": "A clear section title",
          "explanation": "A thorough and in-depth explanation",
          "code": "If applicable, provide fully formatted code. IMPORTANT: Escape backslashes as \\\\ and double quotes as \\\"."
        }
      ],
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }
    `;

    const contentResult = await model.generateContent(contentPrompt);
    let responseText = await contentResult.response.text();
    responseText = responseText.replace(/```json|```/g, "").trim();

    let generatedContent;
    try {
      generatedContent = JSON.parse(responseText);
      console.log("Generated Content:", generatedContent);
    } catch (parseError) {
      console.error("Error parsing AI model response:", parseError);
      return res.status(500).json({
        message: "Failed to parse generated content",
        error: parseError.message,
      });
    }


    let videoResults = [];
    if (generatedContent.keywords && generatedContent.keywords.length > 0) {
      for (const keyword of generatedContent.keywords) {
        const youtubeSearchUrl = `https://www.googleapis.com/youtube/v3/search?key=${youtubeKey}&q=${encodeURIComponent(
          keyword
        )}&type=video&part=snippet&maxResults=1`;

        try {
          const youtubeResponse = await axios.get(youtubeSearchUrl);
          if (youtubeResponse.data.items.length > 0) {
            const video = youtubeResponse.data.items[0];
            videoResults.push({
              videoTitle: video.snippet.title,
              videoUrl: `https://www.youtube.com/watch?v=${video.id.videoId}`,
            });
          }
        } catch (youtubeError) {
          console.error("YouTube API error:", youtubeError);
        }
      }
    }

    console.log(`Found ${videoResults.length} videos for keywords`);

    return res.status(200).json({

      content: generatedContent.content,
      videos: videoResults,
    });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({
      message: "Failed to generate content",
      error: error.message,
    });
  }
};