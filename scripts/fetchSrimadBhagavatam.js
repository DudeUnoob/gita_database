const apiFunction = require('../functions/apiFunction');
const { cantoVerses } = require('../config/srimadBhagavatamConfig');

async function fetchVerse(canto, chapter, verse, retryCount = 0) {
    const maxRetries = 3;
    const baseUrl = `https://vedabase.io/en/library/sb/${canto}/${chapter}/${verse}/`;
    
    const mockRes = {
        status: (code) => mockRes,
        json: (data) => data
    };

    try {
        await apiFunction(baseUrl, mockRes, "SB");
        console.log(`Successfully fetched Canto ${canto}, Chapter ${chapter}, Verse ${verse}`);
    } catch (error) {
        if (error.response?.status === 404) {
            // Try different joined verse combinations
            const possibleJoinedUrls = [
                `${verse-1}-${verse}`,   // Check if joined with previous verse
                `${verse}-${verse+1}`,   // Check if joined with next verse
                `${verse-2}-${verse}`,   // Some verses are joined in groups of 3
                `${verse-1}-${verse+1}`  // Check if it's in the middle of a joined set
            ];

            for (const joinedPattern of possibleJoinedUrls) {
                try {
                    const joinedUrl = `https://vedabase.io/en/library/sb/${canto}/${chapter}/${joinedPattern}/`;
                    await apiFunction(joinedUrl, mockRes, "SB");
                    console.log(`Successfully fetched joined verses Canto ${canto}, Chapter ${chapter}, Verse ${joinedPattern}`);
                    return;
                } catch (joinedError) {
                    continue;
                }
            }
            
            if (retryCount < maxRetries) {
                console.log(`Retrying Canto ${canto}, Chapter ${chapter}, Verse ${verse} (Attempt ${retryCount + 1})`);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
                return fetchVerse(canto, chapter, verse, retryCount + 1);
            }
            
            console.error(`Failed to fetch Canto ${canto}, Chapter ${chapter}, Verse ${verse} after all attempts`);
        } else if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
            if (retryCount < maxRetries) {
                const waitTime = Math.pow(2, retryCount) * 1000; // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, waitTime));
                return fetchVerse(canto, chapter, verse, retryCount + 1);
            }
        }
        console.error(`Failed to fetch Canto ${canto}, Chapter ${chapter}, Verse ${verse}:`, error.message);
    }
}

async function fetchAllVerses() {
    const concurrentRequests = 3;
    const delay = 1000; // 1 second delay between batches

    for (let canto = 1; canto <= 12; canto++) {
        console.log(`Processing Canto ${canto}`);
        
        for (let chapter in cantoVerses[canto]) {
            console.log(`Processing Chapter ${chapter}`);
            const versesToProcess = [];

            // Simply process each verse number sequentially
            for (let verse = 1; verse <= cantoVerses[canto][chapter]; verse++) {
                versesToProcess.push(verse);
            }

            // Process verses in batches
            for (let i = 0; i < versesToProcess.length; i += concurrentRequests) {
                const batch = versesToProcess.slice(i, i + concurrentRequests);
                await Promise.all(
                    batch.map(verse => fetchVerse(canto, chapter, verse))
                );
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    console.log("All verses have been processed!");
}

fetchAllVerses().catch(console.error); 