const ATS = require('../models/atsModel');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const pdfParse = require('pdf-parse');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const parsePDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const parsedData = await pdfParse(dataBuffer);
    return parsedData.text;
  } catch (err) {
    console.error('Error parsing PDF:', err.message);
    throw new Error('Failed to parse the uploaded PDF file');
  }
};

exports.calculateATSScore = async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!jobDescription || !req.file) {
      return res.status(400).json({ error: 'Job Description and Resume are required' });
    }

    const filePath = req.file.path;
    let resumeText = '';

    try {
      if (req.file.mimetype === 'application/pdf') {
        resumeText = await parsePDF(filePath);
        console.log('Resume Parsed Text:', resumeText);
      } else {
        resumeText = fs.readFileSync(filePath, 'utf-8');
      }
    } catch (fileError) {
      console.error('Error processing file:', fileError.message);
      return res.status(500).json({ error: 'Failed to parse the uploaded resume' });
    }

    // Updated prompt to explicitly ask for a percentage score
    const prompt = `Based on the following job description:\n\n${jobDescription}\n\nAnd this resume:\n\n${resumeText}\n\nRate their compatibility as a percentage (0-100%) and explain your reasoning.`;

    let atsScore = 0;
    try {
      const result = await model.generateContent({
        prompt,
        temperature: 0.7, 
        maxOutputTokens: 200, 
      });

      // Updated response text parsing
      const responseText = result.candidates[0].content; // Correct way to access the response
      console.log('Gemini API Response:', responseText);

      const scoreMatch = responseText.match(/(\d+)%/);
      atsScore = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;

      if (isNaN(atsScore)) {
        throw new Error('Failed to extract ATS score from the AI response');
      }
    } catch (apiError) {
      console.error('Error calling Gemini API:', apiError.message);
      return res.status(503).json({
        error: 'Gemini API is currently unavailable or failed to process the request. Please try again later.',
      });
    }

    const atsData = new ATS({
      jobDescription,
      resumeText,
      atsScore, 
    });

    try {
      await atsData.save();
    } catch (dbError) {
      console.error('Error saving data to MongoDB:', dbError.message);
      return res.status(500).json({ error: 'Failed to save ATS data' });
    }

    // Delete the uploaded file after processing
    fs.unlinkSync(filePath);

    res.status(200).json({ atsScore: `${atsScore}%` }); 
  } catch (err) {
    console.error('Unexpected Error:', err.message);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};
