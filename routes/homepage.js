const express = require('express')
const router = express.Router();
const puppeteer = require('puppeteer');
const { DEFAULT_LANGUAGE } = require('../constants');

router.get('/', async function(req, res) {
    const lang = req.query.lang ?? DEFAULT_LANGUAGE
    
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.goto(`https://www.filmaffinity.com/${lang}/main.html`)
    
    const homepage = await page.evaluate(() => {
        response = []
        const query = document.querySelectorAll('.home-cat-container .home-cat-container')

        for(section of query) {
            const titleSection = section.firstElementChild.firstElementChild.innerHTML
            const items = section.querySelectorAll('.padding-movie-catrd')
            films = []

            for(item of items) {
                reference = item.firstElementChild.firstElementChild.href
                image = item.querySelector('img').dataset.src
                aux = item.innerText.split('\n')
                titleFilm = aux[0]
                premiereDay = aux[1]

                if(reference != null) {
                    films.push({
                        'id': reference.substring(reference.search('/film') + 5, reference.search('.html')),
                        'reference': reference,
                        'image': image,
                        'title': titleFilm,
                        'premiere_day': premiereDay    
                    })
                }
                
            }

            response.push({
                'title_section': titleSection,
                'films': films
            })
        }

        return response  
    });

    await browser.close()

    res.json(homepage)
});

module.exports = router