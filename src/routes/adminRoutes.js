var express = require("express");
var adminRouter = express.Router();
var mongodb = require("mongodb").MongoClient;

adminRouter.route("/addMentors").get(function (req, res) {
  var url = "mongodb://localhost:27017/infohub_mentors";
  mongodb.connect(url, function (err, db) {
    db.createCollection("mentors", function (err, result) {
      var collection = result;
      collection.insertMany(Mentors, function (err, results) {
        res.send(results);
        db.close();
      });
    });
  });
});

module.exports = adminRouter;