const express = require('express'), bodyParser = require('body-parser');;
const mysql = require('mysql');




// var db = mysql.createConnection({

// });
var db;
const hostname = 'remotemysql.com';
// const hostname = 'localhost';

const port = 3000;
var db_config = {
    host     : hostname,
    // path :'/phpmyadmin_70ad85ca0dd8b62f/db_structure.php?server=1&db=nodemysql',
    user: "jHws6qKKFc",
    password: "wgGYuNRC9T",
    database: "jHws6qKKFc"

}
// var db_config = {
//     host     : hostname,
//     // path :'/phpmyadmin_70ad85ca0dd8b62f/db_structure.php?server=1&db=nodemysql',
//     user: "root",
//     password: "",
//     database: "nodemysql"

// }

handleDisconnect();



function handleDisconnect() {
    db = mysql.createConnection(db_config); // Recreate the connection, since
                                                    // the old one cannot be reused.                                            
    db.connect(function(err) {              // The server is either down
      if(err) {                                     // or restarting (takes a while sometimes).
        console.log('error when connecting to db:');
        setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
      }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
    db.on('error', function(err) {
      console.log('db error', err);
      if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
        handleDisconnect();                         // lost due to either server restart, or a
      } else {                                      // connnection idle timeout (the wait_timeout
        throw err;                                  // server variable configures this)
      }
    });
  }

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

const app = express();
app.use(bodyParser.json());

var cors = require('cors');

// use it before all route definitions
app.use(cors({origin: '*'}));

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// app.get('/connect', (req, res) => {

//     handleDisconnect(req,res);
// })

app.get('/', (req, res) => {

    res.send(JSON.stringify({ http_code: 200, http_response: 'Hello World' }));
    console.log("Hello World!");
})


// ----------Permissions--------------
app.post('/insert/permissions/:Acc_holder', (req, res) => {

    $request1 = req.params.Acc_holder;

    let requested_body = req.body;
    // var count = Object.keys(requested_body)
    let obj = new Object(requested_body);

    {
        if (Object.keys(obj).length < 2) {
            res.send(JSON.stringify({ http_code: 100, http_response: "Error body incomplete" }));
        }
        else if (Object.keys(obj).length <= 11) {
            let sql = "INSERT INTO "
                + "permissions" +
                "(id,username,access_sms,access_mms,access_contacts,sms_campaign,access_templates,access_billing,mobile_topup,access_resellers,banned,status) VALUES("
                + requested_body.id + ",'" + requested_body.username + "','"
                + requested_body.access_sms + "','" + requested_body.access_mms + "','"
                + requested_body.access_contacts + "','" + requested_body.sms_campaign + "','"
                + requested_body.access_templates + "','" + requested_body.access_billing + "','"
                + requested_body.mobile_topup + "','" + requested_body.access_resellers	+ "','" 
                + requested_body.banned + "','" + $request1 + "')";

            db.query(sql, (err, result) => {
                if (err) {
                    // console.log(err);
                    res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to ' + err }));
                }
                else {
                    // console.log(result);

                    res.send(JSON.stringify({ http_code: 200, http_response: result }));
                }

            });

        }
        else {
            res.send(JSON.stringify({ http_code: 100, http_response: "Error body Overlimit" }));
        }
    }
}
)

app.get('/select/permissions', (req, res) => {

    $request = req.query.id;
    $request1 = req.query.status;
    // res.setHeader("Content-Type", "text/html");

    if (($request != null || undefined) ) 
    {
        // res.setHeader("Access-Control-Allow-Origin", "*")

        let sql = "SELECT * FROM " + "permissions" + " WHERE id = " + $request;
        db.query(sql, (err, result) => {
            if (err) 
            {

                res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to? ' + err }));
            }
            else
            {

                res.send(JSON.stringify({
                    http_code: 200
                    , http_response: result
                }));
            }

        })

    }

    else if (($request1 != null || undefined) ) {
        // res.setHeader("Access-Control-Allow-Origin", "*");

        let sql = "SELECT * FROM " + "permissions " + "WHERE status = '" + $request1+"'";
        db.query(sql, (err, result) => {
            if (err)
            {
                res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to? ' + err }));
            } 
            else{

                res.send(JSON.stringify({
                    http_code: 200
                    , http_response: result
                }));
            }
                

        })

    }
    
    else
    {

        res.send(JSON.stringify({
            http_code: 200
            , http_response: 'id missing or status not defined?'
        })
        );
    }
    


}
)

app.put('/modify/permissions', (req, res) => { // Only for resellers
    $request1 = req.query.id;
    let requested_body = req.body;
    // var count = Object.keys(requested_body)
    let obj = new Object(requested_body);

    
    if (Object.keys(obj).length <= 11)
    {

        let sql = "UPDATE " + "permissions" 
        + " SET username = '" + requested_body.username 
        + "',access_sms = '" + requested_body.access_sms 
        + "',access_mms='" + requested_body.access_mms 
        + "',access_contacts = '" + requested_body.access_contacts 
        + "',sms_campaign='" + requested_body.sms_campaign
        + "',access_templates = '" + requested_body.access_templates 
        + "',access_billing='" + requested_body.access_billing 
        + "',mobile_topup = '" + requested_body.mobile_topup 
        + "',access_resellers='" + requested_body.access_resellers
        + "',banned='" + requested_body.banned
        + "' WHERE id = " + $request1 + ";";

        db.query(sql, (err, result) => {
            if (err) {
                res.send(JSON.stringify({ http_code: 400, http_response: err }));
            }
            else {
                res.send(JSON.stringify({ http_code: 200, http_response: result }));
            }
    
        })


    }


}
)


// ----------Resellers--------------
app.post('/insert/accounts/:resellers', (req, res) => {

    $request1 = req.params.resellers;

    let requested_body = req.body;
    // var count = Object.keys(requested_body)
    let obj = new Object(requested_body);

    if ($request1 == 'resellers') {
        
        {
            let sql = "INSERT INTO "
                + $request1 +
                "(id,username,business_name,first_name,last_name,phone,email,ip_addr,device,country) VALUES("
                + requested_body.id + ",'" + requested_body.username + "','"
                + requested_body.account_name + "','" + requested_body.first_name + "','"
                + requested_body.last_name + "','" + requested_body.phone + "','"
                + requested_body.email + "','" + requested_body.ip_addr + "','"
                + requested_body.device + "','" + requested_body.country + "')";

            db.query(sql, (err, result) => {
                if (err) {
                    // console.log(err);
                    res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to ' + err }));
                }
                else {
                    // console.log(result);

                    res.send(JSON.stringify({ http_code: 200, http_response: result }));
                }

            });

        }
        
    }
}
)

app.get('/select/accounts/:resellers', (req, res) => {

    $request = req.query.id;
    $request1 = req.params.resellers;

    if (($request != null || undefined) && $request1=='resellers') {

        let sql = "SELECT * FROM " + $request1 + " WHERE id = " + $request;
        db.query(sql, (err, result) => {
            if (err) res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to? ' + err }));
            res.send(JSON.stringify({
                http_code: 200
                , http_response: result
            }));

        })

    }

    else {
        res.send(JSON.stringify({
            http_code: 200
            , http_response: 'id missing or not defined?'
        })
        );
    }


}
)


// ---------- data to operators-------------
app.post('/insert/operators/:operators_list', (req, res) => {

    $request1 = req.params.operators_list;

    let requested_body = req.body;
    // let obj = new Object(requested_body);
    var count = Object.keys(requested_body)

    if (count!=0)
    {

        if ($request1 == 'operators_list') {
            {
                let sql = "INSERT INTO "
                    + $request1 +
                    "(operator_name,operator_code) VALUES('"
                    + requested_body.name + "','" + requested_body.code + "')";
    
                db.query(sql, (err, result) => {
                    if (err) {
                        // console.log(err);
                        res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to ' + err }));
                    }
                    else {
                        // console.log(result);
    
                        res.send(JSON.stringify({ http_code: 200, http_response: result }));
                    }
    
                });
    
            }
            
        }
    }
    else{
        res.send({http_code:401,http_response:"body required"})
    }
}
)
app.get('/select/operators/:operators_list', (req, res) => {

    $request1 = req.params.operators_list;
    if ($request1 == "operators_list")
    {

        {
            let sql = "SELECT * FROM " + $request1 ;
            db.query(sql, (err, result) => {
                if (err) res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to? ' + err }));
                res.send(JSON.stringify({
                    http_code: 200
                    , http_response: result
                }));
    
            })
        }
    }

    else {
        res.send(JSON.stringify({
            http_code: 200
            , http_response: 'Location missing'
        })
        );
    }


}
)

app.put('/modify/operators/:operators_list', (req, res) => {

    $request1 = req.params.operators_list;
    $request2 = req.query.id;


    let requested_body = req.body;
    // let obj = new Object(requested_body);
    var count = Object.keys(requested_body)

        if ($request1 == 'operators_list') 
        {
            {
                let sql = "UPDATE " + $request1 + " SET operator_name = '" 
                + requested_body.operator_name + "' , operator_code = '" 
                + requested_body.operator_code + "' WHERE id = " + $request2 + ";";

                db.query(sql, (err, result) => {
                    if (err) {
                        // console.log(err);
                        res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to ' + err }));
                    }
                    else {
                        // console.log(result);
    
                        res.send(JSON.stringify({ http_code: 200, http_response: result}));
                    }
    
                });
    
            }
        }
        else
        {
            res.send({http_code:401,http_response:"path required"})
        }
    
}
)

app.delete('/remove/operators/:operators_list',(req,res)=>
{
    $request1 = req.params.operators_list;
    $request2 = req.query.id;

    if ($request1 =='operators_list' && $request2 !=null)
    {
        let sql = "DELETE FROM "+$request1+" WHERE id = "+$request2;
        db.query(sql, (err, result) => {
            if (err) {
                // console.log(err);
                res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to ' + err }));
            }
            else {
                // console.log(result);

                res.send(JSON.stringify({ http_code: 200, http_response: result }));
            }

        });
    }
    else{
        res.send(JSON.stringify({ http_code: 400, http_response: 'Error in path or id ' + err }));

    }
}

)



// --------------Get All Numbers---------------
app.get('/operators/sim/:device', (req, res) => {
    let opcode = req.query.opcode;
    $request1 = req.params.device;
    if ($request1 == 'subscribe_devices_info') 
    {
        if (opcode != null || undefined) 
        {
            // SELECT number FROM `subscribe_devices_info` WHERE number LIKE '0322%'

            let sql = "SELECT number FROM " + $request1 +" WHERE number LIKE '%"+opcode+"%' "   ;
            db.query(sql, (err, result) => {
                if (err) 
                {

                    res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to? ' + err }));
                }
                else{

                    var filtered = [{},{},{}];
                    

                    // let data = JSON.parse(JSON.stringify(result));
                    // let number = result ;

                    // let b = number.filter(e=>
                    //     {
                    //         e.substr(0,5)== opcode
                    //     })

                    res.send(JSON.stringify({
                         http_code: 200
                        ,http_response: result
                    }));


                    



                }

            })
        }
            
            else {
                res.send(JSON.stringify({ http_code: 100, http_response: "id not found!" }))
            }


    }
    else {
        res.send(JSON.stringify({ http_code: 100, http_response: "Path not found? " + $request1 }))
    }
}
)


// -------------- Operator Balance ----
app.post('/insert/balance/:operator_balance', (req, res) => {

    $request1 = req.params.operator_balance;

    let requested_body = req.body;
    // let obj = new Object(requested_body);
    var count = Object.keys(requested_body)


        if ($request1 == 'operator_balance') {
            {
                let sql = "INSERT INTO "
                    + $request1 +
                    "(operator_code,ussd,sms_number,sms,receive_format,max_inquiry,mode) VALUES('"
                    + requested_body.operator_code + "','" + requested_body.ussd + "','" 
                    + requested_body.sms_number + "','" + requested_body.sms + "','" 
                    + requested_body.receive_format + "','" + requested_body.max_inquiry + "','" 
                    + requested_body.mode + "')";
    
                db.query(sql, (err, result) => {
                    if (err) {
                        // console.log(err);
                        res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to ' + err }));
                    }
                    else {
                        // console.log(result);
    
                        res.send(JSON.stringify({ http_code: 200, http_response: result }));
                    }
    
                });
    
            }
            
        }
        else
        {
            res.send({http_code:401,http_response:"path required"})
        }
    
    
}
)

app.get('/bselect/:type/:operator_balance', (req, res) => {
    let opcode = req.query.opcode;
    $request1 = req.params.operator_balance;
    $request2 = req.params.type;

    if ($request1 == 'operator_balance') 
    {
        if (opcode != null || undefined) 
        {
            // SELECT number FROM `subscribe_devices_info` WHERE number LIKE '0322%'

            if ($request2=='ussd')
            {
                let sql = "SELECT ussd,receive_format,max_inquiry FROM " + $request1 +" WHERE operator_code = "+opcode   ;
                db.query(sql, (err, result) => {
                    if (err) 
                    {
    
                        res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to? ' + err }));
                    }
                    else{
    
                        res.send(JSON.stringify({
                             http_code: 200
                            ,http_response: result
                        }));
    
    
                        
    
    
    
                    }
    
                })

            }
            else if ($request2 == 'sms')
            {
                let sql = "SELECT sms_number,sms,receive_format,max_inquiry FROM " + $request1 +" WHERE operator_code = "+opcode  ;
                db.query(sql, (err, result) => {
                    if (err) 
                    {
    
                        res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to? ' + err }));
                    }
                    else{
    
                        res.send(JSON.stringify({
                             http_code: 200
                            ,http_response: result
                        }));

                    }
    
                })
            }


        }
            
            else {
                res.send(JSON.stringify({ http_code: 100, http_response: "id not found!" }))
            }


    }
    else {
        res.send(JSON.stringify({ http_code: 100, http_response: "Path not found? " + $request1 }))
    }
}
)

app.put('/modify/balance/:operator_balance', (req, res) => {

    $request1 = req.params.operator_balance;
    $request2 = req.query.opcode;


    let requested_body = req.body;
    // let obj = new Object(requested_body);
    var count = Object.keys(requested_body)

    
    {

        if ($request1 == 'operator_balance') 
        {
            {
                let sql = "UPDATE " + $request1 + " SET ussd = '" 
                + requested_body.ussd + "' , sms_number = '" 
                + requested_body.sms_number + "',sms = '" 
                + requested_body.sms + "',receive_format = '" 
                + requested_body.receive_format + "',max_inquiry = '" 
                + requested_body.max_inquiry + "',mode = '" 
                + requested_body.mode+ "' WHERE operator_code = " + $request2 + ";";

                db.query(sql, (err, result) => {
                    if (err) {
                        // console.log(err);
                        res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to ' + err }));
                    }
                    else {
                        // console.log(result);
    
                        res.send(JSON.stringify({ http_code: 200, http_response: result }));
                    }
    
                });
    
            }
        }
        else
        {
            res.send({http_code:401,http_response:"path required"})
        }
    }
    
}
)

app.delete('remove/balance/:operator_balance',(req,res)=>
{
    $request1 = req.params.operator_balance;
    $request2 = req.query.opcode;

    if ($request1 =='operator_balance' && $request2 !=null)
    {
        let sql = "DELETE FROM "+$request1+"' WHERE operator_code = "+$request2;
        db.query(sql, (err, result) => {
            if (err) {
                // console.log(err);
                res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to ' + err }));
            }
            else {
                // console.log(result);

                res.send(JSON.stringify({ http_code: 200, http_response: result }));
            }

        });
    }
    else{
        res.send(JSON.stringify({ http_code: 400, http_response: 'Error in path or id ' + err }));

    }
}

)


// -------------- Operator Number ----
app.post('/insert/number/:operator_number', (req, res) => {

    $request1 = req.params.operator_number;

    let requested_body = req.body;
    // let obj = new Object(requested_body);
    var count = Object.keys(requested_body)


    {

        if ($request1 == 'operator_number') {
            {
                let sql = "INSERT INTO "
                    + $request1 +
                    "(operator_code,ussd,sms_number,sms,receive_format,max_inquiry,mode) VALUES('"
                    + requested_body.operator_code + "','" + requested_body.ussd + "','" 
                    + requested_body.sms_number + "','" + requested_body.sms + "','" 
                    + requested_body.receive_format + "','" + requested_body.max_inquiry + "','" 
                    + requested_body.mode + "')";
    
                db.query(sql, (err, result) => {
                    if (err) {
                        // console.log(err);
                        res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to ' + err }));
                    }
                    else {
                        // console.log(result);
    
                        res.send(JSON.stringify({ http_code: 200, http_response: result }));
                    }
    
                });
    
            }
            
        }
        else
        {
            res.send({http_code:401,http_response:"path required"})
        }

    }

}
)

app.get('/nselect/:type/:operator_number', (req, res) => {
    let opcode = req.query.opcode;
    $request1 = req.params.operator_number;
    $request2 = req.params.type;

    if ($request1 == 'operator_number') 
    {
        if (opcode != null || undefined) 
        {
            // SELECT number FROM `subscribe_devices_info` WHERE number LIKE '0322%'

            if ($request2=='ussd')
            {
                let sql = "SELECT ussd,receive_format,max_inquiry FROM " + $request1 +" WHERE operator_code = "+opcode   ;
                db.query(sql, (err, result) => {
                    if (err) 
                    {
    
                        res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to? ' + err }));
                    }
                    else{
    
                        res.send(JSON.stringify({
                             http_code: 200
                            ,http_response: result
                        }));
    
    
                        
    
    
    
                    }
    
                })

            }
            else if ($request2 == 'sms')
            {
                let sql = "SELECT sms_number,sms,receive_format,max_inquiry FROM " + $request1 +" WHERE operator_code = "+opcode  ;
                db.query(sql, (err, result) => {
                    if (err) 
                    {
    
                        res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to? ' + err }));
                    }
                    else{
    
                        res.send(JSON.stringify({
                             http_code: 200
                            ,http_response: result
                        }));

                    }
    
                })
            }


        }
            
            else {
                res.send(JSON.stringify({ http_code: 100, http_response: "id not found!" }))
            }


    }
    else {
        res.send(JSON.stringify({ http_code: 100, http_response: "Path not found? " + $request1 }))
    }
}
)

app.put('/modify/number/:operator_number', (req, res) => {

    $request1 = req.params.operator_number;
    $request2 = req.query.opcode;


    let requested_body = req.body;
    // let obj = new Object(requested_body);
    var count = Object.keys(requested_body)


    {

        if ($request1 == 'operator_number') 
        {
            {
                let sql = "UPDATE " + $request1 + " SET ussd = '" 
                + requested_body.ussd + "' , sms_number = '" 
                + requested_body.sms_number + "',sms = '" 
                + requested_body.sms + "',receive_format = '" 
                + requested_body.receive_format + "',max_inquiry = '" 
                + requested_body.max_inquiry + "',mode = '" 
                + requested_body.mode+ "' WHERE operator_code = " + $request2 + ";";

                db.query(sql, (err, result) => {
                    if (err) {
                        // console.log(err);
                        res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to ' + err }));
                    }
                    else {
                        // console.log(result);
    
                        res.send(JSON.stringify({ http_code: 200, http_response: result }));
                    }
    
                });
    
            }
        }
        else
        {
            res.send({http_code:401,http_response:"path required"})
        }
    }

}
)

app.delete('remove/number/:operator_number',(req,res)=>
{
    $request1 = req.params.operator_number;
    $request2 = req.query.opcode;

    if ($request1 =='operator_number' && $request2 !=null)
    {
        let sql = "DELETE FROM "+$request1+"' WHERE operator_code = "+$request2;
        db.query(sql, (err, result) => {
            if (err) {
                // console.log(err);
                res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to ' + err }));
            }
            else {
                // console.log(result);

                res.send(JSON.stringify({ http_code: 200, http_response: result }));
            }

        });
    }
    else{
        res.send(JSON.stringify({ http_code: 400, http_response: 'Error in path or id ' + err }));

    }
}

)

// --------------- 

// ----------Top up requests---------
app.post('/insert/topups/information',(req,res)=>
{
    let requested_body = req.body;
    {
        let sql = "INSERT INTO " + 'Top_Requests' + "(user_id , id, number, amount) VALUES('"
        + requested_body.user_id + "','"
        + requested_body.id + "','" + requested_body.number + "','"
        + requested_body.amount + "')";

        db.query(sql, (err, result) => {
            if (err) {
                // console.log(err);
                res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to ' + err }));
            }
            else {
                // console.log(result);

                res.send(JSON.stringify({ http_code: 200, http_response: result }));
            }

        });

    }

})

app.get('/select/topups/information', (req, res) => {

    let $request = req.query.user_id;
    if ($request != (null||undefined))
    {

        let sql = "SELECT * FROM " + 'Top_Requests' + " WHERE user_id = " + $request;
        db.query(sql, (err, result) => {
            if (err) res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to? ' + err }));
            res.send(JSON.stringify({
                http_code: 200
                , http_response: result
            }));
    
        })
    }
    else
    {
        res.send(JSON.stringify({
            http_code: 200
            , http_response: "Required user id"
        }));
    }
    


}
)



// ----------Users request-----------

app.get('/select/:superadmin', (req, res) => {

    $request = req.query.id;
    $request1 = req.params.superadmin;
    
    
    if ($request != null || undefined) {
        let sql = "SELECT * FROM " + $request1 + " WHERE id = " + $request;
        db.query(sql, (err, result) => {
            if (err) res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to? ' + err }));
            res.send(JSON.stringify({
                http_code: 200
                , http_response: result
            }));

        })
    }

    else {
        res.send(JSON.stringify({
            http_code: 200
            , http_response: 'id missing or not defined?'
        })
        );
    }


}
)

app.post('/insert/:superadmin', (req, res) => { //only for super and sub admins

    $request1 = req.params.superadmin;
    $request2 = req.query.id;
    $request3 = req.query.username;
    $request4 = req.query.ip_addr;
    $request5 = req.query.device;
    $request6 = req.query.country;


    let sql = "INSERT INTO " + $request1 + "(id, username, ip_addr, device, country) VALUES("
        + $request2 + ",'" + $request3 + "','"
        + $request4 + "','" + $request5 + "','" + $request6 + "')";
    db.query(sql, (err, result) => {
        if (err) {
            res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to? ' + err }));
        }
        else {
            res.send(JSON.stringify({ http_code: 200, http_response: result }));
        }

    })
}
)

app.put('/modify/:superadmin', (req, res) => { // Only for super and sub admins

    $request1 = req.params.superadmin;
    $request2 = req.query.id;
    $request4 = req.query.ip_addr;
    $request5 = req.query.device;
    $request6 = req.query.country;


    let sql = "UPDATE " + $request1 + " SET ip_addr = '" + $request4 + "' , device = '" + $request5 + "',country='" + $request6 + "' WHERE id = " + $request2 + ";";
    db.query(sql, (err, result) => {
        if (err) {
            res.send(JSON.stringify({ http_code: 400, http_response: err }));
        }
        else {
            res.send(JSON.stringify({ http_code: 200, http_response: result }));
        }

    })
}
)

// -----------Remote Messages--------------

app.post('/message/:message_path', (req, res) => {
    let requested_body = req.body;
    // var count = Object.keys(requested_body)
    let obj = new Object(requested_body);
    $request1 = req.params.message_path;

    
    
    {
        if ($request1 == 'remote_messages') {
            if (Object.keys(obj).length < 10) {
                res.send(JSON.stringify({ http_code: 100, http_response: "Error body incomplete" }));
            }
            else if (Object.keys(obj).length === 10) {
                {
                    let sql = "INSERT INTO "
                        + $request1 + "(id,username,device,body,from_num,to_num,direction,type,cost,status) VALUES("
                        + requested_body.id + ",'" + requested_body.username + "','"
                        + requested_body.device + "','" + requested_body.body + "','"
                        + requested_body.from_num + "','" + requested_body.to_num + "','"
                        + requested_body.direction + "','" + requested_body.type + "','"
                        + requested_body.cost + "','" + requested_body.status + "')";

                    db.query(sql, (err, result) => {
                        if (err) {
                            // console.log(err);
                        
                            res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to ' + err }));


                        }
                        else {
                            // console.log(result);
                            let sql = "SELECT * FROM " + $request1 + " WHERE id = " + requested_body.id;
                            db.query(sql, (err, result) => {
                                if (err) 
                                {
                
                                    // res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to? ' + err }));
                                }
                                else{

                                    let count = 0;
                                    // result.forEach(data => {
                                    //     if (data.status == "completed")
                                    //     {
                                    //         count++;
                                    //     }
                                    // });

                                    result.forEach(function(obj) 
                                    { 
                                       
                                        if (obj.status == "completed")
                                        {
                                            count++;
                                        }
                                    
                                    
                                    });

                                    
                                    
                                    let T_count = result.length;

                                    let answer = ((count/T_count).toFixed(2))*100;
                                    let sql = ' UPDATE subscribe_devices_info SET success= '+"'"+ answer +"'"+' WHERE id = '+requested_body.id ;

                                    db.query(sql, (err, result) => {
                                        if (err) 
                                        {
                        
                                        }
                                        else{

                                        }
                                    })

                                    
                                    // res.send(JSON.stringify({
                                    //     http_code: 200
                                    //     , http_response: result
                                    // }));
                                }
                
                            })
                            res.send(JSON.stringify({ http_code: 200, http_response: result }));
                        }
    
                    })
                }
            }
    
        }
        else {
            res.send(JSON.stringify({ http_code: 100, http_response: "Path not found? " + $request1 }))
        }
    }

    


}
)

app.get('/message/:message_path', (req, res) => {
    let id = req.query.id;
    $request1 = req.params.message_path;
    if ($request1 == 'remote_messages') {
        if (id != null || undefined) {
            let sql = "SELECT * FROM " + $request1 + " WHERE id = " + id;
            db.query(sql, (err, result) => {
                if (err) 
                {

                    res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to? ' + err }));
                }
                else{
                    
                    res.send(JSON.stringify({
                        http_code: 200
                        , http_response: result
                    }));
                    // console.log(result)
                    


                    
                }

            })
        }
        else {
            res.send(JSON.stringify({ http_code: 100, http_response: "id not found!" }))
        }


    }
    else {
        res.send(JSON.stringify({ http_code: 100, http_response: "Path not found? " + $request1 }))
    }
}
)

app.post('/message/:type/:date', (req,res) =>
{
    $request = req.params.type;
    $request1 = req.params.date;

    if($request=="scheduler")

    {
        const schedule = require('node-schedule');
        const date = new Date(2012, 11, 21, 5, 30, 0);

        let requested_body = req.body;
        let obj = new Object(requested_body);


        if (Object.keys(obj).length === 10)
        {

        const job = schedule.scheduleJob(date, function(){
            {
                let sql = "INSERT INTO "
                    + $request1 + "(id,username,device,body,from_num,to_num,direction,type,cost,status) VALUES("
                    + requested_body.id + ",'" + requested_body.username + "','"
                    + requested_body.device + "','" + requested_body.body + "','"
                    + requested_body.from_num + "','" + requested_body.to_num + "','"
                    + requested_body.direction + "','" + requested_body.type + "','"
                    + requested_body.cost + "','" + requested_body.status + "')";
                db.query(sql, (err, result) => {
                    if (err) {
                        // console.log(err);
                        res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to ' + err }));
                    }
                    else {
                        // console.log(result);

                        res.send(JSON.stringify({ http_code: 200, http_response: result }));
                    }

                })
            }
        });
        }
        else{
            res.send(JSON.stringify({ http_code: 400, http_response: 'Minimum length must be 10' }));

        }
    }
})




// -------Subscribers----------
app.post('/subscribe/:device', (req, res) => {
    let requested_body = req.body;
    // var count = Object.keys(requested_body)
    let obj = new Object(requested_body);
    $request1 = req.params.device;

    if ($request1 == 'subscribe_devices') {
        if (Object.keys(obj).length < 5) {
            res.send(JSON.stringify({ http_code: 100, http_response: "Error body incomplete" }));
        }
        else if (Object.keys(obj).length === 7) {
            {
                let sql = "INSERT INTO "
                    + $request1 + "(id,username,imei,imsi,phone,device,country) VALUES("
                    + requested_body.id + ",'" + requested_body.username + "','"
                    + requested_body.imei + "','" + requested_body.imsi + "','"
                    + requested_body.phone + "','"
                    + requested_body.device + "','"
                    + requested_body.country + "')";
                db.query(sql, (err, result) => {
                    if (err) {
                        // console.log(err);
                        res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to ' + err }));
                    }
                    else {
                        // console.log(result);

                        res.send(JSON.stringify({ http_code: 200, http_response: result }));
                    }

                })
            }
        }

    }
    else {
        res.send(JSON.stringify({ http_code: 100, http_response: "Path not found? " + $request1 }))
    }
}
)

app.get('/subscribe/:device', (req, res) => {
    let id = req.query.id;
    let imei = req.query.imei;
    $request1 = req.params.device;
    if ($request1 == 'subscribe_devices') {
        if (id != null || undefined) {
            let sql = "SELECT * FROM " + $request1 + " WHERE id = " + id;
            db.query(sql, (err, result) => {
                if (err) 
                {

                    res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to? ' + err }));
                }
                else{
                    
                    res.send(JSON.stringify({
                        http_code: 200
                        , http_response: result
                    }));
                }

            })
        }

        if(id != (null || undefined)  && imei != (null || undefined))
        {
            // SELECT * FROM `subscribe_devices` WHERE id = 316366 AND imei = '869254026691561'
            let sql = "SELECT * FROM " + $request1 + " WHERE id = " + id +" AND imei = "+imei;
            db.query(sql, (err, result) => {
                if (err) 
                {

                    res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to? ' + err }));
                }
                else{
                    
                    res.send(JSON.stringify({
                        http_code: 200
                        , http_response: result
                    }));
                }

            })
        }

        else {
            res.send(JSON.stringify({ http_code: 100, http_response: "id not found!" }))
        }


    }
    else {
        res.send(JSON.stringify({ http_code: 100, http_response: "Path not found? " + $request1 }))
    }
}
)

app.put('/subscribe/:device', (req, res) => { // Only for all update

    let requested_body = req.body;
    let $request2 = req.query.id;
    $request1 = req.params.device;
    if ($request1 == 'subscribe_devices')
    
    {
    let sql = "UPDATE " + $request1 + " SET username = '" 
    + requested_body.username + "',imei= '"+requested_body.imei
    + "',imsi='"+requested_body.imsi + "',phone='"+requested_body.phone + 
    "',device='"+requested_body.device +
     "',country='"+requested_body.country 
    +"' WHERE id = '" + $request2 + "';";

    db.query(sql, (err, result) => {
        if (err) {
            res.send(JSON.stringify({ http_code: 400, http_response: err }));
        }
        else {
            res.send(JSON.stringify({ http_code: 200, http_response: result }));
        }

    })

    }

}
)







// --------Subscriber each sim info------
app.post('/subscribe/sim/:device', (req, res) => {
    let requested_body = req.body;
    // var count = Object.keys(requested_body)
    let obj = new Object(requested_body);
    $request1 = req.params.device;

    if ($request1 == 'subscribe_devices_info') {
        if (Object.keys(obj).length < 1) {
            res.send(JSON.stringify({ http_code: 100, http_response: "Error body incomplete" }));
        }
        else if (Object.keys(obj).length > 1) {
            {
                let sql = "INSERT INTO "
                    + $request1 + "(id, simId ,sim,number,balance,date,time, ex_time ,sim_Status,success,delay,phone_Status,top_up,android_ver,device,imei) VALUES("
                    + requested_body.id + ",'" + requested_body.simId  + "','" + requested_body.sim + "','"
                    + requested_body.number + "','" + requested_body.balance + "','"
                    + requested_body.date + "','"
                    + requested_body.time + "','" + requested_body.ex_time + "','" 
                    + requested_body.sim_status + "','"
                    + requested_body.success + "','"
                    + requested_body.delay + "','"
                    + requested_body.phone_status + "','"
                    + requested_body.top_up + "','"
                    + requested_body.android_ver + "','"
                    + requested_body.device + "','"
                    + requested_body.imei + "')";
                db.query(sql, (err, result) => {
                    if (err) {
                        // console.log(err);
                        res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to ' + err }));
                    }
                    else {
                        // console.log(result);

                        res.send(JSON.stringify({ http_code: 200, http_response: result }));
                    }

                })
            }
        }

    }
    else {
        res.send(JSON.stringify({ http_code: 100, http_response: "Path not found? " + $request1 }))
    }
}
)

app.get('/subscribe/sim/:device', (req, res) => {
    let id = req.query.id;
    let imei = req.query.imei
    $request1 = req.params.device;
    if ($request1 == 'subscribe_devices_info') {
        if (id != null || undefined) {
            let sql = "SELECT * FROM " + $request1 + " WHERE id = " + id;
            db.query(sql, (err, result) => {
                if (err) 
                {

                    res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to? ' + err }));
                }
                else{
                    
                    res.send(JSON.stringify({
                        http_code: 200
                        , http_response: result
                    }));
                }

            })
        }
        if (imei != null || undefined)
        {
            let sql = "SELECT * FROM " + $request1 + " WHERE imei = '" + imei+"'";
            db.query(sql, (err, result) => {
                if (err) 
                {

                    res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to? ' + err }));
                }
                else{
                    
                    res.send(JSON.stringify({
                        http_code: 200
                        , http_response: result
                    }));
                }

            })
        }

        else {
            // res.send(JSON.stringify({ http_code: 100, http_response: "Query not found?" }))
        }


    }
    else {
        res.send(JSON.stringify({ http_code: 100, http_response: "Path not found? " + $request1 }))
    }
}
)



app.put('/subscribe/sim/:device', (req, res) => { // Only for all update

    $request2 = req.query.id;
    $request4 = req.query.number;
    $slot = req.query.slot;

    $request3 = req.query.imei;

    let requested_body = req.body;

    $request1 = req.params.device;
    if ($request1 == 'subscribe_devices_info')
    
    {
    let sql = "UPDATE " + $request1 + " SET balance = '" 
    + requested_body.balance + "',slot= '"+$slot + "',number= '"
    +$request4 + "',date= '"+requested_body.date
    + "',time='"+requested_body.time + "',delay='"+requested_body.delay + 
    "',phone_Status='"+requested_body.phone_status +
     "',success='"+requested_body.success + "',sim_Status='"+requested_body.sim_status
    +"' WHERE (id = " + $request2 + " AND imei = '"+$request3 + "') AND (number = '"+$request4 
    +"' OR slot = '"+$slot+"');" ;

    db.query(sql, (err, result) => {
        if (err) {
            res.send(JSON.stringify({ http_code: 400, http_response: err }));
        }
        else {
            res.send(JSON.stringify({ http_code: 200, http_response: result }));
        }

    })

    }

}
)

app.put('/subscribe/sims/:device', (req, res) => { // Only for all update

    $request2 = req.query.id;
    $request4 = req.query.number;
    $slot = req.query.slot;
    $request3 = req.query.imei;
    $request1 = req.params.device;

    if ($request1 == 'subscribe_devices_info')
    
    {
    let sql = "UPDATE " + $request1 + " SET slot= '"+$slot + "',number= '"
    +$request4 
    +"' WHERE (id = " + $request2 + " AND imei = '"+$request3 + "') AND (number = '"+$request4 
    +"' OR slot = '"+$slot+"');" ;

    db.query(sql, (err, result) => {
        if (err) {
            res.send(JSON.stringify({ http_code: 400, http_response: err }));
        }
        else {
            res.send(JSON.stringify({ http_code: 200, http_response: result }));
        }

    })

    }

}
)

app.put( '/subscribe/simupdates/:target', (req, res) =>
{
    let $request = req.params.target;
    let simID = req.query.simId;
    let obj = req.body;
    let body = new Object(obj);
    


    if ($request == "subscribe_devices_info")
    {
        if (Object.keys(body).length > 0 )
        {

            if (body.hasOwnProperty("balance"))
            {
            //  sql = "UPDATE " + $request + " SET balance= '"+body.balance + "'Where simId = "+$request1;
           let  sql =  "UPDATE "+$request+" SET balance = '"+body.balance+"' WHERE simId = '"+simID+"'";
            db.query(sql, (err, result) => {
                if (err) {
                    res.send(JSON.stringify({ http_code: 400, http_response: err }));
                }
                else {
                    res.send(JSON.stringify({ http_code: 200, http_response: "Balance updated success" }));
                }
        
            })
            }

            if (body.hasOwnProperty("simId"))
            {
           let  sql =  "UPDATE "+$request+" SET simId = '"+body.simId+"' WHERE simId = '"+simID+"'";
            db.query(sql, (err, result) => {
                if (err) {
                    res.send(JSON.stringify({ http_code: 400, http_response: err }));
                }
                else {
                    res.send(JSON.stringify({ http_code: 200, http_response: "Name updated success" }));
                }
        
            })
            }

             if (body.hasOwnProperty("delay"))
            {
                let sql =  "UPDATE "+$request+" SET delay = '"+body.delay+"' WHERE simId = '"+simID+"'";
                
                db.query(sql, (err, result) => {
                    if (err) {
                        res.send(JSON.stringify({ http_code: 400, http_response: err }));
                    }
                    else {
                        res.send(JSON.stringify({ http_code: 200, http_response: "Delay updated success" }));
                    }
            
                })
            }

            if (body.hasOwnProperty("slot"))
            {
                let sql =  "UPDATE "+$request+" SET slot = '"+body.slot+"' WHERE simId = '"+simID+"'";
                
                db.query(sql, (err, result) => {
                    if (err) {
                        res.send(JSON.stringify({ http_code: 400, http_response: err }));
                    }
                    else {
                        res.send(JSON.stringify({ http_code: 200, http_response: "Slot updated success" }));
                    }
            
                })
            }

            if (body.hasOwnProperty("number"))
            {
                let sql =  "UPDATE "+$request+" SET number = '"+body.number+"' WHERE simId = '"+simID+"'";
                
                db.query(sql, (err, result) => {
                    if (err) {
                        res.send(JSON.stringify({ http_code: 400, http_response: err }));
                    }
                    else {
                        res.send(JSON.stringify({ http_code: 200, http_response: "Number updated success" }));
                    }
            
                })
            }
            
        }
        else{
            res.send(JSON.stringify({ http_code: 200, http_response: "Json not found" }));
        }
        

        

        
    }
    else{
        res.send(JSON.stringify({ http_code: 200, http_response: "Table not found" }));

    }
}
)

app.delete('/remove/sim/:device',(req,res)=>
{
    $request1 = req.params.device;
    $request2 = req.query.imei;

    if ($request1 =='subscribe_devices_info' && $request2 !=null)
    {
        let sql = "DELETE FROM "+$request1+" WHERE imei = '"+$request2+"';";
        db.query(sql, (err, result) => {
            if (err) {
                // console.log(err);
                res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to ' + err }));
            }
            else {
                // console.log(result);

                res.send(JSON.stringify({ http_code: 200, http_response: result }));
            }

        });
    }
    else{
        res.send(JSON.stringify({ http_code: 400, http_response: 'Error in path or id ' + err }));

    }
}

)








// ------Auto Email Verification----------
app.post('/sendverification/:email/:api', (req, res) => {
    // var count = Object.keys(requested_body)
    
    $request1 = req.params.email; //email
    $request2 = req.params.api; //code

    var nodemailer = require('nodemailer');
    const pug = require('pug');
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: false,
        auth: {
            user: 'livenewsofficials@gmail.com',
            pass: 'Myyahooacc-1Saen'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const _fs = require('fs');
const _path = require('path');

code_data=0;

var path = _path.join("/");
    _fs.readFile('verifier_code.html', 'utf8', function (err, data) {
        if (err) {
            _console.log(err, 'error');

            return null;
        };

        code_data = data.replace('{{code}}', $request2);
        var mailOptions = {
            from: 'nor-reply@smsgateways.com',
            to: $request1,
            subject: 'Welcome to our SMS Gateway ',
            text:'Here is the Code',
            html : code_data
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                res.send(error);
            } else {
                console.log('Email sent: ' + info.response);
                res.send(JSON.stringify({
                    response_msg: "Verification Email Sent success"
                })
                )
            }
        });
        

        
    });

}
)


// Auto Email Sender....
app.post('/gatewaysendmail/:email/:user/:api', (req, res) => {
    // var count = Object.keys(requested_body)
    $request1 = req.params.user;
    $request2 = req.params.api;
    $request3 = req.params.email;

    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: false,
        auth: {
            user: 'livenewsofficials@gmail.com',
            pass: 'Myyahooacc-1Saen'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const _fs = require('fs');
const _path = require('path');
    var path = _path.join("/");
    _fs.readFile('credentials_code.html', 'utf8', function (err, data) {
        if (err) {
            _console.log(err, 'error');

            return null;
        };

        code_data = data.replace('{{Email}}', $request1);
        code_data = code_data.replace('{{Password}}', $request2);

        var mailOptions = {
            from: 'nor-reply@smsgateways.com',
            to: $request3,
            subject: 'Welcome to our Business as a Sub Admin ',
            html: code_data
        };
    
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                res.send(error);
            } else {
                console.log('Email sent: ' + info.response);
                res.send(JSON.stringify({
                    response_msg: "Email Sent success"
                })
                )
            }
        });
        

        
    });

    


}
)

// ------Webhooks----
const { EventEmitter } = require('stream');

// const { Server } = require("./lib/socket.io");
// const emit = new Server();
const emit = new EventEmitter();


// const Router = express();
// sets event listener

app.get('/webhook/', (req, res) => {
    io.emit('chat', req.body)
    res.status(200).send('success '+req.body);
    // res.send(JSON.stringify(req.body))
});


io.on('chat', function(requestBody) {
    // Do what you want
    console.log("Working "+requestBody);    
});

const token = 'ar23o8v77'; // type here your verification token



app.get('/webget', (req, res) => {
    // check if verification token is correct
    if (req.query.token !== token) {
        return res.sendStatus(401);
    }

    // return challenge
    return res.end(req.query.challenge);
});


app.post('/webpost', (req, res) => {
    // check if verification token is correct
    if (req.query.token !== token) {
        return res.sendStatus(401);
    }

    // print request body
    console.log(req.body);

    // return a text response
    const data = {
        responses: [
            {
                type: 'text',
                elements: ['Hi', 'Hello']
            }
        ]
    };

    res.json(data);
});


const PORT = process.env.PORT || 3000
server.listen(
    PORT,
    '0.0.0.0',
    function () {
        console.log("Server started......."+hostname+" "+port);
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






