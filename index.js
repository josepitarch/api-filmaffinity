const express = require('express')
const app = express()

var {router, prueba} = require('./routes/cinema-listing')
var searchFilm = require('./routes/search-film')
//var { router } = require('./routes/metadata-film')

const x = await prueba()
console.log(x);

app.use('/api/cinema/listing', router)
app.use('/api/search/film', searchFilm)
//app.use('/api/metadata/film', router)

app.get('/', function(req, res) {
    res.send('API Filmaffinity for Flutter Application')
});

app.listen(3000, () => {
    console.log('API of Filfmaffinity for Flutter film application')
})