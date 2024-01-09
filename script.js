/**
 * Image loading, mouse panning and zooming functionality as well as
 * file keyboard shortcut functionality.
 */
let isDragging = false;
let numOpenModals = 0;
let initialMouseX;
let initialMouseY;
let originalImageWidth;
let originalImageHeight;
let imagesDescriptions = [];
let imagesData = [];
let currentImageIndex = 0;

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
  });
}

// Show the image in the specified direction (1 for next, -1 for previous).
function showImage(direction) {
  if (imagesData.length === 0) {
    return;
  }

  currentImageIndex = (currentImageIndex + direction + imagesData.length) % imagesData.length;
  const newImageData = imagesData[currentImageIndex];
  const background = document.querySelector(".background");
  background.style.backgroundImage = `url("${newImageData}")`;
  loadImage(newImageData);
  resetToOriginalSize();
  const file = imagesDescriptions[currentImageIndex];
  document.getElementById("current-file-info").textContent = file.name;
}

// Function to toggle the visibility of the image list modal and to populate it.
function toggleImageList() {
  const modal = document.getElementById("list-modal");
  if (modal.style.display === "block") {
    modal.style.display = "none";
    numOpenModals -= 1;
  } else {
    const imageList = document.getElementById("image-list");
    imageList.innerHTML = "";
    Array.from(imagesDescriptions).forEach((file) => {
      const listItem = document.createElement("li");
      listItem.textContent = file.name;
      imageList.appendChild(listItem);
    });
    numOpenModals += 1;
    modal.style.display = "block";
  }
}

// Function to bookmark or unmark the current image.
function toggleMarkImageIndex() {
  if (bookmarkedIndices.has(currentImageIndex)) {
    bookmarkedIndices.delete(currentImageIndex);
  } else {
    bookmarkedIndices.add(currentImageIndex);
  }
}

// Function to toggle the visibility of the bookmark image list modal.
function toggleBookmarks() {
  const modal = document.getElementById("bookmarks-modal");
  if (modal.style.display === "block") {
    modal.style.display = "none";
    numOpenModals -= 1;
  } else {
    if (imagesDescriptions.length === 0) {
      return;
    }

    const bookmarkList = document.getElementById("bookmark-list");
    bookmarkList.innerHTML = "";

    bookmarkedIndices.forEach((index) => {
      const listItem = document.createElement("li");
      listItem.textContent = imagesDescriptions[index].name;
      bookmarkList.appendChild(listItem);
    });

    numOpenModals += 1;
    modal.style.display = "block";
  }
}

// Function to toggle the visibility of the help modal.
function toggleHelp() {
  const helpContent = document.getElementById("help-modal");
  if (helpContent.style.display === "block") {
    helpContent.style.display = "none";
    numOpenModals -= 1;
  } else {
    helpContent.style.display = "block";
    numOpenModals += 1;
  }
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
  if (numOpenModals !== 0) {
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
  if (numOpenModals !== 0) {
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

  // Zoom around mouse as center point
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

// Change background file.
document.getElementById("file-input").addEventListener("change", async (e) => {
  const fileInput = e.target;
  imagesDescriptions = fileInput.files;
  document.getElementById("current-file-info").textContent = imagesDescriptions[0].name;

  imagesData = [];
  currentImageIndex = 0;

  for (const file of imagesDescriptions) {
    const reader = new FileReader();

    reader.onload = async function (event) {
      const imageData = event.target.result;
      await loadImage(imageData);
      imagesData.push(imageData);
      if (imagesData.length === imagesDescriptions.length) {
        document.querySelector(".background").style.backgroundImage =
          `url(${imagesData[currentImageIndex]})`;
        resetToOriginalSize();
      }
    };

    reader.readAsDataURL(file);
  }
});

// Keyboard shortcut listener.
document.addEventListener("keydown", (e) => {
  if (e.key === "?") {
    toggleHelp(); // Toggle help on "?" key press
  } else if (e.key.toLowerCase() === "o") {
    document.getElementById("file-input").click(); // Open file dialog
  } else if (e.key.toLowerCase() === "l") {
    toggleImageList(); // Toggle file list
  } else if (e.key === "0") {
    resetToOriginalSize(); // Reset to original size
  } else if (e.key === "ArrowRight" || e.key.toLowerCase() === "k") {
    showImage(1); // Next image
  } else if (e.key === "ArrowLeft" || e.key.toLowerCase() === "j") {
    showImage(-1); // Previous image
  } else if (e.key.toLowerCase() === "c" || e.key.toLowerCase() === "y") {
    copyFileNameToClipboard(); // Copy file name
  } else if (e.key === "Escape") {
    // Close all modal dialogues on "Esc" key press
    const modals = document.querySelectorAll(".modal-content");
    modals.forEach((modal) => {
      modal.style.display = "none";
    });
    numOpenModals = 0;
  }
});

// Copy the content of the `current-file-info` span to the clipboard.
function copyFileNameToClipboard() {
  const textToCopy = document.getElementById("current-file-info").textContent;
  navigator.clipboard.writeText(textToCopy).catch((error) => {
    console.error("Unable to copy to clipboard:", error);
  });
}
