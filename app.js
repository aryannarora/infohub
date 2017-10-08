var express=require('express');
var userrouter= express.Router();
var app=express();
var port=process.env.PORT || 5000;


app.use(express.static('public'));
app.set('views', './src/views');
app.use('/user', userrouter);
app.set('view engine', 'ejs');

app.get('/',function(req,res)
	{
		res.send('Welcome page will be here');
	});


userrouter.route('/')
	.get(function(req,res){
	res.render('login');
});

userrouter.route('/id')
		.get(function(req,res){
		res.render('cards');
});

userrouter.route('/id/mentors_all')
		.get(function(req,res){
		res.render('mentors_all');
});








	/*	userrouter.route('/:id')
    .get(function (req, res) {
        var id = req.params.id;
        res.render('cards');
    }); */
app.listen(port,function(err){
	console.log('system runnin on Port: ',port );
});