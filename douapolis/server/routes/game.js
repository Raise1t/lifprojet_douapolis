const express = require("express");

// gameRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /game.
const gameRoutes = express.Router();

// This will help us connect to the database
const dbo = require("../db/conn");

const gameCtrl = require("../controllers/game");

// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;

// Start a game
gameRoutes.get('/game/start/:code', gameCtrl.startGame);

// This section will help you get a list of all the game.
gameRoutes.route("/game").get(function (req, res) {
 let db_connect = dbo.getDb("douapolis");
 db_connect
   .collection("game")
   .find({})
   .toArray(function (err, result) {
     if (err) throw err;
     res.json(result);
   });
});


// This section will help you get a single game by id
gameRoutes.route("/game/:id").get(function (req, res) {
    let db_connect = dbo.getDb();
    let myquery = { _id: ObjectId(req.params.id) };
    db_connect
    .collection("game")
    .findOne(myquery, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});

// This section will help you create a new game.
gameRoutes.route("/game/add").post(function (req, response) {
    let db_connect = dbo.getDb();
    let owner = ObjectId(req.body.ownerId);
    let query = { _id: owner};
    let myobj = {
        nbJoueurs: req.body.nbJoueurs,
        priv: req.body.priv,
        speed: req.body.speed,
        currentPlayer: owner,
    };
    db_connect.collection("game").insertOne(myobj, function (err, res) {
        if (err) throw err;
    });
    db_connect
        .collection("users")
        .findOne(query)
        .then((player) => {
            response.status(200).json({player});
            // player.inGame = true;
            // db_connect
            //     .collection("users")
            //     .updateOne(query, player)
            //     .then(() => { res.status(201).json({message: 'Game created'})})
            //     .catch(error => { res.status(400).json( { error })})
        })
});

// This section will help you update a game by id.
gameRoutes.route("/update/:id").post(function (req, response) {
    let db_connect = dbo.getDb();
    let myquery = { _id: ObjectId(req.params.id) };
    let newvalues = {
        $set: {
            nbJoueurs: req.body.nbJoueurs,
            priv: req.body.priv,
            speed: req.body.speed,
        },
    };
    db_connect
    .collection("game")
    .updateOne(myquery, newvalues, function (err, res) {
        if (err) throw err;
        console.log("1 document updated");
        response.json(res);
    });
});

// This section will help you delete a game
gameRoutes.route("/:id").delete((req, response) => {
    let db_connect = dbo.getDb();
    let myquery = { _id: ObjectId(req.params.id) };
    db_connect.collection("game").deleteOne(myquery, function (err, obj) {
        if (err) throw err;
        console.log("1 document deleted");
        response.json(obj);
    });
});

module.exports = gameRoutes;
