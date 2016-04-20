var mongoose = require('mongoose'),
      Schema = require('mongoose').Schema

userSchema = new Schema({
  username : {type:String, required:true, unique:true},
  password : {type:String, required:true},
  name     : {type:String, required:true},
  phone    : {type:String, required:true},
  email    : {type:String, required:true, unique:true},
  address  : {
                street : {type:String, required:true},
                city   : {type:String, required:true},
                zip    : {type:String, required:true}
              },
  location : {
                type: {type:String, default:'Point'},
                coordinates : [{type:Number}]
              },
  userGear : [{ type: Schema.Types.ObjectId, ref: 'Gear' }]
})

userSchema.index({location:'2dsphere'})

module.exports = mongoose.model('user',userSchema)
