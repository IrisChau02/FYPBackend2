const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors())
app.use(express.json())

const db = mysql.createConnection({
    host: "localhost",
    user: 'root',
    password: "2Oo21226@",
    database: "user"
})

app.get('/', (req, res)=> {
    return res.json("From Backend Side");
  });

  //login
  app.post('/login', (req, res)=> {
    const sql = "SELECT * FROM `register` WHERE `loginName` = ? AND `password` = ?"

    db.query(sql, [req.body.username, req.body.password], (err, data)=>{
        if(err) {
          return res.json(err);
        }
        if(data.length>0){
          return res.json(data);
        }else{
          return res.json("failed");
        }
    })
  });

  //register
  app.post('/register', (req, res)=> {

    const sql = "INSERT INTO `register`(`firstName`, `lastName`, `birthday`, `gender`, `email`, `phoneNumber`, `loginName`, `password`) VALUES (?)"

    const values = [req.body.firstName, req.body.lastName, req.body.formatbirthday, req.body.gender, req.body.email, req.body.phoneNumber, req.body.loginName, req.body.password ]

    db.query(sql, [values], (err, data)=>{
        if(err) {
          return res.json(err);
        }
        return res.json("added");
  
    })
  });

  app.get('/getUserData', (req, res) => {
    const { loginName, password } = req.query;
  
    const sql = "SELECT * FROM `register` WHERE `loginName` = ? AND `password` = ?";
  
    db.query(sql, [loginName, password], (err, data) => {
      if (err) {
        return res.json(err);
      }
      if (data.length > 0) {
        return res.json(data);
      } else {
        return res.json("failed");
      }
    });
  });

  app.get('/getDistrict', (req, res)=> {
    const sql = "SELECT * FROM `district`"
    db.query(sql, (err, data)=>{
        if(err) return res.json(err);
        return res.json(data);
    })
  });

  app.get('/getWorkingMode', (req, res)=> {
    const sql = "SELECT * FROM `workingmode`"
    db.query(sql, (err, data)=>{
        if(err) return res.json(err);
        return res.json(data);
    })
  });

  app.get('/getSports', (req, res)=> {
    const sql = "SELECT * FROM `sports`"
    db.query(sql, (err, data)=>{
        if(err) return res.json(err);
        return res.json(data);
    })
  });

///////////////////////////Guild/////////////////////////////
app.post('/createGuild', (req, res)=> {

  const sql = "INSERT INTO `guild`(`guildName`, `guildInto`, `level`, `memberNo`, `guildLogo`, `districtID`) VALUES (?)"

  const values = [req.body.guildName, req.body.guildIntro, req.body.level, req.body.member, req.body.guildLogo, req.body.districtDropdown.districtID ]

  db.query(sql, [values], (err, data)=>{
      if(err) {
        return res.json(err);
      }
      return res.json("added");

  })
});

app.get('/getGuild', (req, res)=> {
  const sql = "SELECT * FROM `guild`"
  db.query(sql, (err, data)=>{
      if(err) return res.json(err);
      return res.json(data);
  })
});


  /*
  app.get('/users', (req, res)=> {
    const sql = "SELECT * FROM users"
    db.query(sql, (err, data)=>{
        if(err) return res.json(err);
        return res.json(data);
    })
  });*/

  app.listen(3000, ()=> {
    console.log("listening");
  });