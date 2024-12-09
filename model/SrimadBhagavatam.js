const mongoose = require("mongoose")
const environment = require('../config/environment')

mongoose.connect(environment.MONGODB_URI)
  .then(() => console.log(`Connected to MongoDB in ${environment.NODE_ENV} mode`))
  .catch(err => console.error('MongoDB connection error:', err))

const Schema = new mongoose.Schema({
    cantoNumber: Number,
    chapterNumber: Number,
    verseNumber: Number,
    isJoinedVerse: Boolean,
    joinedVerseNumbers: [Number],
    sanskritText: String,
    englishSanskritTranslation: String,
    synonyms: String,
    translation: String,
    purport: String
})

module.exports = mongoose.model("SrimadBhagavatam", Schema)