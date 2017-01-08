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
liit.fr website creation

## Technical Choices

- I used [html5boilerplate](https://html5boilerplate.com/) to start with.
- I used page.js for routing
- I used gulp when I felt something couldn't get done easily with Webpack / Spike couple. Gulp manages long term caching (hashes) & favicons meta injection.
- No transformation used over Contentful's data !
- Still to explain : vendor vs webpack / pagejs, templates & page.json / split data & transforms / plugin offline / gestion images
- I didn't use PageId but did it myself (because of bug)
- router and scripts
- transformations to avoid big bundle

## Routing

- for any new page, first add an entry in pages.json
- for any new page, add a new controller entry in `/js/_controllers.js`. Default behavior is :
```
controllerName = (ctx, next) => {
  ctx.data = null
  next()
}
```
Remember that controller must have same name as page name in pages.json

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
