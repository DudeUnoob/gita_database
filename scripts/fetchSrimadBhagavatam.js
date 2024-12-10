const apiFunction = require('../functions/apiFunction');
const { cantoVerses } = require('../config/srimadBhagavatamConfig');
const errorLogger = require('../utils/errorLogger');

// Add handlers for different termination scenarios
process.on('SIGINT', handleTermination);  // Ctrl+C
process.on('SIGTERM', handleTermination); // Kill command
process.on('SIGHUP', handleTermination);  // Terminal closed
process.on('uncaughtException', handleError);
process.on('unhandledRejection', handleError);

function handleTermination(signal) {
    console.log(`\nReceived ${signal}. Saving error log before exit...`);
    errorLogger.saveErrors();
    process.exit();
}

function handleError(error) {
    console.error('Fatal error:', error);
    errorLogger.logError({
        type: 'FATAL_ERROR',
        location: 'Process Error Handler',
        error: error.message,
        details: error.stack
    });
    errorLogger.saveErrors();
    process.exit(1);
}

async function fetchVerse(canto, chapter, verse, retryCount = 0) {
    const maxRetries = 3;
    const baseUrl = `https://vedabase.io/en/library/sb/${canto}/${chapter}/${verse}/`;
    
    const mockRes = {
        status: (code) => mockRes,
        json: (data) => data
    };

    try {
        // First try the single verse URL
        await apiFunction(baseUrl, mockRes, "SB");
        console.log(`✓ C${canto}.${chapter}.${verse}`);
    } catch (error) {
        if (error.response?.status === 404) {
            // Generate more comprehensive patterns for joined verses
            const possiblePatterns = [];
            
            // Look ahead patterns (up to 10 verses ahead)
            for (let i = 1; i <= 10; i++) {
                if (verse + i <= cantoVerses[canto][chapter]) {
                    possiblePatterns.push(`${verse}-${verse + i}`);
                }
            }
            
            // Look behind patterns (up to 10 verses behind)
            for (let i = 1; i <= 10; i++) {
                if (verse - i > 0) {
                    possiblePatterns.push(`${verse - i}-${verse}`);
                }
            }

            // Look both ways patterns (up to 5 verses in each direction)
            for (let before = 1; before <= 5; before++) {
                for (let after = 1; after <= 5; after++) {
                    if (verse - before > 0 && verse + after <= cantoVerses[canto][chapter]) {
                        possiblePatterns.push(`${verse - before}-${verse + after}`);
                    }
                }
            }

            // Try each pattern
            for (const pattern of possiblePatterns) {
                try {
                    const joinedUrl = `https://vedabase.io/en/library/sb/${canto}/${chapter}/${pattern}/`;
                    await apiFunction(joinedUrl, mockRes, "SB");
                    console.log(`✓ C${canto}.${chapter}.${pattern} (joined)`);
                    return;
                } catch (joinedError) {
                    if (joinedError.response?.status !== 404) {
                        console.error(`× Error fetching C${canto}.${chapter}.${pattern}:`, 
                            joinedError.message || 'Unknown error');
                    }
                    continue;
                }
            }

            // If all patterns fail, implement exponential backoff retry
            if (retryCount < maxRetries) {
                const waitTime = Math.pow(2, retryCount) * 1000;
                await new Promise(resolve => setTimeout(resolve, waitTime));
                return fetchVerse(canto, chapter, verse, retryCount + 1);
            }
            
            errorLogger.logError({
                type: 'FETCH_FAILED',
                location: `Canto ${canto}, Chapter ${chapter}, Verse ${verse}`,
                error: `Failed to fetch after ${maxRetries} retries`,
                details: { canto, chapter, verse, attempts: maxRetries }
            });
        } else if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
            if (retryCount < maxRetries) {
                const waitTime = Math.pow(2, retryCount) * 1000;
                await new Promise(resolve => setTimeout(resolve, waitTime));
                return fetchVerse(canto, chapter, verse, retryCount + 1);
            }
            errorLogger.logError({
                type: 'NETWORK_ERROR',
                location: `Canto ${canto}, Chapter ${chapter}, Verse ${verse}`,
                error: error.code,
                details: { canto, chapter, verse, attempts: maxRetries }
            });
        } else {
            errorLogger.logError({
                type: 'GENERAL_ERROR',
                location: `Canto ${canto}, Chapter ${chapter}, Verse ${verse}`,
                error: error,
                details: { canto, chapter, verse }
            });
        }
    }
}

async function fetchAllVerses() {
    const concurrentRequests = 10;
    const delay = 300;

    try {
        // Create a queue of all verses to fetch
        const queue = [];
        for (let canto = 1; canto <= 12; canto++) {
            for (let chapter in cantoVerses[canto]) {
                for (let verse = 1; verse <= cantoVerses[canto][chapter]; verse++) {
                    queue.push({ canto, chapter, verse });
                }
            }
        }

        // Process queue in batches
        for (let i = 0; i < queue.length; i += concurrentRequests) {
            const batch = queue.slice(i, i + concurrentRequests);
            await Promise.all(
                batch.map(({ canto, chapter, verse }) => 
                    fetchVerse(canto, chapter, verse)
                )
            );
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        console.log("\nAll verses have been processed!");
    } catch (error) {
        console.error('Fatal error in fetchAllVerses:', error);
        errorLogger.logError({
            type: 'FATAL_ERROR',
            location: 'fetchAllVerses',
            error: error.message,
            details: error.stack
        });
    } finally {
        // Save error log when the script completes
        errorLogger.saveErrors();
    }
}

fetchAllVerses().catch(console.error); 