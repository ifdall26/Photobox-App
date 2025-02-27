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

// **Ukuran Tetap untuk Kolase**
const COLLAGE_WIDTH = 420;
const COLLAGE_HEIGHT = 1390;
const PHOTO_HEIGHT = 325; // Dihitung otomatis agar pas
const MAX_PHOTOS = 4;
const SPACING = 10; // Jarak antar foto
const BORDER_SIZE = 30; // Frame luar kolase

// Aktifkan Kamera
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

function takePhoto() {
  let img = new Image();
  canvas.width = COLLAGE_WIDTH;
  canvas.height = PHOTO_HEIGHT;
  ctx.drawImage(video, 0, 0, COLLAGE_WIDTH, PHOTO_HEIGHT);
  img.src = canvas.toDataURL("image/png");
  img.onload = function () {
    tempImage = img;
    addToCollageButton.disabled = false;
  };
}

function handleUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  let reader = new FileReader();
  reader.onload = function (e) {
    let img = new Image();
    img.src = e.target.result;
    img.onload = function () {
      tempImage = cropToAspectRatio(img, COLLAGE_WIDTH / PHOTO_HEIGHT);
      addToCollageButton.disabled = false;
    };
  };
  reader.readAsDataURL(file);
}

function addPhotoToCollage() {
  if (!tempImage || photos.length >= MAX_PHOTOS) return;

  const croppedImage = cropToAspectRatio(
    tempImage,
    COLLAGE_WIDTH / PHOTO_HEIGHT
  );
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  tempCanvas.width = COLLAGE_WIDTH;
  tempCanvas.height = PHOTO_HEIGHT;
  tempCtx.drawImage(croppedImage, 0, 0, COLLAGE_WIDTH, PHOTO_HEIGHT);

  photos.push(tempCanvas.toDataURL("image/png"));
  tempImage = null;
  addToCollageButton.disabled = true;
  updateCollage();
}

function updateCollage() {
  const totalHeight = COLLAGE_HEIGHT;

  collageCanvas.width = COLLAGE_WIDTH + BORDER_SIZE * 2;
  collageCanvas.height = totalHeight;

  collageCtx.fillStyle = "white";
  collageCtx.fillRect(0, 0, collageCanvas.width, collageCanvas.height);

  let y = BORDER_SIZE;
  photos.forEach((photo) => {
    let img = new Image();
    img.src = photo;
    img.onload = function () {
      collageCtx.drawImage(img, BORDER_SIZE, y, COLLAGE_WIDTH, PHOTO_HEIGHT);
      y += PHOTO_HEIGHT + SPACING;
    };
  });
}

function saveCollage() {
  const link = document.createElement("a");
  link.download = "photobox_collage.png";
  link.href = collageCanvas.toDataURL("image/png");
  link.click();
}

// **Fungsi untuk memastikan gambar tetap proporsional saat dipotong**
function cropToAspectRatio(image, aspectRatio) {
  let { width, height } = image;
  let targetWidth = width;
  let targetHeight = width / aspectRatio;

  if (targetHeight > height) {
    targetHeight = height;
    targetWidth = height * aspectRatio;
  }

  const offsetX = (width - targetWidth) / 2;
  const offsetY = (height - targetHeight) / 2;

  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  tempCanvas.width = COLLAGE_WIDTH;
  tempCanvas.height = PHOTO_HEIGHT;
  tempCtx.drawImage(
    image,
    offsetX,
    offsetY,
    targetWidth,
    targetHeight,
    0,
    0,
    COLLAGE_WIDTH,
    PHOTO_HEIGHT
  );

  let croppedImage = new Image();
  croppedImage.src = tempCanvas.toDataURL("image/png");
  return croppedImage;
}
