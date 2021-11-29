const { response } = require('express');
const express = require('express')
const router = express.Router();
const puppeteer = require('puppeteer');
const { metadataFilm } = require('./metadata-film')

router.get('/', async function(req, res) {
    try {
        const name = req.query.film.replace(" ", "+")

        const browser = await puppeteer.launch()
        const page = await browser.newPage()

        await page.goto(`https://www.filmaffinity.com/es/search.php?stext=${name}`)

        let search = await page.evaluate(async() => {
            response = []
            const years = document.querySelectorAll('.ye-w')
            const films = document.querySelectorAll('.movie-card')

            let i = 0
            for (film of films) {
                const poster = film.firstElementChild.firstElementChild
                const container = film.children[1]

                response.push({
                    'id': film.dataset.movieId,
                    'title': poster['title'],
                    'poster': poster.firstElementChild.src,
                    'reference': poster["href"],
                    'year': years[i].innerText,
                    'country': container.firstElementChild.lastElementChild['alt'],
                    'average': container.children[1].firstElementChild.innerText,
                    'director': container.children[2].innerText
                });
                i++
            }

            if(response.length === 0) {
                response = document.URL.substring(document.URL.search('/film') + 5, document.URL.search('.html'))
            }

            return response

        });

        if(typeof(search) === 'string') {
            search = await metadataFilm(search)
        }

        res.json(search)

    } catch (err) {
        if (err instanceof TypeError) {
            res.json({
                'message': 'Bad Request: the id parameter has not been passed',
                'error': err.message
            })
        }
    }
});

module.exports = router