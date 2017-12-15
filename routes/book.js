var express = require('express');
var router = express.Router();
var conn=require("../utils/conn");
var async=require("async")



//书本详情页
router.get("/detail",(req,res)=>{
    var bookid=req.query.bookid;
    console.log(bookid);

    if(req.session.username){

        var findData=function(db,callback){
            var book=db.collection("book");
            var bkcomment=db.collection("bkcomment");
    
            async.series([
                function(callback){
                    book.find({id:bookid},{_id:0}).toArray((err,result)=>{
                        if(err) throw err;
                        console.log(result);
                        callback(null,result[0])
                        // res.render("detail",{username:req.session.username,result:result[0]})
                    })
                   
                  
    
                },
                function(callback){
                    bkcomment.find({bookid:bookid},{_id:0}).sort({_id:-1}).toArray((err,result)=>{
                        if(err) throw err;
                        console.log(result);
                        // result=JSON.stringify(result);
                        callback(null,result)
                    })
    
                }
            ],function(err,result){
                if(err) throw err;
                // console.log(result);
                callback(result)
    
            })
    
        }
    
        conn.getDb((err,db)=>{
            if(err) throw err;
    
            console.log("数据库连接成功")
            findData(db,(result)=>{
                console.log(result)
                result[1].forEach((item,index)=>{
                    item.time=new Date(item.time);
                    item.time=item.time.getFullYear()+"年"+item.time.getMonth()+"月"+item.time.getDate()+"日"+item.time.getHours()+"时"+item.time.getMinutes()+"分"+item.time.getSeconds()+"秒";
                   
                })
               
                
                console.log(result)
                res.render('detail',{bookresult:result[0],commentresult:result[1],username:req.session.username})
    
            })
            
    
           
            
        })
    



    }else{
        res.send("<script>alert('session会话过期，请重新登录！'),location.href='/login'</script>")
    }
    



    
})




//加入我的书架

router.get("/addtomybook",(req,res)=>{


    // res.send("加入我的书架成功")
    
    var id=req.query.id;
    var username=req.session.username;

    if(username){

        
        async.waterfall([
            function(callback){
                conn.getDb((err,db)=>{
                    if(err) throw err;
                    var mybook=db.collection("mybook");
                    mybook.find({username:username,id:id},{_id:0}).toArray((err,result)=>{
                        if(err) throw err;
                        console.log(result);
                        if(result.length>0){
                            callback(null,true)
                        }else{
                            callback(null,false)
                        }
                    })
                    

                })
            },
            function(arg1,callback){
                if(!arg1){

                    conn.getDb((err,db)=>{
                        if(err) throw err;
                        console.log("数据库连接=========成功")
                        var book=db.collection("book");
                        book.find({id:id},{_id:0}).toArray((err,result)=>{
                            if(err) throw err;
                            console.log(result)
                            if(result.length>0){
                                // res.send("1")
                                callback(null,result[0])
                            }else{
                                callback(null,false)
                            }
                
                
                        })
                    })

                }else{
                    callback(null,false)
                }


                

            },
            function(arg,callback){
                if(arg){
                    conn.getDb((err,db)=>{
                        var mybook=db.collection("mybook");
                        mybook.insert({username:username,
                            id:arg.id,
                            author:arg.author,
                            summary:arg.summary,
                            image:arg.image,
                            price:arg.price,
                            title:arg.title
                             
                        },(err,result)=>{
                            if(err) throw err;
                            console.log(result);
                            console.log("数据插入成功");
                            callback(null,"0")

                        })

                    })
                    

                }else{
                    callback(null,"1")
                }
            }
        ],function(err,result){
            if(err) throw err;
            console.log(result)
            if(result=="1"){
                res.send("1")
            }else{
                res.send("0")
            }

        })

        

    }else{
           res.send("<script>alert('session会话过期，请重新登录！'),location.href='/login'</script>")
    }


    

})


//我的书架

router.get("/mybook",(req,res)=>{
    var username=req.session.username;
    var pageSize=5;
    var totalPage=0;
    var count=0;
    var pageNo=req.query["pageNo"];
    console.log(pageNo);
    pageNo=pageNo?parseInt(pageNo):1;




    if(username){

        var findData=function(db,callback){
            var mybook=db.collection("mybook");

            async.waterfall([
                function(callback){
                    //查询mybook数据条数
                    mybook.find({username:username}).toArray((err,result)=>{
                        if(err) throw err;
                        console.log("查询数量成功");
                        count=result.length;
                        if(count>=1){
                            totalPage=Math.ceil(count/pageSize);
                            pageNo=pageNo<=1?1:pageNo;
                            pageNo=pageNo>=totalPage?totalPage:pageNo;
                            callback(null,true)
                        }else{
                            callback(null,false)
                        }


                    })

                
                },
                function(arg,callback){
                    if(arg){
                        mybook.find({username:username},{_id:0}).sort({_id:-1}).skip((pageNo-1)*pageSize).limit(pageSize).toArray((err,result)=>{
                            if(err) throw err;
                            callback(null,result)
                        })
                    }else{
                        callback(null,false)
                    }
                
                }
            ],function(err,result){
                if(err) throw err;
                callback(result);


            })
        }
        conn.getDb((err,db)=>{
            if(err) throw err;
            findData(db,(result)=>{
                res.render("mybook",{username:req.session.username,
                                    result:result,
                                    pageNo:pageNo,
                                    count:count,
                                    totalPage:totalPage,
                         })

                })

               
        })


    }else{
        res.send("<script>alert('session会话过期，请重新登录！'),location.href='/login'</script>")
    }



    
})


//删除书籍
router.get("/mybookdelete",(req,res)=>{

    var id=req.query.id;
    console.log(id)

    if(id!=-1){
        conn.getDb((err,db)=>{
            if(err) throw err;
            var mybook=db.collection("mybook");
            mybook.deleteOne({id:id},(err,result)=>{
                if(err) throw err;
                console.log(result);
                res.send("1");
                db.close();
    
            })
    
            
        })

    }else{
        conn.getDb((err,db)=>{
            if(err) throw err;
            var mybook=db.collection("mybook");
            mybook.remove((err,result)=>{
                if(err) throw err;
                console.log(result);
                console.log("删除所有")
                res.send("0");
                db.close();
            })


        })

    }

    


})



//搜索图书

router.get("/searchbook",(req,res)=>{
   res.render("searchbook",{username:req.session.username})




})

router.get("/searchinputbook",(req,res)=>{
    var title=req.query.title;

    if(title!=""){

        conn.getDb((err,db)=>{
            if(err) throw err;
            var book=db.collection("book");
            book.find({title:{$regex:new RegExp(title)}},{_id:0}).toArray((err,result)=>{
                if(err) throw err;
                console.log(result);
                res.send(result);
    
            })
        })
     

    }else{
        res.send("0")
    }
    
 })




module.exports = router;