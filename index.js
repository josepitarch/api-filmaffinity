const express = require('express')
const app = express()
require('dotenv').config()

var cinemaListing = require('./routes/cinema-listing')
var searchFilm = require('./routes/search-film')
var { router } = require('./routes/metadata-film')


app.use('/api/cinema/listing', cinemaListing)
app.use('/api/search/film', searchFilm)
app.use('/api/metadata/film', router)

app.get('/', function(req, res) {
    res.send('API of famous Filmaffinity web')
});

app.listen(process.env.PORT, () => {
    console.log(`API of famous Filmaffinity web. Listen on the port ${process.env.PORT}`)
})