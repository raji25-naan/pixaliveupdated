const Register = require("../../models/Admin/register");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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