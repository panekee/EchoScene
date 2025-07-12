const videoInput = document.getElementById('videoInput');
const video = document.getElementById('video');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultDiv = document.getElementById('result');

videoInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  video.src = URL.createObjectURL(file);
});

analyzeBtn.addEventListener('click', async () => {
  resultDiv.innerText = 'Analizando audio...';

  const context = new AudioContext();
  const source = context.createMediaElementSource(video);
  const analyser = context.createAnalyser();
  source.connect(analyser);
  analyser.connect(context.destination);

  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  let totalEnergy = 0;
  let samples = 0;

  video.play();

  const analyzeFrame = () => {
    analyser.getByteFrequencyData(dataArray);
    const sum = dataArray.reduce((a, b) => a + b, 0);
    totalEnergy += sum;
    samples++;

    if (!video.paused && !video.ended) {
      requestAnimationFrame(analyzeFrame);
    } else {
      const avgEnergy = totalEnergy / samples;
      const mood = avgEnergy > 20000 ? 'energetic' : 'calm';
      fetchAndMatchMood(mood);
    }
  };

  analyzeFrame();
});

async function fetchAndMatchMood(mood) {
  const res = await fetch('music-library.json');
  const library = await res.json();
  const match = library.find(m => m.mood === mood);

  resultDiv.innerHTML = match
    ? `Mood detectado: <b>${mood}</b><br>Recomendada: <a href="${match.url}" target="_blank">${match.title}</a>`
    : `No se encontró música para mood: ${mood}`;
}
