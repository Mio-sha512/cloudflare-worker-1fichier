# Cloudflare Indexer for 1fichier

A simple Cloudflare worker that indexes your files on 1fichier, making them viewable and downloadable to the public.

## Getting Started

To get started with Cloudflare Indexer for 1fichier, follow these steps:

1. Login to [cloudflare.com](https://www.cloudflare.com).
2. Login to [1fichier.com](https://1fichier.com) and get your api key from [here](https://1fichier.com/console/params.pl).
3. Make a new worker and copy the contents of [`worker.js`](worker.js) into the worker.
4. Update the `API_KEY` and `ROOT_FOLDER_ID` variables with your own credentials.
5. Save the script and deploy it to Cloudflare.
6. Enjoy!

## License

Cloudflare Indexer for 1fichier is licensed under the [MIT License](LICENSE).
