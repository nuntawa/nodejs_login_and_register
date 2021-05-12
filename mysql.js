var mysql = require('mysql');
var mysql_connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "my_db"
});

var runSQLQuery=(sql,place_holder)=>
{
    //กำหนดให้ return  object Promise รอ
    return new Promise((resolve, reject)=>{

        mysql_connection.connect(()=>{
            //รันคำสั่ง SQL
            mysql_connection.query(sql,place_holder,(err,result)=>{
        
                if(err)
                { 
                    console.log(err);
                    return reject(err.sqlMessage);
                }
        
                if(result==null)
                {
                   
                    return reject("Mysql Error");
                }

                //ส่งผลลัพธืของคำสั่ง sql กลับไปให้ทำงานต่อ
                resolve(result);
        
            })
        
        });

    });
};

module.exports ={ runSQLQuery };