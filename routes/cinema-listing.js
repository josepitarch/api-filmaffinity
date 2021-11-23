const express = require('express')
const router = express.Router();
const puppeteer = require('puppeteer');

router.get('/', async function(req, res) {
    
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.goto('https://filmaffinity.com')

    const homepage = await page.evaluate(() => {
        response = []
        const query = document.querySelectorAll('.home-cat-container .home-cat-container')

        for(let i = 0; i < query.length; i++) {
            const section = query[i]
            const titleSection = section.firstElementChild.firstElementChild.innerHTML
            const items = section.lastElementChild.children
            films = []

            for(item of items) {
                reference = item.firstElementChild.firstElementChild.href
                aux = item.firstElementChild.firstElementChild.outerHTML
                image = aux.substring(aux.search('src') + 5, aux.search('data-src') - 2)
                aux = item.innerText.split('\n')
                titleFilm = aux[0]
                premiereDay = aux[1]

                if(reference != null) {
                    films.push({
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

    res.json(homepage)
});

module.exports = router;