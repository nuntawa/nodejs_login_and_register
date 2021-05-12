var express=require("express");
var cookieSession=require("cookie-session");
var app=express();
var port=process.env.PORT || 3000;
var path = require("path");
var bcrypt=require("bcryptjs");

var mysql= require("./mysql");


app.use(cookieSession({
    name: 'session',
    keys: ["key-1","key-2"],//Set cookies are always signed with keys[0], while the other keys are valid for verification
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }))

// แปลงข้อมูลที่ส่งมาแบบ JSON String ( application/json ) ให้อยู่ในรูป JSON Object    
app.use(express.json());
// แปลงข้อมูลที่ส่งมาแบบ url encode form ( application/x-www-form-urlencoded ) เป็น Object
app.use(express.urlencoded({extended:true}));
//If extended is false person[name] = 'cw'
// you can not post "nested object"

//middleware สำหรับตรวจสอบการ login
var middleware=(req,res,next)=>{

    if(req.session.user_id==null)//ยังไม่ได้ Login
    {
        res.sendFile(path.join(__dirname+'/public/login_register.html'));
    }
    else
    {
        return next();

    }
};


app.get("/",(req,res)=>{

    if(req.session.user_id!=null)//Login แล้ว
    {
        res.sendFile(path.join(__dirname+'/public/welcome.html'));
    }
    else
    {
        //ยังไม่ได้ Login
        res.sendFile(path.join(__dirname+'/public/login_register.html'));
    }


});


app.get("/signout",(req,res)=>{

    req.session.user_id=null;
    res.sendFile(path.join(__dirname+'/public/login_register.html'));

});


app.get("/welcome",middleware,(req,res)=>{

    res.sendFile(path.join(__dirname+'/public/welcome.html'));

});

app.post("/register",async (req,res)=>{

    var username=req.body.regis_username;
    var password=req.body.regis_password;
        password= bcrypt.hashSync(password,10);
    var name=req.body.regis_name;

    var sql="INSERT INTO user(username,password,name) VALUES ( ? , ? , ? )";
    var val=[username,password,name];
    var response=null;
    try{
        response=await mysql.runSQLQuery(sql,val);
    }catch(ex)
    {
        console.log(ex);
        res.send({message:"Error "+ex});

        return;
    }

    sql="SELECT user_id FROM user WHERE (username= ? )";
    val=[username];

    try{
        var user=await mysql.runSQLQuery(sql,val);
        req.session.user_id=user[0].user_id;

    }catch(error)
    {
        console.log(error);
        res.send({message:"Error "+error});

        return;
    }
    
    res.send({message:"Success"});
});

app.post("/login",async (req,res)=>{

    var username=req.body.login_username;
    var password=req.body.login_password;

    var sql="SELECT * FROM user WHERE (username = ?)";
    var val=[username];

    var user=null;
    try {
        
        user=await mysql.runSQLQuery(sql,val);

        if(user.length==0)
        {
            res.send({message:"Wrong Username Password"});
            return;
        }
        else if(!bcrypt.compareSync(password,user[0].password))
        {
            res.send({message:"Wrong Username Password"});
            return;
        }
        else
        {
            req.session.user_id=user[0].user_id;
            res.send({message:"Success"});
        }

    } catch (error) {
        
        res.send({message:"Error "+ex});
        return;
    }

});


//กรณีไม่พบหน้า
app.get('*', (req, res)=>{
    //console.log(req.session.user_id==null);
    //console.log("xxx");
    res.status(404).send('Page Not Found');
});

app.listen(port);
console.log("server start");
 
