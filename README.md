# MTG Grabber

Uses scryfall API to scrape data into a postgresql database and downloads all images, sorting them accordingly.

# Getting Started

## Requirements

- NodeJS 18+
- An existing postgres database (Docker or other instance)
- A few hours..

## Agreement

By using this project you agree to not spam scryfall's api service. These tools inteded use is to perform a one time operation which fills a postgres database with card data provided by scryfall, as well as sourcing card images for personal use.

## Pre-Reqs

1.  Clone this repo `github.com/geekstories/mtg-stuff`
2.  Open a terminal and run `npm install` to install all the dependencies
3.  Place your Postgres database connection url in the `.env` file. (a default localhost connection string is provided already)
4. Create a table called `cards` in your database (use `./sql/cards.sql` for the defaults)

# Usage

Both scripts can be run at the same time, or one after another (order doesn't matter). Neither script interacts with the other, they are completely separate.

However, both scripts use the same `data source`.

To start filling your postgres database with magic cards and downloading the card images, you need a `data source`. You can find these hosted at and updated regularly by the scryfall api service. https://scryfall.com/docs/api/bulk-data.

I recommend the `Default Cards` file (~450MB) as this is what I built this around. Once downloaded, place this file in a called `output` and rename it to `cards.json`.

You are ready to begin filling your database!

## Filling the database

Currently, only some of the data is taken from the data source. You can change which items are taken by modifying the SQL query in `script/CreateDatabase.js`.

```js
const query = `
    INSERT INTO cards (
        ...
    ) VALUES (
        ...
    )`;
```

You will also need to make changes to the query call

```js
    await client.query(query, [
        ...
    ]);
```

### Running the script

`node ./scripts/CreateDatabase.js`

## Downloading Card Images

This will take a while, there are `~10.5GB` of images in total. Roughly `105,000` jpg files. Buckle up, because it takes a few hours. These images are gathered using the Scryfall API service. Each image is downloaded once, and on subsequent runs are skipped if they already exist. This means you can close it, and come back later.

Images are named by their scryfall card id, and placed a folder which is named based on the scryfall set id of that card. This means all cards are grouped by their sets.

Cards with a second face (on the back of the card) will use the same card id but with a -2 at the end of the name.

Cards with 2 faces have the `layout` of `transform/modal_dfc/art_series`, so an additional image will be downloaded with these cards only if both faces have urls avaliable.

Example of image once downloaded:

- #### Tamiyo, Inquisitive Student // Tamiyo, Seasoned Scholar
  - `3ed80bb6-77e8-4aa7-8262-95377a38aba1` (set id)
  - `{set id}/2a717b98-cdac-416d-bf6c-f6b6638e65d1.jpg` (front)
  - `{set id}/2a717b98-cdac-416d-bf6c-f6b6638e65d1-2.jpg` (back)

### Running the script

`node ./scripts/DownloadImages.js`

## Additional Tools

Under `./tools` you will find `fileCounter.js`. Run this in a separate terminal and you will have a running count on how many images you have downloaded so far.

# Troubleshooting suggestions

- Check your database connection
- Check the correct data source is placed at `./output/cards.json`
- Ensure you run the command from the root folder
