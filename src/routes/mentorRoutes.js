var express = require("express");
var mentorRouter = express.Router();
var mongodb = require("mongodb").MongoClient;

mentorRouter.use(function (req, res, next) {
  //console.log(req.user);
  if (!req.user) {
    return res.redirect("/login");
  }
  if (req.user.mentor === false) {
    return res.redirect("/user/dashboard");
  }
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );

  next();
});

mentorRouter.route("/dashboard/messages").get(function (req, res) {
  res.render("messages", {
    id: req.user._id,
    name: req.user.name
  });
});

mentorRouter.route("/dashboard/messages/chat/:id").get(function (req, res) {
  var mail = req.user._id;
  var name = req.user.name;
  var url = "mongodb://localhost:27017/infohub_mentors";
  mongodb.connect(url, function (err, db) {
    var collection = db.collection("users");

    collection.findOne({
      _id: req.params.id
    }, function (err, result) {
      if (result) {
        res.render("message-interface", {
          mentor: result,
          mail: mail,
          name: name
        });
      } else {
        res.redirect("/mentors/dashboard/messages");
      }
    });
  });
});

module.exports = mentorRouter;