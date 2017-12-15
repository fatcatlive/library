var express = require('express');
var router = express.Router();
var conn=require("../utils/conn")
var async=require("async")

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});



//登录
router.post("/login",(req,res)=>{
  var username=req.body.username;
  var password=req.body.password;
  var identify=req.body.iden;
  console.log(username);
  console.log(password);
  console.log(identify);

 


  if(identify=='normal'){
    conn.getDb((err,db)=>{
      if(err) throw err;
      console.log("数据库连接11111111111成功")
  
      var user=db.collection("user");
      user.find({username:username,password:password}).toArray((err,result)=>{
        if(err) throw err;
        console.log("查询数据成功")
        console.log(result)
  
        if(result.length>0){
          req.session.username=username;
          res.redirect("/?pageNo=1")
         
         
        }else{
          res.redirect("/login")
        }
  
  
  
        
      })
    })
  

  }else{
    conn.getDb((err,db)=>{
      if(err) throw err;
      console.log("数据库连接成功")
  
      var superuser=db.collection("superuser");
      superuser.find({username:username,password:password}).toArray((err,result)=>{
        if(err) throw err;
        console.log("查询数据成功");
        console.log(result)
  
        if(result.length>0){
          req.session.username=username;
          res.redirect("/superuser/")
         
         
        }else{
          res.redirect("/login")
        }
  
  
  
        
      })
    })
  
  }





})

//注册

router.post("/register",(req,res)=>{
  var username=req.body.username;
  var password=req.body.password;
  console.log(username,password)
  // res.send("注册成功")


  var insertData=function(db,callback){
    var user=db.collection("user");
    async.waterfall([
      function(callback){
        user.find({username:username}).toArray((err,result)=>{
          if(err) throw err;
          console.log(result);
          if(result.length>0){
            callback(null,true)
          }else{
            callback(null,false)
          }
        })

      },
      function(arg,callback){
        if(!arg){
          console.log("没注册")
          user.insert({username:username,password:password},(err,result)=>{
             if(err) throw err;
             console.log("数据插入成功");
             callback(null,"1")

          })
          
        }else{
          callback(null,"0")
        }
      }
    ],function(err,result){
      if(err) throw err;
      callback(result)

    })



  }

  conn.getDb((err,db)=>{
     if(err) throw err;
     console.log("数据库连接成功");

     insertData(db,(result)=>{
         console.log(result);
         if(result=="1"){
           res.redirect("/login")
         }else{
           res.render("register")
         }


          
     })

     
    
  })



})


//修改密码
router.post("/updatepasswordsubmit",(req,res)=>{
//  res.send("修改密码成功")

 var username=req.body.username;
 var password=req.body.password;

 if(req.session.username){
      conn.getDb((err,db)=>{
        if(err) throw err;
        console.log("数据库连接成功");

        var user=db.collection("user");
        user.updateOne({username:username},{$set:{password:password}},(err,result)=>{
          if(err) throw err;
          console.log("密码修改成功")
          console.log(result);
          res.redirect("/")

        })


      })
      


 }else{
   res.send("<script>alert('session会话过期，请重新登录！'),location.href=''</script>")
 }

 





})




//修改个人信息

router.post("/updatepersonmessagesubmit",(req,res)=>{
     var username=req.body.username;
     var telephone=req.body.telephone;
     var email=req.body.email;
     var sex=req.body.sex;

     conn.getDb((err,db)=>{
       if(err) throw err;
       console.log("数据库连接成功");
       var user=db.collection("user");
       user.updateOne({username:username},{$set:{
         telephone:telephone,
         email:email,
         sex:sex,

       }},(err,result)=>{
         if(err) throw err;
         console.log(result);
         console.log("修改数据成功");
         res.redirect("/")

       }
        
      
      )
      })


})
module.exports = router;
