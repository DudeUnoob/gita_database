const mongoose = require("mongoose")
const environment = require('../config/environment')

mongoose.connect(environment.MONGODB_URI)
  .then(() => console.log(`Connected to MongoDB in ${environment.NODE_ENV} mode`))
  .catch(err => console.error('MongoDB connection error:', err))

const Schema = new mongoose.Schema({
    chapterNumber: Number,
    verseNumber: Number,
    isJoinedVerse: Boolean,
    joinedVerseNumbers: [Number],  // Array of verse numbers if joined
    sanskritText: String,
    englishSanskritTranslation: String,
    synonyms: String,
    translation: String,
    purport: String
})

module.exports = mongoose.model("BhagavadGita", Schema)