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

                res.json(JSON.stringify({ http_code: 400, http_response: 'Failed due to? ' + err }));
            }
            else
            {

                res.json(JSON.stringify({
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
        if (Object.keys(obj).length < 10) {
            res.send(JSON.stringify({ http_code: 100, http_response: "Error body incomplete" }));
        }
        else if (Object.keys(obj).length == 10) {
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
        else {
            res.send(JSON.stringify({ http_code: 100, http_response: "Error body Overlimit" }));
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
        else {
            res.send(JSON.stringify({ http_code: 100, http_response: "id not found!" }))
        }


    }
    else {
        res.send(JSON.stringify({ http_code: 100, http_response: "Path not found? " + $request1 }))
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
                    + $request1 + "(id,sim,number,balance,date,time,sim_Status,success,delay,phone_Status,top_up,android_ver,imei) VALUES("
                    + requested_body.id + ",'" + requested_body.sim + "','"
                    + requested_body.number + "','" + requested_body.balance + "','"
                    + requested_body.date + "','"
                    + requested_body.time + "','"
                    + requested_body.sim_status + "','"
                    + requested_body.success + "','"
                    + requested_body.delay + "','"
                    + requested_body.phone_status + "','"
                    + requested_body.top_up + "','"
                    + requested_body.android_ver + "','"
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
        else {
            res.send(JSON.stringify({ http_code: 100, http_response: "id not found!" }))
        }


    }
    else {
        res.send(JSON.stringify({ http_code: 100, http_response: "Path not found? " + $request1 }))
    }
}
)

app.put('/subscribe/sim/:device/:number', (req, res) => { // Only for all update

    $request2 = req.params.number;
    let requested_body = req.body;

    $request1 = req.params.device;
    if ($request1 == 'subscribe_devices_info')
    
    {
    let sql = "UPDATE " + $request1 + " SET balance = '" 
    + requested_body.balance + "',date= '"+requested_body.date
    + "',time='"+requested_body.time + "',delay='"+requested_body.delay + 
    "',phone_Status='"+requested_body.phone_status +
     "',success='"+requested_body.success + "',sim_Status='"+requested_body.sim_status
    +"' WHERE number = '" + $request2 + "';";

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


// ------Auto Email Verification----------
app.post('/sendverification/:email/:api', (req, res) => {
    // var count = Object.keys(requested_body)
    
    $request1 = req.params.email; //email
    $request2 = req.params.api; //code

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

    var mailOptions = {
        from: 'nor-reply@smsgateways.com',
        to: $request1,
        subject: 'Welcome to our SMS Gateway ',
        text: '<h1> Welcome to SMS Gateway Providers </h1> <p> Your Verification Code is.  \n' +
            '.....' +
            'Code : ' + $request2 + '\n' +
            '</p>'
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

    var mailOptions = {
        from: 'nor-reply@smsgateways.com',
        to: $request3,
        subject: 'Welcome to our Business as a Sub Admin ',
        text: '<h1> Welcome to SMS Gateway Providers </h1> <p> Here are your Credentials.  \n' +
            '.....' +
            'Hi Mr. ' + $request1 + '\n' +
            'API_Username : ' + $request1 + '\n' +
            'API_Key : ' + $request2 + '\n' +
            '</p>'
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


}
)


const PORT = process.env.PORT || 3000
app.listen(
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



