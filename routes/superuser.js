var express = require('express');
var router = express.Router();
var conn=require("../utils/conn");
var async=require("async")

//首页
router.get('/', function(req, res, next) {
    
    res.render("superuser",{username:req.session.username});



})

//用户信息管理

router.get("/updateuser",(req,res)=>{

    var pageSize=5;
    var totalPage=0;
    var count=0;
    var pageNo=req.query["pageNo"];
    console.log(pageNo);
    pageNo=pageNo?parseInt(pageNo):1;

    if(req.session.username){

        var findData=function(db,callback){
            var user=db.collection("user");

            async.waterfall([
                function(callback){

                    user.find({}).toArray((err,result)=>{
                        if(err) throw err;
                        console.log(result);
                        count=result.length;
                        totalPage=Math.ceil(count/pageSize);
                        pageNo=pageNo<=1?1:pageNo;
                        pageNo= pageNo>=totalPage?totalPage:pageNo;
                       if(result.length>=1){
                          callback(null,true)
                       }else{
                           callback(null,false)
                       }

                    })
                   
                },function(arg,callback){

                    if(arg){

                        user.find({},{_id:0}).sort({_id:-1}).skip((pageNo-1)*pageSize).limit(pageSize).toArray((err,result)=>{
                            if(err) throw err;
                            console.log(result);
                            callback(null,result)
                           
            
                        })

                    }else{
                        callback(null,false);
                    }
                   

                }
            ],function(err,result){
                if(err) throw err;
                console.log(result)
                callback(result)
    
            })

        }

        conn.getDb((err,db)=>{
            if(err) throw err;

            findData(db,(result)=>{

                  res.render("updateuser",{username:req.session.username,
                                           result:result,
                                           pageNo:pageNo,
                                           count:count,
                                           totalPage:totalPage,

                                        })
                

            })
           
           
        })


    }else{
        res.send("<script>alert('session失效，请重新登录');location.href='/login'</script>")

    }


//    
})
  

//删除用户

router.get("/userdelete",(req,res)=>{
    var uname=req.query.uname;
    if(req.session.username){

        if(uname!=-1){
            conn.getDb((err,db)=>{
                if(err) throw err;
                var user=db.collection("user");
                user.deleteOne({username:uname},(err,result)=>{
                    if(err) throw err;
                    console.log(result);
                    res.send("0");
                })
            })

        }else{
            conn.getDb((err,db)=>{
                if(err) throw err;
                var user=db.collection("user");
                user.remove((err,result)=>{
                    if(err) throw err;
                    console.log(result);
                    res.send("1");
                })
            })

        }

    }else{

        res.send("<script>alert('session失效，请重新登录');location.href='/login'</script>")

    }
})


//将普通用户变为管理员

router.get("/setadmin",(req,res)=>{
    var uname=req.query.uname;
    console.log(uname);
    var password="";
    var updateData=function(db,callback){
        var user=db.collection("user");
        var superuser=db.collection("superuser");
        async.waterfall([

            function(callback){
                user.find({username:uname}).toArray((err,result)=>{
                   if(err) throw err;
                   console.log(result);
                   if(result.length>=1){
                    callback(null,true)
                    password=result[0].password;

                   }else{
                       callback(null,true)
                   }
                  
                })

            },function(arg,callback){
                if(arg){
                    user.deleteOne({username:uname},(err,result)=>{
                        if(err) throw err;
                        console.log(result);
                        callback(null,true)
                    })

                }else{
                    callback(null,false)
                }

            },
            function(ag2,callback){
                if(ag2){
                    superuser.insert({username:uname,password:password},(err,result)=>{
                        if(err) throw err;
                        console.log(result)
                        callback(null,true)


                    })


                }else{
                    callback(null,false)
                }

            }
        ],function(err,result){
            if(err) throw err;
            console.log(result)
            callback(result)
            


        })
    }




    conn.getDb((err,db)=>{
        if(err) throw err;
        updateData(db,(result)=>{
            if(result){
                res.send("1")
            }else{
                res.send("0")
            }

        })
    })

})



//添加用户
router.get("/adduser",(req,res)=>{
   res.render("adduser",{username:req.session.username})
})


//添加用户信息提交
router.get("/addusersubmit",(req,res)=>{
    var username=req.query.username;
    var password=req.query.password;
    var telephone=req.query.telephone;
    var email=req.query.email;
    var sex=req.query.sex;


    console.log(username,password,telephone,email,sex)

    if(req.session.username){
        var insertData=function(db,callback){
            var user=db.collection("user");
            
            async.waterfall([
                function(callback){
                    user.find({username:username}).toArray((err,result)=>{
                        if(err) throw err;
                        console.log(result);
                        if(result.length>=1){
                            callback(null,true)
                        }else{
                            callback(null,false)
                        }
                    })
                    
    
    
                },function(arg,callback){
                    if(!arg){
                        user.insert({
                            username:username,
                            password:password,
                            telephone:telephone,
                            email:email,
                            sex:sex,
                        },(err,result)=>{
                            if(err) throw err;
                            callback(null,true)
                        })
                    }else{
                        callback(null,false)
    
                    }
    
                }
    
    
            ],function(err,result){
                if(err) throw err;
                console.log(result);
                callback(result)
    
            })
        }
    
        conn.getDb((err,db)=>{
            if(err) throw err;
            insertData(db,(result)=>{
                if(result){
                    res.send("1")
                }else{
                    res.send("0")
                }
    
            })
    
        })
    
    

    }else{
        res.send("<script>alert('session失效，请重新登录');location.href='/login'</script>")

    }


 })

 //图书信息管理

 router.get("/updatebook",(req,res)=>{

    var pageSize=5;
    var totalPage=0;
    var count=0;
    var pageNo=req.query["pageNo"];
    console.log(pageNo);
    pageNo=pageNo?parseInt(pageNo):1;

    if(req.session.username){

        var findData=function(db,callback){
            var book=db.collection("book");

            async.waterfall([
                function(callback){

                    book.find({}).toArray((err,result)=>{
                        if(err) throw err;
                       
                        count=result.length;
                        totalPage=Math.ceil(count/pageSize);
                        pageNo=pageNo<=1?1:pageNo;
                        pageNo= pageNo>=totalPage?totalPage:pageNo;
                       if(result.length>=1){
                          callback(null,true)
                       }else{
                           callback(null,false)
                       }

                    })
                   
                },function(arg,callback){

                    if(arg){

                        book.find({},{_id:0}).sort({_id:-1}).skip((pageNo-1)*pageSize).limit(pageSize).toArray((err,result)=>{
                            if(err) throw err;
                           
                            callback(null,result)
                           
            
                        })

                    }else{
                        callback(null,false);
                    }
                   

                }
            ],function(err,result){
                if(err) throw err;
             
                callback(result)
    
            })

        }

        conn.getDb((err,db)=>{
            if(err) throw err;

            findData(db,(result)=>{

                  res.render("updatebook",{username:req.session.username,
                                           result:result,
                                           pageNo:pageNo,
                                           count:count,
                                           totalPage:totalPage,

                                        })
                

            })
           
           
        })


    }else{
        res.send("<script>alert('session失效，请重新登录');location.href='/login'</script>")

    }


 })

//删除图书

router.get("/deletebook",(req,res)=>{
    var bookid=req.query.bookid;
    console.log(bookid)
    if(bookid!=-1){
        conn.getDb((err,db)=>{
            if(err) throw err;
            var book=db.collection("book");
            var bkcomment=db.collection("bkcomment");
            async.series([
                function(callback){
                    bkcomment.deleteMany({bookid:bookid},(err,result)=>{
                        if(err) throw err;
                        console.log(result);
                        callback(null,"0")
                        
                    })

                },function(callback){
                    book.deleteOne({id:bookid},(err,result)=>{
                        if(err) throw err;
                        console.log(result);
                        callback(null,"1")
                    })

                }
            ],function(err,result){
                if(err) throw err;
                console.log(result)
                res.send("1")

            })
        })

    }else{

        conn.getDb((db,result)=>{
            var bkcomment=db.collection("bkcomment");
            var book=db.collection("book");
            book.remove((err,result)=>{
                if(err) throw err;
                console.log(result)
            })
            bkcomment.remove((err,result)=>{
                if(err) throw err;
                console.log(result)
            })

            res.send("0")
        })





    }

})


//修改图书信息

router.get("/updatebooksubmit",(req,res)=>{
    var bookid=req.query.bookid;
    var title=req.query.title;
    var author=req.query.author;
    var price=req.query.price;
    var summary=req.query.summary;
    console.log(bookid,title,author,price,summary)

    conn.getDb((err,db)=>{
        if(err) throw err;
        var book=db.collection("book");
        book.updateOne({id:bookid},{
            $set:{
                title:title,
                author:author,
                price:price,
                summary:summary

            }
        },(err,result)=>{
            if(err) throw err;
            console.log("连接数据库成功")
            
            res.send("0")

        })
    })

 



})


//添加图书
router.get("/addbook",(req,res)=>{
    // res.send("添加书籍")

    res.render("addbook",{username:req.session.username})




})

//添加图书提交

router.get("/addbooksubmit",(req,res)=>{

    var bookid=req.query.bookid;
    var title=req.query.title;
    var author=req.query.author;
    var price=req.query.price;
    var summary=req.query.summary;
    var image="https://img3.doubanio.com/mpic/s27264181.jpg";
    console.log(bookid,title,author,price,summary)

    conn.getDb((err,db)=>{
        if(err) throw err;
        var book=db.collection("book");
        async.waterfall([
            function(callback){
                book.find({id:bookid}).toArray((err,result)=>{
                    if(err) throw err;
                    if(result.length>0){
                    callback(null,false)
                    }else{
                     callback(null,true);
                    }


                })


            },
            function(arg,callback){
                if(arg){
                    book.insert({id:bookid,title:title,author:author,price:price,summary:summary, image:image,},(err,result)=>{
                        if(err) throw err;
                        callback(null,true)
                    })
                }else{
                    callback(null,false)
                }
            }
        ],function(err,result){
            if(err) throw err;
            console.log(result);
            if(result){
                res.send("1")
            }else{
                res.send("0")
            }
        })

    })



})

module.exports = router;