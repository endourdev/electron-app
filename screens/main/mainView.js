document.addEventListener("DOMContentLoaded", function () {
  window.bridge.updateMessage(updateMessage);
  window.bridge.onUpdateProgress(updateProgress);
});

function updateMessage(event, message) {
  console.log("message logged in view");
  let elemE = document.getElementById("message");
  elemE.innerHTML = message;
}

function updateProgress(event, percent) {
  let container = document.getElementById('updateProgress');
  let bar = document.getElementById('progressBar');
  let text = document.getElementById('progressText');
  if (!container || !bar || !text) return;
  container.style.display = 'block';

  let p = 0;
  if (typeof percent === 'object' && percent !== null) {
    p = percent.percent || (percent.total ? Math.floor((percent.transferred / percent.total) * 100) : 0);
  } else {
    p = Number(percent) || 0;
  }

  bar.value = p;
  text.innerText = p + '%';
  if (p >= 100) text.innerText = 'Download complete';
}