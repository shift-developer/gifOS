//ENDPOINTS
const trending = 'gifs/trending';
const search = 'gifs/search';
const trendingSearchs = 'trending/searches'

//REQUEST PARAMETERS
const limit = '&limit='; //The maximum number of objects to return. (Default: “25”)
const q = '&q='; //Search query term or phrase.


async function llamarApi(endpoint, nroLimit = '', stringSearch = '') {
    const API_KEY = '?api_key=CAllNkSvYhmRBlXwfjBCJcvN3CZJ69w5';
    const API_URL = 'http://api.giphy.com/v1/';
    let url = `${API_URL}${endpoint}${API_KEY}`;

    if(endpoint == trending || endpoint == search) {
     url = url + limit + nroLimit;
        if(endpoint == trending) {
            url = url + q + stringSearch;
        }
    }

    const datos = await fetch(url);
    const datosJSON = await datos.json();
    return datosJSON;
}

function getTrendingGifs(numeroDeGifs, arrDOM) {
    const trendingGifsUrls = [];
    llamarApi(trending, numeroDeGifs).then((res) => {
        for(let gif of res.data){
            trendingGifsUrls.push(gif.images.downsized.url);
        }
        for(let i = 0; i < numeroDeGifs; i++){
            arrDOM[i].src = trendingGifsUrls[i];
        }
    });
    
}

//creamos el array de urls de gifs
const sugerenciasGifs = document.getElementsByClassName('gif sugerencias');
getTrendingGifs(4, sugerenciasGifs);

const tendenciasGifs = document.getElementsByClassName('gif tendencias');
getTrendingGifs(4, tendenciasGifs);

console.log(sugerenciasGifs)
//console.log();


   
