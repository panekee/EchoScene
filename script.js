const videoInput = document.getElementById('videoInput');
const video = document.getElementById('video');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultDiv = document.getElementById('result');

videoInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  video.src = URL.createObjectURL(file);
});

analyzeBtn.addEventListener('click', async () => {
  const mood = 'calm'; // análisis fake por ahora
  const res = await fetch('music-library.json');
  const library = await res.json();
  const match = library.find(m => m.mood === mood);

  resultDiv.innerHTML = match
    ? `Recomendada: <a href="${match.url}">${match.title}</a>`
    : 'No se encontró coincidencia.';
});
