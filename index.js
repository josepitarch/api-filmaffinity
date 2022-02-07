const express = require('express')
const app = express()
require('dotenv').config()

var homepage = require('./routes/homepage')
var searchFilm = require('./routes/search-film')
var { router } = require('./routes/metadata-film')
var topMovies = require('./routes/top-movies')


app.use('/api/homepage', homepage)
app.use('/api/search/film', searchFilm)
app.use('/api/metadata/film', router)
app.use('/api/top/movies', topMovies)

app.get('/', function(req, res) {
    res.send('API of famous Filmaffinity Web')
});

app.listen(process.env.PORT, () => {
    console.log(`API of famous Filmaffinity Web. Listen on the port ${process.env.PORT}`)
})