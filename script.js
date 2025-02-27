const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const captureButton = document.getElementById("capture");
const countdownElement = document.getElementById("countdown");
const collageCanvas = document.getElementById("collageCanvas");
const collageCtx = collageCanvas.getContext("2d");
const saveButton = document.getElementById("savePhoto");
let photos = [];
let photoCount = 3; // Default 3 foto

document.getElementById("photoCount").addEventListener("change", function () {
  photoCount = parseInt(this.value);
});

navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => console.error("Error accessing webcam:", err));

captureButton.addEventListener("click", () => {
  startCountdown(3, takePhoto);
});

function startCountdown(seconds, callback) {
  countdownElement.innerText = seconds;
  let interval = setInterval(() => {
    seconds--;
    countdownElement.innerText = seconds;
    if (seconds <= 0) {
      clearInterval(interval);
      countdownElement.innerText = "";
      callback();
    }
  }, 1000);
}

function takePhoto() {
  if (photos.length >= photoCount) {
    generateCollage();
    return;
  }

  const videoAspectRatio = video.videoWidth / video.videoHeight;
  const targetWidth = 400;
  const targetHeight = targetWidth / videoAspectRatio; // Jaga skala tetap proporsional

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

  // Simpan foto tanpa distorsi
  let img = new Image();
  img.src = canvas.toDataURL("image/png");
  img.onload = function () {
    let tempCanvas = document.createElement("canvas");
    let tempCtx = tempCanvas.getContext("2d");

    // Buat ukuran bingkai tetap dengan aspect ratio asli
    let frameWidth = targetWidth;
    let frameHeight = targetHeight;
    tempCanvas.width = frameWidth;
    tempCanvas.height = frameHeight;

    // Latar belakang putih
    tempCtx.fillStyle = "white";
    tempCtx.fillRect(0, 0, frameWidth, frameHeight);

    // Gambar foto di tengah tanpa distorsi
    let offsetX = (frameWidth - targetWidth) / 2;
    let offsetY = (frameHeight - targetHeight) / 2;
    tempCtx.drawImage(img, offsetX, offsetY, targetWidth, targetHeight);

    photos.push(tempCanvas.toDataURL("image/png"));

    if (photos.length < photoCount) {
      startCountdown(3, takePhoto);
    } else {
      generateCollage();
    }
  };
}

function generateCollage() {
  const photoWidth = 400;
  const aspectRatio = video.videoWidth / video.videoHeight;
  const photoHeight = photoWidth / aspectRatio; // Jaga proporsi foto
  const spacing = 20;
  const borderSize = 30;
  const totalHeight =
    photoHeight * photoCount + spacing * (photoCount - 1) + borderSize * 2;

  collageCanvas.width = photoWidth + borderSize * 2;
  collageCanvas.height = totalHeight;

  // Background bingkai putih
  collageCtx.fillStyle = "white";
  collageCtx.fillRect(0, 0, collageCanvas.width, collageCanvas.height);

  let y = borderSize;

  photos.forEach((photo) => {
    let img = new Image();
    img.src = photo;
    img.onload = function () {
      collageCtx.drawImage(img, borderSize, y, photoWidth, photoHeight);
      y += photoHeight + spacing;
    };
  });
}

saveButton.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "photobox_strip.png";
  link.href = collageCanvas.toDataURL("image/png");
  link.click();
});
