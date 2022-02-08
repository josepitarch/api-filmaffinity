const puppeteer = require('puppeteer');
const fs = require('fs');

moviesId = [];
lang = 'es';
top = [];

fs.readFile('top_movies.txt', 'utf-8', (err, data) => {
   const lines = data.split('\r\n');
   for(line of lines) {
       id = line.split('-')[1].trim()
       moviesId.push(id)
   }
});

(async () => {
    const browser = await puppeteer.launch({headless: true})
    
    for(id of moviesId) {
        const page = await browser.newPage()

        await page.goto(`https://filmaffinity.com/${lang}/film${id}.html`)
    
        const film = await page.evaluate(() => {
            const title = document.querySelector('h1#main-title')
            const attributes = document.querySelector('.movie-info').querySelectorAll("dt:not([class='akas'])")
            const values = document.querySelector('.movie-info').querySelectorAll("dd:not([class='akas'])")
            const average = document.querySelector('div#movie-rat-avg')
            const justwatch = document.querySelector("#stream-wrapper .body")
            const reviews = document.querySelectorAll('#pro-reviews > li > div')
    
            const transformAttrbiutes = (attribute) => {
                const translates = {
                    title: ['titulo original', 'original title'],
                    year: ['ano', 'year'],
                    duration: ['duracion', 'running time'],
                    country: ['pais', 'country'],
                    director: ['direccion', 'director'],
                    screenwriter: ['guion', 'screenwriter'],
                    music: ['musica', 'music'],
                    cinematography: ['fotografia', 'cinematography'],
                    cast: ['reparto', 'cast'],
                    producer: ['productora', 'producer'],
                    genre: ['genero', 'genre'],
                    groups: ['grupos', 'movie groups'],
                    synopsis: ['sinopsis', 'synopsis'],
                }
    
                for(let key in translates) {
                    if(translates[key].find(e => e === attribute)) {
                        return key
                    }
                }
            }
    
            const translateSubtitle = (subtitle) => {
                const translates = {
                    flatrate: ["suscripcion", "flatrate"],
                    rent: ["alquiler", "rent"],
                    buy: ["compra", "buy"]
                }
    
                for(let key in translates) {
                    if(translates[key].find(e => e === subtitle)) {
                        return key
                    }
                }
            }
    
            const normalize = (text) => {
                return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            }
    
            response = {}
    
            for(let i = 0; i < attributes.length; i++) {
                transAttribute = transformAttrbiutes(normalize(attributes[i].innerText))
                console.log(transAttribute);
                if(transAttribute === 'synopsis') {
                    response[transAttribute] = values[i].innerText.search('(FILMAFFINITY)') == -1
                    ? values[i].innerText
                    : values[i].innerText.substring(0, values[i].innerText.indexOf(' (FILMAFFINITY)'))
                } else {
                    response[transAttribute] = values[i].innerText
                }
            }
    
            response['average'] = average != null ? average.innerText : ''
    
            response['justwatch'] = {flatrate: [], rent: [], buy: []}
            if (justwatch != undefined) {
                const subtitles = justwatch.querySelectorAll(".sub-title")
                
                for (subtitle of subtitles) {
                    let transSubtitle = translateSubtitle(normalize(subtitle.innerText))
                    for (platform of subtitle.nextElementSibling.children) {
                        if(transSubtitle !== undefined) {
                            response['justwatch'][transSubtitle].push({
                                'name': platform.firstElementChild.firstElementChild.alt,
                                'url': platform.href
                            })
                        }  
                    }
                }
            }
    
            const transformInclination = (inclination) => {
                if(inclination.includes('negativa') || inclination.includes('negative')) {
                    return 'negative'
                } else if(inclination.includes('neutral')) {
                    return 'neutral'
                } else {
                    return 'positive'
                }
            }
    
            response['reviews'] = []
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
                        'inclination': transformInclination(review.lastElementChild.lastElementChild.attributes.alt.value.toLowerCase())
                    })
                }
            }
    
            response['title'] = title.innerText
            
            return response
        });
    
        top.push(film)
       
        await page.close()
    }

    await browser.close()
    const convertTop = JSON.stringify(top);
    fs.writeFileSync("top_movies.json", convertTop);
})();
