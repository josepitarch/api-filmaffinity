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

        const search = await page.evaluate(() => {
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
            
            if(i === 0) {
                const id = document.URL.substring(document.URL.search('/film') + 5, document.URL.search('.html'))
                console.log(id);
                response = metadataFilm(id)
            }

            return response
        });

        if (search.length === 0) {
            search = await metadataFilm(425311)
        }

        res.json(search)

        res.json(search)

    } catch (err) {
        if (err instanceof TypeError) {
            res.json({
                'message': 'No se ha pasado el parámetro film',
                'error': err.message
            })
        }
    }
});

module.exports = router;