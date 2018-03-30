var express = require("express");
var userRouter = express.Router();
var mongodb = require("mongodb").MongoClient;

userRouter.use(function (req, res, next) {
  //console.log(req.user);
  if (!req.user) {
    return res.redirect("/login");
  }
  if (req.user.mentor) {
    return res.redirect("/mentors/dashboard/messages");
  }

  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );

  next();
});

userRouter.route("/dashboard/messages").get(function (req, res) {
  res.render("messages", {
    id: req.user._id,
    name: req.user.name
  });
});

userRouter.route("/dashboard").get(function (req, res) {
  res.render("cards", {
    name: req.user.name,
    email: req.user._id
  });
});

userRouter.route("/dashboard/mentors_all").get(function (req, res) {
  var url = "mongodb://localhost:27017/infohub_mentors";
  mongodb.connect(url, function (err, db) {
    var collection = db.collection("users");

    collection.find({
      mentor: true
    }).toArray(function (err, results) {
      res.render("mentors", {
        mentors: results
      });
    });
  });
});

userRouter.route("/dashboard/mentors_cse").get(function (req, res) {
  var url = "mongodb://localhost:27017/infohub_mentors";
  mongodb.connect(url, function (err, db) {
    var collection = db.collection("users");
    collection
      .find({
        branch: "CSE",
        mentor: true
      })
      .toArray(function (err, results) {
        res.render("mentors", {
          mentors: results
        });
      });
  });
});

userRouter.route("/dashboard/mentors_ece").get(function (req, res) {
  var url = "mongodb://localhost:27017/infohub_mentors";
  mongodb.connect(url, function (err, db) {
    var collection = db.collection("users");
    collection
      .find({
        branch: "ECE",
        mentor: true
      })
      .toArray(function (err, results) {
        res.render("mentors", {
          mentors: results
        });
      });
  });
});
userRouter.route("/dashboard/mentors_eee").get(function (req, res) {
  var url = "mongodb://localhost:27017/infohub_mentors";
  mongodb.connect(url, function (err, db) {
    var collection = db.collection("users");
    collection
      .find({
        branch: "EEE",
        mentor: true
      })
      .toArray(function (err, results) {
        res.render("mentors", {
          mentors: results
        });
      });
  });
});
userRouter.route("/dashboard/mentors_it").get(function (req, res) {
  var url = "mongodb://localhost:27017/infohub_mentors";
  mongodb.connect(url, function (err, db) {
    var collection = db.collection("users");
    collection
      .find({
        branch: "IT",
        mentor: true
      })
      .toArray(function (err, results) {
        res.render("mentors", {
          mentors: results
        });
      });
  });
});

userRouter.route("/dashboard/messages/chat/:id").get(function (req, res) {
  var mail = req.user._id;
  var name = req.user.name;
  console.log("id is req.params.id " + req.params.id);
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
        res.redirect("/user/dashboard/messages");
      }
    });
  });
});

userRouter.route("/dashboard/messages").get(function (req, res) {
  res.render("messages", {
    id: req.user._id
  });
});

module.exports = userRouter;