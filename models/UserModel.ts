import mongoose from "mongoose";
import validator from "validator";
let userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    lowercase: true,
    minLength: 3,
    maxLength: 10,
  },
  last_name: {
    type: String,
    required: true,
    lowercase: true,
    minLength: 3,
    maxLength: 10,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: (value: string) => {
      return validator.isEmail(value);
    },
  },
  gender: {
    required: true,
    type: String,
    enum: ["female", "male"],
  },
  profile_pic_url: {
    type: String,
  },
  date_of_birth: {
    type: Date,
  },
  allergies: [
    {
      name: {
        type: String,
        required:true,
        enum: [
          "soy",
          "wheat derivatives",
          "pistachio",
          "peanut",
          "nuts",
          "marine ingredients",
          "fish",
          "egg",
          "milk",
        ],
      },
    },
  ],

  diseases: [
    {
      name: {
        type: String,
        required:true,
        enum: ["liver", "kidney", "pressure", "diabetes"],
      },
    },
  ],
  weight:{
    type: Number,
  }
  ,
  hight:{
    type: Number,
  }
,
  is_reqUser:{
    type: Boolean,
  },
  is_Nutritionist:{
    type: Boolean,
  }
  ,
  phone_number:[
    {
        country_code:{type:Number,required:true},
        phone_number:{type:Number,required:true},

    }
  ],
  description:{type: String,},
  experience_years:{type:String},
  collage:{type:String,},
  specialization:{type:String,},
  price:{type:Number,}
});

export default mongoose.model("User", userSchema);
