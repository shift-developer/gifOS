/*--------------------------- CONSTANTES ---------------------------*/ 
/*API*/
const APIKEY = '?api_key=CAllNkSvYhmRBlXwfjBCJcvN3CZJ69w5';
const API_BASE_URL = 'https://api.giphy.com/v1/gifs/';
const API_UPLOAD = 'https://upload.giphy.com/v1/gifs/';

/*DOM*/
const start = document.getElementById('permiso-comenzar'); //btn comenzar
const video = document.querySelector('video'); //<video>
const record = document.getElementById('record'); //btn capturar
const stop = document.getElementById('stop'); //img btn capturar
const restart = document.getElementById('restart'); //btn repetir captura
const upload = document.getElementById('upload'); //btn subir guifo
const preview = document.getElementById('preview'); //img gif de preview
const progressBar = document.getElementsByClassName('progress-bar-item'); //progress bar items array
const uploadMessage = document.getElementById('upload-msg'); //container de mensaje de subiendo gif
const download = document.getElementById('download'); //boton descargar guifo
const copy = document.getElementById('copy'); //boton copiar link
const ventanaCrearGuifos = document.querySelector('#ventana-crearguifos');

/*---------------------------- VARIABLES ----------------------------*/ 
let recorder;
let recording = false; //para el manejo del timer
let contador = 0;

/*------------------------- GLOBAL FUNCTIONS -------------------------*/ 
function getStreamAndRecord() {

    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            height: { max: 480 }
        }
    }) 
    .then( (stream) => {
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
                    }
                );

                recorder.startRecording();
                getDuration();

                record.classList.add('capturandobtn');
                record.innerHTML = 'Listo';
                stop.classList.add('capturandobtn');

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

    //aca obtenemos el blob con la variable global recorder, que ya tiene el gif guardado para la preview
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
    fetch(API_UPLOAD + APIKEY, {
        method: 'POST', //or 'PUT'
        body: gif,
    }).then( res => {
        if (res.status != 200 ) {
            uploadMessage.innerHTML = `<h3 class="error-msg">Hubo un error subiendo tu Guifo</h3>`;
        }
        return res.json();
    }).then(data => {
        uploadMessage.classList.add('hidden');
        document.getElementById('share-modal-wrapper').classList.remove('hidden');
        const gifId = data.data.id;
        getGifDetails(gifId);
    })
    .catch(error => {
        uploadMessage.innerHTML = `<h3 class="error-msg">Hubo un error subiendo tu Guifo</h3>`;
        console.log('Error: ', error);
    });
}

function getGifDetails(id) {

    fetch(API_BASE_URL + id + APIKEY)
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
        
        if(item.includes('data')) {
            itemJson = JSON.parse(item);
            items.push(itemJson.data.images.downsized.url);
        }
    }
    return items;
}


/*------------------------------- EVENTS AND FUNCTIONS CALLS -------------------------------*/ 
/*BOTÓN COMENZAR*/
start.addEventListener('click', () => {
    //cambiamos de modal pre a modal grabacion
    ventanaCrearGuifos.classList.add('captura-container');
    document.querySelector('#pre-upload-text').classList.add('hidden');
    document.querySelector('#pre-upload-video').classList.remove('hidden');

    getStreamAndRecord();
});

/*BOTÓN REPETIR CAPTURA*/
restart.addEventListener('click', () => {
    location.reload();
    getStreamAndRecord();
})

/*MIS GUIFOS */
window.addEventListener('load', () => {
    const localGifs = getMyGifs();

    localGifs.forEach(item => {
        const img = document.createElement('img');
        img.src = item;
        img.classList.add('results-thumb');
        document.getElementById('results').appendChild(img);
    })
})

getMyGifs();

document.getElementById('share-done').addEventListener('click', () => {
    ventanaCrearGuifos.classList.remove('captura-container');
    location.reload();
});

