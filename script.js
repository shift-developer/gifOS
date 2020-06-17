const API_KEY = '?api_key=CAllNkSvYhmRBlXwfjBCJcvN3CZJ69w5';
const API_URL = 'http://api.giphy.com/v1/gifs/';
const trending = 'trending';
const random = 'random';
const limit = '&limit=';


async function llamarApi(endpoint, nroLimit){
    const datos = await fetch(`${API_URL}${endpoint}${API_KEY}${limit}${nroLimit}`);
    const datosJson = await datos.json();
    return datosJson;
}

llamarApi(trending, 4).then(res => console.log(res.data[0].images));

