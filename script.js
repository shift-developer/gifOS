const API_KEY = '?api_key=CAllNkSvYhmRBlXwfjBCJcvN3CZJ69w5';
const API_URL = 'http://api.giphy.com/v1/gifs/';
const trending = 'trending';
const random = 'random';
const limit = '&limit=';


async function llamarApi(endpoint, nroLimit) {
    const datos = await fetch(`${API_URL}${endpoint}${API_KEY}${limit}${nroLimit}`);
    const datosJson = await datos.json();
    return datosJson;
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


   
