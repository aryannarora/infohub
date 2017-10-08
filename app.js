var express=require('express');
var userrouter= express.Router();
var adminRouter= express.Router();
var mongodb = require('mongodb').MongoClient;
var app=express();
var port=process.env.PORT || 5000;

var Mentors = [
        {
            name: 'Shubham Sharma',
            branch:'EEE',
            year: 'IV',
            experience: ['Power systems','Phase electronics']
        },
        {
            name: 'Harmeet Sinha',
            branch:'EEE',
            year: 'IV',
            experience: ['Transformer systems']
        },
        {
            name: 'Prayag Mishra',
            branch:'EEE',
            year: 'III',
            experience: ['Control Systems']
        },
        {
            name: 'Rahul Tyagi',
            branch:'ECE',
            year: 'IV',
            experience: ['Robotics']
        },
        {
            name: 'Prajwal Khatri',
            branch:'ECE',
            year: 'III',
            experience: ['Robotics','Internet Of Things','Micro-electronics']
        },
        {
            name: 'Sandeep soni',
            branch:'CSE',
            year: 'IV',
            experience: ['NODE','Angular']
        },
        {
            name: 'Prateek Bhatt',
            branch:'CSE',
            year: 'IV',
            experience: ['ML','CV']
        },
        {
            name: 'Navdeep Singh',
            branch:'CSE',
            year: 'IV',
            experience: ['Robotics','Virtual Reality']
        },
        {
            name: 'Atul Juneja',
            branch:'IT',
            year: 'IV',
            experience: ['Angular','Android']
        },
        {
            name: 'Rohan Deshwal',
            branch:'IT',
            year: 'IV',
            experience: ['ML','ReactJS','Cloud Computing']
        },
    ];


app.use(express.static('public'));
app.set('views', './src/views');
app.use('/user', userrouter);
app.use('/admin', adminRouter);
app.set('view engine', 'ejs');

app.get('/',function(req,res)
	{
		res.send('Welcome page will be here');
	});

//user routes

userrouter.route('/')
	.get(function(req,res){
	res.render('login');
});

userrouter.route('/:id')
    .get(function (req, res) {
        var id = req.params.id;
        res.render('cards');
    });

userrouter.route('/:id/mentors_all')
		.get(function(req,res){
			var id=req.params.id;
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

userrouter.route('/:id/messages')
		.get(function(req,res){
			var id=req.params.id;
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

           		})
              

            });
      });

//admin routes end








		 
app.listen(port,function(err){
	console.log('system running on Port: ',port );
});