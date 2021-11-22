// const { validateList, validateAddToCart, validateFilter, validateRemoveItemFromCart } = require('./validators.js');

const { createSubsription, publishMessage } = require('./controllers/publisher.js');

module.exports = app => {
    const { Ping, Health } = require('./controllers/system.js');
    // health check
    app.route('/health').get(Health)
    // status check
    app.route('/status').get(Ping)


    // create subscription
    app.route('/subscribe/:topic').post(createSubsription)

    // publish message to topic 
    app.route('/publish/:topic').post(publishMessage)


   /*  const {listFrom, listSongs, AddToCart, filterBy, listCart, PurchaseCart, removeCartItem} = require('./controllers/catalog.js')
    // genres
    app.route('/genres').get(listFrom('genre'))
    app.route('/genres/:name').get(validateList('name'), listFrom('genre'))

    // artists
    app.route('/artists').get(listFrom('artist'))
    app.route('/artists/:name').get(validateList('name'), listFrom('artist'))
    app.route('/artists/:genre/genre').get(validateFilter('artist', 'genre'), filterBy('artist', 'genre'))

    // albums
    app.route('/albums').get(listFrom('album'))
    app.route('/albums/:name').get(validateList('name'), listFrom('album'))
    app.route('/albums/:genre/genre').get(validateList('genre'), listFrom('album', 'genre'))
    app.route('/albums/:artist/artist').get(validateList('artist'), listFrom('album', 'artist'))

    // songs
    app.route('/songs').get(listSongs())
    app.route('/songs/:name').get(validateList('name', 'song.name'), listSongs())
    app.route('/songs/:genre/genre').get(validateList('genre', 'genre.name'), listSongs('genre', 'genre.name'))
    app.route('/songs/:album/album').get(validateList('album', 'album.name'), listSongs('album', 'album.name'))

    // cart
    app.route('/cart')
        .post(validateAddToCart, AddToCart)
        .get(listCart())
        .put(PurchaseCart)
        .delete(validateRemoveItemFromCart, removeCartItem) */
};