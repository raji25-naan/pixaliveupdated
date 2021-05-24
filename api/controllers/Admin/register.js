const Register = require("../../models/Admin/register");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Users = require("../../models/User/Users");

exports.signup = async(req,res) => {
console.log(1);
    let {username,email,password,country_code,phone} = req.body;
    const data = new Register({
        username : username,
        email : email,
        password : bcrypt.hashSync(password,12),
        country_code : country_code,
        phone : phone,
        created_At : Date.now()
    });
    const save = await data.save();
    return res.send(save);
}

//login
exports.login = async (req, res, next) => {
    try {
      let { username, password } = req.body;
      const data = await Register.findOne({ username}).exec();
      if (data) {
        const matched = await bcrypt.compare(password, data.password);
        if (!matched) {
          return res.json({
            success: false,
            message: "Invalid credentials!",
          });
        } else {
          const payload = {
            user: {
              id: data._id,
            },
          };
          const token = jwt.sign(payload, process.env.JWT_KEY, {
            expiresIn: "90d",
          });
          if (token) {
            return res.json({
              success: true,
              result: { data, token: token },
              message: "you have logged in successfully",
            });
          }
        }
      } else {
        return res.json({
          success: false,
          message: "you are not registered with us!",
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: "Error occured!",
      });
    }
  };

  exports.getAllUsers = async(req,res,next)=>{

    try 
    {
      let getUserInfo = await Users.find({
        $or:[{isActive:true},{isActive:false}]
      },
        {_id:1,avatar:1,username:1,first_name:1,last_name:1,phone:1,email:1,isActive:1}).exec();
      if(getUserInfo.length>0)
      {
        return res.json({
          success : true,
          result : getUserInfo
        })
      }
      else
      {
        return res.json({
          success : false,
          result : "No data found"
        })
      }
    } 
    catch (error) {
      return res.json({
        success: false,
        message: "Error occured!",
      });
    }
  }

  exports.activateUser = async(req,res,next)=>{

    try
    {
      const updateactivate = await Users.updateOne(
        {_id : req.body.userId},
        {
          $set : {isActive : true}
        },
        {new : true}
      );
      if(updateactivate)
      {
        return res.json({
          success : true,
          result : "Successfully Activated"
        })
      }
    }
    catch(error)
    {
      return res.json({
        success: false,
        message: "Error occured!",
      });
    }
  }

  exports.deactivateUser = async(req,res,next)=>{

    try
    {
      const updateDeactivate = await Users.updateOne(
        {_id : req.body.userId},
        {
          $set : {isActive : false}
        },
        {new : true}
      );
      if(updateDeactivate)
      {
        return res.json({
          success : true,
          result : "Successfully Deactivated"
        })
      }
    }
    catch(error)
    {
      return res.json({
        success: false,
        message: "Error occured!",
      });
    }
  }

exports.getUserDetail = async(req,res,next)=> {

  try
  {
    const getUserInfo = await Users.findOne({_id:req.body.userId},
      {_id:1,avatar:1,username:1,first_name:1,last_name:1,phone:1,email:1,country_code:1}).exec();
    if(getUserInfo)
    {
      {
        return res.json({
          success : true,
          result : getUserInfo,
          message: "Fetched successfully"
        })
      }
    }

  }
  catch(error)
  {
    return res.json({
      success: false,
      message: "Error occured!"+error
    });
  }
}