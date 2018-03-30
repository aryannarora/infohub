var express = require("express");

var authRouter = express.Router();
var mongodb = require("mongodb").MongoClient;
var passport = require("passport");

authRouter.route("/signup").post(function (req, res) {
  // console.log(req.body);

  var url = "mongodb://localhost:27017/infohub_mentors";
  mongodb.connect(url, function (err, db) {
    var collection = db.collection("users");
    var name = req.body.fname + " " + req.body.lname;
    var user = {
      _id: req.body.email,
      password: req.body.password,
      name: name,
      email: req.body.email
    };
    collection.findOne({
        _id: user._id
      },
      function (err, results) {
        if (results === null) {
          collection.insert(user, function (err, results) {
            //	name=' '+results.ops[0].fname+' '+results.ops[0].lname;

            req.login(results.ops[0], function () {
              res.redirect("/user/dashboard");
            });
          });
        } else {
          var success = encodeURIComponent("false");
          res.redirect("/registration/?success=" + success);
        }
      }
    );
  });
});

authRouter.route("/signin").post(
  passport.authenticate("local", {
    failureRedirect: "/login"
  }),
  function (req, res) {
    if (req.user.mentor) return res.redirect("/mentors/dashboard/messages");

    //name=' '+req.user.fname +' '+ req.user.lname;
    res.redirect("/user/dashboard");
  }
);

module.exports = authRouter;