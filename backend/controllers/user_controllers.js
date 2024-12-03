const User = require('../models/user_model')
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
require('dotenv').config()
const Techs = require('../models/TechnologiesModel')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

exports.CreateUser = async (req, res) => {
    try {
        const { password, confirm_password } = req.body;
        if (password !== confirm_password) {
            return res.status(500).json({ error: 'password do not match' })
        }
        const user = new User(req.body)
        await user.save();
        res.status(200).json({message :"user created succesfully " , user})
    } catch (error) {
        res.status(500).json({error});
    }
}

exports.loginController = async (req,res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: 'user not found create account' })
        } else {
            const hashedpassword = user.password
            const ismatched = await bcrypt.compare(password, hashedpassword)
            if (!ismatched) {
                return res.status(401).json({ erreur: 'wrong password please try again' })
            } else {
                const token = jwt.sign({ userId: user._id}, process.env.SECRET_KEY, { expiresIn: '1d' });
                // res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
                return res.json({user: {user_id : user._id ,username: user.username, token: token } })
            }
        }
    }
    catch (err) {
        (err) => {
        res.status(500).json({ err })
        }
    }
}

exports.UpdaetUserController = async(req, res) => {
    try {
        const {  username ,name, email , birth_date , gender , phone_number} = req.body;
        const user = req.user;
        if(user._id.toString() !== req.params.user_id){
            return res.status(401).json({error : "not autorized"}) 
        }
        existinaccount = await User.findById(req.params.user_id)
        if (!existinaccount) {
            return res.status(404).json({ error: 'user not found' })
        }
        const existingMail = await User.findOne({email : email})
        if (existingMail && existingMail._id.toString() !== req.params.user_id) {
            return res.status(400).json({ error: 'email already used , change it ' })
        }
        const existingUsername = await User.findOne({username : username})
        if(existingUsername && existingUsername._id.toString() !== req.params.user_id){
            return res.status(400).json({ error: 'username already used , change it ' })
        }
        const usertoupdate = await User.findByIdAndUpdate(req.params.user_id, {
            $set: {
                name: name,
                username : username,
                email: email,
                birth_date: birth_date,
                gender : gender,
                phone_number : phone_number,
                // password: await bcrypt.hash(password, 10)
            }
        }, { new: true }).select("-password")
        res.status(200).json({ message: 'user has been updated succesfully', user: usertoupdate });


    }
    catch (err) {
        (err) => {
            res.status(500).json({ err })
        }
    }
}

exports.GetUserProfile = async (req,res) => {
try {
    const user = req.user;
    const user_id = req.params.user_id
    if(user._id.toString() !==user_id){
        return res.status(401).json({error : "not autorized"}) 
    }
    const userprofile = await User.findOne({ _id: user_id }).select("-password");
    if (!userprofile) {
        return res.status(404).json({ error: 'user not found' })
    }
    if (!userprofile.image) {
        var image_path = ""
    }else{
        var image_path = path.join(__dirname, 'uploads', userprofile.image)
    }
    return res.status(200).json({ userprofile , user_image : image_path })
} catch (error) {
    res.status(500).json({ error })
}
}

exports.deleteprofile = async (req, res) => {   
    try {
        const user_id = req.params.user_id
        const user = req.user;
        if(user._id.toString() !==user_id){
            return res.status(401).json({error : "not autorized"}) 
        }
        const usertodelete = await User.findByIdAndDelete(user_id)
        if (!usertodelete) {
            return res.status(404).json({ error: 'user not found' })
        }
        const imagepath = path.resolve(__dirname, '../uploads', usertodelete.image)
        if (imagepath){
            fs.unlinkSync(imagepath , (err) => {
                if (err) {
                    return res.status(500).json({ error: err })
                }
            }
            )
        }
        return res.status(200).json({ message: 'user has been deleted succesfully' })
    } catch (error) {
        res.status(500).json({ error })
    }
}

exports.GetTechs = async (req, res) => {
    try {
           
        const techs = await Techs.find()
        if (!techs.length) {
            return res.status(500).json({ error: 'no techs found' })
        }
        return res.status(200).json({ techs })
    } catch (error) {
        console.log("error")
        res.status(501).json({ error: error })
    }
}

exports.GetTechDetail = async (req,res) => {
    try {
        const tech_id = req.params.tech_id
        console.log(tech_id);
        const tech = await Techs.findById(tech_id)
        if (!tech) {
            return res.status(500).json({ error: 'no tech found' })
        }
        return res.status(200).json({ tech })
    } catch (error) {
        console.log(error.message);
        
    }
}

exports.Search = async(req , res) => {
    try {
        const {querry} = req.body
        const tech = await Techs.find({title : querry.toLowerCase()}).select("-description -category")
        if (!tech.length) {
            return res.status(500).json({ error: 'no tehcnology found' })
        }
        return res.status(200).json({ "technology": tech[0] })
    } catch(error){
        res.status(500).json({ "error": error.message })
    }
    
}

exports.askAI = async (req, res) => {
    return res.json({ message: 'AI is not available yet' })
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null,path.resolve(__dirname, '../uploads'));
    },
    filename: function (req, file, cb) {
      cb(null, `${req.params.user_id}${path.extname(file.originalname)}`);
    },
  });
exports.upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 }, // 10MB limit
    fileFilter: function (req, file, cb) {
      const fileTypes = /jpeg|jpg|png/;
      const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = fileTypes.test(file.mimetype);
  
      if (extname && mimetype) {
        return cb(null, true);
      } else {
        cb(new Error('Only images are allowed'));
      }
    },
  });


exports.uploadImage = async (req, res) => {
try {
    const user_id = req.params.user_id
    const user = req.user
        if (!req.file) {
        return res.status(400).json({ error: 'please upload an image' })
    }
    if (user._id.toString() !== user_id) {
        return res.status(401).json({ error: "not autorized" })
    }
      const usertoupload = await User.findByIdAndUpdate(user_id , {
        $set: {
            image: `${user_id}${path.extname(req.file.originalname)}`
        }  } , {new : true }).select("-password")
        const image_path = path.join(__dirname, 'uploads', usertoupload.image)

    return res.status(200).json({ message: 'image uploaded succesfully', user: usertoupload , user_image : image_path })
         
} catch (error) {
    return res.status(500).json({ error: error.message })
}
}
