// Image loading, mouse panning and zooming functionality as well as
// file keyboard shortcut functionality.

let isDragging = false;
let initialMouseX;
let initialMouseY;
let originalImageWidth;
let originalImageHeight;

// Reset image to its original size.
function resetToOriginalSize() {
  const background = document.querySelector(".background");
  if (originalImageWidth && originalImageHeight) {
    background.style.backgroundSize = `${originalImageWidth}px ${originalImageHeight}px`;
  }
}

// Load an image.
function loadImage(imagePath) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imagePath;
    img.onload = function () {
      originalImageWidth = img.width;
      originalImageHeight = img.height;
      resolve();
    };
  });
}

// Set the initial image from the CSS file.
document.addEventListener("DOMContentLoaded", () => {
  const initialImagePath = "default.jpg";
  loadImage(initialImagePath);
  resetToOriginalSize();
  document.querySelector(".background").style.backgroundImage = `url(${initialImagePath})`;
});

document.querySelector(".background").addEventListener("mousedown", (e) => {
  isDragging = true;
  initialMouseX = e.clientX;
  initialMouseY = e.clientY;
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

// Panning functionality.
document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const deltaX = e.clientX - initialMouseX;
    const deltaY = e.clientY - initialMouseY;

    const background = document.querySelector(".background");
    const currentBackgroundPosition = getComputedStyle(background).backgroundPosition.split(" ");
    const currentBackgroundPositionX = parseFloat(currentBackgroundPosition[0].replace("px", ""));
    const currentBackgroundPositionY = parseFloat(currentBackgroundPosition[1].replace("px", ""));

    background.style.backgroundPositionX = `${currentBackgroundPositionX + deltaX}px`;
    background.style.backgroundPositionY = `${currentBackgroundPositionY + deltaY}px`;

    initialMouseX = e.clientX;
    initialMouseY = e.clientY;
  }
});

// Zooming functionality.
document.addEventListener("wheel", (e) => {
  const delta = e.deltaY;
  const scaleChange = delta > 0 ? 1.1 : 0.9;

  const background = document.querySelector(".background");
  const currentBackgroundSize = getComputedStyle(background).backgroundSize.split(" ");
  const currentBackgroundSizeX = parseFloat(currentBackgroundSize[0].replace("px", ""));
  const newBackgroundSizeX = currentBackgroundSizeX * scaleChange;

  background.style.backgroundSize = `${newBackgroundSizeX}px auto`;
});

// Change background file.
document.getElementById("file-input").addEventListener("change", async (e) => {
  const fileInput = e.target;
  const selectedFile = fileInput.files[0];

  if (selectedFile) {
    const reader = new FileReader();
    reader.onload = async function (event) {
      const newImagePath = event.target.result;
      await loadImage(newImagePath);
      document.querySelector(".background").style.backgroundImage = `url(${newImagePath})`;
      resetToOriginalSize();
    };

    reader.readAsDataURL(selectedFile);
  }
});

// Keyboard shortcut listener.
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "o") {
    document.getElementById("file-input").click();
  } else if (e.ctrlKey && e.key === "0") {
    resetToOriginalSize();
  }
});
