var con = require('./connection');
var express = require ('express');
var app = express();
var jwt = require('jsonwebtoken');

app.use(express.static(__dirname+'/style.css'));

var bodyParser = require('body-parser');

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended:true}));

app.set('view engine', 'ejs');

app.get('/', function(req,res){
    res.sendFile(__dirname+'/register.html')

});

//use body parser to get form data on server. It converts data into JSON, also encodes URL.
app.post('/', function(req,res){
    //console.log(req.body)

    var id = req.body.Emp_id;
    var name = req.body.Name;
    var email = req.body.Email;
    var number = req.body.Mbnum;
    

    con.connect(function(error){                            
        if(error) throw error 
    
        var sql = "INSERT INTO employee(Name, Email, Mbnum) VALUES('"+name+"', '"+email+"', '"+number+"')";
        con.query(sql, function(error, result){
            if(error) throw error 
            
            //res.send('Employee Registered Successfully');
            res.redirect('/employee');
        });


    });

});



app.get('/employee',function(req,res){
    con.connect(function(error){
        if(error) console.log(error);

        var sql = "select * from employee";

        con.query(sql, function(error, result){
            if(error) console.log(error);
            //console.log(result);

            res.render(__dirname+"/employee",{employee:result});
            

        });

    });

});

app.get('/delete-employee', function(req,res){
    con.connect(function(error){
        if(error) console.log(error);

        var sql = "delete from employee where Emp_id=?";

        var id = req.query.Emp_id;



        con.query(sql,[id], function(error, result){
            if(error) console.log(error);
          
            res.redirect('/employee');
            
            

        });

    });

});



app.get('/update-employee',function(req,res){
    con.connect(function(error){
        if(error) console.log(error);

        var sql = "select * from employee where Emp_id=?";

        var id = req.query.Emp_id;

        con.query(sql, [id],function(error, result){
            if(error) console.log(error);
            //console.log(result);

            res.render(__dirname+"/update-employee",{employee:result});
            

        });

    });

});


app.post('/update-employee',function(req,res) {

    var name = req.body.Name;    
    var email = req.body.Email;
    var mno = req.body.Mbnum;
    var id = req.body.Emp_id;

    con.connect(function(error){
        if(error) console.log(error);

        var sql = "UPDATE employee set Name=?, Email=?, Mbnum=? where Emp_id=?";

        con.query(sql, [name, email, mno, id],function(error, result){
            if(error) console.log(error);
            res.redirect('/employee');
            //console.log(result);          
            
    
        });

    });

});

//To fetch all registered employees 
app.get('/users',(req,res)=>{

    let qr = `select * from streamon.employee`;

    con.query(qr,(err,result)=>{

        if(err)
        {
            console.log(err, 'errs');
        }

        if(result.length>0)
        {
            res.send({
                message: 'All employee data',
                data:result
            });
        }
    });
});

//To fetch single employee data

/*app.get('/users/:id',(req,res)=>{

    var Emp_id = req.body.Emp_id;

    let qr = `select * from streamon.employee where Emp_id = ${Emp_id}`;

    con.query(qr,(err,result)=>{
       
        if(err) {console.log(err);}

        if(result.length>0)
        {
            res.send({
                message:'Get single employee data',
                data:result
            });
        }
        else
        {
            res.send({
                message:'data not found'
            });
        }

    });
});*/

//To post data 

app.post('/users',(req,res)=>{
    const data= req.body;
    //const data = {Name:"Akhil",Email:"akhil@gmail.com",Mbnum:"1234567890"};
    con.query("INSERT INTO employee SET?",data,(err,result)=>{
        if(err){
            res.send('Error');
        }else{
            res.send(result);
        }
    });

    jwt.sign({}, 'secretkey',(err, token)=>{
        res.json({
            token
        })
    });

});

app.put('/:Emp_id',(req,res)=>{
    
    //const data=["Khushiii", "khushi25@gmail.com","0987654321", 52 ];
    //const data=["Khushiii2", "khushi25@gmail.com","0987654321", req.params.Emp_id];
   const data=[req.body.Name, req.body.Email, req.body.Mbnum, req.params.Emp_id];
    con.query("UPDATE employee SET Name= ?, Email= ?, Mbnum= ? where Emp_id=?",data,(err,result)=>{
        if(err){
            res.send('Error');
        }else{
            res.send(result);
        }
    })
    //res.send("hello test");
});



app.delete('/:Emp_id', verifyToken, (req,res)=>{
    
    jwt.verify(req.token, 'secretkey', (err, authData)=>{
        if(err){
            res.sendStatus(403);
        }else{       
    
            let employee_id = req.params.Emp_id;
            con.query("DELETE from employee where Emp_id = "+employee_id,(err,result)=>{
                if(err){
                    throw err;
                }
                else{
                  /*  res.json({
                        message:'User deleted',
                        
                    });
                    res.send(result)*/
                    res.send({
                        message: 'User deleted'                       
                    });
                }
            });
        }});
});


app.post('/users/posts', verifyToken, (req,res)=>
{
    jwt.verify(req.token, 'secretkey', (err, authData)=>{
        if(err){
            res.sendStatus(403);
        }else{
            res.json({
                message:'Post created',
                authData
            });
        }
    });
    
});

// To create token

app.post('/users/login',(req,res)=>{

   /* const user = {
        Emp_id:1,
        Name:'Hellotest',
        Email:'hello@gmail.com',
        Mbnum:'8097865432'
    
    jwt.sign({user}, 'secretkey',(err, token)=>{
        res.json({
            token
        })
    });
*/
});

//Verify Token

function verifyToken(req, res, next){  
// Get auth header value
const bearerHeader = req.headers['authorization'];
// Check if bearer is undefined
if(typeof bearerHeader !== 'undefined'){
// Split at the space
const bearer = bearerHeader.split(' ');
//Get token from array
const bearerToken = bearer[1];
//Set the token

req.token = bearerToken;
//Next middleware
next();
}else{
    //Forbidden
    res.sendStatus(403);
}
}


app.listen(9000, function() {
    console.log("Server is running on Port 9000");
    
});  




//hello test


//"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7IkVtcF9pZCI6MSwiTmFtZSI6IkhlbGxvdGVzdCIsIkVtYWlsIjoiaGVsbG9AZ21haWwuY29tIiwiTWJudW0iOiI4MDk3ODY1NDMyIn0sImlhdCI6MTY2NTQ5Mjc4Nn0.xzkBx22g8doFMdZxCLEuejoK0IMFS-u89tinz58FFbA"

//Akhilesh token
//  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NjU2NTYwMTV9.vBe-8NgVzNJGAOvFYJy7wksXpf9DcG2EYs2samxwuVw 