const express = require('express'), bodyParser = require('body-parser');;
const mysql = require('mysql');
var db;

var db_config = {
    host     : '51.79.171.35',
    port     :  827,
    // path :'/phpmyadmin_70ad85ca0dd8b62f/db_structure.php?server=1&db=nodemysql',
    user: "sms_Gateways",
    password: "khan.awais#123",
    database: "nodemysql"

}

let pool = mysql.createPool(db_config);



const app = express();
const PORT = process.env.PORT || 3000
app.listen(
    PORT,
    '0.0.0.0',
    function () {
        console.log("Server started.......");
        pool.on('connection', function (err,_conn) {
            if(err)
            {
                console.log("Error occurred"+err);
            }
        
            if (_conn) {
                logger.info('Connected the database via threadId %d!!', _conn.threadId);
                _conn.query('SET SESSION auto_increment_increment=1');
                console.log("connected success");
            }
        });
        // db.connect(function (err) {
        //     if (err) 
        //     {
        
        //         throw err;
        //     }
        //     else{
        
        //         console.log("Connected!");
        //     }
        
            
        //     // db.query("CREATE DATABASE mydb", function (err, result) {
        //     //   if (err) throw err;
        //     //   console.log("Database created");
        //     // });
        // });
    }
);



// handleDisconnect();
// function handleDisconnect() {
//     db = mysql.createConnection(db_config); // Recreate the connection, since
//                                                     // the old one cannot be reused.                                    
//     db.connect(function(err) {              // The server is either down
//       if(err) {                                     // or restarting (takes a while sometimes).
//         console.log('error when connecting to db:', err);
//         setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
//       }                                     // to avoid a hot loop, and to allow our node script to
//     });                                     // process asynchronous requests in the meantime.
//                                             // If you're also serving http, display a 503 error.
//     db.on('error', function(err) {
//       console.log('db error', err);
//       if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
//         handleDisconnect();                         // lost due to either server restart, or a
//       } else {                                      // connnection idle timeout (the wait_timeout
//         throw err;                                  // server variable configures this)
//       }
//     });
//   }