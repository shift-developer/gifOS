//Constantes utiles

const apiKey = 'CAllNkSvYhmRBlXwfjBCJcvN3CZJ69w5';
const apiBaseUrl = 'https://api.giphy.com/v1/gifs/';

//Subir gifs

//Elementos del HTML con los que vamos a interactuar
const start = document.getElementById('start');
const video = document.querySelector('video');
const record = document.getElementById('record');
const stop = document.getElementById('stop');
const restart = document.getElementById('restart');
const upload = document.getElementById('upload');
const preview = document.getElementById('preview');
const progressBar = document.getElementsByClassName('progress-bar-item');
const uploadMessage = document.getElementById('upload-msg');
const download = document.getElementById('download');
const copy = document.getElementById('copy');
const main = document.getElementById('main');

//definimos el recorder
let recorder;

//tambien definimos una variable recording para el manejo del timer
let recording = false;

//barra de progreso
let counter = 0;


/*---------------FUNCIONES GLOBALES----------------*/

//obtener video y grabación
function getStreamAndRecord() {

    //empieza a correr la camara 
    //aca pedimos al usuario que nos de acceso a la cámara
    //chrome lanza un error si la página que da el script es insegura
    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            height: { max: 480 }
        }
    }) 
    .then( function(stream) {

        //usamos el stream de la cámara como source de nuestra tag <video> en el html
        video.srcObject = stream;
        video.play();

        record.addEventListener('click', () => {
            recording = !recording;
            document.getElementById('camera-button').src = '../assets/combined_shape.svg';

            if (recording === true) {
                this.disabled = true; //deshabilitamos el boton record
                recorder = RecordRTC(stream, 
                    {
                        type: 'gif',
                        frameRate: 1,
                        quality: 10,
                        width: 360,
                        hidden: 240,
                        onGifRecordingStarted: function() {
                            console.log('started');
                        }
                    }
                );
                //empezamos a grabar
                recorder.startRecording();
                //obtener duracion
                getDuration();

                //modificamos el DOM para que se note que estamos grabando
                record.classList.add('button-recording');
                record.innerHTML = 'Listo';
                stop.classList.add('button-recording');

                //cortamos el stream de la camara
                recorder.camera = stream;

            } else {
                this.disabled = true;
                recorder.stopRecording(stopRecordingCallback);
                recording = false;
            }
        });
    });
}

function getDuration() {
    let seconds = 0;
    let minutes = 0;
    let timer = setInterval(() => {
        if (recording) {
            if (seconds < 60) {
                if (seconds <= 9) {
                    seconds = '0' + seconds;
                }
                document.getElementById('timer').innerHTML = `00:00:0${minutes}:${seconds}`;
                seconds++;
            } else {
                minutes++;
                seconds = 0;
            }
            
        } else {
            clearInterval(timer); //si no estoy grabando los limpia
        }
    }, 1000);
}

function stopRecordingCallback() {

    recorder.camera.stop();

    //le damos el formato  requerido a la data que vamos a enviar como body de nuestro 
    //POST REQUEST
    //Creamos un form data al que le anexamos el archivo gif pasado a blob, con la función getBlob
    let form = new FormData();
    //le ponemos 'file' porque en la doc de giphy lo pide como ese parámetro, y aclara que tiene 
    //que ser un string binario
    form.append('file', recorder.getBlob(), 'test-gif');

    upload.addEventListener('click', () => {
        uploadMessage.classList.remove('hidden');
        preview.classList.add('hidden');
        animateProgressbar(progressBar);
        //acá se pasa el form a la función upload gif
        uploadGif(form);
    });

    //aca obtenemos el blob con la variable global recorder, que ya tiene le gif guardado para la preview
    objectURL = URL.createObjectURL(recorder.getBlob());
    preview.src = objectURL;

    //modificamos el DOM para mostrar la preview, remover el timer
    preview.classList.remove('hidden');
    video.classList.add('hidden');
    document.getElementById('video-record-buttons').classList.add('hidden');
    document.getElementById('video-upload-buttons').classList.remove('hidden');


    recorder.destroy();
    recorder = null;

}

function animateProgressbar(bar) {
    setInterval( () => {

        if(counter < bar.length) {
            bar.item(counter).classList.toggle('progress-bar-item-active');
            counter++;
        } else {
            counter = 0;
        }
    }, 200);
}

function uploadGif(gif) {
    
    //formateamos el post según las necesidades particulares de la api de giphy
    fetch('https://upload.giphy.com/v1/gifs/' + '?api_key=' + apiKey, {
        method: 'POST', //or 'PUT'
        body: gif,
    }).then( res => {
        console.log(res.status);
        if (res.status != 200 ) {
            uploadMessage.innerHTML = `<h3>Hubo un error subiendo tu Guifo</h3>`;
        }
        return res.json();
    }).then(data => {
        uploadMessage.classList.add('hidden');
        document.getElementById('share-modal-wrapper').classList.remove('hidden');
        const gifId = data.data.id;
        getGifDetails(gifId);
    })
    .catch(error => {
        uploadMessage.innerHTML = `<h3>Hubo un error subiendo tu Guifo</h3>`;
        console.log('Error: ', error);
    });
}

function getGifDetails(id) {

    fetch(apiBaseUrl + id + '?api_key=' + apiKey)
        .then( (response) => {
            return response.json();
        }) .then( (data) => {
            const gifURL = data.data.url;
            localStorage.setItem('gif' + data.data.id, JSON.stringify(data));

            /*Seteamos el DOM para mostrar nuestro modal de succes*/
            document.getElementById('share-modal-preview').src = data.data.images.fixed_height.url;
            const copyModal = document.getElementById('copy-success');
            preview.classList.remove('hidden');
            main.classList.add('gray');
            nav.classList.add('gray');

            download.href = gifURL;

            copy.addEventListener('click', async () => {
                await navigator.clipboard.writeText(gifUrl);
                copyModal.innerHTML = 'Link copiado con éxito!';
                copyModal.classList.remove('hidden');
                setTimeout(() => {copyModal.classList.add('hidden') }, 500);
            })

            document.getElementById('finish').addEventListener('click', () => {
                location.reload();
            })
        }) .catch( (error) => {
                return error;  
        });
}

function getMyGifs() {
    let items = [];
    for (let i = 0; i < localStorage.length; i++) {
        let item = localStorage.getItem(localStorage.key(i));
        console.log(item);
        if(item.includes('data')) {
            itemJson = JSON.parse(item);
            items.push(itemJson.data.images.downsized.url);
            console.log(items);
        }
    }
    return items;
}

/*---------------EVENTOS-----------------*/

start.addEventListener('click', () => {
    //cambiamos de modal pre a modal grabacion
    document.getElementById('pre-upload-tex').classList.add('hidden');
    document.getElementById('pre-upload-video').classList.remove('hidden');

    getStreamAndRecord();
});

restart.addEventListener('click', () => {
    location.reload();
    getStreamAndRecord();
})

window.addEventListener('load', () => {
    const localGifs = getMyGifs();
    console.log(localGifs);
    localGifs.forEach(item => {
        const img = document.createElement('img');
        img.src = item;
        img.classList.add('results-thumb');
        document.getElementById('results').appendChild(img);
    })
})

getMyGifs();

document.getElementById('share-done').addEventListener('click', () => {
    location.reload();
});


