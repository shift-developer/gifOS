//ENDPOINTS
const trending = 'gifs/trending';
const search = 'gifs/search';
const random = 'gifs/random';
const trendingSearchs = 'trending/searches'

//REQUEST PARAMETERS
const limit = '&limit='; //The maximum number of objects to return. (Default: “25”)
const q = '&q='; //Search query term or phrase.
const tag = '&tag=' //Filters results by specified tag..

async function llamarApi(endpoint, nroLimit = '', stringSearch = '', stringTag = '') {
    const API_KEY = '?api_key=CAllNkSvYhmRBlXwfjBCJcvN3CZJ69w5';
    const API_URL = 'http://api.giphy.com/v1/';
    let url = `${API_URL}${endpoint}${API_KEY}`;

    if(endpoint == trending || endpoint == search) {
     url = url + limit + nroLimit;
        if(endpoint == trending) {
            url = url + q + stringSearch;
        }
    } else if (endpoint == random){
        url = url + tag + stringTag;
    }
    const datos = await fetch(url);
    const datosJSON = await datos.json();
    return datosJSON;
}

function getTrendingGifs(numeroDeGifs, arrDOM) {
    llamarApi(trending, numeroDeGifs).then((res) => {
        for(let i = 0; i < numeroDeGifs; i++){
            arrDOM[i].src = res.data[i].images.downsized.url;
        }
    });  
}

function getSugerenciasGifs() {
    let tags = [];
    llamarApi(trendingSearchs).then((res) => {
        tags = res.data;
        llamarApi(random, )
    })
    
}


//creamos el array de urls de gifs
const sugerenciasGifs = document.getElementsByClassName('gif sugerencias');
getTrendingGifs(4, sugerenciasGifs);

const tendenciasGifs = document.getElementsByClassName('gif tendencias');
getTrendingGifs(4, tendenciasGifs);

console.log(sugerenciasGifs)
//console.log();

getSugerenciasGifs()
   
