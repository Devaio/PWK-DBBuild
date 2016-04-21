var mongoose = require('mongoose'),
     request = require('request'),
        User = require(__dirname + '/user.js'),
          fs = require('fs'),

                  dbURL = 'mongodb://localhost:27017/gears',
       googleGeoCodeKey = "AIzaSyDgbsbrIWjSmSOoTVOLFAU2b2eHw2lavd8"

var users = JSON.parse(fs.readFileSync(__dirname + '/users.json','utf-8'))

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

// -----------------------------------------------------------------------------
// primary responsibility for dispatching and resolving the chain of functions
// to create each object.  maps a chain of Promise-wrapped asynchronous calls
// onto each element of the users array - parsed from file input.
// returns: array of user objects and/or null values in the case of attempted
// creation of a duplicate user
// -----------------------------------------------------------------------------
function writeUsers(users){
  return Promise.all(
    users.map(function(user){
      return new Promise(function(fulfill,reject){
        var address = user.address.street + ', ' + user.address.city + ', ' +
                      user.address.state + " " + user.address.zip
        geocode(address)
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

// *****************************************************************************
// geocode - helper function, invoked in writeUsers - returns a Promise
// requests geoJSON conversion for a passed address, fulfills coordinate pair
// *****************************************************************************
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

// *****************************************************************************
// userSaver - helper function, invoked in writeUsers - returns a Promise
// saves user to the db, fulfills saved user
// *****************************************************************************
function userSaver(user,geocode){
  return new Promise(function(fulfill,reject){
    var newUser = new User(user)
    newUser.location = {
                          type: 'Point',
                          coordinates: [geocode.location.lng,geocode.location.lat]
                        }
    newUser.save(function(err,user){
      if(err) reject(err)
      fulfill(user)
    })
  })
}
