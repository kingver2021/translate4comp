const mysql = require("mysql");
const fs = require("fs");

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '338800',
  database: 'xmw',
  connectionLimit: 1000 // 最大连接数
});

function qy(sql){return new Promise((resolve,reject)=>{
    pool.getConnection((err, connection) => {
    connection.query(sql,(err, result)=>{
        connection.release();
        if(err)
             reject(err);
        else
             resolve(JSON.stringify(result));
        
    });
    });
    }).then(function(rs){return rs;}).catch(function(err){console.log(err);});
}

var query = async function(arg)
{
            var rs = await qy(arg);
            return rs;
}

exports.query = query;
