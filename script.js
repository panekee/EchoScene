const videoInput = document.getElementById('videoInput');
const video = document.getElementById('video');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultDiv = document.getElementById('result');
const overlay = document.getElementById('overlay');
const status = document.getElementById('status');

// Cargar modelos de face-api.js desde CDN
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js/models')
]).then(() => {
  status.textContent = "Modelos cargados. Listo.";
});

// Reproducir video desde archivo
videoInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  video.src = URL.createObjectURL(file);
  video.load();
});

// Análisis principal
analyzeBtn.addEventListener('click', async () => {
  resultDiv.innerHTML = "Analizando emociones...";
  overlay.width = video.videoWidth;
  overlay.height = video.videoHeight;

  const context = overlay.getContext('2d');
  let emotionCounts = {};
  let currentTime = 0;
  const step = 1; // segundos entre capturas

  video.muted = true;
  video.play();

  const processFrame = async () => {
    if (currentTime >= video.duration) {
      video.pause();
      const dominant = getDominantEmotion(emotionCounts);
      const song = await getSongByMood(dominant);
      resultDiv.innerHTML = `Emoción dominante: <b>${dominant}</b><br>Recomendación: <a href="${song.url}">${song.title}</a>`;
      return;
    }

    video.currentTime = currentTime;
    await new Promise(r => setTimeout(r, 500)); // esperar cambio de frame

    context.drawImage(video, 0, 0, overlay.width, overlay.height);
    const detections = await faceapi.detectAllFaces(overlay, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();

    detections.forEach(det => {
      const expr = det.expressions.asSortedArray()[0];
      emotionCounts[expr.expression] = (emotionCounts[expr.expression] || 0) + 1;
    });

    currentTime += step;
    processFrame();
  };

  processFrame();
});

// Emoción más frecuente
function getDominantEmotion(counts) {
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

// Mapea emoción a canción
async function getSongByMood(emotion) {
  const moodMap = {
    happy: 'happy',
    sad: 'sad',
    angry: 'dramatic',
    disgusted: 'dramatic',
    surprised: 'energetic',
    fearful: 'sad',
    neutral: 'calm'
  };

  const mood = moodMap[emotion] || 'calm';
  const res = await fetch('music-library.json');
  const library = await res.json();
  return library.find(track => track.mood === mood);
}
