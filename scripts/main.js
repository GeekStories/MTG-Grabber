const { Worker, isMainThread, workerData } = require("worker_threads");
const os = require("os");
const fs = require("fs");

const rawData = fs.readFileSync("../output/cards.json", "utf8");
let dataArray = JSON.parse(rawData);

const totalCards = dataArray.length;

// Number of worker threads (use number of CPU cores for efficiency)
const numWorkers = Math.max(1, Math.floor(os.cpus().length / 2));
const chunkSize = Math.ceil(dataArray.length / numWorkers);

// Function to split the array into chunks
const splitArray = (array, chunkSize) => {
  return Array.from({ length: numWorkers }, (_, i) =>
    array.slice(i * chunkSize, (i + 1) * chunkSize)
  );
};

const chunks = splitArray(dataArray, chunkSize);
let chunkSizes = [];
chunks.forEach((chunk) => chunkSizes.push(chunk.length));

if (isMainThread) {
  let completedWorkers = 0;

  console.log(`Spawning ${numWorkers} workers...`);
  const progress = new Array(numWorkers).fill(0); // Track progress for each worker

  chunks.forEach((chunk, index) => {
    // Pass the pool to the worker as part of the workerData
    const worker = new Worker("./worker.js", {
      workerData: { chunk, id: index },
    });

    worker.on("message", (msg) => {
      // Update progress for the respective worker
      progress[msg.workerId] = msg.count;
      displayProgress(progress, chunkSizes);
    });

    worker.on("error", (err) => console.error(`Worker ${index} error:`, err));

    worker.on("exit", () => {
      completedWorkers++;
      if (completedWorkers === numWorkers) {
        console.log("All workers completed.");
        process.exit();
      }
    });
  });
}

function displayProgress(progress) {
  const totalProcessed = progress.reduce((sum, count) => sum + count, 0);
  const percentComplete = ((totalProcessed / totalCards) * 100).toFixed(2);

  console.clear(); // Clear the console for a cleaner update
  console.log(`Progress: ${percentComplete}%`);
  progress.forEach((processed, index) => {
    console.log(`Worker ${index + 1}: ${processed}/${chunkSizes[index]}`);
  });
}
