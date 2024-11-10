require("dotenv").config();

const { Client } = require("pg");
const fs = require("fs");

// Configure PostgreSQL client
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function loadData() {
  // Connect to the database
  await client.connect();

  // Load JSON data from file
  const rawData = fs.readFileSync("./cards.json", "utf8");
  const cards = JSON.parse(rawData);

  const totalCards = cards.length;

  // Prepare SQL insert statement (PARTIAL DATA INSERT)
  const query = `
    INSERT INTO cards (
      card_id, name, lang, released_at, scryfall_uri, layout, image_status, image_uris,
      mana_cost, cmc, type_line, oracle_text, colors, color_identity, keywords,
      produced_mana, card_faces, legalities, set_id, set, set_name, scryfall_set_uri,
      collector_number, rarity, card_back_id, artist, artist_ids
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
      $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
    );
  `;

  try {
    // Insert each card into the database
    for (let i = 0; i < totalCards; i++) {
      const card = cards[i];

      // We only take some of the data provided from the json file. You can adjust this as needed.
      const {
        id: card_id, // Rename original `id` to `card_id`
        name,
        lang,
        released_at,
        scryfall_uri,
        layout,
        image_status,
        image_uris,
        mana_cost,
        cmc,
        type_line,
        oracle_text,
        colors,
        color_identity,
        keywords,
        produced_mana,
        card_faces = [],
        legalities,
        set_id,
        set,
        set_name,
        scryfall_set_uri,
        collector_number,
        rarity,
        card_back_id,
        artist,
        artist_ids,
      } = card;

      // Insert into PostgreSQL, converting JSON fields as needed
      await client.query(query, [
        card_id,
        name,
        lang,
        released_at,
        scryfall_uri,
        layout,
        image_status,
        JSON.stringify(image_uris),
        mana_cost,
        cmc,
        type_line,
        oracle_text,
        JSON.stringify(colors),
        JSON.stringify(color_identity),
        JSON.stringify(keywords),
        JSON.stringify(produced_mana),
        JSON.stringify(card_faces),
        JSON.stringify(legalities),
        set_id,
        set,
        set_name,
        scryfall_set_uri,
        collector_number,
        rarity,
        card_back_id,
        artist,
        JSON.stringify(artist_ids),
      ]);

      // Update progress in the console
      process.stdout.write(`\rProcessing card ${i + 1} of ${totalCards}`);
    }

    console.log("\nData successfully inserted");
  } catch (err) {
    console.error("\nError inserting data:", err.stack);
  } finally {
    // Close the database connection
    await client.end();
  }
}

// Start the update
loadData();
