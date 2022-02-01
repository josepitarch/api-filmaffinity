const express = require('express')
const router = express.Router();
const puppeteer = require('puppeteer');
const { DEFAULT_LANGUAGE } = require('../constants');

router.get('/', async function(req, res) {
    const language = req.query.lang ?? DEFAULT_LANGUAGE
    const id = req.query.id
    if(id === undefined) res.json({'error': 'endpoint needs an id of some movie'})
    else {
        const lang = req.query.lang ?? DEFAULT_LANGUAGE
        response = await metadataFilm(id, lang)
        res.json(response)
    }
});

async function metadataFilm(id, lang) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.goto(`https://filmaffinity.com/${lang}/film${id}.html`)

    const film = await page.evaluate(() => {
        const title = document.querySelector('h1#main-title')
        const query = document.querySelector('.movie-info').querySelectorAll("dd:not([class='akas']):not([style])")
        const average = document.querySelector('div#movie-rat-avg')
        const justwatch = document.querySelector("#stream-wrapper .body")
        const reviews = document.querySelectorAll('#pro-reviews > li > div')
        
        if (query.length == 12) {
            response = {
                'title': title.innerText,
                'year': query[1].innerText,
                'duration': query[2].innerText,
                'country': query[3].innerText,
                'directors': query[4].innerText,
                'script': query[5].innerText,
                'music': query[6].innerText,
                'photography': query[7].innerText,
                'casting': query[8].innerText,
                'producer': query[9].innerText,
                'genres': query[10].innerText,
                'overview': query[11].innerText.search('(FILMAFFINITY)') == -1
                ? query[11].innerText
                : query[11].innerText.substring(0, query[11].innerText.indexOf(' (FILMAFFINITY)')),
                
                'average': average.innerText,
                'justwatch': {},
                'reviews': []
            }

            if (justwatch != undefined) {
                const subtitles = justwatch.querySelectorAll(".sub-title")
                for (subtitle of subtitles) {
                    let platforms = []
                    for (platform of subtitle.nextElementSibling.children) {
                        platforms.push({
                            'name': platform.firstElementChild.firstElementChild.alt,
                            'url': platform.href
                        })
                    }
                    response['justwatch'][subtitle.innerText.toLowerCase()
                        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")] = platforms
                }
            }

            if (reviews != undefined) {
                let aux = []
                for (review of reviews) {

                    if (review.firstElementChild.localName === 'div') {
                        body = review.firstElementChild.innerText
                    } else {
                        body = review.firstElementChild.firstElementChild.innerText
                    }

                    response['reviews'].push({
                        'reference': review.firstElementChild.href,
                        'body': body,
                        'author': review.lastElementChild.innerText.trim(),
                        'inclination': review.lastElementChild.lastElementChild.attributes.alt.value
                    })
                }
            }
        } else {
            response = {
                'message': 'This film is not compatible with the skeleton of Filmaffinity information of films'
            }
        }

        return response
    });

    await browser.close()

    return film
}

module.exports = { router, metadataFilm }