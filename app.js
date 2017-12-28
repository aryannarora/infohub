var express=require('express');
var userrouter= express.Router();
var adminRouter= express.Router();
var mentorRouter=express.Router();
var fs=require('fs');
var crypto = require('crypto');
var path=require('path');
var mongodb = require('mongodb').MongoClient;
var app=express();
var port=process.env.PORT || 5000;
var name;
var server=require('http').Server(app);
var io=require('socket.io')(server);
var objid=require('mongodb').ObjectID;
var Map = require("collections/map");
var p2pserver = require('socket.io-p2p-server').Server
server.listen(port,function(err){
	console.log('Sir, I\'m running on port ' + port);
});

var sockettouser= new Map();
var usertosocket=new Map();
var authRouter = express.Router();

var FastSet = require("collections/fast-set");
var fset=new FastSet();
 var onlineusers=new Map();
//var authRouter = require('./src/routes/authRoutes');


io.on('connection', function(socket){

  socket.on('add-user',function(id,from,to){
    var hash=crypto.createHash('md5').update(from+to).digest('hex');
    usertosocket.add(hash,id);
    sockettouser.add(id,hash);
    console.log(usertosocket.toObject());
    console.log(sockettouser.toObject());
    
  });

  socket.on('online',function(data){
    console.log(data+" see here");
    onlineusers.add(data,socket.id);
  })
  socket.on('do-it',function(){
    var data=true;
                         io.emit('refresh',data);
                      console.log('emitting...');

                      })


app.post('/getsocketid',function(req,res){
  var rid=sockettouser.get(crypto.createHash('md5').update(req.body.to+req.body.from).digest('hex'));
  res.send(rid);
  console.log("rid is "+rid);
})
  /*socket.on('getsocketid',function(to){
    var rid=sockettouser.get(to);
    socket.emit('socketid',rid);
    console.log('receiver id '+to);
  })*/
  socket.on('disconnect',function(){
    var email=usertosocket.get(socket.id);
    usertosocket.delete(socket.id);
    console.log('email is this'+email);
    sockettouser.delete(email);
    onlineusers.delete(socket.id);
    

  })

  socket.on('send-message', function(id, msg){
    socket.broadcast.to(id).emit('message', msg);
  });
});





var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
app.use(cookieParser());
app.use(session({secret: 'nodemon',
					resave:false,
					saveUninitialized:false
					
					}));
require('./src/config/passport')(app);

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use('/auth', authRouter);
app.use('/mentors',mentorRouter);
app.post('/calchash',function(req,res){

  var hashes={
    hash1:crypto.createHash('md5').update(req.body.sender+req.body.recepient).digest('hex'),
    hash2:crypto.createHash('md5').update(req.body.recepient+req.body.sender).digest('hex')
  }
  res.send(hashes);
})

app.post('/getmessages',function(req,res){

  var url ='mongodb://localhost:27017/infohub_mentors';
           mongodb.connect(url, function (err, db) {

                var collection = db.collection('messages');
                var options = {
                                  "limit": 20,
                                  "sort": [["time","desc"]]
                              }
                collection.find({ $or:[{mid:req.body.hash1},{mid:req.body.hash2}]},options).toArray(
                    function (err, results) {
                      console.log("mid is " + req.body.hash1);
                      if(err) console.log("check your config.");
                        res.send(results);
                    }
                );

           });

});



app.post('/addreceived',function(req,res){

  var url ='mongodb://localhost:27017/infohub_mentors';
           mongodb.connect(url, function (err, db) {

                var collection = db.collection('messages');
                var options = {
                                "sort": [["time","desc"]]
                              }
                collection.aggregate([
                    {$match:  {
                      "recipient":req.body.recipient,
                      
                    }},{$group: {
                      _id: {sender:"$sender"}
                    }}] ).toArray(
                    function (err, results) {
                        for(i=0;i<results.length;i++)
                        {
                          fset.add(results[i]._id.sender);
                        }
                        res.send(true);
                    }
                );

           });

});

app.post('/addsent',function(req,res){
  fset.clear();

  var url ='mongodb://localhost:27017/infohub_mentors';
           mongodb.connect(url, function (err, db) {

                var collection = db.collection('messages');
                var options = {
                                "sort": [["time","desc"]]
                              }
                collection.aggregate([
                    {$match:  {
                      "sender":req.body.recipient,
                      
                    }},{$group: {
                      _id: {recipient:"$recipient"}
                    }}] ).toArray(
                    function (err, results) {
                        for(i=0;i<results.length;i++)
                        {
                          fset.add(results[i]._id.recipient);
                        }
                        res.send(true);
                    }
                    

                );

           });
           

});

 app.post('/getchats',function(req,res){
  console.log("getting chats...");
  console.log(fset.toJSON());
  res.send(fset);
    
    
  })




 app.post('/getonlineusers',function(req,res){
  console.log(onlineusers.values());
  res.send(onlineusers);
 })

 app.post('/getname',function(req,res){
console.log("getting names");
  var url ='mongodb://localhost:27017/infohub_mentors';
            mongodb.connect(url, function (err, db) {
                var collection = db.collection('users');

                 
                collection.find({_id:req.body.mail}).toArray(
                    function (err, results) {
                      console.log(results[0].name);
                        res.send(results[0].name);
                    }
                );
           
                  
          
    
});

 })


app.post('/addmessage',function(req,res){
  
     var url ='mongodb://localhost:27017/infohub_mentors';
            mongodb.connect(url, function (err, db) {
                var collection = db.collection('messages');
                var msg = {
                    mid: crypto.createHash('md5').update(req.body.sender+req.body.recepient).digest('hex'),
                    sender:req.body.sender,
                    recipient:req.body.recepient,
                    content: req.body.content,
                    time: req.body.time,
                    
                };
           
                     collection.insert(msg,
                    function (err, results) {
                            if(err) res.send(false);
                            else res.send(true);
                    });
                  
          
    
});
          });


mentorRouter.use(function(req,res,next){
	//console.log(req.user);
	if(!req.user){
		return res.redirect('/login');
}
	if(req.user.mentor===false){
		return res.redirect('/user/dashboard');
	}
	res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  
	next();
});






app.set('views', './src/views');
app.use('/user', userrouter);
app.use('/admin', adminRouter);

app.set('view engine', 'ejs');


app.get('/',function(req,res)
	{
		res.redirect('/login');

	});
 
 authRouter.route('/signup')
        .post(function (req, res) {
           // console.log(req.body);
          

             var url =
                'mongodb://localhost:27017/infohub_mentors';
            mongodb.connect(url, function (err, db) {
                var collection = db.collection('users');
                var name=req.body.fname+' '+req.body.lname;
                var user = {
                    _id: req.body.email,
                    password: req.body.password,
                    name: name,
                    email:req.body.email
                };
                collection.findOne({
                	_id: user._id
                },function(err , results){
                	if(results===null)
                	{	
                		 collection.insert(user,
                    function (err, results) {

                    //	name=' '+results.ops[0].fname+' '+results.ops[0].lname;
                    	
                        req.login(results.ops[0], function () {
                            res.redirect('/user/dashboard');

                        });
                    });
                	}
                	else
                	{	var success=encodeURIComponent('false');
                		res.redirect('/registration/?success='+success);             	
                	
                	}
                })
               
            });
           });



   authRouter.route('/signin')
        .post(passport.authenticate('local', {
            failureRedirect: '/login'
        }), function (req, res) {

        	if(req.user.mentor) return res.redirect('/mentors/dashboard/messages');


        	//name=' '+req.user.fname +' '+ req.user.lname;
            res.redirect('/user/dashboard');
        });


mentorRouter.route('/dashboard/messages/chat/:id')
    .get(function(req,res){
      var mail=req.user._id;
      var name=req.user.name;
     var url ='mongodb://localhost:27017/infohub_mentors';
           mongodb.connect(url, function (err, db) {

                var collection = db.collection('users');

                collection.findOne({_id:req.params.id},function(err, result){
                      if(result)
                      {
                         res.render('message-interface', {
                            mentor: result,
                            mail:mail,
                            name:name,
                            
                        });

                      }
                           else{
                            res.redirect('/umentors/dashboard/messages');
                           }
                    });
                 });
                 });  




  mentorRouter.route('/dashboard/messages')
    .get(function(req,res){
    
    res.render('messages',{
      id:req.user._id,
      name:req.user.name
    });
});
     userrouter.route('/dashboard/messages')
    .get(function(req,res){
    
    res.render('messages',{
      id:req.user._id,
      name:req.user.name
    });
});

app.get('/mlogin',function(req,res)
{
	if(req.user){
		if(req.user.mentor) return res.redirect('/mentors/dashboard/messages');
		return res.redirect('/user/dashboard');
}
res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

	res.render('mlogin');
	
});


 app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});
   



app.get('/registration/')




app.get('/login',function(req,res){
	if(req.user)
	{	if(req.user.mentor) return res.redirect('mentors/dashboard/messages');
		return res.redirect('user/dashboard');
	}
	res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  
	res.render('login',{

	});
});
app.get('/registration',function(req,res){
	if(req.user)
	{	if(req.user.mentor) return res.redirect('mentors/dashboard/messages');
		return res.redirect('user/dashboard');
	}
	var failed=req.query.success;
	res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
 
	res.render('register',{
                			success:failed
                		});

})

//user routes
	userrouter.use(function(req,res,next){
	//console.log(req.user);
	if(!req.user){
		return res.redirect('/login');
		
	}
	if(req.user.mentor){
		return res.redirect('/mentors/dashboard/messages');
	}

	res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  
	next();
});

userrouter.route('/dashboard')
    .get(function (req, res) {
    	 res.render('cards',{
        	name:req.user.name,
        	email:req.user._id
        });
    });
    userrouter.route('/dashboard/aboutus')
    .get(function (req, res) {
    	 res.render('aboutus');
    });

  /*  userrouter.route('/dashboard/messages/chat')
    .get(function (req, res) {
    	 res.render('message-interface');
    }); */

userrouter.route('/dashboard/mentors_all')
		.get(function(req,res){
						
			var url ='mongodb://localhost:27017/infohub_mentors';
           mongodb.connect(url, function (err, db) {

           	    var collection = db.collection('users');

                collection.find({mentor:true}).toArray(
                    function (err, results) {
                        res.render('mentors', {
                            mentors: results
                        });
                    }
                );

           });	
});

		userrouter.route('/dashboard/mentors_cse')
		.get(function(req,res){
						
			var url ='mongodb://localhost:27017/infohub_mentors';
           mongodb.connect(url, function (err, db) {

           	    var collection = db.collection('users');

                collection.find({branch:"CSE",mentor:true}).toArray(
                    function (err, results) {
                        res.render('mentors', {
                            mentors: results
                        });
                    }
                );

           });	
});

userrouter.route('/dashboard/mentors_ece')
		.get(function(req,res){
						
			var url ='mongodb://localhost:27017/infohub_mentors';
           mongodb.connect(url, function (err, db) {

           	    var collection = db.collection('users');

                collection.find({branch:"ECE",mentor:true}).toArray(
                    function (err, results) {
                        res.render('mentors', {
                            mentors: results
                        });
                    }
                );

           });	
});
		userrouter.route('/dashboard/mentors_eee')
		.get(function(req,res){
						
			var url ='mongodb://localhost:27017/infohub_mentors';
           mongodb.connect(url, function (err, db) {

           	    var collection = db.collection('users');

                collection.find({branch:"EEE",mentor:true}).toArray(
                    function (err, results) {
                        res.render('mentors', {
                            mentors: results
                        });
                    }
                );

           });	
});
		userrouter.route('/dashboard/mentors_it')
		.get(function(req,res){
						
			var url ='mongodb://localhost:27017/infohub_mentors';
           mongodb.connect(url, function (err, db) {

           	    var collection = db.collection('users');

                collection.find({branch:"IT",mentor:true}).toArray(
                    function (err, results) {
                        res.render('mentors', {
                            mentors: results
                        });
                    }
                );

           });	
});

userrouter.route('/dashboard/messages/chat/:id')
		.get(function(req,res){
			var mail=req.user._id;
			var name=req.user.name;
						console.log('id is req.params.id ' + req.params.id);
			var url ='mongodb://localhost:27017/infohub_mentors';
           mongodb.connect(url, function (err, db) {

           	    var collection = db.collection('users');

                collection.findOne({_id:req.params.id},function(err, result){
                			if(result)
                			{
                				 res.render('message-interface', {
                            mentor: result,
                            mail:mail,
                            name:name,
                            
                        });

                			}
                           else{
                           	res.redirect('/user/dashboard/messages');
                           }
                    });
                 });	
});


userrouter.route('/dashboard/messages')
		.get(function(req,res){
		
		res.render('messages',{
			id:req.user._id
		});
});

//user routes end


//admin routes

adminRouter.route('/addMentors')
    .get(function (req, res) {
         var url ='mongodb://localhost:27017/infohub_mentors';
           mongodb.connect(url, function (err, db) {
           		db.createCollection('mentors',function(err,result){
           			  var collection = result;
                collection.insertMany(Mentors,
                    function (err, results) {
                        res.send(results);
                        db.close();
                    }
                );

           		});
              

            });
      });

//admin routes end


/*app.listen(port,function(err){
	console.log('system running on Port: ',port );
});*/