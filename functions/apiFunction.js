const axios = require('axios');
const cheerio = require('cheerio');

async function apiFunction(baseUrl, res, library) {
    try {
        const response = await axios.get(baseUrl, {
            headers: {
                "Accept": "*/*",
                "set-cookie": "csrftoken=ZYyKJWfR9JDWa4mfYxHwn30Z2ifIaNzK;",
                "Cookie": "csrftoken=ZYyKJWfR9JDWa4mfYxHwn30Z2ifIaNzK",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0"
            }
        });

        const $ = cheerio.load(response.data);
        const parentContainer = $('#content');
        let englishSanskritTranslation;
        const chapterNumber = parseInt(parentContainer.find('h1').text().split('.')[1]);
        const verseNumber = parseInt(parentContainer.find('h1').text().split('.')[2]);
        const sanskritText = parentContainer.find('.r-devanagari').html().replace(/<br\s*[/]?>/gi, '\n').replace(/<\/?[^>]+(>|$)/g, '');
        if(library == "BG"){
            englishSanskritTranslation = parentContainer.find('.r-verse-text em em').html().replace(/<br\s*[/]?>/gi, '\n').replace(/<\/?[^>]+(>|$)/g, '')
        } else if(library == "SB") {
            englishSanskritTranslation = parentContainer.find('.r-verse-text em').html().replace(/<br\s*[/]?>/gi, '\n').replace(/<\/?[^>]+(>|$)/g, '')
        }
        const synonyms = parentContainer.find('.r-synonyms p').text().trim();
        const translation = parentContainer.find('.r-translation strong').text().trim();
        const purport = parentContainer.find('.r-paragraph p').text().trim();

        return res.status(200).json({
            library: "BG",
            chapterNumber,
            verseNumber,
            sanskritText,
            englishSanskritTranslation,
            synonyms,
            translation,
            Purport: purport
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            errorMessage: "Error in scraping content"
        });
    }
}

module.exports = apiFunction