var express = require('express');

var authRouter = express.Router();
var mongodb = require('mongodb').MongoClient;
var passport = require('passport');


var router = function () {
    console.log('there?');
    authRouter.route('/signup')
        .post(function (req, res) {
            console.log(req.body);
           });
    
    return authRouter;
};

module.exports = router;