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
    database: "fyp"
})

app.get('/', (req, res)=> {
    return res.json("From Backend Side");
  });

  //Format date
Date.prototype.yyyymmdd = function () {
  var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
  var dd = this.getDate().toString();
  return [
    this.getFullYear(),
    mm.length === 2 ? "" : "0",
    mm,
    dd.length === 2 ? "" : "0",
    dd,
  ].join(""); // padding
};

  function generateUniqueIdentifier() {
    const date = new Date();
    const todayString = date.yyyymmdd();
  
    // Generate a random string of alphanumeric characters
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters[randomIndex];
    }
  
    // Concatenate the todayString and random string
    const uniqueId = todayString + '_' + randomString;
  
    return uniqueId;
  }

  //login
  app.post('/login', (req, res)=> {
    const sql = "SELECT * FROM `user` WHERE `loginName` = ? AND `password` = ?"

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

    const sql = "INSERT INTO `user`(`userID`, `firstName`, `lastName`, `birthday`, `gender`, `email`, `phoneNumber`, `loginName`, `password`) VALUES (?)"

    // Generate a unique identifier
    const uniqueIdentifier = generateUniqueIdentifier();
    const values = [uniqueIdentifier, req.body.firstName, req.body.lastName, req.body.formatbirthday, req.body.gender, req.body.email, req.body.phoneNumber, req.body.loginName, req.body.password ]

    db.query(sql, [values], (err, data)=>{
        if(err) {
          return res.json(err);
        }
        return res.json("added");
  
    })
  });

  //Initiate account
  app.post('/initiateAccount', (req, res) => {
    const { userID, firstName, lastName, birthday, gender, email, phoneNumber, loginName, password, workModeID, districtID, sportsID } = req.body;
  
    const sql = "UPDATE `user` SET `workModeID` = ?, `districtID` = ?, `sportsID` = ? WHERE `loginName` = ? AND `password` = ?";
  
    // Convert the sportsID array to a comma-separated string
    const sportsIDString = req.body.sportsID.join(',');
  
    const values = [req.body.workModeID, req.body.districtID, sportsIDString, req.body.loginName, req.body.password];
  
    db.query(sql, values, (err, data) => {
      if (err) {
        return res.json(err);
      }
      return res.json("updated");
    });
  });


  //Home
  app.get('/getUserData', (req, res) => {
    const { loginName, password } = req.query;
  
    const sql = "SELECT * FROM `user` WHERE `loginName` = ? AND `password` = ?";
  
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

  const sql = "INSERT INTO `guild`(`guildName`, `guildIntro`, `level`, `memberNo`, `guildLogo`, `districtID`) VALUES (?)"

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


///////////////////////////Guild Event/////////////////////////////
app.post('/createGuildEvent', (req, res)=> {

  
  const sql = "INSERT INTO `guildevent`(`eventName`, `eventDetail`, `eventDate`, `startTime`, `endTime`, `venue`, `guildName`) VALUES (?)"

  const values = [req.body.eventName, req.body.eventDetail, req.body.formateventDate, req.body.startTime, req.body.endTime, req.body.venue, req.body.guildName ]

  db.query(sql, [values], (err, data)=>{
      if(err) {
        return res.json(err);
      }
      return res.json("added");

  })
});

app.get('/getGuildEvent', (req, res)=> {
  
  const { guildName } = req.query;

  const sql = "SELECT * FROM `guildevent` WHERE `guildName` = ?"

  db.query(sql, [guildName], (err, data) => {
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