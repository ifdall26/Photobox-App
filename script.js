const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const captureButton = document.getElementById("capture");
const uploadInput = document.getElementById("uploadImage");
const addToCollageButton = document.getElementById("addToCollage");
const collageCanvas = document.getElementById("collageCanvas");
const collageCtx = collageCanvas.getContext("2d");
const saveButton = document.getElementById("savePhoto");
const countdownDisplay = document.getElementById("countdown");

let photos = [];
let tempImage = null;

// Ukuran lebar tetap 480px, tinggi menyesuaikan
const TARGET_WIDTH = 420;
const SPACING = 20; // Jarak antar foto
const BORDER_SIZE = 30; // Bingkai putih

// Aktifkan kamera
navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => console.error("Error accessing webcam:", err));

captureButton.addEventListener("click", startCountdown);
uploadInput.addEventListener("change", handleUpload);
addToCollageButton.addEventListener("click", addPhotoToCollage);
saveButton.addEventListener("click", saveCollage);

// Countdown sebelum ambil foto
function startCountdown() {
  let count = 3;
  countdownDisplay.textContent = count;
  countdownDisplay.style.display = "block";

  let interval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownDisplay.textContent = count;
    } else {
      clearInterval(interval);
      countdownDisplay.style.display = "none";
      takePhoto();
    }
  }, 1000);
}

// Ambil foto dari kamera
function takePhoto() {
  let img = new Image();
  canvas.width = TARGET_WIDTH;
  canvas.height = video.videoHeight / (video.videoWidth / TARGET_WIDTH);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  img.src = canvas.toDataURL("image/png");
  img.onload = function () {
    tempImage = img;
    addToCollageButton.disabled = false;
  };
}

// Upload & tambahkan ke kolase
function handleUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  let reader = new FileReader();
  reader.onload = function (e) {
    let img = new Image();
    img.src = e.target.result;
    img.onload = function () {
      tempImage = resizeImage(img, TARGET_WIDTH);
      addToCollageButton.disabled = false;
    };
  };
  reader.readAsDataURL(file);
}

// Tambahkan foto ke kolase
function addPhotoToCollage() {
  if (!tempImage) return;

  const resizedImage = resizeImage(tempImage, TARGET_WIDTH);
  photos.push(resizedImage.src);
  tempImage = null;
  addToCollageButton.disabled = true;
  updateCollage();
}

// Update tampilan kolase
function updateCollage() {
  const totalHeight =
    photos.reduce((acc, photoSrc) => {
      let img = new Image();
      img.src = photoSrc;
      return acc + img.height;
    }, 0) +
    SPACING * (photos.length - 1) +
    BORDER_SIZE * 2;

  collageCanvas.width = TARGET_WIDTH + BORDER_SIZE * 2;
  collageCanvas.height = totalHeight;

  collageCtx.fillStyle = "white"; // Background putih
  collageCtx.fillRect(0, 0, collageCanvas.width, collageCanvas.height);

  let y = BORDER_SIZE;
  photos.forEach((photo) => {
    let img = new Image();
    img.src = photo;
    img.onload = function () {
      collageCtx.drawImage(img, BORDER_SIZE, y, TARGET_WIDTH, img.height);
      y += img.height + SPACING;
    };
  });
}

// Simpan kolase ke file
function saveCollage() {
  const link = document.createElement("a");
  link.download = "photobox_collage.png";
  link.href = collageCanvas.toDataURL("image/png");
  link.click();
}

// Fungsi resize agar gambar tetap proporsional
function resizeImage(image, targetWidth) {
  let aspectRatio = image.width / image.height;
  let targetHeight = targetWidth / aspectRatio;

  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  tempCanvas.width = targetWidth;
  tempCanvas.height = targetHeight;
  tempCtx.drawImage(image, 0, 0, targetWidth, targetHeight);

  let resizedImage = new Image();
  resizedImage.src = tempCanvas.toDataURL("image/png");
  return resizedImage;
}
