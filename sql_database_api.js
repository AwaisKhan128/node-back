const express = require('express'), bodyParser = require('body-parser');;
const mysql = require('mysql');


var db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "nodemysql"
});

db.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    // db.query("CREATE DATABASE mydb", function (err, result) {
    //   if (err) throw err;
    //   console.log("Database created");
    // });
});

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {

    res.send(JSON.stringify({ http_code: 200, http_response: 'Hello World' }));
    console.log("Hello World!");
})

// ----------Users request-----------

app.get('/select/:superadmin', (req, res) => {

    $request = req.query.id;
    $request1 = req.params.superadmin;

    if  ($request!=null||undefined)
    {
    let sql = "SELECT * FROM " + $request1 + " WHERE id = " + $request;
    db.query(sql, (err, result) => {
        if (err) res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to? '+err }));
        res.send(JSON.stringify({
            http_code: 200
            , http_response: result
        }));

    })
    }

    else{
        res.send(JSON.stringify({
                    http_code: 200
                    , http_response: 'id missing or not defined?' 
                })
                );
    }


}
)

app.post('/insert/:superadmin', (req, res) => {

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
            res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to? '+err }));
        }
        else {
            res.send(JSON.stringify({ http_code: 200, http_response: result }));
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
                        res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to '+err }));
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
        res.send(JSON.stringify({ http_code: 100, http_response: "Path not found? "+$request1 }))
    }
}
)

app.get('/message/:message_path', (req, res) => {
    let id = req.query.id;
    $request1 = req.params.message_path;
    if ($request1 == 'remote_messages') {
        if (id!=null || undefined )
        {
            let sql = "SELECT * FROM " + $request1 + " WHERE id = " + id;
            db.query(sql, (err, result) => {
                if (err) res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to? '+err }));
                res.send(JSON.stringify({
                    http_code: 200
                    , http_response: result
                }));
        
            })
        }
        else{
            res.send(JSON.stringify({ http_code: 100, http_response: "id not found!" }))
        }


    }
    else {
        res.send(JSON.stringify({ http_code: 100, http_response: "Path not found? "+$request1 }))
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
        else if (Object.keys(obj).length === 5) {
            {
                let sql = "INSERT INTO "
                    + $request1 + "(id,username,imei,imsi,phone,device,country) VALUES("
                    + requested_body.id + ",'" + requested_body.username + "','"
                    + requested_body.imei + "','" + requested_body.imsi + "','"
                    + requested_body.phone+"','"
                    + requested_body.device+"','"
                    + requested_body.country+"')";
                db.query(sql, (err, result) => {
                    if (err) {
                        // console.log(err);
                        res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to '+err }));
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
        res.send(JSON.stringify({ http_code: 100, http_response: "Path not found? "+$request1 }))
    }
}
)

// ----------------------------


const PORT = process.env.PORT || 3000
app.listen(
    PORT,
    '0.0.0.0',
    function () {
        console.log("Server started.......");
    }
);
