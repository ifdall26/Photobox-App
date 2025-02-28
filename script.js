const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const captureButton = document.getElementById("capture");
const uploadInput = document.getElementById("uploadImage");
const addToCollageButton = document.getElementById("addToCollage");
const collageCanvas = document.getElementById("collageCanvas");
const collageCtx = collageCanvas.getContext("2d");
const saveButton = document.getElementById("savePhoto");
const countdownElement = document.getElementById("countdown");
const photoPreview = document.getElementById("photoPreview");
const frameColorInput = document.getElementById("frameColor");

let frameColor = "#fff"; // Default hitam
let photos = [];
let tempImage = null;

// **Ukuran Tetap untuk Kolase**
const COLLAGE_WIDTH = 420;
const COLLAGE_HEIGHT = 1390;
const PHOTO_HEIGHT = 325;
const MAX_PHOTOS = 4;
const SPACING = 10;
const BORDER_SIZE = 30;

frameColorInput.addEventListener("input", (event) => {
  frameColor = event.target.value;
  updateCollage();
});

// **Aktifkan Kamera**
navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => console.error("Error accessing webcam:", err));

// **Event Listeners**
captureButton.addEventListener("click", startCountdown);
uploadInput.addEventListener("change", handleUpload);
addToCollageButton.addEventListener("click", addPhotoToCollage);
saveButton.addEventListener("click", saveCollage);

// **Hitung Mundur Sebelum Ambil Foto**
function startCountdown() {
  let count = 3;
  countdownElement.textContent = count;
  countdownElement.style.display = "flex"; // Pastikan countdown terlihat

  let interval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownElement.textContent = count;
    } else {
      clearInterval(interval);
      countdownElement.style.display = "none"; // Sembunyikan setelah selesai
      takePhoto();
    }
  }, 1000);
}

// **Ambil Foto dari Kamera**
function takePhoto() {
  let img = new Image();
  let videoWidth = video.videoWidth;
  let videoHeight = video.videoHeight;

  let videoAspectRatio = videoWidth / videoHeight;
  let collageAspectRatio = COLLAGE_WIDTH / PHOTO_HEIGHT;

  let targetWidth = videoWidth;
  let targetHeight = videoHeight;
  let offsetX = 0;
  let offsetY = 0;

  if (videoAspectRatio < collageAspectRatio) {
    targetHeight = videoWidth / collageAspectRatio;
    offsetY = (videoHeight - targetHeight) / 2;
  } else {
    targetWidth = videoHeight * collageAspectRatio;
    offsetX = (videoWidth - targetWidth) / 2;
  }

  canvas.width = COLLAGE_WIDTH;
  canvas.height = PHOTO_HEIGHT;

  // 🔄 **Flip Horizontal**
  ctx.save(); // Simpan state canvas
  ctx.scale(-1, 1); // Balik secara horizontal
  ctx.drawImage(
    video,
    offsetX,
    offsetY,
    targetWidth,
    targetHeight,
    -COLLAGE_WIDTH, // Gambar di sisi kiri negatif agar tidak terpotong
    0,
    COLLAGE_WIDTH,
    PHOTO_HEIGHT
  );
  ctx.restore(); // Kembalikan transformasi ke normal

  // **Tampilkan Preview**
  img.src = canvas.toDataURL("image/png");
  img.onload = function () {
    tempImage = img;
    addToCollageButton.disabled = false;
    photoPreview.src = img.src;
    photoPreview.style.display = "block";
  };
}

// **Upload Gambar dari File**
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
      photoPreview.src = tempImage.src;
      photoPreview.style.display = "block";
    };
  };
  reader.readAsDataURL(file);
}

// **Tambahkan Foto ke Kolase**
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

  // **Sembunyikan Preview Setelah Ditambahkan ke Kolase**
  photoPreview.style.display = "none";
}

function updateCollage() {
  collageCanvas.width = COLLAGE_WIDTH + BORDER_SIZE * 2;
  collageCanvas.height = COLLAGE_HEIGHT;

  // Bersihkan canvas sebelum menggambar ulang
  collageCtx.clearRect(0, 0, collageCanvas.width, collageCanvas.height);

  // Gunakan warna frame yang dipilih
  collageCtx.fillStyle = frameColor;
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

// **Simpan Kolase sebagai Gambar**
function saveCollage() {
  const link = document.createElement("a");
  link.download = "photobox_collage.png";
  link.href = collageCanvas.toDataURL("image/png");
  link.click();
}

// **Fungsi Crop agar Gambar Proporsional**
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
