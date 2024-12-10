const axios = require('axios');
const cheerio = require('cheerio');
const SrimadBhagavatam = require('../model/SrimadBhagavatam');

async function apiFunction(baseUrl, res, library, isJoinedVerse = false, joinedVerseNumbers = []) {
    try {
        const response = await axios.get(baseUrl);
        const $ = cheerio.load(response.data);
        
        // Extract canto, chapter, and verse from the title
        const titleText = $('.r-title h1').text();
        
        // Enhanced regex to detect both single and joined verses
        // This will match patterns like "ŚB 1.11.16" and "ŚB 1.11.16-17"
        const matches = titleText.match(/[SŚ]B\s*(\d+)\.(\d+)\.(\d+)(?:-(\d+))?/i);
        
        if (!matches) {
            throw new Error('Invalid verse format');
        }

        const [_, cantoStr, chapterStr, startVerseStr, endVerseStr] = matches;
        const startVerse = parseInt(startVerseStr);
        const endVerse = endVerseStr ? parseInt(endVerseStr) : startVerse;
        
        // Determine if this is actually a joined verse
        const isActuallyJoined = endVerse > startVerse;
        
        // Generate array of verse numbers if joined
        const actualJoinedNumbers = isActuallyJoined 
            ? Array.from({ length: endVerse - startVerse + 1 }, (_, i) => startVerse + i)
            : [startVerse];

        // Get the parent container for the verse content
        const parentContainer = $('.wrapper-devanagari').parent();

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

        if (library === "SB") {
            return res.status(200).json(verseData);
        }

    } catch (error) {
        console.error('Error in apiFunction:', error);
        throw error;
    }
}

module.exports = apiFunction;