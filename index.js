const express = require('express')
const environment = require('./config/environment')
const app = express()
const axios = require('axios');
const cheerio = require('cheerio');
const apiFunction  = require('./functions/apiFunction');
const BhagavadGitaVerse = require('./model/BhagavadGita');
const SrimadBhagavatam = require('./model/SrimadBhagavatam');
// const ChapterOne = require("./model/chapter_1")


app.get('/', (req, res) => {
    res.json({
        message: "Welcome to the gitabase API.",
    })
})

/*
app.get("/api/v1/bg/:chapter/:verse", (req, res) => {
    const baseUrl = `https://vedabase.io/en/library/bg/${req.params.chapter}/${req.params.verse}/`;
    apiFunction(baseUrl, res, "BG") 

})
*/

app.get('/api/v1/sb/:canto/:chapter/:verse', async (req, res) => {
    const baseUrl = `https://vedabase.io/en/library/sb/${req.params.canto}/${req.params.chapter}/${req.params.verse}/`;
    apiFunction(baseUrl, res, "SB");
})

app.get("/api/v1/bg/verse/:chapter/:verse", async (req, res) => {
    try {
        const { chapter, verse } = req.params;
        const verseNumber = parseInt(verse);
        const chapterNumber = parseInt(chapter);

        const verseData = await BhagavadGitaVerse.findOne({
            chapterNumber,
            $or: [
                { verseNumber: verseNumber },
                { joinedVerseNumbers: verseNumber }
            ]
        });

        if (!verseData) {
            return res.status(404).json({
                error: `Verse ${verse} from Chapter ${chapter} not found`
            });
        }

        res.status(200).json(verseData);
    } catch (error) {
        console.error('Error fetching verse:', error);
        res.status(500).json({
            error: "Internal server error while fetching verse"
        });
    }
});

app.get("/api/v1/sb/verse/:canto/:chapter/:verse", async (req, res) => {
    try {
        const { canto, chapter, verse } = req.params;
        const verseNumber = parseInt(verse);
        const cantoNumber = parseInt(canto);
        const chapterNumber = parseInt(chapter);

        const verseData = await SrimadBhagavatam.findOne({
            cantoNumber,
            chapterNumber,
            $or: [
                { verseNumber: verseNumber },
                { joinedVerseNumbers: verseNumber }
            ]
        });

        if (!verseData) {
            return res.status(404).json({
                error: `Verse ${verse} from Canto ${canto}, Chapter ${chapter} not found`
            });
        }

        res.status(200).json(verseData);
    } catch (error) {
        console.error('Error fetching verse:', error);
        res.status(500).json({
            error: "Internal server error while fetching verse"
        });
    }
});

const port = environment.PORT || process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running in ${environment.NODE_ENV} mode on port ${port}`);
});