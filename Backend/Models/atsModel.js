const mongoose = require('mongoose');

const atsSchema = new mongoose.Schema({
  jobDescription: String, // The job description text
  resumeText: String, // The parsed resume text
  atsScore: Number, // Updated: Store ATS score as a number (percentage)
});

module.exports = mongoose.model('ATS', atsSchema);
