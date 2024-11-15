const apiFunction = require('../functions/apiFunction');
const { chapterVerses, joinedVerses } = require('../config/versesConfig');

async function fetchVerse(chapter, verse, isJoined = false, joinedNumbers = []) {
    const baseUrl = `https://vedabase.io/en/library/bg/${chapter}/${isJoined ? `${joinedNumbers[0]}-${joinedNumbers[joinedNumbers.length-1]}` : verse}/`;
    
    const mockRes = {
        status: (code) => mockRes,
        json: (data) => data
    };

    try {
        await apiFunction(baseUrl, mockRes, "BG", isJoined, joinedNumbers);
        console.log(`Successfully fetched Chapter ${chapter}, Verse ${isJoined ? joinedNumbers.join('-') : verse}`);
    } catch (error) {
        console.error(`Failed to fetch Chapter ${chapter}, Verse ${verse}:`, error.message);
    }
}

async function fetchAllVerses() {
    const concurrentRequests = 3; // Number of concurrent requests
    const delay = 1000; // Delay between batches in ms

    for (let chapter = 1; chapter <= 18; chapter++) {
        console.log(`Processing Chapter ${chapter}`);
        const versesToProcess = [];

        for (let verse = 1; verse <= chapterVerses[chapter]; verse++) {
            // Check if verse is part of a joined set
            const joinedSet = joinedVerses[chapter]?.find(set => 
                verse >= set[0] && verse <= set[1]
            );

            if (joinedSet) {
                if (verse === joinedSet[0]) { // Only process once for joined verses
                    const joinedNumbers = Array.from(
                        { length: joinedSet[1] - joinedSet[0] + 1 },
                        (_, i) => joinedSet[0] + i
                    );
                    versesToProcess.push({ verse, isJoined: true, joinedNumbers });
                }
                verse = joinedSet[1]; // Skip to end of joined set
            } else {
                versesToProcess.push({ verse, isJoined: false, joinedNumbers: [verse] });
            }
        }

        // Process verses in batches
        for (let i = 0; i < versesToProcess.length; i += concurrentRequests) {
            const batch = versesToProcess.slice(i, i + concurrentRequests);
            await Promise.all(
                batch.map(({ verse, isJoined, joinedNumbers }) => 
                    fetchVerse(chapter, verse, isJoined, joinedNumbers)
                )
            );
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    console.log("All verses have been processed!");
}

fetchAllVerses().catch(console.error); 