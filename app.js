var express=require('express');

var app=express();
app.use(express.static('public'));
app.use(express.static('src/views'));

var port=5000;
app.get('/',function(req,res){
	res.send('hello world');
});
app.get('/books',function(req,res){
	res.send('hello wbooksd');
});
app.listen(port,function(err){
	console.log('system runnin on Port: ',port );
});