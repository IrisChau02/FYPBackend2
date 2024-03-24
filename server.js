const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
var cron = require('node-cron');


const app = express();
app.use(cors())
app.use(express.json())

const db = mysql.createConnection({
  host: "localhost",
  user: 'root',
  password: "2Oo21226@",
  database: "fyp"
})

app.get('/', (req, res) => {
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

function areDatesInSameWeek(date1, date2) {
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);

  // Check if the dates have the same year and month
  if (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth()
  ) {
    // Get the start of the month
    const startOfMonth = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);

    // Get the week numbers for each date, counting from the start of the month
    const firstWeek = Math.ceil((firstDate.getDate() + startOfMonth.getDay()) / 7);
    const secondWeek = Math.ceil((secondDate.getDate() + startOfMonth.getDay()) / 7);

    // Compare the week numbers
    return firstWeek === secondWeek;
  }

  // Dates are not in the same year and month
  return false;
}


// Refresh daily mission every day at midnight
cron.schedule('0 0 * * *', () => {
  const selfMissionsql = "UPDATE `missionusermap` SET `isFinish` = false, `missionPhoto` = null WHERE `missionMode` = 'Daily' AND `isSystem` = false";
  const selfMissionCuDaysql = `UPDATE \`missionusermap\` SET \`missionKeepTime\` = 0 WHERE \`missionMode\` = 'Daily' AND \`isSystem\` = false AND DATE(\`missionLastDate\`) != DATE(DATE_SUB(NOW(), INTERVAL 1 DAY))`;

  const systemMissionsql = "UPDATE `missionusermap` SET `isFinish` = false, `missionPhoto` = null WHERE missionusermap.isSystem = true AND missionID IN (SELECT missionID FROM `mission` WHERE missionMode = 'Daily')";
  const systemMissionCuDaysql = `UPDATE \`missionusermap\` SET \`missionKeepTime\` = 0 WHERE \`isSystem\` = true AND DATE(\`missionLastDate\`) != DATE(DATE_SUB(NOW(), INTERVAL 1 DAY)) AND missionID IN (SELECT missionID FROM \`mission\` WHERE missionMode = 'Daily')`;

  db.query(selfMissionsql, (err, result) => {
    if (err) {
      console.error('Error updating missionusermap:', err);
    }
  });

  db.query(selfMissionCuDaysql, (err, result) => {
    if (err) {
      console.error('Error updating missionKeepTime:', err);
    }
  });

  db.query(systemMissionsql, (err, result) => {
    if (err) {
      console.error('Error updating systemMissionsql:', err);
    }
  });

  db.query(systemMissionCuDaysql, (err, result) => {
    if (err) {
      console.error('Error updating systemMissionCuDaysql:', err);
    }
  });
});


// Refresh weekly mission every week at midnight
cron.schedule('0 0 * * 1', () => {
  const selfMissionsql = "UPDATE `missionusermap` SET `isFinish` = false, `missionPhoto` = null WHERE `missionMode` = 'Weekly' AND `isSystem` = false";
  const selfMissionCuDaysql = `UPDATE \`missionusermap\` SET \`missionKeepTime\` = 0 WHERE \`missionMode\` = 'Weekly' AND \`isSystem\` = false AND DATE(\`missionLastDate\`) != DATE(DATE_SUB(NOW(), INTERVAL 1 Week))`;

  const systemMissionsql = "UPDATE `missionusermap` SET `isFinish` = false, `missionPhoto` = null WHERE missionusermap.isSystem = true AND missionID IN (SELECT missionID FROM `mission` WHERE missionMode = 'Weekly')";
  const systemMissionCuDaysql = `UPDATE \`missionusermap\` SET \`missionKeepTime\` = 0 WHERE \`isSystem\` = true AND DATE(\`missionLastDate\`) != DATE(DATE_SUB(NOW(), INTERVAL 1 Week)) AND missionID IN (SELECT missionID FROM \`mission\` WHERE missionMode = 'Weekly')`;

  db.query(selfMissionsql, (err, result) => {
    if (err) {
      console.error('Error updating missionusermap:', err);
    }
  });

  db.query(selfMissionCuDaysql, (err, result) => {
    if (err) {
      console.error('Error updating missionKeepTime:', err);
    }
  });

  db.query(systemMissionsql, (err, result) => {
    if (err) {
      console.error('Error updating systemMissionsql:', err);
    }
  });

  db.query(systemMissionCuDaysql, (err, result) => {
    if (err) {
      console.error('Error updating systemMissionCuDaysql:', err);
    }
  });
});

// Refresh monthly mission at midnight
cron.schedule('0 0 1 * *', () => {
  const selfMissionsql = "UPDATE `missionusermap` SET `isFinish` = false, `missionPhoto` = null WHERE `missionMode` = 'Monthly' AND `isSystem` = false";
  const systemMissionsql = "UPDATE `missionusermap` SET `isFinish` = false, `missionPhoto` = null WHERE missionusermap.isSystem = true AND missionID IN (SELECT missionID FROM `mission` WHERE missionMode = 'Monthly')";

  db.query(selfMissionsql, (err, result) => {
    if (err) {
      console.error('Error updating missionusermap:', err);
    }
  });

  db.query(systemMissionsql, (err, result) => {
    if (err) {
      console.error('Error updating systemMissionsql:', err);
    }
  });
});


//login
app.post('/login', (req, res) => {
  const sql = "SELECT * FROM `user` WHERE `loginName` = ? AND `password` = ?"

  db.query(sql, [req.body.username, req.body.password], (err, data) => {
    if (err) {
      return res.json(err);
    }
    if (data.length > 0) {
      return res.json(data);
    } else {
      return res.json("failed");
    }
  })
});

//register
app.post('/register', (req, res) => {

  const sql = "INSERT INTO `user`(`userID`, `firstName`, `lastName`, `birthday`, `gender`, `email`, `phoneNumber`, `loginName`, `password`) VALUES (?)"

  // Generate a unique identifier
  const uniqueIdentifier = generateUniqueIdentifier();
  const values = [uniqueIdentifier, req.body.firstName, req.body.lastName, req.body.formatbirthday, req.body.gender, req.body.email, req.body.phoneNumber, req.body.loginName, req.body.password]

  db.query(sql, [values], (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json("added");

  })
});

//Initiate account
app.post('/updateUser', (req, res) => {
  const { userID, firstName, lastName, formatbirthday, gender, email, phoneNumber, loginName, password, userLogo, userIntro } = req.body;

  const sql = "UPDATE `user` SET `firstName` = ?, `lastName` = ?, `birthday` = ?, `gender` = ?, `email` = ?, `phoneNumber` = ?, `loginName` = ?, `password` = ?, `userLogo` = ?, `userIntro` = ? WHERE `userID` = ?";

  const values = [req.body.firstName, req.body.lastName, req.body.formatbirthday, req.body.gender, req.body.email, req.body.phoneNumber, req.body.loginName, req.body.password, req.body.userLogo, req.body.userIntro, req.body.userID];

  db.query(sql, values, (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json("updated");
  });
});


app.post('/updateUserLogo', (req, res) => {
  const { userID, userLogo } = req.body;

  const sql = "UPDATE `user` SET `userLogo` = ? WHERE `userID` = ?";

  const values = [req.body.userLogo, req.body.userID];

  db.query(sql, values, (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json("updated");
  });
});

//Initiate account
app.post('/initiateAccount', (req, res) => {
  const { loginName, password, workModeID, districtID, sportsID, timeslotID } = req.body;

  const sql = "UPDATE `user` SET `workModeID` = ?, `districtID` = ?, `sportsID` = ? , `timeslotID` = ? WHERE `loginName` = ? AND `password` = ?";

  // Convert the sportsID array to a comma-separated string 
  const sportsIDString = req.body.sportsID.join(',');

  const values = [req.body.workModeID, req.body.districtID, sportsIDString, req.body.timeslotID, req.body.loginName, req.body.password];

  db.query(sql, values, (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json("updated");
  });
});

app.post('/updateSportsID', (req, res) => {
  const { userID, sportsID } = req.body;

  const sql = "UPDATE `user` SET `sportsID` = ? WHERE `userID` = ?";

  // Convert the sportsID array to a comma-separated string
  const sportsIDString = req.body.sportsID.join(',');

  const values = [sportsIDString, req.body.userID];

  db.query(sql, values, (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json("updated");
  });
});

app.post('/updateWorkModeID', (req, res) => {
  const { userID, sportsID } = req.body;

  const sql = "UPDATE `user` SET `workModeID` = ? WHERE `userID` = ?";

  const values = [req.body.workModeID, req.body.userID];

  db.query(sql, values, (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json("updated");
  });
});

app.post('/updateTimeslotID', (req, res) => {
  const { userID, timeslotID } = req.body;

  const sql = "UPDATE `user` SET `timeslotID` = ? WHERE `userID` = ?";

  const values = [req.body.timeslotID, req.body.userID];

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

//Home
app.get('/getUserDataByID', (req, res) => {
  const { userID } = req.query;

  const sql = "SELECT * FROM `user` WHERE `userID` = ?";

  db.query(sql, [userID], (err, data) => {
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

app.get('/getDistrict', (req, res) => {
  const sql = "SELECT * FROM `district`"
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  })
});

app.get('/getWorkingMode', (req, res) => {
  const sql = "SELECT * FROM `workingmode`"
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  })
});

app.get('/getSports', (req, res) => {
  const sql = "SELECT * FROM `sports`"
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  })
});

app.get('/getTimeslot', (req, res) => {
  const sql = "SELECT * FROM `timeslot`"
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  })
});

///////////////////////////Guild/////////////////////////////
app.post('/createGuild', (req, res) => {
  const guildSql = "INSERT INTO `guild`(`guildName`, `guildIntro`, `masterUserID`, `level`, `maxMemberLimit`, `memberNo`, `guildLogo`, `districtID`) VALUES (?)";
  const guildValues = [req.body.guildName, req.body.guildIntro, req.body.userID, req.body.level, 20, req.body.member, req.body.guildLogo, req.body.districtID];

  const userSql = "UPDATE `user` SET `guildName` = ? WHERE `userID` = ?";
  const userValues = [req.body.guildName, req.body.userID];

  /********************************************/
  //create the guild mission
  const birthday = new Date(req.body.birthday);
  const today = new Date();
  const age = today.getFullYear() - birthday.getFullYear();

  // Check the age category and find the corresponding mission targets
  let missionTarget;
  if (age <= 14) {
    missionTarget = 'Child';
  } else if (age <= 64) {
    missionTarget = 'Adult';
  } else {
    missionTarget = 'Elder';
  }

  // Query the 'mission' table for the corresponding mission IDs
  const selectMissionSql = "SELECT `missionID` FROM `mission` WHERE `missionTarget` = ?";
  const selectMissionValues = [missionTarget];
  /********************************************/

  db.beginTransaction((err) => {
    if (err) {
      return res.json(err);
    }

    db.query(guildSql, [guildValues], (err, guildData) => {
      if (err) {
        db.rollback(() => res.json(err));
      }

      db.query(userSql, userValues, (err, userData) => {
        if (err) {
          db.rollback(() => res.json(err));
        }

        db.query(selectMissionSql, selectMissionValues, (err, missionData) => {
          if (err) {
            db.rollback(() => res.json(err));
          }

          const missionIDs = missionData.map((row) => row.missionID);

          const insertMissionSql = "INSERT INTO `missionusermap` (`userID`, `missionID`, `isSystem`, `isFinish`) VALUES ?";
          const insertMissionValues = missionIDs.map((missionID) => [req.body.userID, missionID, true, false]);


          db.query(insertMissionSql, [insertMissionValues], (err, missionInsertResult) => {
            if (err) {
              db.rollback(() => res.json(err));
            }

            db.commit((err) => {
              if (err) {
                db.rollback(() => res.json(err));
              }
              return res.json("added");
            });
          });
        });
      });
    });
  });
});

app.post('/joinGuild', (req, res) => {
  const { userID, birthday, guildName, memberNo } = req.body;

  const newMemberNo = memberNo + 1;

  const guildSql = "UPDATE guild SET memberNo = ? WHERE guildName = ?";
  const guildValues = [newMemberNo, guildName];

  const userSql = "UPDATE user SET guildName = ? WHERE userID = ?";
  const userValues = [guildName, userID];

  /********************************************/
  // Create the guild mission
  const birth = new Date(birthday);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();

  // Check the age category and find the corresponding mission targets
  let missionTarget;
  if (age <= 14) {
    missionTarget = 'Child';
  } else if (age <= 64) {
    missionTarget = 'Adult';
  } else {
    missionTarget = 'Elder';
  }

  console.log(missionTarget)

  // Query the 'mission' table for the corresponding mission IDs
  const selectMissionSql = "SELECT `missionID` FROM `mission` WHERE `missionTarget` = ?";
  const selectMissionValues = [missionTarget];
  /********************************************/

  db.beginTransaction((err) => {
    if (err) {
      return res.json(err);
    }

    db.query(guildSql, guildValues, (err, guildData) => {
      if (err) {
        db.rollback(() => res.json(err));
      }

      db.query(userSql, userValues, (err, userData) => {
        if (err) {
          db.rollback(() => res.json(err));
        }

        db.query(selectMissionSql, selectMissionValues, (err, missionData) => {
          if (err) {
            db.rollback(() => res.json(err));
          }

          const missionIDs = missionData.map((row) => row.missionID);

          const insertMissionSql = "INSERT INTO `missionusermap` (`userID`, `missionID`, `isSystem`, `isFinish`) VALUES ?";
          const insertMissionValues = missionIDs.map((missionID) => [userID, missionID, true, false]);

          db.query(insertMissionSql, [insertMissionValues], (err, missionInsertResult) => {
            if (err) {
              db.rollback(() => res.json(err));
            }

            db.commit((err) => {
              if (err) {
                db.rollback(() => res.json(err));
              }
              return res.json("updated");
            });
          });
        });
      });
    });
  });
});


app.get('/getGuild', (req, res) => {
  const sql = "SELECT * FROM `guild`"
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  })
});

app.get('/getGuildByDistrict', (req, res) => {
  const { districtID } = req.query;

  const sql = "SELECT * FROM `guild`  WHERE `districtID` = ?"

  db.query(sql, [districtID], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  })
});

//Guild Detail
app.get('/getGuildDetailByName', (req, res) => {
  const { guildName } = req.query;

  const sql = "SELECT * FROM `guild` WHERE `guildName` = ?";

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


app.post('/updateGuild', (req, res) => {
  const { guildName, guildIntro, guildLogo, groupID } = req.body;
  
  const sql = "UPDATE `guild` SET `guildIntro` = ?, `guildLogo` = ?, `groupID` = ? WHERE `guildName` = ?";
  const values = [guildIntro, guildLogo, groupID, guildName];

  db.query(sql, values, (err, data) => {
    if (err) {
      console.log(err);
      return res.json(err);
    }
    return res.json("updated");
  });
});


///////////////////////////Guild Event/////////////////////////////
app.post('/createGuildEvent', (req, res) => {
  const sql = "INSERT INTO `guildevent`(`eventName`, `guildName`, `eventDetail`, `eventDate`, `startTime`, `endTime`, `memberNumber`, `currentNumber`, `venue`, `initiatorID`, `isFinished`) VALUES (?)";
  const values = [req.body.eventName, req.body.guildName, req.body.eventDetail, req.body.formateventDate, req.body.startTime, req.body.endTime, req.body.memberNumber, req.body.currentNumber, req.body.venue, req.body.userID, false];

  const mapsql = "INSERT INTO `eventusermap`(`eventName`, `guildName`, `userID`) VALUES (?)";
  const mapvalues = [req.body.eventName, req.body.guildName, req.body.userID];

  db.query(sql, [values], (eventErr, eventData) => {
    if (eventErr) {
      console.log(eventErr);
      return res.json(eventErr);
    }

    db.query(mapsql, [mapvalues], (mapErr, mapData) => {
      if (mapErr) {
        console.log(mapErr);
        return res.json(mapErr);
      }

      return res.json("added");
    });
  });
});

app.get('/getGuildEvent', (req, res) => {
  const { guildName } = req.query;
  const sql = "SELECT * FROM `guildevent` WHERE `guildName` = ? AND `isFinished` = ?"

  db.query(sql, [guildName, false], (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });

});


app.get('/getGuildEventByName', (req, res) => {

  const { eventName } = req.query;
  const sql = "SELECT * FROM `guildevent` WHERE `eventName` = ?"

  db.query(sql, [eventName], (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });

});

app.post('/joinEvent', (req, res) => {
  const { userID, guildName, eventName, currentNumber } = req.body;

  // Set currentNumber = currentNumber + 1
  const eventsql = "UPDATE `guildevent` SET `currentNumber` = ? WHERE `guildName` = ? AND `eventName` = ?";
  const eventvalues = [currentNumber, guildName, eventName];

  const mapsql = "INSERT INTO `eventusermap`(`eventName`, `guildName`, `userID`) VALUES (?)";
  const mapvalues = [eventName, guildName, userID];

  db.query(eventsql, eventvalues, (eventErr, eventData) => {
    if (eventErr) {
      console.log(eventErr);
      return res.json(eventErr);
    }

    db.query(mapsql, [mapvalues], (mapErr, mapData) => {
      if (mapErr) {
        console.log(mapErr);
        return res.json(mapErr);
      }

      return res.json("updated");
    });
  });
});

app.get('/getGuildEventMember', (req, res) => {
  const { eventName, guildName } = req.query;
  const sql = "SELECT * FROM `eventusermap` WHERE `eventName` = ? AND `guildName` = ?"

  db.query(sql, [eventName, guildName], (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });

});

app.post('/finishGuildEvent', (req, res) => {
  const { eventName, guildName, eventPhoto } = req.body;

  const sql = "UPDATE `guildevent` SET `isFinished` = ?, `eventPhoto` = ? WHERE `eventName` = ? AND `guildName` = ?";
  const values = [true, eventPhoto, eventName, guildName];

  db.query(sql, values, (err, data) => {
    if (err) {
      console.log(err);
      return res.json(err);
    }
    return res.json("updated");
  });
});

///////////////////////////Guild Member List/////////////////////////////
app.get('/getGuildMemberList', (req, res) => {
  const { guildName } = req.query;

  const sql = "SELECT * FROM `user` WHERE `guildName` = ? ";

  db.query(sql, [guildName], (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
});

app.post('/addFriend', (req, res) => {
  const { requestUserID, acceptUserID } = req.body;

  const sql = "INSERT INTO `friendshipmap`(`requestUserID`, `acceptUserID`, `isAccept`)  VALUES (?)"
  const values = [requestUserID, acceptUserID, false]

  db.query(sql, [values], (err, data) => {
    if (err) {
      console.log(err)
      return res.json(err);
    }
    return res.json("added");
  })

});

app.post('/confirmAddFriend', (req, res) => {
  const { requestUserID, acceptUserID } = req.body;

  const sql = "UPDATE `friendshipmap` SET `isAccept` = ? WHERE `requestUserID` = ? AND `acceptUserID` = ?";
  const values = [true, requestUserID, acceptUserID];

  db.query(sql, values, (err, data) => {
    if (err) {
      console.log(err);
      return res.json(err);
    }
    return res.json("updated");
  });
});

app.get('/getWaitingFriendList', (req, res) => {
  const { userID } = req.query;

  const sql = "SELECT * FROM `friendshipmap` WHERE `acceptUserID` = ? AND `isAccept` = ?";

  const values = [userID, false] //0 = false, mean not accept

  db.query(sql, values, (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
});

app.get('/getWaitingFriendListWithDetail', (req, res) => {
  const { userID } = req.query;

  const sql = "SELECT * FROM `friendshipmap` JOIN `user` ON friendshipmap.requestUserID = user.userID WHERE `acceptUserID` = ? AND `isAccept` = ?";

  const values = [userID, false]; // 0 = false, meaning not accepted

  db.query(sql, values, (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
});

app.get('/getUserFriendList', (req, res) => {
  const { userID } = req.query;

  const sql = "SELECT * FROM `friendshipmap` WHERE `requestUserID` = ? OR `acceptUserID` = ?";

  db.query(sql, [userID, userID], (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
});

app.get('/getFriendListWithDetail', (req, res) => {
  const { userID } = req.query;

  const sql = "SELECT * FROM friendshipmap JOIN user ON friendshipmap.requestUserID = user.userID WHERE acceptUserID = ? AND isAccept = ?";

  const values = [userID, true];

  db.query(sql, values, (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
});

app.get('/getRequestFriendListWithDetail', (req, res) => {
  const { userID } = req.query;

  const sql = "SELECT * FROM friendshipmap JOIN user ON friendshipmap.acceptUserID = user.userID WHERE requestUserID = ? AND isAccept = ?";

  const values = [userID, true];

  db.query(sql, values, (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
});

//confirm 2 known user is friend or not
app.get('/getUserIsFriendWithUser', (req, res) => {
  const { user1ID, user2ID } = req.query;

  const sql = "SELECT * FROM `friendshipmap` WHERE (`requestUserID` = ? AND `acceptUserID` = ? AND `isAccept` = true) OR (`requestUserID` = ? AND `acceptUserID` = ? AND `isAccept` = true)";

  db.query(sql, [user1ID, user2ID, user2ID, user1ID], (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
});



//create new mission
app.post('/createMission', (req, res) => {

  const sql = "INSERT INTO `missionusermap`(`userID`, `isSystem`, `missionName`, `missionDetail`, `missionMode`, `missionDifficulty`, `isFinish`) VALUES (?)"

  const values = [req.body.userID, false, req.body.missionName, req.body.missionDetail, req.body.missionMode, req.body.missionDifficulty, req.body.isFinish]

  db.query(sql, [values], (err, data) => {
    if (err) {
      console.log(err)
      return res.json(err);
    }
    return res.json("added");

  })

});

//check no. of self defined mission
app.get('/getMissionNumByMode', (req, res) => {
  const { userID, missionMode } = req.query;

  const sql = "SELECT count(*) FROM `missionusermap` WHERE `isSystem` = false AND `userID` = ? AND `missionMode` = ?";

  db.query(sql, [userID, missionMode], (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
});

app.get('/getSystemMissionList', (req, res) => {
  const { userID } = req.query;

  const sql = `
    SELECT missionusermap.*, mission.*
    FROM missionusermap
    INNER JOIN mission ON missionusermap.missionID = mission.missionID
    WHERE missionusermap.userID = ? AND missionusermap.isSystem = true`;

  db.query(sql, [userID], (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
});

app.get('/getSelfDefineMissionList', (req, res) => {
  const { userID } = req.query;

  const sql = "SELECT * FROM `missionusermap` WHERE `userID` = ? AND missionusermap.isSystem = false";

  db.query(sql, [userID], (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
});


app.post('/finishMission', (req, res) => {
  const { userID, missionID, missionName, missionMode, missionDifficulty, isSystem, isFinish, missionPhoto, missionLastDate, missionKeepTime } = req.body;

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const formatToday = `${year}-${month}-${day}`;

  let updatedMissionKeepTime = missionKeepTime;

  if (missionLastDate) {
    const lastDate = new Date(missionLastDate);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isYesterday = lastDate.getFullYear() === yesterday.getFullYear() && lastDate.getMonth() === yesterday.getMonth() && lastDate.getDate() === yesterday.getDate();
    const isSameWeek = areDatesInSameWeek(lastDate, today);

    if (missionMode === 'Daily') {
      if (isYesterday) {
        updatedMissionKeepTime += 1;
      } else {
        updatedMissionKeepTime = 1;
      }
    } else if (missionMode === 'Weekly') {
      if (isSameWeek) {
        updatedMissionKeepTime += 1;
      } else {
        updatedMissionKeepTime = 1;
      }
    }
  } else {
    // Handle the case when missionLastDate is empty
    updatedMissionKeepTime = 1;
  }

  let updatedCheckPoint = null;
  const originalCheckPointSql = "SELECT `checkPoint` FROM `user` WHERE `userID` = ?";
  const originalCheckPointValues = [userID];

  db.query(originalCheckPointSql, originalCheckPointValues, (cpErr, cpData) => {
    if (cpErr) {
      console.log(cpErr);
      return res.json(cpErr);
    }

    if (cpData.length === 1) {
      const originalCheckPoint = cpData[0].checkPoint;

      if (missionDifficulty === 'Easy') {
        updatedCheckPoint = originalCheckPoint + updatedMissionKeepTime * 1; //cumulative
      } else if (missionDifficulty === 'Normal') {
        updatedCheckPoint = originalCheckPoint + updatedMissionKeepTime * 2;
      } else if (missionDifficulty === 'Medium') {
        updatedCheckPoint = originalCheckPoint + updatedMissionKeepTime * 3;
      } else if (missionDifficulty === 'Hard') {
        updatedCheckPoint = originalCheckPoint + updatedMissionKeepTime * 4;
      }

      let sql;
      let values;

      if (isSystem === 0) {
        //use mission name
        sql =
          "UPDATE `missionusermap` SET `isFinish` = ?, `missionPhoto` = ?, `missionLastDate` = ?, `missionKeepTime` = ? WHERE `userID` = ? AND `missionName` = ?";
        values = [true, missionPhoto, formatToday, updatedMissionKeepTime, userID, missionName];
      } else {
        //use mission ID
        sql =
          "UPDATE `missionusermap` SET `isFinish` = ?, `missionPhoto` = ?, `missionLastDate` = ?, `missionKeepTime` = ? WHERE `userID` = ? AND `missionID` = ?";
        values = [true, missionPhoto, formatToday, updatedMissionKeepTime, userID, missionID];
      }

      db.query(sql, values, (err, data) => {
        if (err) {
          console.log(err);
          return res.json(err);
        }

        const userSql = "UPDATE `user` SET `checkPoint` = ? WHERE `userID` = ?";
        const userValues = [updatedCheckPoint, userID];

        db.query(userSql, userValues, (userErr, userData) => {
          if (userErr) {
            console.log(userErr);
            return res.json(userErr);
          }
          return res.json("updated");
        });
      });
    } else {
      return res.json("User not found");
    }
  });
});

//Guild Ranking
app.get('/getAllGuildRanking', (req, res) => {
  const sql = "SELECT guild.*, district.*, SUM(user.checkPoint) AS totalCheckPoint FROM `user` JOIN `guild` ON user.guildName = guild.guildName JOIN `district` ON guild.districtID = district.districtID GROUP BY guild.guildName ORDER BY totalCheckPoint DESC";

  db.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
});


//get guild checkPoint
app.get('/getGuildCheckPoint', (req, res) => {
  const { guildName } = req.query;

  const sql = "SELECT SUM(`checkPoint`) AS totalCheckPoint FROM `user` WHERE `guildName` = ?";

  db.query(sql, [guildName], (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
});

//upgrade guild
app.post('/upgradeGuild', (req, res) => {

  const { guildName, level, maxMemberLimit } = req.body;

  const sql = "UPDATE `guild` SET `level` = ? , `maxMemberLimit` = ? WHERE `guildName` = ?";
  const values = [level + 1, maxMemberLimit + 20, guildName];

  db.query(sql, values, (err, data) => {
    if (err) {
      console.log(err);
      return res.json(err);
    }
    return res.json("updated");
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

app.listen(3000, () => {
  console.log("listening");
});