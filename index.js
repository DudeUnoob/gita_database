const express = require('express')
const app = express()
const axios = require('axios');
const cheerio = require('cheerio');
const apiFunction  = require('./functions/apiFunction');
// const ChapterOne = require("./model/chapter_1")


app.get('/', (req, res) => {
    res.json({
        message: "Welcome to the gitabase API.",
    })
})

app.get("/api/v1/bg/:chapter/:verse", (req, res) => {
    const baseUrl = `https://vedabase.io/en/library/bg/${req.params.chapter}/${req.params.verse}/`;
    apiFunction(baseUrl, res, "BG") 

})


app.get('/api/v1/sb/:canto/:chapter/:verse', async (req, res) => {
    const baseUrl = `https://vedabase.io/en/library/sb/${req.params.canto}/${req.params.chapter}/${req.params.verse}/`;
    apiFunction(baseUrl, res, "SB");
})

app.listen(process.env.PORT || 3000, () => {
    console.log("connected to port 3000")
})