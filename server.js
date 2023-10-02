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

  app.get('/users', (req, res)=> {
    const sql = "SELECT * FROM users"
    db.query(sql, (err, data)=>{
        if(err) return res.json(err);
        return res.json(data);
    })
  });

  
  app.post('/register', (req, res)=> {
    const sql = "INSERT INTO `register`(`firstName`, `lastName`, `gender`, `email`, `phoneNumber`, `loginName`, `password`) VALUES (?)"

    const values = [req.body.firstName, req.body.lastName, req.body.gender, req.body.email, req.body.phoneNumber, req.body.loginName,req.body.password ]

    db.query(sql, [values], (err, data)=>{
        if(err) {
          return res.json(err);
        }
        return res.json(data);
    })
  });
  
  
  app.post('/login', (req, res)=> {
    const sql = "SELECT * FROM `register` WHERE `loginName` = ? AND `password` = ?"

    db.query(sql, [req.body.username, req.body.password], (err, data)=>{
        if(err) {
          return res.json(err);
        }
        if(data.length>0){
          return res.json("success");
        }else{
          return res.json("failed");
        }
    })
  });

  app.listen(8081, ()=> {
    console.log("listening");
  });