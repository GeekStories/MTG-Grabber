require("dotenv").config({ path: "../.env" });
const { parentPort, workerData } = require("worker_threads");
const { Pool } = require("pg");

const { chunk } = workerData;

async function insertData(data) {
  const MAX_DB_CONNECTIONS = 10; // Set based on your DB's max connections
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: MAX_DB_CONNECTIONS,
  });

  const client = await pool.connect();
  try {
    const query = `
        INSERT INTO cards (
          card_id, name, lang, released_at, scryfall_uri, layout, image_status, image_uris,
          mana_cost, cmc, type_line, oracle_text, colors, color_identity, keywords,
          produced_mana, card_faces, legalities, set_id, set, set_name, scryfall_set_uri,
          collector_number, rarity, card_back_id, artist, artist_ids
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
        ) ON CONFLICT(card_id) DO NOTHING;
      `;

    let count = 0;
    for (const card of data) {
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

      count += 1;

      if (count % 10 == 0)
        parentPort.postMessage({ workerId: workerData.id, count });
    }
    parentPort.postMessage(data.length);
  } catch (err) {
    console.error("Database error:", err);
  } finally {
    client.release();
    pool.end(); // Close the pool when done
  }
}

insertData(chunk).then(() => process.exit());
