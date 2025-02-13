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

1.  Clone this repo `gh repo clone GeekStories/MTG-Grabber`
2.  Open a terminal and run `npm install` to install all the dependencies
3.  Place your Postgres database connection url in the `.env` file. (a default localhost connection string is provided already)
4.  Create a table called `cards` in your database (use `./sql/cards.sql` for the defaults)

# Usage

_both scripts use the same `data source`._

To start filling your postgres database with magic cards and downloading the card images, you need a `data source`. You can find these hosted at and updated regularly by the scryfall api service. https://scryfall.com/docs/api/bulk-data.

I recommend the `Default Cards` file (~450MB) as this is what I built this around. Once downloaded, place this file in a called `output` and rename it to `cards.json`.

You are ready to begin filling your database!

## Filling the database

Currently, only some of the data is taken from the data source. You can change which items are taken by modifying the SQL query in `script/worker.js`.

```js
const query = `
    INSERT INTO cards (
        ...
    ) VALUES (
        ...
    ) ...`;
```

You will also need to make changes to the query call

```js
    await client.query(query, [
        ...
    ]);
```

### Running the script

The script spawns workers which each process a chunk of the overall cards data. This speeds the process up a bit as doing this on a single thread takes a few hours.

*Ensure you have a local PostgreSQL instance running (Or, edit the [.env](./env) with your own credentials)!*
*The easiest way is with [Docker](https://www.docker.com/) (see provided [docker-compose.yml](./docker-compose.yml) for more information)*

In a terminal, simply run `node ./scripts/main.js` to kick off the process!

## Downloading Card Images
*All  images are downloaded via the Scryfall API service.*

This will take a while, there are roughly `11GB` of images in total (about 105,000 individual jpg files). Buckle up, because it takes a few hours. 

- Each image is downloaded once, and on subsequent runs skipped if they already exist. This means you can close it and come back later.
- Images are named by their scryfall card id, and placed a folder which is named based on the scryfall set id of that card. This means all cards are grouped by their sets.
- Cards with a second face (back of the card) will use the same card id but with a -2 at the end of the name, the same convention is used in the Database for the `card_id` column.
- Cards with 2 faces have the `layout` of `transform/modal_dfc/art_series`, so an additional image will be downloaded with these cards only if both faces have urls avaliable.

Example of image dir once downloaded:

- #### Tamiyo, Inquisitive Student // Tamiyo, Seasoned Scholar
  - `3ed80bb6-77e8-4aa7-8262-95377a38aba1` (set id)
  - `{set id}/2a717b98-cdac-416d-bf6c-f6b6638e65d1.jpg` (front)
  - `{set id}/2a717b98-cdac-416d-bf6c-f6b6638e65d1-2.jpg` (back, if one exists)

### Running the script

`node ./scripts/DownloadImages.js`

This command will kick off the image download process. Let this run in the background, you can stop it at any time.

## Additional Tools

Under `./tools` you will find `fileCounter.js`. Run this in a separate terminal and you will have a running count on how many images you have downloaded so far.

# Troubleshooting suggestions

- Check your database connection
- Check the correct data source is placed at `./output/cards.json`
- There's probably a bug in the code, report at: [Issues](https://github.com/GeekStories/MTG-Grabber/issues)
