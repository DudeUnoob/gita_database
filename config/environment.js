const dotenv = require('dotenv');

const loadEnvironment = () => {
  const environment = process.env.NODE_ENV || 'development';
  
  // Only load from .env file in development
  if (environment !== 'production') {
    dotenv.config();
  }
  
  return {
    NODE_ENV: environment,
    PORT: process.env.PORT || 3000,
    MONGODB_URI: process.env.MONGODB_URI
  };
};

module.exports = loadEnvironment(); 