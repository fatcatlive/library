var express = require('express');
var router = express.Router();
var conn=require("../utils/conn");
var async=require("async");
var multiparty=require("multiparty");
var fs=require("fs");

//评价提交

router.post("/commentsubmit",(req,res)=>{
    var username=req.session.username;
    var bookid=req.query.bookid;
    var title=req.body.title;
    var content=req.body.content;

    console.log(bookid);

    if(username){

        var insertData=function(db,callback){
            var  bkcomment=db.collection("bkcomment");
            var iids=db.collection("iids");


            async.waterfall([function(callback){
                iids.findAndModify(
                    {name:"comment"},  // query 查询条件
                    [["_id","desc"]],  // sort 排序 
                    {$inc:{id:1}},  // id +1
                    function(err,result){
                        if(err) throw err;
                        console.log(result);
                        callback(null,result.value.id);
                    }
                )
            },
                function(commentid,callback){

                    bkcomment.insert({commentid:commentid,username:username,bookid:bookid,title:title,content:content,time:Date.now()},(err,result)=>{
                        if(err) throw err;
                        console.log(result);
                        console.log("数据插入成功");
                        callback(null,result)
                       
                    })

                }
            
            ],function(err,result){
                if(err) throw err;
                callback(result)
            })
        
        }

        conn.getDb((err,db)=>{
            if(err) throw err;
            // console.log(result);
            insertData(db,(result)=>{
                if(err) throw err;
                res.redirect('/book/detail?bookid='+bookid)

            })
           
           
    
        })
    

    }else{
        res.send("<script>alert('sess过期，请先登录');location.href='/login'</script>")
    }


    

   


    
    


})


//上传图片
router.post("/uploadImg",(req,res)=>{
    console.log("上传图片");
    // multiparty
    
    var form = new multiparty.Form();  // 实例化
    // 设置编码
    form.encoding = "UTF-8";
    // 设置文件的临时存储路径 
    form.uploadDir = "./uploadtemp";
    // 设置上传图片的大小限制
    form.maxFilesSize = 2*1024*1024;   // 2M

    form.parse(req,(err,fields,files)=>{
        if(err) throw err;
        // fields 文件域
        // files  对应的文件
        console.log(fields);
        console.log(files);
        var uploadUrl = "/images/upload/";  // 文件上传的真实路径
        file = files["filedata"];   // 富文本编辑框  filedata
        originalFilename = file[0].originalFilename;   //文件名称 
        tempath = file[0].path;    //  文件的临时路径   进行读  readStream

        var timestamp = new Date().getTime();  // 获取时间戳  4444
        uploadUrl += timestamp + originalFilename;  // /images/upload/44442.jpg
        newPath = "./public"+uploadUrl;    // 文件的写入路径 

        // 通过文件读写流进行操作  
        var fileReadStream = fs.createReadStream(tempath);    // 读取文件流
        var fileWriteStream = fs.createWriteStream(newPath);   //写入文件流

        fileReadStream.pipe(fileWriteStream); 

        // 监听文件上传关闭
        fileWriteStream.on("close",()=>{
            // 同步删除  临时文件夹的文件
            fs.unlinkSync(tempath);
            res.send('{"err":"","msg":"'+uploadUrl+'"}');
        })
    })
})




module.exports = router;