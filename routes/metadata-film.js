const { response } = require('express');
const express = require('express')
const router = express.Router();
const puppeteer = require('puppeteer');

router.get('/', async function(req, res) {
    const id = req.query.id
   
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.goto(`https://filmaffinity.com/es/film${id}.html`)

    const film = await page.evaluate(() => {
        const title = document.querySelector('h1#main-title')
        const query = document.querySelector('.movie-info').querySelectorAll("dd:not([class='akas']):not([style])")
        const average = document.querySelector('div#movie-rat-avg')
        const justwatch = document.querySelector("#stream-wrapper .body")
        const reviews = document.querySelectorAll('#pro-reviews > li > div')
        if (query.length == 12) {
            response = {
                'title': title.innerText,
                'year' : query[1].innerText,
                'duration': query[2].innerText,
                'country': query[3].innerText,
                'directors': query[4].innerText,
                'script' : query[5].innerText,
                'music': query[6].innerText,
                'photography': query[7].innerText,
                'casting': query[8].innerText,
                'producer': query[9].innerText,
                'genres': query[10].innerText,
                'description': query[11].innerText.search('(FILMAFFINITY)') == -1 ? query[11].innerText : query[11].innerText.substring(0, query[11].innerText.indexOf(' (FILMAFFINITY)')),
                'average': average.innerText,
                'justwatch': {},
                'reviews': []
            }

            if(justwatch != undefined) {
                const subtitles = justwatch.querySelectorAll(".sub-title")
                for(subtitle of subtitles) {
                    let platforms = []
                    for(platform of subtitle.nextElementSibling.children) {
                        element = platform.firstElementChild.firstElementChild
                        platforms.push({
                            'name': element.alt,
                            'url': element.src
                        })
                    }
                    response['justwatch'][subtitle.innerText] = platforms
                }
            }

            if(reviews != undefined) {
                let aux = []
                for(review of reviews) {

                    if(review.firstElementChild.localName === 'div') {
                        body = review.firstElementChild.innerText
                    } else {
                        body = review.firstElementChild.firstElementChild.innerText
                    }
                    
                    response['reviews'].push({
                        'reference' : review.firstElementChild.href,
                        'body' : body,
                        'author' : review.lastElementChild.innerText.trim(),
                        'inclination' : review.lastElementChild.lastElementChild.attributes.alt.value
                    })
                }
            } 
        } else {
            response = {
                'message': 'Los datos de esta película son incompatibles con la API'
            }
        }
        
        return response
    });

    await browser.close();
    
    res.json(JSON.stringify(film))
    

});

module.exports = router;