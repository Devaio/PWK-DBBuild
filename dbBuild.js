var mongoose = require('mongoose'),
     request = require('request'),
        User = require(__dirname + '/user.js'),
          fs = require('fs'),

                  dbURL = 'mongodb://localhost:27017/gears',
       googleGeoCodeKey = "AIzaSyDgbsbrIWjSmSOoTVOLFAU2b2eHw2lavd8"

var users = JSON.parse(fs.readFileSync(__dirname + '/users.json','utf-8'))

// DB Initialization
mongoose.connect(dbURL, function(err){
  if(err)  console.log("!- Failed to connect to gears db.")
  if(!err) console.log("-- Connected to gears db.")
})
.then(writeUsers.bind(null,users))
.then(function(output){
  var success=0,
      failure=0
  output.forEach(function(user){
    if(user===null) failure++
    if(user!==null) success++
  })
  console.log("-- Succeeded in adding " + success +  " users to the db.")
  console.log("!- Failed to add " + failure + " users to the db.")
  console.log("-- Closing gears db connection.")
  mongoose.connection.close()
})

function writeUsers(users){
  return Promise.all(
    users.map(function(user){
      return new Promise(function(fulfill,reject){
        geocode(user.address.street + ', ' + user.address.city + ', ' + user.address.state + " " + user.address.zip)
        .then(userSaver.bind(null,user))
        .then(function(user){
          fulfill(user)
        })
        .catch(function(){
          fulfill(null)
        })
      })
    })
  )
}

function geocode(address){
  return new Promise(function(fulfill,reject){
    request('https://maps.googleapis.com/maps/api/geocode/json?' +
              'address=' + encodeURIComponent(address) +
              '&key=' + googleGeoCodeKey
              ,function(err,res){
                if(!err) fulfill(JSON.parse(res.body).results[0].geometry)
                if(err) reject(err)
              })
  })
}

function userSaver(user,geocode){
  return new Promise(function(fulfill,reject){
    var newUser = new User(user)
    newUser.location = {
                          coordinates: [geocode.location.lng,geocode.location.lat]
                        }
    newUser.save(function(err,user){
      if(err) reject(err)
      fulfill(user)
    })
  })
}
