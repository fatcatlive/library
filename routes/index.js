var express = require('express');
var router = express.Router();
var conn=require("../utils/conn")
var async=require("async")

/* GET home page. */
router.get('/', function(req, res, next) {
  var username=req.session.username;
  var pageSize = 8;
  var totalPage = 0;
  var count  = 0;
  var pageNo = req.query["pageNo"];  //  字符串  
  console.log(pageNo);    
  pageNo = pageNo?parseInt(pageNo):1;
  console.log(pageNo);

  var findData=function(db,callback){

    var book=db.collection("book");

    async.waterfall([
      function(callback){
        book.find({},{_id:0}).toArray((err,result)=>{
          if(err) throw err;
          // console.log(result)
          count=result.length;
          
          if(count>=1){
            totalPage = Math.ceil(count/pageSize);
            pageNo = pageNo<=1?1:pageNo;
            pageNo = pageNo>=totalPage?totalPage:pageNo;
            callback(null,true);
          }else{
            callback(null,false)
          }
          
        })
        

    },
    function(arg,callback){
      if(arg){
        book.find({}).sort({_id:1}).skip((pageNo-1)*pageSize).limit(pageSize).toArray((err,result)=>{
          if(err) throw err;
          console.log(result)
          callback(null,result);
        })
      }else{
        callback(null,false)
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
    findData(db,(result)=>{
      res.render('index', {username: req.session.username,
                           result:result,
                           pageNo:pageNo,
                           totalPage:totalPage
                          });
    })
    
   
  })




 
});


//登录
router.get('/login', function(req, res) {
  res.render('login');

});

//注册
router.get('/register', function(req, res) {
  res.render('register');
});

//注销

router.get("/loginout",(req,res)=>{
  req.session.destroy((err)=>{
    if(err) throw err;
    res.redirect("/")
  })

 
})

//修改密码页面
router.get('/updatepassword', function(req, res) {
  if(req.session.username){
    res.render('updatepassword',{username:req.session.username});

  }else{
    res.redirect("/login")
  }
 
});

//修改个人信息页面
router.get('/updatepersonmessage', function(req, res) {

  var username=req.session.username;
  if(req.session.username){

    conn.getDb((err,db)=>{
      if(err) throw err;
      console.log("数据库连接成功");
      var user=db.collection("user");
      user.find({username:username},{telephone:1,email:1,username:1}).toArray((err,result)=>{
        if(err) throw err;
       
        res.render("updatepersonmessage",{result:result[0],username:username})
      })

    })


     
  }else{
    res.redirect("/login")
  }
});





module.exports = router;
