# liit-www

```
                ___       ___          ___   
               /  /\     /  /\        /  /\  
 ___     ___  /  /:/    /  /:/       /  /:/  
/__/\   /  /\/__/::\   /__/::\      /  /:/   
\  \:\ /  /:/\__\/\:\__\__\/\:\__  /  /::\   
 \  \:\  /:/    \  \:\/\  \  \:\/\/__/:/\:\  
  \  \:\/:/      \__\::/   \__\::/\__\/  \:\
   \  \::/       /__/:/    /__/:/      \  \:\
    \__\/        \__\/     \__\/        \__\/

```
[website](liit.fr) creation

:construction: This document is a draft :heavy_exclamation_mark:

## Technical Choices

- Favicon : http://realfavicongenerator.net/ (is there another option ?)
- I used [html5boilerplate](https://html5boilerplate.com/) to start with.
- I used page.js for routing
- I used gulp when I felt something couldn't get done easily with Webpack / Spike couple. Gulp manages long term caching (hashes for json js css imgs) & favicons meta injection.
- No transformation used over Contentful's data !
- Still to explain : vendor vs webpack / pagejs, templates & page.json / split data & transforms / plugin offline / gestion images
- I didn't use PageId but did it myself (because of bug)
- router and scripts
- transformations to avoid big bundle
- router : ne fonctionne qu'avec des scripts non inline
- css : tout dans un seul fichier :
```
Current strategy : all pages use the same bundle.css file.
Pros: cache. OK if pages don't have too much individual styles (increase overall size)  
Cons : Size. KO if some pages only use few individual styles ...
Let's find the critical path ... ;)
Best practices : https://github.com/jescalan/gps
```
when creating a new page :
add it to pages.js
add a controller function
add an export for this function

when creating a new js :
add it to app.js

## Routing

- for any new page, first add an entry in pages.json
- for any new page, add a new controller entry in `/js/_controllers.js`. Default behavior is :
```js
controllerName = (ctx, next) => {
    ctx.data = null
    next()
}
```
Remember that controller must have same name as page name in pages.json

## Integrating Spike with Gulp to deploy on a FTP / Apache server

## Making an hybrid SPA with Spike

## Setup

- make sure [node.js](http://nodejs.org) is at version >= `6`
- `npm i spike -g`
- clone this repo down and `cd` into the folder
- run `npm install`
- run `spike watch` or `spike compile`

## Testing
Tests are located in `test/**` and are powered by [ava](https://github.com/sindresorhus/ava)
- `npm install` to ensure devDeps are installed
- `npm test` to run test suite
