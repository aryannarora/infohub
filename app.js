var express=require('express');
var userrouter= express.Router();
var adminRouter= express.Router();
var fs=require('fs');
var path=require('path');
var mongodb = require('mongodb').MongoClient;
var app=express();
var port=process.env.PORT || 5000;
var name;


var authRouter = express.Router();
//var authRouter = require('./src/routes/authRoutes');







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







app.set('views', './src/views');
app.use('/user', userrouter);
app.use('/admin', adminRouter);

app.set('view engine', 'ejs');


app.get('/',function(req,res)
	{
		res.send('Welcome page will be here');
	});
 
 authRouter.route('/signup')
        .post(function (req, res) {
           // console.log(req.body);
           if(req.user)
	{
		return res.redirect('../user/dashboard');
	}

             var url =
                'mongodb://localhost:27017/infohub_mentors';
            mongodb.connect(url, function (err, db) {
                var collection = db.collection('users');
                var user = {
                    _id: req.body.email,
                    password: req.body.password,
                    fname: req.body.fname,
                    lname: req.body.lname
                };
                collection.findOne({
                	_id: user._id
                },function(err , results){
                	if(results===null)
                	{
                		 collection.insert(user,
                    function (err, results) {
                    	name=' '+results.ops[0].fname+' '+results.ops[0].lname;
                    	
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
        	name=' '+req.user.fname +' '+ req.user.lname;
            res.redirect('/user/dashboard');
        });



 app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});
   



app.get('/registration/')




app.get('/login',function(req,res){
	if(req.user)
	{
		return res.redirect('user/dashboard');
	}
	res.render('login');
});
app.get('/registration',function(req,res){
	if(req.user)
	{
		return res.redirect('user/dashboard');
	}
	var failed=req.query.success;
	res.render('register',{
                			success:failed
                		});

})

//user routes

/*userrouter.route('/')
	.get(function(req,res){
	res.render('login');
}); 
	userrouter.route('/new/registration')
	.get(function(req,res){
	res.render('register');
});
*/
userrouter.use(function(req,res,next){
	console.log(req.user);
	if(!req.user){
		return res.redirect('/login');
		
	}
	next();
})

userrouter.route('/dashboard')
    .get(function (req, res) {
        res.render('cards',{
        	name:name
        });
    });

userrouter.route('/dashboard/mentors_all')
		.get(function(req,res){
			
			var url ='mongodb://localhost:27017/infohub_mentors';
           mongodb.connect(url, function (err, db) {

           	    var collection = db.collection('mentors');

                collection.find({}).toArray(
                    function (err, results) {
                        res.render('mentors_all', {
                            mentors: results
                        });
                    }
                );


           });
		
});

userrouter.route('/dashboard/messages')
		.get(function(req,res){
		
		res.render('messages');
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








		 
app.listen(port,function(err){
	console.log('system running on Port: ',port );
});