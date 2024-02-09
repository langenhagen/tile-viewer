/**
 * Image loading, mouse panning and zooming functionality as well as
 * file keyboard shortcut functionality.
 */
let isDragging = false;
let movementEnabled = true;
let initialMouseX;
let initialMouseY;
let originalImageWidth;
let originalImageHeight;
let images = [];
let currentImageIndex = 0;
let bookmarkedIndices = new Set();

// Reset image to its original size.
function resetToOriginalSize() {
  const background = document.querySelector(".background");
  if (originalImageWidth && originalImageHeight) {
    background.style.backgroundSize = `${originalImageWidth}px ${originalImageHeight}px`;
  }
}

// Load an image file to get its dimensions.
function loadImage(imagePath) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imagePath;
    img.onload = function () {
      originalImageWidth = img.width;
      originalImageHeight = img.height;
      resolve();
    };
    updateBookmarkIndicator();
  });
}

// Open one or several images.
async function loadImages(e) {
  const fileList = e.target.files || e.dataTransfer.files;
  images = Array.from(fileList);
  currentImageIndex = 0;
  document.getElementById("current-file-info").textContent = images[currentImageIndex].name;

  for (const [index, file] of images.entries()) {
    const reader = new FileReader();
    reader.onload = async function (event) {
      const imageData = event.target.result;
      await loadImage(imageData);
      images[index].data = imageData;
      if (index === 0) {
        document.querySelector(".background").style.backgroundImage =
          `url(${images[currentImageIndex].data})`;
        resetToOriginalSize();
      }
    };

    reader.readAsDataURL(file);

    bookmarkedIndices.clear();
  }
}

// Show the image in the specified direction (1 for next, -1 for previous).
function showImage(direction) {
  if (images.length === 0) {
    return;
  }

  currentImageIndex = (currentImageIndex + direction + images.length) % images.length;
  const newImageData = images[currentImageIndex].data;
  const background = document.querySelector(".background");
  background.style.backgroundImage = `url("${newImageData}")`;
  loadImage(newImageData);
  resetToOriginalSize();
  const file = images[currentImageIndex];
  document.getElementById("current-file-info").textContent = file.name;
}

// Toggle the visibility of the image list modal and populate it.
function toggleImageList() {
  const modal = document.getElementById("list-modal");
  if (modal.style.display === "block") {
    modal.style.display = "none";
    movementEnabled = true;
  } else {
    const imageList = document.getElementById("image-list");
    imageList.innerHTML = "";
    Array.from(images).forEach((file) => {
      const listItem = document.createElement("li");
      listItem.textContent = file.name;
      imageList.appendChild(listItem);
    });
    closeAllModals();
    movementEnabled = false;
    modal.style.display = "block";
  }
}

// Update the bookmark indicator according to the bookmark-status of the current image.
function updateBookmarkIndicator() {
  const bookmarkIndicator = document.getElementById("bookmark-indicator");
  const isBookmarked = bookmarkedIndices.has(currentImageIndex);
  bookmarkIndicator.style.color = isBookmarked ? "rgba(0, 0, 0, 1.0)" : "rgba(0, 0, 0, 0.4)";
  bookmarkIndicator.title = isBookmarked ? "Toggle Bookmark Off (m)" : "Toggle Bookmark On (m)";
}

// Bookmark or unmark the current image.
function toggleBookmark() {
  if (bookmarkedIndices.has(currentImageIndex)) {
    bookmarkedIndices.delete(currentImageIndex);
  } else {
    bookmarkedIndices.add(currentImageIndex);
  }
  updateBookmarkIndicator();
}

// Toggle the visibility of the bookmark image list modal.
function toggleBookmarksList() {
  const modal = document.getElementById("bookmarks-modal");
  if (modal.style.display === "block") {
    modal.style.display = "none";
    movementEnabled = true;
  } else {
    if (images.length === 0) {
      return;
    }

    const bookmarkList = document.getElementById("bookmark-list");
    bookmarkList.innerHTML = "";

    bookmarkedIndices.forEach((index) => {
      const listItem = document.createElement("li");
      listItem.textContent = images[index].name;
      bookmarkList.appendChild(listItem);
    });

    closeAllModals();
    movementEnabled = false;
    modal.style.display = "block";
  }
}

// Toggle the visibility of the help modal.
function toggleHelp() {
  const helpContent = document.getElementById("help-modal");
  if (helpContent.style.display === "block") {
    helpContent.style.display = "none";
    movementEnabled = true;
  } else {
    closeAllModals();
    helpContent.style.display = "block";
    movementEnabled = false;
  }
}

// Close all modal dialogues.
function closeAllModals() {
  const modals = document.querySelectorAll(".modal-content");
  modals.forEach((modal) => {
    modal.style.display = "none";
  });
  movementEnabled = true;
}

// Set the initial image from the CSS file.
document.addEventListener("DOMContentLoaded", () => {
  const initialImagePath = "default.jpg";
  loadImage(initialImagePath);
  resetToOriginalSize();
  document.querySelector(".background").style.backgroundImage = `url(${initialImagePath})`;
  document.getElementById("current-file-info").textContent = initialImagePath;
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
  if (!movementEnabled) {
    return;
  }
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
  if (!movementEnabled) {
    return;
  }

  const delta = e.deltaY;
  const scaleChange = delta > 0 ? 1.1 : 0.9;

  const background = document.querySelector(".background");
  const currentBackgroundSize = getComputedStyle(background).backgroundSize.split(" ");
  const currentBackgroundSizeX = parseFloat(currentBackgroundSize[0].replace("px", ""));
  const currentBackgroundSizeY = parseFloat(currentBackgroundSize[1].replace("px", ""));
  const newBackgroundSizeX = currentBackgroundSizeX * scaleChange;
  const newBackgroundSizeY = currentBackgroundSizeY * scaleChange;
  background.style.backgroundSize = `${newBackgroundSizeX}px ${newBackgroundSizeY}px`;

  // Zoom around mouse as the center point
  const offsetX = e.clientX - background.offsetLeft;
  const offsetY = e.clientY - background.offsetTop;
  const currentBackgroundPosition = getComputedStyle(background).backgroundPosition.split(" ");
  const currentBackgroundPositionX = parseFloat(currentBackgroundPosition[0].replace("px", ""));
  const currentBackgroundPositionY = parseFloat(currentBackgroundPosition[1].replace("px", ""));
  const scaledPositionX = (currentBackgroundPositionX - offsetX) * scaleChange + offsetX;
  const scaledPositionY = (currentBackgroundPositionY - offsetY) * scaleChange + offsetY;
  background.style.backgroundPositionX = `${scaledPositionX}px`;
  background.style.backgroundPositionY = `${scaledPositionY}px`;
});

// Change image files.
document.getElementById("file-input").addEventListener("change", loadImages);

// Prevent the default behavior of opening files when they are dragged over the document.
document.addEventListener("dragover", (e) => {
  e.preventDefault();
});

// Prevent the default behavior of opening files when they are dragged over the document.
document.addEventListener("drop", async (e) => {
  e.preventDefault();
  loadImages(e);
  closeAllModals();
  const fileInput = document.getElementById("file-input");
  fileInput.value = "";
});

// Copy the content of the `current-file-info` span to the clipboard.
function copyFileNameToClipboard() {
  const textToCopy = document.getElementById("current-file-info").textContent;
  navigator.clipboard.writeText(textToCopy).catch((error) => {
    console.error("Unable to copy to clipboard:", error);
  });
}

// Keyboard shortcut listener.
document.addEventListener("keydown", (e) => {
  key = e.key;

  const isModifierKey = e.ctrlKey || e.altKey || e.metaKey;
  if (isModifierKey) return;

  if (key === "?") {
    toggleHelp(); // Toggle help modal on "?" key press
  } else if (key.toLowerCase() === "o") {
    document.getElementById("file-input").click(); // Open file dialog
    closeAllModals();
  } else if (key.toLowerCase() === "l") {
    toggleImageList(); // Toggle file list modal
  } else if (key === "0") {
    resetToOriginalSize(); // Reset to original size
  } else if (key === "ArrowRight" || key.toLowerCase() === "k" || key === "[") {
    showImage(1); // Next image
  } else if (key === "ArrowLeft" || key.toLowerCase() === "j" || key === "]") {
    showImage(-1); // Previous image
  } else if ((key.toLowerCase() === "c" && !e.ctrlKey && !e.metaKey) || key.toLowerCase() === "y") {
    copyFileNameToClipboard(); // Copy file name
  } else if (key.toLowerCase() === "m" || key === "'") {
    toggleBookmark(); // Toggle bookmark image
  } else if (key.toLowerCase() === "b") {
    toggleBookmarksList(); // Toggle bookmark list modal
  } else if (key === "Escape") {
    closeAllModals(); // Close all modals
  }
});
