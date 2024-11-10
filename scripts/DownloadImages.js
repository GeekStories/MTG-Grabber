const fs = require("fs");
const https = require("https");
const http = require("http");

const cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));
const BASE_DIR = "./images";
const TIMEOUT = 10000; // 10 seconds timeout for each download

if (!fs.existsSync(BASE_DIR)) fs.mkdirSync(BASE_DIR, { recursive: true });

async function downloadImage(card) {
  const { id, set_id, image_uris, layout, card_faces = [] } = card;
  if (!id || !set_id || (!image_uris && card_faces.length === 0) || !layout) {
    return;
  }

  const set_dir = `${BASE_DIR}/${set_id}`;
  if (!fs.existsSync(set_dir)) fs.mkdirSync(set_dir, { recursive: true });

  // For double-faced or transform cards
  if (
    layout === "transform" ||
    layout === "modal_dfc" ||
    layout === "art_series"
  ) {
    if (card_faces.length !== 2) return;

    const side1 = card_faces[0];
    const side2 = card_faces[1];
    const side1_url =
      side1?.image_uris?.normal ||
      side1?.image_uris?.border_crop ||
      side1?.image_uris?.large ||
      side1?.image_uris?.small;
    const side2_url =
      side2?.image_uris?.normal ||
      side2?.image_uris?.border_crop ||
      side2?.image_uris?.large ||
      side2?.image_uris?.small;

    if (!side1_url || !side2_url) return;

    const side1_dir = `${set_dir}/${id}.jpg`;
    const side2_dir = `${set_dir}/${id}-2.jpg`;

    // Download each side if it doesn't exist
    if (!fs.existsSync(side1_dir)) {
      await downloadImageFromURL(side1_url, side1_dir, id);
    }

    if (!fs.existsSync(side2_dir)) {
      await downloadImageFromURL(side2_url, side2_dir, id + "-2");
    }
  } else {
    // For single-sided cards
    const card_dir = `${set_dir}/${id}.jpg`;
    if (fs.existsSync(card_dir)) return;

    const url =
      image_uris?.normal ||
      image_uris?.border_crop ||
      image_uris?.large ||
      image_uris?.small;
    if (!url) return;

    await downloadImageFromURL(url, card_dir, id);
  }
}

function downloadImageFromURL(url, path, id) {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(path);
    const protocol = url.startsWith("https") ? https : http;

    const req = protocol.get(url, { timeout: TIMEOUT }, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          console.log(`💾 ${id} | Saved to ${path}`);
          resolve();
        });
      } else {
        console.error(
          `❌ ${id} | Failed to download ${url}. Status Code: ${response.statusCode}`
        );
        file.close();
        fs.unlink(path, () => resolve()); // Delete partial file, then resolve
      }
    });

    req.on("timeout", () => {
      req.abort();
      console.error(`⏲️ ${id} | Timeout while downloading ${url}`);
      fs.unlink(path, () => resolve()); // Delete partial file, then resolve
    });

    req.on("error", (err) => {
      console.error(`❌ ${id} | Error downloading ${url}: ${err.message}`);
      fs.unlink(path, () => resolve()); // Delete partial file, then resolve
    });
  });
}

async function downloadImages() {
  for (const card of cards) {
    await downloadImage(card);
  }
}

downloadImages();
