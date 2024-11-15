const axios = require('axios');
const cheerio = require('cheerio');
const BhagavadGitaVerse = require('../model/BhagavadGita');

async function apiFunction(baseUrl, res, library, isJoinedVerse = false, joinedVerseNumbers = []) {
    try {
        const response = await axios.get(baseUrl, {
            headers: {
                "Accept": "*/*",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });

        const $ = cheerio.load(response.data);
        const parentContainer = $('#content');
        
        const titleText = parentContainer.find('h1').text();
        const [_, chapterStr, verseStr] = titleText.split('.');
        const chapterNumber = parseInt(chapterStr);
        const verseNumber = parseInt(verseStr.split('-')[0]); // Get first number for joined verses

        const verseData = {
            chapterNumber,
            verseNumber,
            isJoinedVerse,
            joinedVerseNumbers: isJoinedVerse ? joinedVerseNumbers : [verseNumber],
            sanskritText: parentContainer.find('.r-devanagari').text().trim() || '',
            englishSanskritTranslation: parentContainer.find('.r-verse-text').text().trim() || '',
            synonyms: parentContainer.find('.r-synonyms p').text().trim() || '',
            translation: parentContainer.find('.r-translation p').text().trim() || '',
            purport: parentContainer.find('.r-paragraph p')
                .map((_, el) => $(el).text().trim())
                .get()
                .filter(text => text)
                .join('\n\n')
        };

        // Save to database
        const verse = new BhagavadGitaVerse(verseData);
        await verse.save();

        return res.status(200).json(verseData);
    } catch (error) {
        console.error(`Error processing ${baseUrl}:`, error.message);
        return res.status(400).json({ errorMessage: "Error in scraping content" });
    }
}

module.exports = apiFunction;