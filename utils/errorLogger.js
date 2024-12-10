const fs = require('fs');
const path = require('path');

class ErrorLogger {
    constructor() {
        this.errors = [];
        this.logDir = path.join(__dirname, '../logs');
        
        // Create logs directory if it doesn't exist
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir);
        }
    }

    logError(errorData) {
        this.errors.push({
            ...errorData,
            timestamp: new Date().toISOString()
        });
    }

    saveErrors() {
        if (this.errors.length === 0) {
            console.log('No errors to save.');
            return;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `sb-errors-${timestamp}.json`;
        const filePath = path.join(this.logDir, fileName);

        try {
            fs.writeFileSync(filePath, JSON.stringify(this.errors, null, 2));
            console.log(`\nError log saved to: ${filePath}`);
            console.log(`Total errors logged: ${this.errors.length}`);
        } catch (err) {
            console.error('Failed to save error log:', err);
        }
    }
}

const errorLogger = new ErrorLogger();

// Handle process termination
process.on('SIGINT', () => {
    errorLogger.saveErrors();
    process.exit();
});

module.exports = errorLogger; 