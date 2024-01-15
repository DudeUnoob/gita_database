const express = require('express')
const app = express()
const axios = require('axios');
const cheerio = require('cheerio');
// const ChapterOne = require("./model/chapter_1")


app.get('/', (req, res) => {
    res.json({
        message: "Welcome to the gitabase API.",
    })
})

app.get("/api/v1/bg/:chapter/:verse", (req, res) => {
    async function scrapeGita() {
        const baseUrl = `https://vedabase.io/en/library/bg/${req.params.chapter}/${req.params.verse}/`;

        axios.get(baseUrl, {
            headers:{
                "Accept": "*/*",
                "set-cookie":"csrftoken=ZYyKJWfR9JDWa4mfYxHwn30Z2ifIaNzK;",
                "Cookie":"csrftoken=ZYyKJWfR9JDWa4mfYxHwn30Z2ifIaNzK",
                "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0"
            }
        })
            .then(response => {

                const $ = cheerio.load(response.data)

                const parentContainer = $('#content');


                const chapterNumber = parseInt(parentContainer.find('h1').text().split('.')[1]);
                const verseNumber = parseInt(parentContainer.find('h1').text().split('.')[2]);
                const sanskritText = parentContainer.find('.r-devanagari').html().replace(/<br\s*[/]?>/gi, '\n').replace(/<\/?[^>]+(>|$)/g, '')
                const englishSanskritTranslation = parentContainer.find('.r-verse-text em em').html().replace(/<br\s*[/]?>/gi, '\n').replace(/<\/?[^>]+(>|$)/g, '')
                const synonyms = parentContainer.find('.r-synonyms p').text().trim();
                const translation = parentContainer.find('.r-translation strong').text().trim();
                const purport = parentContainer.find('.r-paragraph p').text().trim();


                // console.log('Chapter Number:', chapterNumber);
                // console.log('Verse Number:', verseNumber);
                // console.log('Sanskrit Text:', sanskritText);
                // console.log('English Sanskrit translation:', englishSanskritTranslation);
                // console.log('synonyms:', synonyms);
                // console.log('translation:', translation);
                // console.log('Purport:', purport);
                

                return res.status(200).json({
                    library: "BG",
                    chapterNumber: chapterNumber,
                    verseNumber: verseNumber,
                    sanskritText: sanskritText,
                    englishSanskritTranslation: englishSanskritTranslation,
                    synonyms: synonyms,
                    translation: translation,
                    Purport: purport
                })

            }).catch(error => {
                console.log(error)
                return res.status(400).json({
                    errorMessage: "Did not find that bhagavad gita chapter/verse"
                })
            })

    }
    scrapeGita()

})


app.get('/api/v1/sb/:canto/:chapter/:verse', async (req, res) => {

    async function scrapeBhagavatam() {
        const baseUrl = `https://vedabase.io/en/library/sb/${req.params.canto}/${req.params.chapter}/${req.params.verse}/`;

        axios.get(baseUrl, {
            headers:{
                "Accept": "*/*",
                "set-cookie":"csrftoken=ZYyKJWfR9JDWa4mfYxHwn30Z2ifIaNzK;",
                "Cookie":"csrftoken=ZYyKJWfR9JDWa4mfYxHwn30Z2ifIaNzK"
            }
        })
            .then(response => {

                const $ = cheerio.load(response.data)

                const parentContainer = $('#content');


                const chapterNumber = parseInt(parentContainer.find('h1').text().split('.')[1]);
                const verseNumber = parseInt(parentContainer.find('h1').text().split('.')[2]);
                const sanskritText = parentContainer.find('.r-devanagari').html().replace(/<br\s*[/]?>/gi, '\n').replace(/<\/?[^>]+(>|$)/g, '')
                const englishSanskritTranslation = parentContainer.find('.r-verse-text em').html().replace(/<br\s*[/]?>/gi, '\n').replace(/<\/?[^>]+(>|$)/g, '')
                const synonyms = parentContainer.find('.r-synonyms p').text().trim();
                const translation = parentContainer.find('.r-translation strong').text().trim();
                const purport = parentContainer.find('.r-paragraph p').text().trim();

                // console.log('Chapter Number:', chapterNumber);
                // console.log('Verse Number:', verseNumber);
                // console.log('Sanskrit Text:', sanskritText);
                // console.log('English Sanskrit translation:', englishSanskritTranslation);
                // console.log('synonyms:', synonyms);
                // console.log('translation:', translation);
                // console.log('Purport:', purport);


                return res.status(200).json({
                    library: "SB",
                    chapterNumber: chapterNumber,
                    verseNumber: verseNumber,
                    sanskritText: sanskritText,
                    englishSanskritTranslation: englishSanskritTranslation,
                    synonyms: synonyms,
                    translation: translation,
                    Purport: purport
                })

            }).catch(error => {
                console.log(error)
                return res.status(400).json({
                    errorMessage: "Did not find that srimad bhagavatm canto/chapter/verse"
                })
            })

    }
    scrapeBhagavatam()
})

app.listen(process.env.PORT || 3000, () => {
    console.log("connected to port 3000")
})