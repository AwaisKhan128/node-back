const express = require("express"),
  bodyParser = require("body-parser");
const mysql = require("mysql");

// var db = mysql.createConnection({

// });
var db;
const hostname = "remotemysql.com";
// const hostname = 'localhost';

const port = 3000;
var db_config = {
  host: hostname,
  // path :'/phpmyadmin_70ad85ca0dd8b62f/db_structure.php?server=1&db=nodemysql',
  user: "jHws6qKKFc",
  password: "wgGYuNRC9T",
  database: "jHws6qKKFc",
};

handleDisconnect();

function handleDisconnect() {
  db = mysql.createConnection(db_config); // Recreate the connection, since
  // the old one cannot be reused.
  db.connect(function (err) {
    // The server is either down
    if (err) {
      // or restarting (takes a while sometimes).
      console.log("error when connecting to db:");
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    } // to avoid a hot loop, and to allow our node script to
  }); // process asynchronous requests in the meantime.
  // If you're also serving http, display a 503 error.
  db.on("error", function (err) {
    console.log("db error", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      // Connection to the MySQL server is usually
      handleDisconnect(); // lost due to either server restart, or a
    } else {
      // connnection idle timeout (the wait_timeout
      throw err; // server variable configures this)
    }
  });
}

const app = express();
app.use(bodyParser.json());

var cors = require("cors");

// use it before all route definitions
app.use(cors({ origin: "*" }));

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

function generate(n) {
  var add = 1,
    max = 12 - add; // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.

  if (n > max) {
    return generate(max) + generate(n - max);
  }

  max = Math.pow(10, n + add);
  var min = max / 10; // Math.pow(10, n) basically
  var number = Math.floor(Math.random() * (max - min + 1)) + min;

  return ("" + number).substring(add);
}

// ---------Own Login APIs For all accounts superadmins, subadmins,resellers---------
app.get("/account", (req, res) => {
  basicAuth(req, res);
});

//  ------------Rate Limiter API----------------
// ----------Rate-Limiter-----------
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

//  apply to all requests
app.use(limiter);
app.set("trust proxy", 1);

// -------------Updates with self contained APIs for SMS Gateway Login, Forget and Registration.....

// -----------------Own Account All--------------
app.get("/accounts", (req, res) => {
   
    basicAuth(req, res);
  });
  
  async function basicAuth(req, res) {
    // make authenticate path public
  
    // check for basic auth header
    if (
      !req.headers.authorization ||
      req.headers.authorization.indexOf("Basic ") === -1
    ) {
      return res.status(401).json({ message: "Missing Authorization Header" });
    }
  
    // verify auth credentials
    const base64Credentials = req.headers.authorization.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "ascii"
    );
    const [username, password] = credentials.split(":");
    //   res
    //       .status(200)
    //       .json({ user: username, password: password});
  
    let sql = "SELECT * FROM user_credentials WHERE `username` = '"+username+"'";
  
    db.query(sql, (err, result) => {
      if (err) {
        // console.log(err);
      } else {
        // console.log(result);
        const user = result.find(
          (u) => u.username === username && u.password === password
        );
  
  
  
        if (!user) {
          res.status(401).json({ http_code: 401, http_response: "Unauthorized" });
        } else {
          console.log(result[0].account_type);
        //  return res.status(200).json({ http_code: 401, http_response: result[0].account_type });
  
          manageAuths(req, res, result, username);
        }
      }
    });
  }
  
  function manageAuths(req, res, result, username) {
    if (result[0].account_type == "superadmins") {
      let data = {};
      let currency = {};
      let subadmin = {};
      let reseller = {};
  
      let sql = "SELECT * FROM `login_data` WHERE `user_name` = '" + username + "';"; // Superadmin data.
      db.query(sql, (err, result) => {
        if (err) {
          // console.log(err);
          res.status(400).json({ http_code: 403, http_response: err });
        } else {
          data = result[0];
          let id = result[0].user_id;
          let sql = "SELECT * FROM `login_currency` WHERE `user_id` = " + id + ";"; // Currency.
          db.query(sql, (err, result) => {
            if (err) {
              // console.log(err);
              res.status(400).json({ http_code: 400, http_response: err });
            } else {
              currency = result[0];
              let sql =
                "SELECT * FROM `login_subaccount` WHERE `user_id` = " + id + ";"; // Currency.
              db.query(sql, (err, result) => {
                if (err) {
                  // console.log(err);
                  res.status(400).json({ http_code: 400, http_response: err });
                } else {
                  subadmin = result[0];
                  let sql =
                    "SELECT * FROM `login_reseller` WHERE `user_id` = " + id + ";"; // Currency.
                  db.query(sql, (err, result) => {
                    if (err) {
                      // console.log(err);
                      res
                        .status(400)
                        .json({ http_code: 400, http_response: err });
                    } else {
                      reseller = result[0];
                      let mydata = {...data};
                      mydata['account_type']='superadmins'
                      let http_resp = {
                        ...mydata,
                        _currency: currency,
                        _subaccount: subadmin,
                        _reseller: reseller,
                      };
  
                      res.status(200).json({
                        http_code: 200,
                        http_response: "SUCCESS",
                        response_msg: "Here's is your account",
                        data: http_resp,
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  
    if (result[0].account_type == "subadmins") {
      let data = {};
      let currency = {};
      let subadmin = {};
      let reseller = {};
  
      let sql = "SELECT * FROM `login_subaccount` WHERE `api_username` = '" + username + "';"; // Subadmin data.
      db.query(sql, (err, result) => {
        if (err) {
          // console.log(err);
          res.status(400).json({ http_code: 403, http_response: err });
        } else {
          
                    let mydata = {...result[0]};
                      mydata['account_type']='subadmins'
                  return res.status(200).json({
                    http_code: 200,
                    response_code: "SUCCESS",
                    response_msg: "Here are your data.",
                    data: {
                      ...mydata,
                    },
                  });
                }
              });
       
    }
  
    if (result[0].account_type == "resellers") {
      let data = {};
      let currency = {};
      let subadmin = {};
      let reseller = {};
  
      let sql = "SELECT * FROM `login_reseller` WHERE `api_username` = '" + username + "';"; // Subadmin data.
      db.query(sql, (err, result) => {
        if (err) {
          // console.log(err);
          res.status(400).json({ http_code: 403, http_response: err });
        } else {
          
                    let mydata = {...result[0]};
                      mydata['account_type']='resellers'
                  return res.status(200).json({
                    http_code: 200,
                    response_code: "SUCCESS",
                    response_msg: "Here are your data.",
                    data: {
                      ...mydata,
                    },
                  });
                }
              });
    }
  }
  

  app.post("/accounts", (req, res) => {
    let requested_body = req.body;
    // var count = Object.keys(requested_body)
    let obj = new Object(requested_body);
  
    if (Object.keys(obj).length < 7) {
      return res
        .status(400)
        .json({ http_code: 400, http_response: "Incomplete Body" });
    } else {
      let sql1 =
        "SELECT * from user_credentials where username = '" +
        requested_body.username +
        "' OR user_phone = '" +
        requested_body.user_phone +
        "'";
      db.query(sql1, (err, result) => {
        if (err) {
          // console.log(err);
          return res.status(400).json({ http_code: 400, http_response: err });
        } else {
          if (!result.length > 0) {
            // Saved to usercredentials
            let userid = Number("2" + generate(5)); // Super Admin Series
            let account_type = "superadmins";
            // first_name , last_name, account_name, user_phone, username, password, country
  
            let sql =
              "INSERT INTO " +
              "user_credentials" +
              "(user_id,user_first_name,user_last_name,account_name,account_type,user_phone,username,password,country) VALUES(" +
              userid +
              ",'" +
              requested_body.first_name +
              "','" +
              requested_body.last_name +
              "','" +
              requested_body.account_name +
              "','" +
              account_type +
              "','" +
              requested_body.user_phone +
              "','" +
              requested_body.username +
              "','" +
              requested_body.password +
              "','" +
              requested_body.country +
              "')";
  
            db.query(sql, (err, result) => {
              if (err) {
            // first_name ,last_name, account_name, user_phone, username, password, country,user_email,
                return res
                  .status(400)
                  .json({ http_code: 400, http_response: err });
              } else {
                let sql =
                  "INSERT INTO " +
                  "login_data" +
                  "(user_id,user_name,email,user_phone,user_first_name,user_last_name,account_name,account_billing_email,account_billing_mobile,country) VALUES(" +
                  userid +
                  ",'" +
                  requested_body.username +
                  "','" +
                  requested_body.user_email +
                  "','" +
                  requested_body.user_phone +
                  "','" +
                  requested_body.first_name +
                  "','" +
                  requested_body.last_name +
                  "','" +
                  requested_body.account_name +
                  "','" +
                  requested_body.user_email +
                  "','" +
                  requested_body.user_phone +
                  "','" +
                  requested_body.country +
                  "')";
  
                db.query(sql, (err, result) => {
                  if (err) {
                    res.status(400).json({ http_code: 404, http_response: err });
                  } else {
                    let sql =
                      "SELECT * FROM user_credentials WHERE username = '" +
                      requested_body.username +
                      "'";
                    db.query(sql, (err, result) => {
                      if (err) {
                        // console.log(err);
                      } else {
                        manageAuths(req, res, result, requested_body.username);
                      }
                    });
                  }
                });
              }
            });
          } else {
            return res
              .status(400)
              .json({ http_code: 400, http_response: "User already present" });
          }
        }
      });
    }
  });
// ----------------->
// users hardcoded for simplicity, store in a db for production applications

//   ---------------Sub Account---------------
// -----------Subaccount

app.post("/subaccounts", (req, res) => {
  let requested_body = req.body;
  // var count = Object.keys(requested_body)
  let obj = new Object(requested_body);
  if (Object.keys(obj).length < 6) {
    return res
      .status(400)
      .json({ http_code: 400, http_response: "Body has short length" });
  } else {
    if (
      !req.headers.authorization ||
      req.headers.authorization.indexOf("Basic ") === -1
    ) {
      return res.status(401).json({ message: "Missing Authorization Header" });
    }

    // verify auth credentials
    const base64Credentials = req.headers.authorization.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "ascii"
    );
    const [username, password] = credentials.split(":");
    //   res
    //       .status(200)
    //       .json({ user: username, password: password});

    let sql =
      "SELECT * FROM user_credentials WHERE account_type = 'superadmins'";
    // let userId = "";
    db.query(sql, (err, result) => {
      if (err) {
        // console.log(err);
        res.status(401).json({ http_code: 401, http_response: err });
      } else {
        // console.log(result);
        const user = result.find(
          (u) => u.username === username && u.password === password
        );

        if (!user) {
          res
            .status(401)
            .json({ http_code: 401, http_response: "Unauthorized" });
        } else {
          userId = result[0].user_id;

          let sql =
            "SELECT * from user_credentials where username = '" +
            requested_body.username +
            "' OR user_phone = '" +
            requested_body.user_phone +
            "'";

          db.query(sql, (err, result) => {
            if (err) {
              // console.log(err);
              return res
                .status(400)
                .json({ http_code: 400, http_response: err });
            } else {
              if (!result.length > 0) {
                //require: first_name, last_name, user_phone,username,country,email,
                let userid = Number("3" + generate(5)); // Sub Admin Series
                let account_type = "subadmins";
                let Subaccount = "Subaccount";
                let password =
                  Number(generate(5)) +
                  "-" +
                  Number(generate(5)) +
                  "-" +
                  Number(generate(5)) +
                  "-" +
                  Number(generate(6));

                let sql1 =
                  "INSERT INTO " +
                  "user_credentials" +
                  "(user_id,user_first_name,user_last_name,account_name,account_type,user_phone,username,password,country) VALUES(" +
                  userid +
                  ",'" +
                  requested_body.first_name +
                  "','" +
                  requested_body.last_name +
                  "','" +
                  Subaccount +
                  "','" +
                  account_type +
                  "','" +
                  requested_body.user_phone +
                  "','" +
                  requested_body.username +
                  "','" +
                  password +
                  "','" +
                  requested_body.country +
                  "')";

                db.query(sql1, (err, result) => {
                  if (err) {
                    return res
                      .status(400)
                      .json({ http_code: 400, http_response: err });
                  } else {
                    let userId = "";
                    let sqlQ =
                      "SELECT * from user_credentials where username = '" +
                      username +
                      "' AND account_type = 'superadmins'";
                    db.query(sqlQ, (err, result) => {
                      if (err) {
                        return res
                          .status(400)
                          .json({ http_code: 400, http_response: err });
                      } else {
                        userId = result[0].user_id;


                        let sql2 =
                          "INSERT INTO " +
                          "login_subaccount" +
                          "(user_id,subaccount_id,api_username,email,phone_number,first_name,last_name,api_key,access_users,access_billing,access_reporting,access_contacts,access_settings,access_sms,access_email,access_voice,access_fax,access_post,access_reseller,access_mms,share_campaigns) VALUES(" +
                          userId +
                          ",'" +
                          userid +
                          "','" +
                          requested_body.username +
                          "','" +
                          requested_body.email +
                          "','" +
                          requested_body.user_phone +
                          "','" +
                          requested_body.first_name +
                          "','" +
                          requested_body.last_name +
                          "','" +
                          password + 
                          "','" +
                          ReturnIF((requested_body,'access_users')) +
                          "','" +
                          ReturnIF((requested_body,'access_billing')) +
                          "','" +
                          ReturnIF((requested_body,'access_reporting')) +
                          "','" +
                          ReturnIF((requested_body,'access_contacts')) +
                          "','" +
                          ReturnIF((requested_body,'access_settings')) +
                          "','" +
                          ReturnIF((requested_body,'access_sms')) +
                          "','" +
                          ReturnIF((requested_body,'access_email')) +
                          "','" +
                          ReturnIF((requested_body,'access_voice')) +
                          "','" +
                          ReturnIF((requested_body,'access_fax')) +
                          "','" +
                          ReturnIF((requested_body,'access_post')) +
                          "','" +
                          ReturnIF((requested_body,'access_reseller')) +
                          "','" +
                          ReturnIF((requested_body,'access_mms')) +
                          "','" +
                          ReturnIF((requested_body,'share_campaigns')) +
                          
                          "')";

                          

                        db.query(sql2, (err, result) => {
                          if (err) {
                            return res
                              .status(400)
                              .json({ http_code: 400, http_response: err });
                          } else {
                            let sql3 =
                              "SELECT * from login_subaccount where subaccount_id = " +
                              userid;

                            db.query(sql3, (err, result) => {
                              if (err) {
                                return res
                                  .status(400)
                                  .json({ http_code: 400, http_response: err });
                              } else {
                                return res.status(200).json({
                                  http_code: 200,
                                  response_code: "SUCCESS",
                                  response_msg: "New account has been created.",
                                  data: result[0],
                                });
                              }
                            });
                          }
                        });
                      }
                    });
                  }
                });
              } else {
                return res.status(400).json({
                  http_code: 400,
                  http_response: "Subuser already present",
                });
              }
            }
          });
        }
      }
    });
  }
});

app.get("/subaccounts", (req, res) => {
  if (
    !req.headers.authorization ||
    req.headers.authorization.indexOf("Basic ") === -1
  ) {
    return res.status(401).json({ message: "Missing Authorization Header" });
  }

  // verify auth credentials
  const base64Credentials = req.headers.authorization.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii"
  );
  const [username, password] = credentials.split(":");
  //   res
  //       .status(200)
  //       .json({ user: username, password: password});

  let sql =
    "SELECT * FROM user_credentials WHERE `account_type` = 'superadmins'";
  db.query(sql, (err, result) => {
    if (err) {
      // console.log(err);
    } else {
      // console.log(result);
      const user = result.find(
        (u) => u.username === username && u.password === password
      );

      if (!user) {
        res.status(401).json({ http_code: 401, http_response: "Unauthorized" });
      } else {
        let userid = "";
        let sqlQ =
          "SELECT * from user_credentials where `username` = '" +
          username +
          "' AND `account_type` = 'superadmins'";
        db.query(sqlQ, (err, result) => {
          if (err) {
            return res.status(400).json({ http_code: 400, http_response: err });
          } else {
            userid = result[0].user_id;
            let sql =
              "SELECT * from login_subaccount where `user_id` = " + userid;
            db.query(sql, (err, result) => {
              if (err) {
                return res
                  .status(400)
                  .json({ http_code: 400, http_response: err });
              } else {
                return res.status(200).json({
                  http_code: 200,
                  response_code: "SUCCESS",
                  response_msg: "SUCCESS",
                  data: {
                    total: 1,
                    per_page: 15,
                    current_page: 1,
                    last_page: 1,
                    next_page_url: null,
                    prev_page_url: null,
                    from: 1,
                    to: 1,
                    data: result,
                  },
                });
              }
            });
          }
        });
      }
    }
  });
});

function ReturnIF(body,value)
{
  if (body.hasOwnProperty(value))
  {
    if (value == 'access_users')
    {

      return body.access_users;
    }
    
    if (value == 'access_billing')
    {
      return body.access_billing;
    }

    if (value == 'access_reporting')
    {
      return body.access_reporting;
    }

    if (value == 'access_contacts')
    {
      return body.access_contacts;
    }

    if (value == 'access_settings')
    {
      return body.access_settings;
    }

    if (value == 'access_sms')
    {
      return body.access_sms;
    }

    if (value == 'access_email')
    {
      return body.access_email;
    }

    if (value == 'access_voice')
    {
      return body.access_voice;
    }

    if (value == 'access_fax')
    {
      return body.access_fax;
    }

    if (value == 'access_post')
    {
      return body.access_post;
    }

    if (value == 'access_reseller')
    {
      return body.access_reseller;
    }

    if (value == 'access_mms')
    {
      return body.access_mms;
    }

    if (value == 'share_campaigns')
    {
      return body.share_campaigns;
    }
  }
  else
  {
    return 1
  }
}



app.get("/subaccounts/:subaccount_id", (req, res) => {
  let path = req.params.subaccount_id;
  if (
    !req.headers.authorization ||
    req.headers.authorization.indexOf("Basic ") === -1
  ) {
    return res.status(401).json({ message: "Missing Authorization Header" });
  }

  // verify auth credentials
  const base64Credentials = req.headers.authorization.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii"
  );
  const [username, password] = credentials.split(":");
  //   res
  //       .status(200)
  //       .json({ user: username, password: password});

  let sql =
    "SELECT * FROM user_credentials WHERE `account_type` = 'superadmins'";
  db.query(sql, (err, result) => {
    if (err) {
      // console.log(err);
    } else {
      // console.log(result);
      const user = result.find(
        (u) => u.username === username && u.password === password
      );

      if (!user) {
        return res
          .status(401)
          .json({ http_code: 401, http_response: "Unauthorized" });
      } else {
        let userid = "";
        let sqlQ =
          "SELECT * from user_credentials where `username` = '" +
          username +
          "' AND `account_type` = 'superadmins'";
        db.query(sqlQ, (err, result) => {
          if (err) {
            return res.status(400).json({ http_code: 400, http_response: err });
          } else {
            userid = result[0].user_id;
            let sql =
              "SELECT * from login_subaccount where `subaccount_id` = " + path;
            db.query(sql, (err, result) => {
              if (err) {
                return res
                  .status(400)
                  .json({ http_code: 400, http_response: err });
              } else {
                return res.status(200).json({
                  http_code: 200,
                  response_code: "SUCCESS",
                  response_msg: "Here are your data.",
                  data: {
                    ...result[0],
                  },
                });
              }
            });
          }
        });
      }
    }
  });
});

app.put("/subaccounts/:subaccount_id", (req, res) => {
  let path = req.params.subaccount_id;
  if (path != undefined && path != "") {
    let requested_body = req.body;
    // var count = Object.keys(requested_body)
    let obj = new Object(requested_body);
    if (Object.keys(obj).length < 5) {
      return res
        .status(400)
        .json({ http_code: 400, http_response: "Body has short length" });
    } else {
      if (
        !req.headers.authorization ||
        req.headers.authorization.indexOf("Basic ") === -1
      ) {
        return res
          .status(401)
          .json({ message: "Missing Authorization Header" });
      }

      // verify auth credentials
      const base64Credentials = req.headers.authorization.split(" ")[1];
      const credentials = Buffer.from(base64Credentials, "base64").toString(
        "ascii"
      );
      const [username, password] = credentials.split(":");
      //   res
      //       .status(200)
      //       .json({ user: username, password: password});

      let sql =
        "SELECT * FROM user_credentials WHERE account_type = 'superadmins'";
      // let userId = "";
      db.query(sql, (err, result) => {
        if (err) {
          // console.log(err);
          res.status(401).json({ http_code: 401, http_response: err });
        } else {
          // console.log(result);
          const user = result.find(
            (u) => u.username === username && u.password === password
          );

          if (!user) {
            res
              .status(401)
              .json({ http_code: 401, http_response: "Unauthorized" });
          } else {
            userId = result[0].user_id;

            // if ( Object(requested_body).has
            // && _isContains(requested_body,"last_name")
            // && _isContains(requested_body,"username")
            // && _isContains(requested_body,"user_phone")
            // && _isContains(requested_body,"email"))

            {
              // Require: first_name, last_name, username, user_phone, email

              let sql1 =
                "UPDATE `user_credentials` SET `user_first_name` = '" +
                requested_body.first_name +
                "', `user_last_name`= '" +
                requested_body.last_name +
                "', `username`= '" +
                requested_body.username +
                "', `user_phone`= '" +
                requested_body.user_phone +
                "' WHERE `user_id` = '" +
                path +
                "'";

              db.query(sql1, (err, result) => {
                if (err) {
                  return res
                    .status(401)
                    .json({ http_code: 400, http_resp: err });
                } else {
                  let sql2 =
                    "UPDATE `login_subaccount` SET `first_name` = '" +
                    requested_body.first_name +
                    "', `last_name`= '" +
                    requested_body.last_name +
                    "', `api_username`= '" +
                    requested_body.username +
                    "', `phone_number` = '" +
                    requested_body.user_phone +
                    "', `email` = '" +
                    requested_body.email +
                    "' WHERE `user_id` = '" +
                    userId +
                    "' AND `subaccount_id` = '" +
                    path +
                    "'";

                  db.query(sql2, (err, result) => {
                    if (err) {
                      return res
                        .status(401)
                        .json({ http_code: 400, http_resp: err });
                    } else {
                      let sql =
                        "SELECT * from login_subaccount where subaccount_id = '" +
                        path +
                        "'";
                      db.query(sql, (err, result) => {
                        if (err) {
                          return res
                            .status(400)
                            .json({ http_code: 400, http_response: err });
                        } else {
                          return res.status(200).json({
                            http_code: 200,
                            response_code: "SUCCESS",
                            response_msg: "Subaccount has been updated.",
                            data: {
                              total: 1,
                              per_page: 15,
                              current_page: 1,
                              last_page: 1,
                              next_page_url: null,
                              prev_page_url: null,
                              from: 1,
                              to: 1,
                              data: result,
                            },
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
            // else
            // {
            //   return res.status(401).json({ http_code: 400, http_resp:"Required is missing" });
            // }
          }
        }
      });
    }
  } else {
    return res.status(401).json({ http_code: 400, http_resp: "Missing_Path" });
  }
});

app.delete("/subaccounts/:subaccount_id", (req, res) => {
  let path = req.params.subaccount_id;
  if (path != undefined && path != "") {
    if (
      !req.headers.authorization ||
      req.headers.authorization.indexOf("Basic ") === -1
    ) {
      return res.status(401).json({ message: "Missing Authorization Header" });
    }

    // verify auth credentials
    const base64Credentials = req.headers.authorization.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "ascii"
    );
    const [username, password] = credentials.split(":");
    //   res
    //       .status(200)
    //       .json({ user: username, password: password});

    let sql =
      "SELECT * FROM user_credentials WHERE account_type = 'superadmins'";
    db.query(sql, (err, result) => {
      if (err) {
        // console.log(err);
      } else {
        // console.log(result);
        const user = result.find(
          (u) => u.username === username && u.password === password
        );

        if (!user) {
          res
            .status(401)
            .json({ http_code: 401, http_response: "Unauthorized" });
        } else {
          let sql_d =
            "DELETE FROM `user_credentials` WHERE user_id = " +
            path +
            " AND `account_type` = 'subadmins'";

          db.query(sql_d, (err, result) => {
            if (err) {
              return res
                .status(400)
                .json({ http_code: 400, http_response: err });
            } else {
              let sql_d1 =
                "DELETE FROM `login_subaccount` WHERE subaccount_id = " +
                path +
                " ;";

              db.query(sql_d1, (err, result) => {
                if (err) {
                  return res
                    .status(400)
                    .json({ http_code: 400, http_response: err });
                } else {
                  {
                    return res.status(200).json({
                      http_code: 200,
                      response_code: "SUCCESS",
                      response_msg: "Subaccount has been deleted",
                      data: true,
                    });
                  }
                }
              });
            }
          });
        }
      }
    });
  } else {
    return res
      .status(400)
      .json({ http_code: 400, http_response: "Subaccount id missing" });
  }
});

// ----------------------------->>

// -------------Resellers------------

app.post("/resellers", (req, res) => {
  let requested_body = req.body;
  // var count = Object.keys(requested_body)
  let obj = new Object(requested_body);
  if (Object.keys(obj).length < 6) {
    return res
      .status(400)
      .json({ http_code: 400, http_response: "Body has short length" });
  } else {
    if (
      !req.headers.authorization ||
      req.headers.authorization.indexOf("Basic ") === -1
    ) {
      return res.status(401).json({ message: "Missing Authorization Header" });
    }

    // verify auth credentials
    const base64Credentials = req.headers.authorization.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "ascii"
    );
    const [username, password] = credentials.split(":");
    //   res
    //       .status(200)
    //       .json({ user: username, password: password});

    let sql =
      "SELECT * FROM user_credentials WHERE account_type = 'superadmins'";
    // let userId = "";
    db.query(sql, (err, result) => {
      if (err) {
        // console.log(err);
        res.status(401).json({ http_code: 401, http_response: err });
      } else {
        // console.log(result);
        const user = result.find(
          (u) => u.username === username && u.password === password
        );

        if (!user) {
          res
            .status(401)
            .json({ http_code: 401, http_response: "Unauthorized" });
        } else {
          userId = result[0].user_id;

          let sql =
            "SELECT * from user_credentials where username = '" +
            requested_body.username +
            "' OR user_phone = '" +
            requested_body.user_phone +
            "'";

          db.query(sql, (err, result) => {
            if (err) {
              // console.log(err);
              return res
                .status(400)
                .json({ http_code: 400, http_response: err });
            } else {
              if (!result.length > 0) {
                //require: first_name, last_name, user_phone,username,country,email,
                let userid = Number("4" + generate(5)); // Sub Admin Series
                let account_type = "resellers";
                let Subaccount = "Reseller";
                let password =
                  Number(generate(5)) +
                  "-" +
                  Number(generate(4)) +
                  "-" +
                  Number(generate(5)) +
                  "-" +
                  Number(generate(6));

                let sql1 =
                  "INSERT INTO " +
                  "user_credentials" +
                  "(user_id,user_first_name,user_last_name,account_name,account_type,user_phone,username,password,country) VALUES(" +
                  userid +
                  ",'" +
                  requested_body.first_name +
                  "','" +
                  requested_body.last_name +
                  "','" +
                  Subaccount +
                  "','" +
                  account_type +
                  "','" +
                  requested_body.user_phone +
                  "','" +
                  requested_body.username +
                  "','" +
                  password +
                  "','" +
                  requested_body.country +
                  "')";

                db.query(sql1, (err, result) => {
                  if (err) {
                    return res
                      .status(400)
                      .json({ http_code: 400, http_response: err });
                  } else {
                    let userId = "";
                    let sqlQ =
                      "SELECT * from user_credentials where username = '" +
                      username +
                      "' AND account_type = 'superadmins'";
                    db.query(sqlQ, (err, result) => {
                      if (err) {
                        return res
                          .status(400)
                          .json({ http_code: 400, http_response: err });
                      } else {
                        userId = result[0].user_id;
                        let sql2 =
                          "INSERT INTO " +
                          "login_reseller" +
                          "(user_id,reseller_id,api_username,email,phone_number,first_name,last_name,api_key,access_users,access_billing,access_reporting,access_contacts,access_settings,access_sms,access_email,access_voice,access_fax,access_post,access_mms,share_campaigns) VALUES(" +
                          userId +
                          ",'" +
                          userid +
                          "','" +
                          requested_body.username +
                          "','" +
                          requested_body.email +
                          "','" +
                          requested_body.user_phone +
                          "','" +
                          requested_body.first_name +
                          "','" +
                          requested_body.last_name +
                          "','" +
                          password + 
                          "','" +
                          ReturnIF((requested_body,'access_users')) +
                          "','" +
                          ReturnIF((requested_body,'access_billing')) +
                          "','" +
                          ReturnIF((requested_body,'access_reporting')) +
                          "','" +
                          ReturnIF((requested_body,'access_contacts')) +
                          "','" +
                          ReturnIF((requested_body,'access_settings')) +
                          "','" +
                          ReturnIF((requested_body,'access_sms')) +
                          "','" +
                          ReturnIF((requested_body,'access_email')) +
                          "','" +
                          ReturnIF((requested_body,'access_voice')) +
                          "','" +
                          ReturnIF((requested_body,'access_fax')) +
                          "','" +
                          ReturnIF((requested_body,'access_post')) +
                          "','" +
                          ReturnIF((requested_body,'access_mms')) +
                          "','" +
                          ReturnIF((requested_body,'share_campaigns')) +
                          
                          "')";



                          
                        db.query(sql2, (err, result) => {
                          if (err) {
                            return res
                              .status(400)
                              .json({ http_code: 400, http_response: err });
                          } else {
                            let sql3 =
                              "SELECT * from login_reseller where subaccount_id = " +
                              userid;

                            db.query(sql3, (err, result) => {
                              if (err) {
                                return res
                                  .status(400)
                                  .json({ http_code: 400, http_response: err });
                              } else {
                                return res.status(200).json({
                                  http_code: 200,
                                  response_code: "SUCCESS",
                                  response_msg: "New account has been created.",
                                  data: result[0],
                                });
                              }
                            });
                          }
                        });
                      }
                    });
                  }
                });
              } else {
                return res.status(400).json({
                  http_code: 400,
                  http_response: "User already present",
                });
              }


            }
          });
        }
      }
    });
  }
});

app.get("/resellers", (req, res) => {
  if (
    !req.headers.authorization ||
    req.headers.authorization.indexOf("Basic ") === -1
  ) {
    return res.status(401).json({ message: "Missing Authorization Header" });
  }

  // verify auth credentials
  const base64Credentials = req.headers.authorization.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii"
  );
  const [username, password] = credentials.split(":");
  //   res
  //       .status(200)
  //       .json({ user: username, password: password});

  let sql =
    "SELECT * FROM user_credentials WHERE `account_type` = 'superadmins'";
  db.query(sql, (err, result) => {
    if (err) {
      // console.log(err);
    } else {
      // console.log(result);
      const user = result.find(
        (u) => u.username === username && u.password === password
      );

      if (!user) {
        res.status(401).json({ http_code: 401, http_response: "Unauthorized" });
      } else {
        let userid = "";
        let sqlQ =
          "SELECT * from user_credentials where `username` = '" +
          username +
          "' AND `account_type` = 'superadmins'";
        db.query(sqlQ, (err, result) => {
          if (err) {
            return res.status(400).json({ http_code: 400, http_response: err });
          } else {
            userid = result[0].user_id;
            let sql =
              "SELECT * from login_reseller where `user_id` = " + userid;
            db.query(sql, (err, result) => {
              if (err) {
                return res
                  .status(400)
                  .json({ http_code: 400, http_response: err });
              } else {
                return res.status(200).json({
                  http_code: 200,
                  response_code: "SUCCESS",
                  response_msg: "SUCCESS",
                  data: {
                    total: 1,
                    per_page: 15,
                    current_page: 1,
                    last_page: 1,
                    next_page_url: null,
                    prev_page_url: null,
                    from: 1,
                    to: 1,
                    data: result,
                  },
                });
              }
            });
          }
        });
      }
    }
  });
});

app.get("/resellers/:reseller_id", (req, res) => {
  let path = req.params.reseller_id;
  if (
    !req.headers.authorization ||
    req.headers.authorization.indexOf("Basic ") === -1
  ) {
    return res.status(401).json({ message: "Missing Authorization Header" });
  }

  // verify auth credentials
  const base64Credentials = req.headers.authorization.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii"
  );
  const [username, password] = credentials.split(":");
  //   res
  //       .status(200)
  //       .json({ user: username, password: password});

  let sql =
    "SELECT * FROM user_credentials WHERE `account_type` = 'superadmins'";
  db.query(sql, (err, result) => {
    if (err) {
      // console.log(err);
    } else {
      // console.log(result);
      const user = result.find(
        (u) => u.username === username && u.password === password
      );

      if (!user) {
        return res
          .status(401)
          .json({ http_code: 401, http_response: "Unauthorized" });
      } else {
        let userid = "";
        let sqlQ =
          "SELECT * from user_credentials where `username` = '" +
          username +
          "' AND `account_type` = 'superadmins'";
        db.query(sqlQ, (err, result) => {
          if (err) {
            return res.status(400).json({ http_code: 400, http_response: err });
          } else {
            userid = result[0].user_id;
            let sql =
              "SELECT * from login_reseller where `reseller_id` = " + path;
            db.query(sql, (err, result) => {
              if (err) {
                return res
                  .status(400)
                  .json({ http_code: 400, http_response: err });
              } else {
                return res.status(200).json({
                  http_code: 200,
                  response_code: "SUCCESS",
                  response_msg: "Here are your data.",
                  data: {
                    ...result[0],
                  },
                });
              }
            });
          }
        });
      }
    }
  });
});

app.put("/resellers/:reseller_id", (req, res) => {
  let path = req.params.reseller_id;
  if (path != undefined && path != "") {
    let requested_body = req.body;
    // var count = Object.keys(requested_body)
    let obj = new Object(requested_body);
    if (Object.keys(obj).length < 5) {
      return res
        .status(400)
        .json({ http_code: 400, http_response: "Body has short length" });
    } else {
      if (
        !req.headers.authorization ||
        req.headers.authorization.indexOf("Basic ") === -1
      ) {
        return res
          .status(401)
          .json({ message: "Missing Authorization Header" });
      }

      // verify auth credentials
      const base64Credentials = req.headers.authorization.split(" ")[1];
      const credentials = Buffer.from(base64Credentials, "base64").toString(
        "ascii"
      );
      const [username, password] = credentials.split(":");
      //   res
      //       .status(200)
      //       .json({ user: username, password: password});

      let sql =
        "SELECT * FROM user_credentials WHERE account_type = 'superadmins'";
      // let userId = "";
      db.query(sql, (err, result) => {
        if (err) {
          // console.log(err);
          res.status(401).json({ http_code: 401, http_response: err });
        } else {
          // console.log(result);
          const user = result.find(
            (u) => u.username === username && u.password === password
          );

          if (!user) {
            res
              .status(401)
              .json({ http_code: 401, http_response: "Unauthorized" });
          } else {
            userId = result[0].user_id;

            // if ( Object(requested_body).has
            // && _isContains(requested_body,"last_name")
            // && _isContains(requested_body,"username")
            // && _isContains(requested_body,"user_phone")
            // && _isContains(requested_body,"email"))

            {
              // Require: first_name, last_name, username, user_phone, email

              let sql1 =
                "UPDATE `user_credentials` SET `user_first_name` = '" +
                requested_body.first_name +
                "', `user_last_name`= '" +
                requested_body.last_name +
                "', `username`= '" +
                requested_body.username +
                "', `user_phone`= '" +
                requested_body.user_phone +
                "' WHERE `user_id` = '" +
                path +
                "'";

              db.query(sql1, (err, result) => {
                if (err) {
                  return res
                    .status(401)
                    .json({ http_code: 400, http_resp: err });
                } else {
                  let sql2 =
                    "UPDATE `login_reseller` SET `first_name` = '" +
                    requested_body.first_name +
                    "', `last_name`= '" +
                    requested_body.last_name +
                    "', `api_username`= '" +
                    requested_body.username +
                    "', `phone_number` = '" +
                    requested_body.user_phone +
                    "', `email` = '" +
                    requested_body.email +
                    "' WHERE `user_id` = '" +
                    userId +
                    "' AND `reseller_id` = '" +
                    path +
                    "'";

                  db.query(sql2, (err, result) => {
                    if (err) {
                      return res
                        .status(401)
                        .json({ http_code: 400, http_resp: err });
                    } else {
                      let sql =
                        "SELECT * from login_reseller where reseller_id = '" +
                        path +
                        "'";
                      db.query(sql, (err, result) => {
                        if (err) {
                          return res
                            .status(400)
                            .json({ http_code: 400, http_response: err });
                        } else {
                          return res.status(200).json({
                            http_code: 200,
                            response_code: "SUCCESS",
                            response_msg: "Reseller has been updated.",
                            data: {
                              total: 1,
                              per_page: 15,
                              current_page: 1,
                              last_page: 1,
                              next_page_url: null,
                              prev_page_url: null,
                              from: 1,
                              to: 1,
                              data: result,
                            },
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
            // else
            // {
            //   return res.status(401).json({ http_code: 400, http_resp:"Required is missing" });
            // }
          }
        }
      });
    }
  } else {
    return res.status(401).json({ http_code: 400, http_resp: "Missing_Path" });
  }
});

app.delete("/resellers/:reseller_id", (req, res) => {
  let path = req.params.reseller_id;
  if (path != undefined && path != "") {
    if (
      !req.headers.authorization ||
      req.headers.authorization.indexOf("Basic ") === -1
    ) {
      return res.status(401).json({ message: "Missing Authorization Header" });
    }

    // verify auth credentials
    const base64Credentials = req.headers.authorization.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "ascii"
    );
    const [username, password] = credentials.split(":");
    //   res
    //       .status(200)
    //       .json({ user: username, password: password});

    let sql =
      "SELECT * FROM user_credentials WHERE account_type = 'superadmins'";
    db.query(sql, (err, result) => {
      if (err) {
        // console.log(err);
      } else {
        // console.log(result);
        const user = result.find(
          (u) => u.username === username && u.password === password
        );

        if (!user) {
          res
            .status(401)
            .json({ http_code: 401, http_response: "Unauthorized" });
        } else {
          let sql_d =
            "DELETE FROM `user_credentials` WHERE user_id = " +
            path +
            " AND `account_type` = 'subadmins'";

          db.query(sql_d, (err, result) => {
            if (err) {
              return res
                .status(400)
                .json({ http_code: 400, http_response: err });
            } else {
              let sql_d1 =
                "DELETE FROM `login_reseller` WHERE reseller_id = " +
                path +
                " ;";

              db.query(sql_d1, (err, result) => {
                if (err) {
                  return res
                    .status(400)
                    .json({ http_code: 400, http_response: err });
                } else {
                  {
                    return res.status(400).json({
                      http_code: 200,
                      response_code: "SUCCESS",
                      response_msg: "Reseller has been deleted",
                      data: true,
                    });
                  }
                }
              });
            }
          });
        }
      }
    });
  } else {
    return res
      .status(400)
      .json({ http_code: 400, http_response: "Subaccount id missing" });
  }
});
// ------------------------------------------->>

// -------Forget Username---------
// Forget Username....
app.put("/forget-username", (req, res) => {
  let body = req.body;
  if (body.hasOwnProperty("email")) {
    let sql =
      "SELECT  * FROM `login_data` WHERE `user_email` = '" + body.email + "'";
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(400).json({ http_code: 400, http_response: err });
      } else {
        if (!result.length > 0) {
          let sql =
            "SELECT  * FROM `login_subaccount` WHERE `email` = '" +
            body.email +
            "'";
          db.query(sql, (err, result) => {
            if (err) {
              return res
                .status(400)
                .json({ http_code: 400, http_response: err });
            } else {
              if (!result.length > 0) {
                let sql =
                  "SELECT  * FROM `login_reseller` WHERE `email` = '" +
                  body.email +
                  "'";
                db.query(sql, (err, result) => {
                  if (err) {
                    return res
                      .status(400)
                      .json({ http_code: 400, http_response: err });
                  } else {
                    if (!result.length > 0) {
                      return res
                        .status(400)
                        .json({
                          http_code: 400,
                          http_response: "Sorry no account exists!",
                        });
                    } else {
                      // {
                      // Send Email to that user
                      // }

                      return res.status(200).json({
                        http_code: 200,
                        response_code: "SUCCESS",
                        response_msg: "An email notification has been sent.",
                        data: [],
                      });
                    }
                  }
                });
              } else {
                // {
                // Send Email to that user
                // }

                return res.status(200).json({
                  http_code: 200,
                  response_code: "SUCCESS",
                  response_msg: "An email notification has been sent.",
                  data: [],
                });
              }
            }
          });
        } else {
          // {
          // Send Email to that user
          // }

          return res.status(200).json({
            http_code: 200,
            response_code: "SUCCESS",
            response_msg: "An email notification has been sent.",
            data: [],
          });
        }
      }
    });
  } else {
    return res
      .status(400)
      .json({ http_code: 400, http_response: "Email Address is missing!" });
  }
});

//------------------------------------------

app.get("/", (req, res) => {
  res.send(JSON.stringify({ http_code: 200, http_response: "Hello World" }));
  console.log("Hello World!");
});

// ----------Permissions--------------
app.post("/insert/permissions/:Acc_holder", (req, res) => {
  $request1 = req.params.Acc_holder;

  let requested_body = req.body;
  // var count = Object.keys(requested_body)
  let obj = new Object(requested_body);

  {
    if (Object.keys(obj).length < 2) {
      res.send(
        JSON.stringify({
          http_code: 100,
          http_response: "Error body incomplete",
        })
      );
    } else if (Object.keys(obj).length <= 11) {
      let sql =
        "INSERT INTO " +
        "permissions" +
        "(id,username,access_sms,access_mms,access_contacts,sms_campaign,access_templates,access_billing,mobile_topup,access_resellers,banned,status) VALUES(" +
        requested_body.id +
        ",'" +
        requested_body.username +
        "','" +
        requested_body.access_sms +
        "','" +
        requested_body.access_mms +
        "','" +
        requested_body.access_contacts +
        "','" +
        requested_body.sms_campaign +
        "','" +
        requested_body.access_templates +
        "','" +
        requested_body.access_billing +
        "','" +
        requested_body.mobile_topup +
        "','" +
        requested_body.access_resellers +
        "','" +
        requested_body.banned +
        "','" +
        $request1 +
        "')";

      db.query(sql, (err, result) => {
        if (err) {
          // console.log(err);
          res.send(
            JSON.stringify({
              http_code: 400,
              http_response: "Failed due to " + err,
            })
          );
        } else {
          // console.log(result);

          res.send(JSON.stringify({ http_code: 200, http_response: result }));
        }
      });
    } else {
      res.send(
        JSON.stringify({
          http_code: 100,
          http_response: "Error body Overlimit",
        })
      );
    }
  }
});

app.get("/select/permissions", (req, res) => {
  $request = req.query.id;
  $request1 = req.query.status;
  // res.setHeader("Content-Type", "text/html");

  if ($request != null || undefined) {
    // res.setHeader("Access-Control-Allow-Origin", "*")

    let sql = "SELECT * FROM " + "permissions" + " WHERE id = " + $request;
    db.query(sql, (err, result) => {
      if (err) {
        res.send(
          JSON.stringify({
            http_code: 400,
            http_response: "Failed due to? " + err,
          })
        );
      } else {
        res.send(
          JSON.stringify({
            http_code: 200,
            http_response: result,
          })
        );
      }
    });
  } else if ($request1 != null || undefined) {
    // res.setHeader("Access-Control-Allow-Origin", "*");

    let sql =
      "SELECT * FROM " + "permissions " + "WHERE status = '" + $request1 + "'";
    db.query(sql, (err, result) => {
      if (err) {
        res.send(
          JSON.stringify({
            http_code: 400,
            http_response: "Failed due to? " + err,
          })
        );
      } else {
        res.send(
          JSON.stringify({
            http_code: 200,
            http_response: result,
          })
        );
      }
    });
  } else {
    res.send(
      JSON.stringify({
        http_code: 200,
        http_response: "id missing or status not defined?",
      })
    );
  }
});

app.put("/modify/permissions", (req, res) => {
  // Only for resellers
  $request1 = req.query.id;
  let requested_body = req.body;
  // var count = Object.keys(requested_body)
  let obj = new Object(requested_body);

  if (Object.keys(obj).length <= 11) {
    let sql =
      "UPDATE " +
      "permissions" +
      " SET username = '" +
      requested_body.username +
      "',access_sms = '" +
      requested_body.access_sms +
      "',access_mms='" +
      requested_body.access_mms +
      "',access_contacts = '" +
      requested_body.access_contacts +
      "',sms_campaign='" +
      requested_body.sms_campaign +
      "',access_templates = '" +
      requested_body.access_templates +
      "',access_billing='" +
      requested_body.access_billing +
      "',mobile_topup = '" +
      requested_body.mobile_topup +
      "',access_resellers='" +
      requested_body.access_resellers +
      "',banned='" +
      requested_body.banned +
      "' WHERE id = " +
      $request1 +
      ";";

    db.query(sql, (err, result) => {
      if (err) {
        res.send(JSON.stringify({ http_code: 400, http_response: err }));
      } else {
        res.send(JSON.stringify({ http_code: 200, http_response: result }));
      }
    });
  }
});

// ----------Resellers--------------
app.post("/insert/accounts/:resellers", (req, res) => {
  $request1 = req.params.resellers;

  let requested_body = req.body;
  // var count = Object.keys(requested_body)
  let obj = new Object(requested_body);

  if ($request1 == "resellers") {
    {
      let sql =
        "INSERT INTO " +
        $request1 +
        "(id,username,business_name,first_name,last_name,phone,email,ip_addr,device,country) VALUES(" +
        requested_body.id +
        ",'" +
        requested_body.username +
        "','" +
        requested_body.account_name +
        "','" +
        requested_body.first_name +
        "','" +
        requested_body.last_name +
        "','" +
        requested_body.phone +
        "','" +
        requested_body.email +
        "','" +
        requested_body.ip_addr +
        "','" +
        requested_body.device +
        "','" +
        requested_body.country +
        "')";

      db.query(sql, (err, result) => {
        if (err) {
          // console.log(err);
          res.send(
            JSON.stringify({
              http_code: 400,
              http_response: "Failed due to " + err,
            })
          );
        } else {
          // console.log(result);

          res.send(JSON.stringify({ http_code: 200, http_response: result }));
        }
      });
    }
  }
});

app.get("/select/accounts/:resellers", (req, res) => {
  $request = req.query.id;
  $request1 = req.params.resellers;

  if (($request != null || undefined) && $request1 == "resellers") {
    let sql = "SELECT * FROM " + $request1 + " WHERE id = " + $request;
    db.query(sql, (err, result) => {
      if (err)
        res.send(
          JSON.stringify({
            http_code: 400,
            http_response: "Failed due to? " + err,
          })
        );
      res.send(
        JSON.stringify({
          http_code: 200,
          http_response: result,
        })
      );
    });
  } else {
    res.send(
      JSON.stringify({
        http_code: 200,
        http_response: "id missing or not defined?",
      })
    );
  }
});

// ---------- data to operators-------------
app.post("/insert/operators/:operators_list", (req, res) => {
  $request1 = req.params.operators_list;

  let requested_body = req.body;
  // let obj = new Object(requested_body);
  var count = Object.keys(requested_body);

  if (count != 0) {
    if ($request1 == "operators_list") {
      {
        let sql =
          "INSERT INTO " +
          $request1 +
          "(operator_name,operator_code) VALUES('" +
          requested_body.name +
          "','" +
          requested_body.code +
          "')";

        db.query(sql, (err, result) => {
          if (err) {
            // console.log(err);
            res.send(
              JSON.stringify({
                http_code: 400,
                http_response: "Failed due to " + err,
              })
            );
          } else {
            // console.log(result);

            res.send(JSON.stringify({ http_code: 200, http_response: result }));
          }
        });
      }
    }
  } else {
    res.send({ http_code: 401, http_response: "body required" });
  }
});
app.get("/select/operators/:operators_list", (req, res) => {
  $request1 = req.params.operators_list;
  if ($request1 == "operators_list") {
    {
      let sql = "SELECT * FROM " + $request1;
      db.query(sql, (err, result) => {
        if (err)
          res.send(
            JSON.stringify({
              http_code: 400,
              http_response: "Failed due to? " + err,
            })
          );
        res.send(
          JSON.stringify({
            http_code: 200,
            http_response: result,
          })
        );
      });
    }
  } else {
    res.send(
      JSON.stringify({
        http_code: 200,
        http_response: "Location missing",
      })
    );
  }
});

app.put("/modify/operators/:operators_list", (req, res) => {
  $request1 = req.params.operators_list;
  $request2 = req.query.id;

  let requested_body = req.body;
  // let obj = new Object(requested_body);
  var count = Object.keys(requested_body);

  if ($request1 == "operators_list") {
    {
      let sql =
        "UPDATE " +
        $request1 +
        " SET operator_name = '" +
        requested_body.operator_name +
        "' , operator_code = '" +
        requested_body.operator_code +
        "' WHERE id = " +
        $request2 +
        ";";

      db.query(sql, (err, result) => {
        if (err) {
          // console.log(err);
          res.send(
            JSON.stringify({
              http_code: 400,
              http_response: "Failed due to " + err,
            })
          );
        } else {
          // console.log(result);

          res.send(JSON.stringify({ http_code: 200, http_response: result }));
        }
      });
    }
  } else {
    res.send({ http_code: 401, http_response: "path required" });
  }
});

app.delete("/remove/operators/:operators_list", (req, res) => {
  $request1 = req.params.operators_list;
  $request2 = req.query.id;

  if ($request1 == "operators_list" && $request2 != null) {
    let sql = "DELETE FROM " + $request1 + " WHERE id = " + $request2;
    db.query(sql, (err, result) => {
      if (err) {
        // console.log(err);
        res.send(
          JSON.stringify({
            http_code: 400,
            http_response: "Failed due to " + err,
          })
        );
      } else {
        // console.log(result);

        res.send(JSON.stringify({ http_code: 200, http_response: result }));
      }
    });
  } else {
    res.send(
      JSON.stringify({
        http_code: 400,
        http_response: "Error in path or id " + err,
      })
    );
  }
});

// --------------Get All Numbers---------------
app.get("/operators/sim/:device", (req, res) => {
  let opcode = req.query.opcode;
  $request1 = req.params.device;
  if ($request1 == "subscribe_devices_info") {
    if (opcode != null || undefined) {
      // SELECT number FROM `subscribe_devices_info` WHERE number LIKE '0322%'

      let sql =
        "SELECT number FROM " +
        $request1 +
        " WHERE number LIKE '%" +
        opcode +
        "%' ";
      db.query(sql, (err, result) => {
        if (err) {
          res.send(
            JSON.stringify({
              http_code: 400,
              http_response: "Failed due to? " + err,
            })
          );
        } else {
          var filtered = [{}, {}, {}];

          // let data = JSON.parse(JSON.stringify(result));
          // let number = result ;

          // let b = number.filter(e=>
          //     {
          //         e.substr(0,5)== opcode
          //     })

          res.send(
            JSON.stringify({
              http_code: 200,
              http_response: result,
            })
          );
        }
      });
    } else {
      res.send(
        JSON.stringify({ http_code: 100, http_response: "id not found!" })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        http_code: 100,
        http_response: "Path not found? " + $request1,
      })
    );
  }
});

// -------------- Operator Balance ----
app.post("/insert/balance/:operator_balance", (req, res) => {
  $request1 = req.params.operator_balance;

  let requested_body = req.body;
  // let obj = new Object(requested_body);
  var count = Object.keys(requested_body);

  if ($request1 == "operator_balance") {
    {
      let sql =
        "INSERT INTO " +
        $request1 +
        "(operator_code,ussd,sms_number,sms,receive_format,max_inquiry,mode) VALUES('" +
        requested_body.operator_code +
        "','" +
        requested_body.ussd +
        "','" +
        requested_body.sms_number +
        "','" +
        requested_body.sms +
        "','" +
        requested_body.receive_format +
        "','" +
        requested_body.max_inquiry +
        "','" +
        requested_body.mode +
        "')";

      db.query(sql, (err, result) => {
        if (err) {
          // console.log(err);
          res.send(
            JSON.stringify({
              http_code: 400,
              http_response: "Failed due to " + err,
            })
          );
        } else {
          // console.log(result);

          res.send(JSON.stringify({ http_code: 200, http_response: result }));
        }
      });
    }
  } else {
    res.send({ http_code: 401, http_response: "path required" });
  }
});

app.get("/bselect/:type/:operator_balance", (req, res) => {
  let opcode = req.query.opcode;
  $request1 = req.params.operator_balance;
  $request2 = req.params.type;

  if ($request1 == "operator_balance") {
    if (opcode != null || undefined) {
      // SELECT number FROM `subscribe_devices_info` WHERE number LIKE '0322%'

      if ($request2 == "ussd") {
        let sql =
          "SELECT ussd,receive_format,max_inquiry FROM " +
          $request1 +
          " WHERE operator_code = " +
          opcode;
        db.query(sql, (err, result) => {
          if (err) {
            res.send(
              JSON.stringify({
                http_code: 400,
                http_response: "Failed due to? " + err,
              })
            );
          } else {
            res.send(
              JSON.stringify({
                http_code: 200,
                http_response: result,
              })
            );
          }
        });
      } else if ($request2 == "sms") {
        let sql =
          "SELECT sms_number,sms,receive_format,max_inquiry FROM " +
          $request1 +
          " WHERE operator_code = " +
          opcode;
        db.query(sql, (err, result) => {
          if (err) {
            res.send(
              JSON.stringify({
                http_code: 400,
                http_response: "Failed due to? " + err,
              })
            );
          } else {
            res.send(
              JSON.stringify({
                http_code: 200,
                http_response: result,
              })
            );
          }
        });
      }
    } else {
      res.send(
        JSON.stringify({ http_code: 100, http_response: "id not found!" })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        http_code: 100,
        http_response: "Path not found? " + $request1,
      })
    );
  }
});

app.put("/modify/balance/:operator_balance", (req, res) => {
  $request1 = req.params.operator_balance;
  $request2 = req.query.opcode;

  let requested_body = req.body;
  // let obj = new Object(requested_body);
  var count = Object.keys(requested_body);

  {
    if ($request1 == "operator_balance") {
      {
        let sql =
          "UPDATE " +
          $request1 +
          " SET ussd = '" +
          requested_body.ussd +
          "' , sms_number = '" +
          requested_body.sms_number +
          "',sms = '" +
          requested_body.sms +
          "',receive_format = '" +
          requested_body.receive_format +
          "',max_inquiry = '" +
          requested_body.max_inquiry +
          "',mode = '" +
          requested_body.mode +
          "' WHERE operator_code = " +
          $request2 +
          ";";

        db.query(sql, (err, result) => {
          if (err) {
            // console.log(err);
            res.send(
              JSON.stringify({
                http_code: 400,
                http_response: "Failed due to " + err,
              })
            );
          } else {
            // console.log(result);

            res.send(JSON.stringify({ http_code: 200, http_response: result }));
          }
        });
      }
    } else {
      res.send({ http_code: 401, http_response: "path required" });
    }
  }
});

app.delete("remove/balance/:operator_balance", (req, res) => {
  $request1 = req.params.operator_balance;
  $request2 = req.query.opcode;

  if ($request1 == "operator_balance" && $request2 != null) {
    let sql =
      "DELETE FROM " + $request1 + "' WHERE operator_code = " + $request2;
    db.query(sql, (err, result) => {
      if (err) {
        // console.log(err);
        res.send(
          JSON.stringify({
            http_code: 400,
            http_response: "Failed due to " + err,
          })
        );
      } else {
        // console.log(result);

        res.send(JSON.stringify({ http_code: 200, http_response: result }));
      }
    });
  } else {
    res.send(
      JSON.stringify({
        http_code: 400,
        http_response: "Error in path or id " + err,
      })
    );
  }
});

// -------------- Operator Number ----
app.post("/insert/number/:operator_number", (req, res) => {
  $request1 = req.params.operator_number;

  let requested_body = req.body;
  // let obj = new Object(requested_body);
  var count = Object.keys(requested_body);

  {
    if ($request1 == "operator_number") {
      {
        let sql =
          "INSERT INTO " +
          $request1 +
          "(operator_code,ussd,sms_number,sms,receive_format,max_inquiry,mode) VALUES('" +
          requested_body.operator_code +
          "','" +
          requested_body.ussd +
          "','" +
          requested_body.sms_number +
          "','" +
          requested_body.sms +
          "','" +
          requested_body.receive_format +
          "','" +
          requested_body.max_inquiry +
          "','" +
          requested_body.mode +
          "')";

        db.query(sql, (err, result) => {
          if (err) {
            // console.log(err);
            res.send(
              JSON.stringify({
                http_code: 400,
                http_response: "Failed due to " + err,
              })
            );
          } else {
            // console.log(result);

            res.send(JSON.stringify({ http_code: 200, http_response: result }));
          }
        });
      }
    } else {
      res.send({ http_code: 401, http_response: "path required" });
    }
  }
});

app.get("/nselect/:type/:operator_number", (req, res) => {
  let opcode = req.query.opcode;
  $request1 = req.params.operator_number;
  $request2 = req.params.type;

  if ($request1 == "operator_number") {
    if (opcode != null || undefined) {
      // SELECT number FROM `subscribe_devices_info` WHERE number LIKE '0322%'

      if ($request2 == "ussd") {
        let sql =
          "SELECT ussd,receive_format,max_inquiry FROM " +
          $request1 +
          " WHERE operator_code = " +
          opcode;
        db.query(sql, (err, result) => {
          if (err) {
            res.send(
              JSON.stringify({
                http_code: 400,
                http_response: "Failed due to? " + err,
              })
            );
          } else {
            res.send(
              JSON.stringify({
                http_code: 200,
                http_response: result,
              })
            );
          }
        });
      } else if ($request2 == "sms") {
        let sql =
          "SELECT sms_number,sms,receive_format,max_inquiry FROM " +
          $request1 +
          " WHERE operator_code = " +
          opcode;
        db.query(sql, (err, result) => {
          if (err) {
            res.send(
              JSON.stringify({
                http_code: 400,
                http_response: "Failed due to? " + err,
              })
            );
          } else {
            res.send(
              JSON.stringify({
                http_code: 200,
                http_response: result,
              })
            );
          }
        });
      }
    } else {
      res.send(
        JSON.stringify({ http_code: 100, http_response: "id not found!" })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        http_code: 100,
        http_response: "Path not found? " + $request1,
      })
    );
  }
});

app.put("/modify/number/:operator_number", (req, res) => {
  $request1 = req.params.operator_number;
  $request2 = req.query.opcode;

  let requested_body = req.body;
  // let obj = new Object(requested_body);
  var count = Object.keys(requested_body);

  {
    if ($request1 == "operator_number") {
      {
        let sql =
          "UPDATE " +
          $request1 +
          " SET ussd = '" +
          requested_body.ussd +
          "' , sms_number = '" +
          requested_body.sms_number +
          "',sms = '" +
          requested_body.sms +
          "',receive_format = '" +
          requested_body.receive_format +
          "',max_inquiry = '" +
          requested_body.max_inquiry +
          "',mode = '" +
          requested_body.mode +
          "' WHERE operator_code = " +
          $request2 +
          ";";

        db.query(sql, (err, result) => {
          if (err) {
            // console.log(err);
            res.send(
              JSON.stringify({
                http_code: 400,
                http_response: "Failed due to " + err,
              })
            );
          } else {
            // console.log(result);

            res.send(JSON.stringify({ http_code: 200, http_response: result }));
          }
        });
      }
    } else {
      res.send({ http_code: 401, http_response: "path required" });
    }
  }
});

app.delete("remove/number/:operator_number", (req, res) => {
  $request1 = req.params.operator_number;
  $request2 = req.query.opcode;

  if ($request1 == "operator_number" && $request2 != null) {
    let sql =
      "DELETE FROM " + $request1 + "' WHERE operator_code = " + $request2;
    db.query(sql, (err, result) => {
      if (err) {
        // console.log(err);
        res.send(
          JSON.stringify({
            http_code: 400,
            http_response: "Failed due to " + err,
          })
        );
      } else {
        // console.log(result);

        res.send(JSON.stringify({ http_code: 200, http_response: result }));
      }
    });
  } else {
    res.send(
      JSON.stringify({
        http_code: 400,
        http_response: "Error in path or id " + err,
      })
    );
  }
});

// ---------------

// ----------Top up requests---------
app.post("/insert/topups/information", (req, res) => {
  let requested_body = req.body;
  {
    let sql =
      "INSERT INTO " +
      "Top_Requests" +
      "(user_id , id, number, amount) VALUES('" +
      requested_body.user_id +
      "','" +
      requested_body.id +
      "','" +
      requested_body.number +
      "','" +
      requested_body.amount +
      "')";

    db.query(sql, (err, result) => {
      if (err) {
        // console.log(err);
        res.send(
          JSON.stringify({
            http_code: 400,
            http_response: "Failed due to " + err,
          })
        );
      } else {
        // console.log(result);

        res.send(JSON.stringify({ http_code: 200, http_response: result }));
      }
    });
  }
});

app.get("/select/topups/information", (req, res) => {
  let $request = req.query.user_id;
  if ($request != (null || undefined)) {
    let sql =
      "SELECT * FROM " + "Top_Requests" + " WHERE user_id = " + $request;
    db.query(sql, (err, result) => {
      if (err)
        res.send(
          JSON.stringify({
            http_code: 400,
            http_response: "Failed due to? " + err,
          })
        );
      res.send(
        JSON.stringify({
          http_code: 200,
          http_response: result,
        })
      );
    });
  } else {
    res.send(
      JSON.stringify({
        http_code: 200,
        http_response: "Required user id",
      })
    );
  }
});

// ----------Users request-----------

app.get("/select/:superadmin", (req, res) => {
  $request = req.query.id;
  $request1 = req.params.superadmin;

  if ($request != null || undefined) {
    let sql = "SELECT * FROM " + $request1 + " WHERE id = " + $request;
    db.query(sql, (err, result) => {
      if (err)
        res.send(
          JSON.stringify({
            http_code: 400,
            http_response: "Failed due to? " + err,
          })
        );
      res.send(
        JSON.stringify({
          http_code: 200,
          http_response: result,
        })
      );
    });
  } else {
    res.send(
      JSON.stringify({
        http_code: 200,
        http_response: "id missing or not defined?",
      })
    );
  }
});

app.post("/insert/:superadmin", (req, res) => {
  //only for super and sub admins

  $request1 = req.params.superadmin;
  $request2 = req.query.id;
  $request3 = req.query.username;
  $request4 = req.query.ip_addr;
  $request5 = req.query.device;
  $request6 = req.query.country;

  let sql =
    "INSERT INTO " +
    $request1 +
    "(id, username, ip_addr, device, country) VALUES(" +
    $request2 +
    ",'" +
    $request3 +
    "','" +
    $request4 +
    "','" +
    $request5 +
    "','" +
    $request6 +
    "')";
  db.query(sql, (err, result) => {
    if (err) {
      res.send(
        JSON.stringify({
          http_code: 400,
          http_response: "Failed due to? " + err,
        })
      );
    } else {
      res.send(JSON.stringify({ http_code: 200, http_response: result }));
    }
  });
});

app.put("/modify/:superadmin", (req, res) => {
  // Only for super and sub admins

  $request1 = req.params.superadmin;
  $request2 = req.query.id;
  $request4 = req.query.ip_addr;
  $request5 = req.query.device;
  $request6 = req.query.country;

  let sql =
    "UPDATE " +
    $request1 +
    " SET ip_addr = '" +
    $request4 +
    "' , device = '" +
    $request5 +
    "',country='" +
    $request6 +
    "' WHERE id = " +
    $request2 +
    ";";
  db.query(sql, (err, result) => {
    if (err) {
      res.send(JSON.stringify({ http_code: 400, http_response: err }));
    } else {
      res.send(JSON.stringify({ http_code: 200, http_response: result }));
    }
  });
});

// -----------Remote Messages--------------

app.post("/message/:message_path", (req, res) => {
  let requested_body = req.body;
  // var count = Object.keys(requested_body)
  let obj = new Object(requested_body);
  $request1 = req.params.message_path;

  {
    if ($request1 == "remote_messages") {
      if (Object.keys(obj).length < 10) {
        res.send(
          JSON.stringify({
            http_code: 100,
            http_response: "Error body incomplete",
          })
        );
      } else if (Object.keys(obj).length === 10) {
        {
          let sql =
            "INSERT INTO " +
            $request1 +
            "(id,username,device,body,from_num,to_num,direction,type,cost,status) VALUES(" +
            requested_body.id +
            ",'" +
            requested_body.username +
            "','" +
            requested_body.device +
            "','" +
            requested_body.body +
            "','" +
            requested_body.from_num +
            "','" +
            requested_body.to_num +
            "','" +
            requested_body.direction +
            "','" +
            requested_body.type +
            "','" +
            requested_body.cost +
            "','" +
            requested_body.status +
            "')";

          db.query(sql, (err, result) => {
            if (err) {
              // console.log(err);

              res.send(
                JSON.stringify({
                  http_code: 400,
                  http_response: "Failed due to " + err,
                })
              );
            } else {
              // console.log(result);
              let sql =
                "SELECT * FROM " +
                $request1 +
                " WHERE id = " +
                requested_body.id;
              db.query(sql, (err, result) => {
                if (err) {
                  // res.send(JSON.stringify({ http_code: 400, http_response: 'Failed due to? ' + err }));
                } else {
                  let count = 0;
                  // result.forEach(data => {
                  //     if (data.status == "completed")
                  //     {
                  //         count++;
                  //     }
                  // });

                  result.forEach(function (obj) {
                    if (obj.status == "completed") {
                      count++;
                    }
                  });

                  let T_count = result.length;

                  let answer = (count / T_count).toFixed(2) * 100;
                  let sql =
                    " UPDATE subscribe_devices_info SET success= " +
                    "'" +
                    answer +
                    "'" +
                    " WHERE id = " +
                    requested_body.id;

                  db.query(sql, (err, result) => {
                    if (err) {
                    } else {
                    }
                  });

                  // res.send(JSON.stringify({
                  //     http_code: 200
                  //     , http_response: result
                  // }));
                }
              });
              res.send(
                JSON.stringify({ http_code: 200, http_response: result })
              );
            }
          });
        }
      }
    } else {
      res.send(
        JSON.stringify({
          http_code: 100,
          http_response: "Path not found? " + $request1,
        })
      );
    }
  }
});

app.get("/message/:message_path", (req, res) => {
  let id = req.query.id;
  $request1 = req.params.message_path;
  if ($request1 == "remote_messages") {
    if (id != null || undefined) {
      let sql = "SELECT * FROM " + $request1 + " WHERE id = " + id;
      db.query(sql, (err, result) => {
        if (err) {
          res.send(
            JSON.stringify({
              http_code: 400,
              http_response: "Failed due to? " + err,
            })
          );
        } else {
          res.send(
            JSON.stringify({
              http_code: 200,
              http_response: result,
            })
          );
          // console.log(result)
        }
      });
    } else {
      res.send(
        JSON.stringify({ http_code: 100, http_response: "id not found!" })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        http_code: 100,
        http_response: "Path not found? " + $request1,
      })
    );
  }
});

app.post("/message/:type/:date", (req, res) => {
  $request = req.params.type;
  $request1 = req.params.date;

  if ($request == "scheduler") {
    const schedule = require("node-schedule");
    const date = new Date(2012, 11, 21, 5, 30, 0);

    let requested_body = req.body;
    let obj = new Object(requested_body);

    if (Object.keys(obj).length === 10) {
      const job = schedule.scheduleJob(date, function () {
        {
          let sql =
            "INSERT INTO " +
            $request1 +
            "(id,username,device,body,from_num,to_num,direction,type,cost,status) VALUES(" +
            requested_body.id +
            ",'" +
            requested_body.username +
            "','" +
            requested_body.device +
            "','" +
            requested_body.body +
            "','" +
            requested_body.from_num +
            "','" +
            requested_body.to_num +
            "','" +
            requested_body.direction +
            "','" +
            requested_body.type +
            "','" +
            requested_body.cost +
            "','" +
            requested_body.status +
            "')";
          db.query(sql, (err, result) => {
            if (err) {
              // console.log(err);
              res.send(
                JSON.stringify({
                  http_code: 400,
                  http_response: "Failed due to " + err,
                })
              );
            } else {
              // console.log(result);

              res.send(
                JSON.stringify({ http_code: 200, http_response: result })
              );
            }
          });
        }
      });
    } else {
      res.send(
        JSON.stringify({
          http_code: 400,
          http_response: "Minimum length must be 10",
        })
      );
    }
  }
});

// -------Subscribers----------
app.post("/subscribe/:device", (req, res) => {
  let requested_body = req.body;
  // var count = Object.keys(requested_body)
  let obj = new Object(requested_body);
  $request1 = req.params.device;

  if ($request1 == "subscribe_devices") {
    if (Object.keys(obj).length < 5) {

      return res.status(400).json({
        http_code: 400,
        http_response: "Error Body incomplete"
        
      });

      
     
    } else if (Object.keys(obj).length === 7) {
      {
        let sql =
          "INSERT INTO " +
          $request1 +
          "(id,username,imei,imsi,phone,device,country) VALUES(" +
          requested_body.id +
          ",'" +
          requested_body.username +
          "','" +
          requested_body.imei +
          "','" +
          requested_body.imsi +
          "','" +
          requested_body.phone +
          "','" +
          requested_body.device +
          "','" +
          requested_body.country +
          "')";
        db.query(sql, (err, result) => {
          if (err) {
            // console.log(err);
            return res.status(400).json({
              http_code: 400,
              http_response: "Failed due to " + err
              
            });


          } else {
            // console.log(result);
            return res.status(200)
            .json({ http_code: 200, http_response: result });
          }
        });
      }
    }
  } else {

    return res.status(100)
    .json({ http_code: 100
      , http_response:  "Path not found? " + $request1 });
  }
});

app.get("/subscribe/:device", (req, res) => {
  let id = req.query.id;
  let imei = req.query.imei;
  $request1 = req.params.device;
  if ($request1 == "subscribe_devices") {
    if (id != null || undefined) {
      let sql = "SELECT * FROM " + $request1 + " WHERE id = " + id;
      db.query(sql, (err, result) => {
        if (err) {
          return res.send(
            JSON.stringify({
              http_code: 400,
              http_response: "Failed due to? " + err,
            })
          );
        } else {
          res.send(
            JSON.stringify({
              http_code: 200,
              http_response: result,
            })
          );
        }
      });
    }

    if (id != (null || undefined) && imei != (null || undefined)) {
      // SELECT * FROM `subscribe_devices` WHERE id = 316366 AND imei = '869254026691561'
      let sql =
        "SELECT * FROM " +
        $request1 +
        " WHERE id = " +
        id +
        " AND imei = '" +
        imei +
        "'";
      db.query(sql, (err, result) => {
        if (err) {
          res.send(
            JSON.stringify({
              http_code: 400,
              http_response: "Failed due to? " + err,
            })
          );
        } else {
          res.send(
            JSON.stringify({
              http_code: 200,
              http_response: result,
            })
          );
        }
      });
    } else {
      // res.send(JSON.stringify({ http_code: 100, http_response: "id and imei not found!" }))
    }
  } else {
    res.send(
      JSON.stringify({
        http_code: 100,
        http_response: "Path not found? " + $request1,
      })
    );
  }
});

app.put("/subscribe/:device", (req, res) => {
  // Only for all update

  let requested_body = req.body;
  let $request2 = req.query.id;
  $request1 = req.params.device;
  if ($request1 == "subscribe_devices") {
    let sql =
      "UPDATE " +
      $request1 +
      " SET username = '" +
      requested_body.username +
      "',imei= '" +
      requested_body.imei +
      "',imsi='" +
      requested_body.imsi +
      "',phone='" +
      requested_body.phone +
      "',device='" +
      requested_body.device +
      "',country='" +
      requested_body.country +
      "' WHERE id = '" +
      $request2 +
      "';";

    db.query(sql, (err, result) => {
      if (err) {
        res.send(JSON.stringify({ http_code: 400, http_response: err }));
      } else {
        res.send(JSON.stringify({ http_code: 200, http_response: result }));
      }
    });
  }
});

// -----------------------USSD Response----------------
app.get("/subscribe/responses/:table/:type", (req, res) => {
  $request1 = req.params.table;
  $request2 = req.params.type;
  $request3 = req.query.id;

  if ($request1 == "USSD_Response") {
    if ($request2 != (null || undefined || "")) {
      let sql =
        "SELECT * FROM " +
        $request1 +
        " WHERE type = '" +
        $request2 +
        "' AND UserId = '" +
        $request3 +
        "'";
      db.query(sql, (err, result) => {
        if (err) {
          res.send(
            JSON.stringify({
              http_code: 400,
              http_response: "Failed due to? " + err,
            })
          );
        } else {
          res.send(
            JSON.stringify({
              http_code: 200,
              http_response: result,
            })
          );
        }
      });
    } else {
      let sql =
        "SELECT * FROM " + $request1 + " WHERE UserId = '" + $request3 + "'";
      db.query(sql, (err, result) => {
        if (err) {
          res.send(
            JSON.stringify({
              http_code: 400,
              http_response: "Failed due to? " + err,
            })
          );
        } else {
          res.send(
            JSON.stringify({
              http_code: 200,
              http_response: result,
            })
          );
        }
      });
    }
  }

  if ($request1 == "USSD_SMS") {
    if ($request2 != (null || undefined || "")) {
      let sql =
        "SELECT * FROM " +
        $request1 +
        " WHERE type = '" +
        $request2 +
        "' AND UserId = '" +
        $request3 +
        "'";
      db.query(sql, (err, result) => {
        if (err) {
          res.send(
            JSON.stringify({
              http_code: 400,
              http_response: "Failed due to? " + err,
            })
          );
        } else {
          res.send(
            JSON.stringify({
              http_code: 200,
              http_response: result,
            })
          );
        }
      });
    } else {
      let sql =
        "SELECT * FROM " + $request1 + " AND UserId = '" + $request3 + "'";
      db.query(sql, (err, result) => {
        if (err) {
          res.send(
            JSON.stringify({
              http_code: 400,
              http_response: "Failed due to? " + err,
            })
          );
        } else {
          res.send(
            JSON.stringify({
              http_code: 200,
              http_response: result,
            })
          );
        }
      });
    }
  }
});

// --------Subscriber each sim info------
app.post("/subscribe/sim/:device", (req, res) => {
  let requested_body = req.body;
  // var count = Object.keys(requested_body)
  let obj = new Object(requested_body);
  $request1 = req.params.device;

  if ($request1 == "subscribe_devices_info") {
    if (Object.keys(obj).length < 1) {
      res.send(
        JSON.stringify({
          http_code: 100,
          http_response: "Error body incomplete",
        })
      );
    } else if (Object.keys(obj).length > 1) {
      {
        let sql =
          "INSERT INTO " +
          $request1 +
          "(id, simId ,sim,number,balance,date,time, ex_time ,sim_Status,success,delay,phone_Status,top_up,android_ver,device,imei) VALUES(" +
          requested_body.id +
          ",'" +
          requested_body.simId +
          "','" +
          requested_body.sim +
          "','" +
          requested_body.number +
          "','" +
          requested_body.balance +
          "','" +
          requested_body.date +
          "','" +
          requested_body.time +
          "','" +
          requested_body.ex_time +
          "','" +
          requested_body.sim_status +
          "','" +
          requested_body.success +
          "','" +
          requested_body.delay +
          "','" +
          requested_body.phone_status +
          "','" +
          requested_body.top_up +
          "','" +
          requested_body.android_ver +
          "','" +
          requested_body.device +
          "','" +
          requested_body.imei +
          "')";
        db.query(sql, (err, result) => {
          if (err) {
            // console.log(err);
            res.send(
              JSON.stringify({
                http_code: 400,
                http_response: "Failed due to " + err,
              })
            );
          } else {
            // console.log(result);

            res.send(JSON.stringify({ http_code: 200, http_response: result }));
          }
        });
      }
    }
  } else {
    res.send(
      JSON.stringify({
        http_code: 100,
        http_response: "Path not found? " + $request1,
      })
    );
  }
});

app.get("/subscribe/sim/:device", (req, res) => {
  let id = req.query.id;
  let imei = req.query.imei;
  $request1 = req.params.device;
  if ($request1 == "subscribe_devices_info") {
    if (id != null || undefined) {
      let sql = "SELECT * FROM " + $request1 + " WHERE id = " + id;
      db.query(sql, (err, result) => {
        if (err) {
          res.send(
            JSON.stringify({
              http_code: 400,
              http_response: "Failed due to? " + err,
            })
          );
        } else {
          res.send(
            JSON.stringify({
              http_code: 200,
              http_response: result,
            })
          );
        }
      });
    }
    if (imei != null || undefined) {
      let sql = "SELECT * FROM " + $request1 + " WHERE imei = '" + imei + "'";
      db.query(sql, (err, result) => {
        if (err) {
          res.send(
            JSON.stringify({
              http_code: 400,
              http_response: "Failed due to? " + err,
            })
          );
        } else {
          res.send(
            JSON.stringify({
              http_code: 200,
              http_response: result,
            })
          );
        }
      });
    } else {
      // res.send(JSON.stringify({ http_code: 100, http_response: "Query not found?" }))
    }
  } else {
    res.send(
      JSON.stringify({
        http_code: 100,
        http_response: "Path not found? " + $request1,
      })
    );
  }
});

app.put("/subscribe/sim/:device", (req, res) => {
  // Only for all update

  $request2 = req.query.id;
  $request4 = req.query.number;
  $slot = req.query.slot;

  $request3 = req.query.imei;

  let requested_body = req.body;

  $request1 = req.params.device;
  if ($request1 == "subscribe_devices_info") {
    let sql =
      "UPDATE " +
      $request1 +
      " SET balance = '" +
      requested_body.balance +
      "',slot= '" +
      $slot +
      "',number= '" +
      $request4 +
      "',date= '" +
      requested_body.date +
      "',time='" +
      requested_body.time +
      "',delay='" +
      requested_body.delay +
      "',phone_Status='" +
      requested_body.phone_status +
      "',success='" +
      requested_body.success +
      "',sim_Status='" +
      requested_body.sim_status +
      "' WHERE (id = " +
      $request2 +
      " AND imei = '" +
      $request3 +
      "') AND (number = '" +
      $request4 +
      "' OR slot = '" +
      $slot +
      "');";

    db.query(sql, (err, result) => {
      if (err) {
        res.send(JSON.stringify({ http_code: 400, http_response: err }));
      } else {
        res.send(JSON.stringify({ http_code: 200, http_response: result }));
      }
    });
  }
});

app.put("/subscribe/sims/:device", (req, res) => {
  // Only for all update

  $request2 = req.query.id;
  $request4 = req.query.number;
  $slot = req.query.slot;
  $request3 = req.query.imei;
  $request1 = req.params.device;

  if ($request1 == "subscribe_devices_info") {
    let sql =
      "UPDATE " +
      $request1 +
      " SET slot= '" +
      $slot +
      "',number= '" +
      $request4 +
      "' WHERE (id = " +
      $request2 +
      " AND imei = '" +
      $request3 +
      "') AND (number = '" +
      $request4 +
      "' OR slot = '" +
      $slot +
      "');";

    db.query(sql, (err, result) => {
      if (err) {
        res.send(JSON.stringify({ http_code: 400, http_response: err }));
      } else {
        res.send(JSON.stringify({ http_code: 200, http_response: result }));
      }
    });
  }
});

app.put("/subscribe/simupdates/:target", (req, res) => {
  let $request = req.params.target;
  let simID = req.query.simId;
  let obj = req.body;
  let body = new Object(obj);

  if ($request == "subscribe_devices_info") {
    if (Object.keys(body).length > 0) {
      if (body.hasOwnProperty("balance")) {
        //  sql = "UPDATE " + $request + " SET balance= '"+body.balance + "'Where simId = "+$request1;
        let sql =
          "UPDATE " +
          $request +
          " SET balance = '" +
          body.balance +
          "' WHERE simId = '" +
          simID +
          "'";
        db.query(sql, (err, result) => {
          if (err) {
            res.send(JSON.stringify({ http_code: 400, http_response: err }));
          } else {
            res.send(
              JSON.stringify({
                http_code: 200,
                http_response: "Balance updated success",
              })
            );
          }
        });
      }

      if (body.hasOwnProperty("simId")) {
        let sql =
          "UPDATE " +
          $request +
          " SET simId = '" +
          body.simId +
          "' WHERE simId = '" +
          simID +
          "'";
        db.query(sql, (err, result) => {
          if (err) {
            res.send(JSON.stringify({ http_code: 400, http_response: err }));
          } else {
            res.send(
              JSON.stringify({
                http_code: 200,
                http_response: "Name updated success",
              })
            );
          }
        });
      }

      if (body.hasOwnProperty("delay")) {
        let sql =
          "UPDATE " +
          $request +
          " SET delay = '" +
          body.delay +
          "' WHERE simId = '" +
          simID +
          "'";

        db.query(sql, (err, result) => {
          if (err) {
            res.send(JSON.stringify({ http_code: 400, http_response: err }));
          } else {
            res.send(
              JSON.stringify({
                http_code: 200,
                http_response: "Delay updated success",
              })
            );
          }
        });
      }

      if (body.hasOwnProperty("slot")) {
        let sql =
          "UPDATE " +
          $request +
          " SET slot = '" +
          body.slot +
          "' WHERE simId = '" +
          simID +
          "'";

        db.query(sql, (err, result) => {
          if (err) {
            res.send(JSON.stringify({ http_code: 400, http_response: err }));
          } else {
            res.send(
              JSON.stringify({
                http_code: 200,
                http_response: "Slot updated success",
              })
            );
          }
        });
      }

      if (body.hasOwnProperty("number")) {
        let sql =
          "UPDATE " +
          $request +
          " SET number = '" +
          body.number +
          "' WHERE simId = '" +
          simID +
          "'";

        db.query(sql, (err, result) => {
          if (err) {
            res.send(JSON.stringify({ http_code: 400, http_response: err }));
          } else {
            res.send(
              JSON.stringify({
                http_code: 200,
                http_response: "Number updated success",
              })
            );
          }
        });
      }
    } else {
      res.send(
        JSON.stringify({ http_code: 200, http_response: "Json not found" })
      );
    }
  } else {
    res.send(
      JSON.stringify({ http_code: 200, http_response: "Table not found" })
    );
  }
});

app.delete("/remove/sim/:device", (req, res) => {
  $request1 = req.params.device;
  $request2 = req.query.imei;

  if ($request1 == "subscribe_devices_info" && $request2 != null) {
    let sql = "DELETE FROM " + $request1 + " WHERE imei = '" + $request2 + "';";
    db.query(sql, (err, result) => {
      if (err) {
        // console.log(err);
        res.send(
          JSON.stringify({
            http_code: 400,
            http_response: "Failed due to " + err,
          })
        );
      } else {
        // console.log(result);

        res.send(JSON.stringify({ http_code: 200, http_response: result }));
      }
    });
  } else {
    res.send(
      JSON.stringify({
        http_code: 400,
        http_response: "Error in path or id " + err,
      })
    );
  }
});

// ------Auto Email Verification----------
app.post("/sendverification/:email/:api", (req, res) => {
  // var count = Object.keys(requested_body)

  $request1 = req.params.email; //email
  $request2 = req.params.api; //code

  var nodemailer = require("nodemailer");
  const pug = require("pug");
  var transporter = nodemailer.createTransport({
    service: "gmail",
    secure: false,
    auth: {
      user: "livenewsofficials@gmail.com",
      pass: "Myyahooacc-1Saen",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const _fs = require("fs");
  const _path = require("path");

  code_data = 0;

  var path = _path.join("/");
  _fs.readFile("verifier_code.html", "utf8", function (err, data) {
    if (err) {
      _console.log(err, "error");

      return null;
    }

    code_data = data.replace("{{code}}", $request2);
    var mailOptions = {
      from: "nor-reply@smsgateways.com",
      to: $request1,
      subject: "Welcome to our SMS Gateway ",
      text: "Here is the Code",
      html: code_data,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        res.send(error);
      } else {
        console.log("Email sent: " + info.response);
        res.send(
          JSON.stringify({
            response_msg: "Verification Email Sent success",
          })
        );
      }
    });
  });
});

// Auto Email Sender....
app.post("/gatewaysendmail/:email/:user/:api", (req, res) => {
  // var count = Object.keys(requested_body)
  $request1 = req.params.user;
  $request2 = req.params.api;
  $request3 = req.params.email;

  var nodemailer = require("nodemailer");
  var transporter = nodemailer.createTransport({
    service: "gmail",
    secure: false,
    auth: {
      user: "livenewsofficials@gmail.com",
      pass: "Myyahooacc-1Saen",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const _fs = require("fs");
  const _path = require("path");
  var path = _path.join("/");
  _fs.readFile("credentials_code.html", "utf8", function (err, data) {
    if (err) {
      _console.log(err, "error");

      return null;
    }

    code_data = data.replace("{{Email}}", $request1);
    code_data = code_data.replace("{{Password}}", $request2);

    var mailOptions = {
      from: "nor-reply@smsgateways.com",
      to: $request3,
      subject: "Welcome to our Business as a Sub Admin ",
      html: code_data,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        res.send(error);
      } else {
        console.log("Email sent: " + info.response);
        res.send(
          JSON.stringify({
            response_msg: "Email Sent success",
          })
        );
      }
    });
  });
});

// ------Webhooks----
const { EventEmitter } = require("stream");
const { json } = require("body-parser");

// const { Server } = require("./lib/socket.io");
// const emit = new Server();
const emit = new EventEmitter();

// const Router = express();
// sets event listener

app.get("/webhook/", (req, res) => {
  io.emit("chat", req.body);
  res.status(200).send("success " + req.body);
  // res.send(JSON.stringify(req.body))
});

io.on("chat", function (requestBody) {
  // Do what you want
  console.log("Working " + requestBody);
});

const token = "ar23o8v77"; // type here your verification token

app.get("/webget", (req, res) => {
  // check if verification token is correct
  if (req.query.token !== token) {
    return res.sendStatus(401);
  }

  // return challenge
  return res.end(req.query.challenge);
});

app.post("/webpost", (req, res) => {
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
        type: "text",
        elements: ["Hi", "Hello"],
      },
    ],
  };

  res.json(data);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", function () {
  console.log("Server started......." + hostname + " " + port);
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
});
