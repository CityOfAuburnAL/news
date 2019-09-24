# NEWS

## Setup
```bash
$ git clone https://github.com/polymer/news.git
$ cd news
$ npm i
$ npm start
```

## Build
```bash
$ npm run build
```

## Test the build
To test prpl-server build:
```bash
$ npm run serve:prpl-server
```
To test static build:
```bash
$ npm run serve:static
```

## Deploying

Deployed on \\webserver1\inetpub\nodejs\news from \build\ directory after running `npm run build`
web.config in the root, and server.js in the build file (source for these are in the \public\ folder)
I did run npm install --save-dev prpl-server rendertron-middleware in the root but I'm not sure if it was required
IISNode was installed and the site is in IIS which just routes to node express webserver

prpl-server uses the three different builds for different browser needs and uses a proxy to render the page for certain bots like FaceBook scraper
