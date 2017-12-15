var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var CONN_DB_STR = "mongodb://60.205.215.60:27017/library";

module.exports = {
    getDb:function(callback){
        MongoClient.connect(CONN_DB_STR,(err,db)=>{
            if(err){
                callback(err,null);
            }else{
                callback(null,db);
            }
        })
    }
}