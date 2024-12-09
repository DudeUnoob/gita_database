const axios = require('axios');
const cheerio = require('cheerio');
const SrimadBhagavatam = require('../model/SrimadBhagavatam');

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
        const matches = titleText.match(/SB (\d+)\.(\d+)\.(\d+)(?:-(\d+))?/);

        if (!matches) {
            throw new Error(`Unable to parse title: ${titleText}`);
        }

        const [_, cantoStr, chapterStr, startVerseStr, endVerseStr] = matches;
        const isActuallyJoined = !!endVerseStr;
        const startVerse = parseInt(startVerseStr);
        const endVerse = isActuallyJoined ? parseInt(endVerseStr) : startVerse;
        
        // Generate joined verse numbers if needed
        const actualJoinedNumbers = isActuallyJoined 
            ? Array.from({ length: endVerse - startVerse + 1 }, (_, i) => startVerse + i)
            : [startVerse];

        const verseData = {
            cantoNumber: parseInt(cantoStr),
            chapterNumber: parseInt(chapterStr),
            verseNumber: startVerse,
            isJoinedVerse: isActuallyJoined,
            joinedVerseNumbers: actualJoinedNumbers,
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

        // Save to database with retry logic
        let retries = 3;
        while (retries > 0) {
            try {
                const verse = new SrimadBhagavatam(verseData);
                await verse.save();
                break;
            } catch (dbError) {
                retries--;
                if (retries === 0) {
                    console.error(`Failed to save to database after 3 attempts:`, dbError);
                    throw dbError;
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return res.status(200).json(verseData);
    } catch (error) {
        console.error(`Error processing ${baseUrl}:`, error.message);
        return res.status(400).json({ errorMessage: "Error in scraping content" });
    }
}

module.exports = apiFunction;