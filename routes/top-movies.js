const express = require('express')
const router = express.Router()
const puppeteer = require('puppeteer')
const topMovies = require('../top_movies.json')

router.get('/', async function(req, res) {
    res.json(topMovies)
});

module.exports = router