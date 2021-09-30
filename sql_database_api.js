const express = require('express');
const mysql = require('mysql');


// var db = mysql.createConnection({
//     host: "127.0.0.1",
//     user: "root",
//     password: "",
//     database: "Nodemysql"
// });

// db.connect(function (err) {
//     if (err) throw err;
//     console.log("Connected!");
//     // db.query("CREATE DATABASE mydb", function (err, result) {
//     //   if (err) throw err;
//     //   console.log("Database created");
//     // });
// });

const app = express();

app.get('/home', (req, res) => {

    res.send("Hello World!");
    console.log("Hello World!");
})

app.get('/createdb', (req, res) => {
    let sql = "CREATE DATABASE Nodemysql"

    db.query(sql, (err, result) => {
        if (err) {
            console.log("error while creating database");
            res.send('database created failed..' + err);
        }
        else {
            console.log('result: ' + result);
            res.send('database created..');

        }
    });
})

app.get('/createtable', (req, res) => {

    $request = req.query.name;
    let sql = "CREATE TABLE police1(id int auto_increment,name varchar(255), address varchar(255),primary key(id))"
    db.query(sql, (result, err) => {
        if (err) {
            console.log(err)
            res.send(err);
            if(result!=null)
            {
                if (result.message=='')
                {
                    console.log("Table generate Success!")
                    res.send("Table generate Success!")
                    // console.log(result.code);

                }
                else{
                    res.send("Table already exists")
                }
            }
            else{
                // res.send("Table already exists")
            }
            
        }
        else{
            if(result!=null)
            {
                if (result.message=='')
                {
                    console.log("Table generate Success!")
                    res.send("Table generate Success!")
                    // console.log(result.code);

                }
                else{
                    res.send("Table already exists")
                }
            }
            else{
                // res.send("Table already exists")
            }
        }
        
        
    })
})

app.get('/select/:super/:superadmin', (req, res) => {

    $request = req.params.super;
    $request1 = req.params.superadmin;

    let sql = "SELECT * FROM "+$request1+" WHERE id = "+$request;
    db.query(sql, (err, result) =>{
            if (err) throw err;
            console.log(result);
            res.json(result);
            
          })
        }
)

app.post('/insert/:superadmin', (req, res) => {

    $request1 = req.params.superadmin;
    $request2 = req.query.id;
    $request3 = req.query.username;
    $request4 = req.query.ip_addr;
    $request5 = req.query.device;
    $request6 = req.query.country;


    let sql = "INSERT INTO "+$request1+"(id, username, ip_addr, device, country) VALUES("+$request2+",'"+$request3+"','"
    +$request4+"','"+$request5+"','"+$request6+"')";
    db.query(sql, (err, result) =>{
            if (err) {console.log(err);
            res.send(err);}
            else{
            console.log(result);
            res.json("Successfully saved");
            }
            
          })
        }
)

app.put('/modify/:superadmin', (req, res) => {

    $request1 = req.params.superadmin;
    $request2 = req.query.id;
    $request4 = req.query.ip_addr;
    $request5 = req.query.device;
    $request6 = req.query.country;


    let sql = "UPDATE "+ $request1 +" SET ip_addr = '"+$request4+"' , device = '"+$request5+"',country='"+$request6+"' WHERE id = "+$request2+";";
    db.query(sql, (err, result) =>{
            if (err) 
            {console.log(err);
            res.send(err);
            }
            else
            {
            console.log(result);
            res.json("Successfully Modified");
            }
            
          })
        }
)
  
const PORT = process.env.PORT || 3000                                                   
   app.listen(                                                                                 
    PORT,                                                                                                    
    '0.0.0.0',                                                                                
    function () {                                                                                                             
    console.log("Server started.......");                                                              
    }                                                                                                                   
  );
