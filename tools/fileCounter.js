const fs = require("fs");
const path = require("path");

const BASE_DIR = "../output/images"; // Adjust this path if needed
let previousCount = 0;

// node tools/fileCounter.js
function countImages(dir) {
  // Counts the number of images in the specified directory and displays the count.
  let count = 0;

  // Recursive function to count images in the directory
  function countFilesInDirectory(directory) {
    const files = fs.readdirSync(directory);
    files.forEach((file) => {
      const fullPath = path.join(directory, file);
      if (fs.statSync(fullPath).isDirectory()) {
        countFilesInDirectory(fullPath); // Recursively count in subdirectories
      } else if (path.extname(file) === ".jpg") {
        count++; // Increment for each image file found
      }
    });
  }

  countFilesInDirectory(dir);
  return count;
}

function updateCounter() {
  const currentCount = countImages(BASE_DIR);
  console.clear(); // Clear the console for cleaner output
  console.log(`Counted: ${currentCount.toLocaleString()} cards.`);
  previousCount = currentCount;
}

// Update counter every second
setInterval(updateCounter, 500);
