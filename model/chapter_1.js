const { mongooseConnectionString } = require('../config/config.json')
const mongoose = require("mongoose")

mongoose.connect(mongooseConnectionString || process.env.mongooseConnectionString).then((result) => console.log("Connected to db"))

const Schema = new mongoose.Schema({
    chapterNumber: Number,
    verseNumber: Number,
    sanskritText: String,
    englishSanskritTranslation: String,
    Synonyms: String,
    Translation: String,
    Purport: String
})

module.exports = mongoose.model("chapter_1", Schema)