import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import env from "dotenv";
import cors from 'cors'
import multer from "multer";
import validator from 'validator';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { SMTPClient } from 'emailjs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import {Server} from 'socket.io';
import {createServer} from 'http';
import connectPgSimple from 'connect-pg-simple';
import jwt from "jsonwebtoken";
import { isAuth } from "./is-auth.js";
import { bucket } from "./FirebaseAdmin.js";
import cookieParser from "cookie-parser";
import faaceBookStrategy from "passport-facebook";
const app=express();
const httpServer=createServer(app);
const PORT =8000;
const saltRounds = 10;
const io= new Server(httpServer,{
  cors:{
  origin:'https://v-blog-react.onrender.com',
  credentials:true,
  }
});

env.config();

//emailjs parameters
const client = new SMTPClient({
	user: process.env.USER_EMAILJS,
	password: process.env.PASSWORD_EMAILJS_APP_GMAIL,
	host: 'smtp.gmail.com',
	ssl: true,
});



const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const storage=multer.diskStorage({
destination:function(req,file,cb){
  cb(null,'../images');
},
filename:function(req,file,cb){
  cb(null,uuidv4()+"."+file.mimetype.split("/")[1]);
}
});
const filefilter=(req,file,cb)=>{
if(file.mimetype==='image/png'||file.mimetype==='image/jpg'||file.mimetype==='image/jpeg'){
cb(null,true)
}
else{
cb(null,false)
}
}

const db = new pg.Client({
  user:process.env.USER_POSTGRESQL,
  host: process.env.HOST_POSTGRESQL,
  database: process.env.DATABASE_POSTGRESQL,
  password: process.env.PASSWORD_POSTGRESQL,
  port: process.env.PORT_POSTGRESQL,
});
db.connect();
const PgSession = connectPgSimple(session);
app.use(cors({
  origin: 'https://v-blog-react.onrender.com',
  credentials: true,
}));

app.use(
  session({
    store: new PgSession({
      pool: db,
      tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie:{
      secure:true,
      maxAge:1000*60*60*24
    }
  })
);

app.use(express.json());
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/images',express.static(path.join(__dirname,'../images')));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

const upload=multer({storage:storage,fileFilter:filefilter});
//delete old pic function
const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`File deleted: ${filePath}`);
    }
  });
};

async function deleteOldImageFB(oldImageUrl){
  try{
  
const fileName0=oldImageUrl.split('images%').pop().split('?')[0];
const fileName=fileName0.split('').slice(2).join('');
await bucket.file(`images/${fileName}`).delete();
console.log('successfuly ddeleted')
  }
  catch(err){
console.log(`error with deleteing the old image from firebase storage ${err}`);
  }
} 

app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"],
}));

app.get("/auth/google/home",
  passport.authenticate("google", {
    failureRedirect: "https://v-blog-react.onrender.com",
  }),(req,res,next)=>{
    const token=jwt.sign({
      id:req.user.id,
      email:req.user.email
      },process.env.JWT_SECRET,{
        expiresIn:"1d"
      });
  res.redirect(`https://v-blog-react.onrender.com/auth/callback?usertk=${token}`)}
);
app.get("/auth/google/callback/:usertk", (req,res,next)=>{
  const token=req.params.usertk;
  console.log(token);
  
  res.json({ message: 'true',token:token });

});
/*app.get("/auth/facebook", passport.authenticate("facebook", {
  scope: ["public_profile", "email"],
}));
app.get("/auth/facebook/home",
  passport.authenticate("facebook", {
 
    failureRedirect: "https://v-blog-react.onrender.com",
  
  }),(req,res,next)=>{
    console.log(req.user.email)
    console.log(req.user.id)
    const token=jwt.sign({
      email:req.user.email,
    id:req.user.id
    },process.env.JWT_SECRET,{
      expiresIn:"1d"
    });
  //res.cookie("jwt",token,{httpOnly:false,secure:true});
 // console.log(`send cookies is${req.cookies.jwt}`)

  }
);*/
app.get("/api/home",isAuth, async (req, res) => {
  console.log(req.userId);
    const page=parseInt(req.query.page)||1;
    const limit=5;
    const offset=(page-1)*limit;
    try {
      const totalResults=await db.query("SELECT COUNT (*) FROM posts");
      const totalPages = Math.ceil(totalResults.rows[0].count / limit);
      const result = await db.query("SELECT posts.id,post,date,id_post,post_title,first_name,last_name FROM posts JOIN user_info ON posts.id_post=user_info.id  ORDER BY id ASC LIMIT $1 OFFSET $2",[limit,offset]);
      res.json({ post: result.rows, userid: req.userId,totalPages:totalPages });
    }
    catch (err) {
      console.log(err);
    }
});
app.post("/api/reset-password/verify-email",async(req,res)=>{
const {email} =req.body
try{
  const result=await db.query("SELECT email FROM user_info WHERE email=$1",[email]);
  if(result.rows.length > 0){
    const verificationCode = crypto.randomBytes(2).toString('hex');
    try{
  const result= await db.query("UPDATE user_info SET resetcode=$1 WHERE email=$2 ",[verificationCode,email]);
  if(result.rowCount===1){
   
  try{
    client.send(
      {
        text: verificationCode,
        from: 'amr.ft38@gmail.com',
        to: email,
        cc:"",
        subject:'OTP Verification Code',
      },
      (err, message) => {
        if(err!=null){
          console.log(err);
        }
      }
    );
    res.status(200).json({message:"success"});
  }
  catch(err){
    console.log(err);
  }
  }
    }
    catch(err){
  console.log(err);
    }

  }
  else{
   res.json({message:"email not found"}); 
  }
}
catch(err){
  console.log(err);
}
});
app.post("/api/reset-password/verify-otp",async(req,res)=>{
const {otp}=req.body;
const {email} =req.body;
const otpinput=otp.input1+otp.input2+otp.input3+otp.input4

try{
const result=await db.query("SELECT resetcode from user_info WHERE email=$1",[email])
const otpcode=result.rows[0].resetcode;
if(otpinput===otpcode){
res.status(200).json({message:"comparison was successful",data:otpinput});
}
else{
res.json({message:"otp is wrong"})
}
}
catch(err){
console.log(err);
}

});
app.patch('/api/setnewpassword',async(req,res)=>{
  const {otp}=req.body;
  const {email} =req.body;
  const {passwords}=req.body;
  const otpinput=otp.input1+otp.input2+otp.input3+otp.input4;

try{
const result=await db.query("SELECT resetcode FROM user_info WHERE email=$1",[email]);
const resetcode=result.rows[0].resetcode;
if(otpinput===resetcode && passwords.newPassword===passwords.cfnewPassword){
bcrypt.hash(passwords.newPassword,saltRounds,async(err,hash)=>{
if(err){
  console.error("Error hashing password:", err);
}
else{
try{
await db.query("UPDATE user_info SET password=$1,resetcode=$2 WHERE email=$3",[hash,null,email]);

res.status(200).json({message:"Changed successfully"});


} 
catch(err){
console.log(err);
}
}
})
}
else{
res.json({message:"Some thing wrong"});
}
}
catch(err){
console.log(err);
}
});

app.get("/api/bar",isAuth, async (req, res) => {
  try {
    const result = await db.query("SELECT first_name,last_name FROM user_info WHERE id=$1", [req.userId]);
    res.json({ fullname: result.rows[0] });
  }
  catch (err) {
console.log(err);
  }
});
app.get("/api/search/:text",isAuth, async (req, res) => {
    res.json({ message: "true" });
});
app.get("/api/profile/pic",isAuth,async(req,res)=>{
  try{
    const result=await db.query("SELECT image FROM user_info WHERE id=$1",[req.userId])
    
    res.json({message:result.rows[0]});
    }
    catch(err){
    console.log(err);
    }
}
);

app.get("/api/profile/:id",isAuth, async (req, res) => {
  const id = req.params.id;
 
    const page=parseInt(req.query.page)||1;
    const limit=5;
    const offset=(page-1)*limit;
    try{
      const totalResults=await db.query("SELECT COUNT (*) FROM posts WHERE id_post=$1",[id]);
      const totalPages = Math.ceil(totalResults.rows[0].count / limit);
      const result = await db.query("SELECT posts.id,post,date,id_post,post_title,first_name,last_name FROM posts JOIN user_info ON posts.id_post = user_info.id WHERE posts.id_post= $1 ORDER BY id ASC LIMIT $2 OFFSET $3", [id,limit,offset]);
      res.json({ post: result.rows,totalPages:totalPages });
    }
    catch(err){
      console.log(err);
    }
});
app.get("/api/result/:text",isAuth, async (req, res) => {
  const text = req.params.text;
 
    const page=parseInt(req.query.page)||1;
    const limit=5;
    const offset=(page-1)*limit;
    try {
      const totalResults=await db.query("SELECT COUNT (*) FROM posts  WHERE LOWER (post) LIKE '%' || $1 || '%' OR LOWER(post_title) LIKE '%' || $1 || '%';", [text.toLowerCase()]);
      const totalPages = Math.ceil(totalResults.rows[0].count / limit);
      const result = await db.query("SELECT post,post_title,date,first_name,last_name,id_post FROM posts JOIN user_info ON posts.id_post=user_info.id WHERE LOWER (post) LIKE '%' || $1 || '%' OR LOWER(post_title) LIKE '%' || $1 || '%' LIMIT $2 OFFSET $3", [text.toLowerCase(),limit,offset]);
      if (result.rows.length <= 0) {
        res.json({ post: "not found any match" });
      }
      else {
        res.json({ post: result.rows,totalPages:totalPages });
      }
    }
    catch (err) {
      console.log(err);
    }
});
app.delete("/api/delete/:id", isAuth,async (req, res) => {
    try {
      const result = await db.query("DELETE FROM posts WHERE id=$1 AND id_post=$2", [req.params.id, req.userId]);
      console.log(result.rowCount);
      if (result.rowCount == 0) {
        res.json({ message: "0" });
      }
      else {
        io.emit('posts',{action:'delete',post:req.params.id})
        res.json({ message: "post is deleted" });
      }
    }
    catch (err) {
      console.log(err);
    }
});
app.get("/api/edit/:id", isAuth,async (req, res) => {
  const id = req.params.id;
  
    try {
      const post = await db.query("SELECT * FROM posts WHERE id=$1 AND id_post=$2", [id, req.userId]);
      const targetPost = post.rows[0];
     
      if (targetPost == undefined) {
        res.json({ post: "NOT MATCH" })
      }
      else {
        res.json({ post: targetPost });
      }
    }
    catch (err) {
      console.log(err);
    }
});
app.patch("/api/edit/:id", isAuth,async (req, res) => {
  const id = req.params.id;
  const { postTitle, postContent } = req.body;
  const dateString = new Date().toLocaleDateString('en-GB').split('/').join('/');

    if(validator.isLength(postTitle,{min:3,max:20})&& !validator.isEmpty(postContent)){
      try {
        const result0 = await db.query("UPDATE posts SET (post,post_title,date)=($1,$2,$4) WHERE id=($3) RETURNING * ", [postContent, postTitle, id, dateString]);
        const result1=await db.query("SELECT first_name,last_name FROM user_info WHERE id=$1",[req.userId]);
        const Result1=result1.rows[0];
        const Result0=result0.rows[0];
    const Result={...Result0,...Result1};
        io.emit('posts',{action:'update',post:Result})
        res.json({ message: "done" });
      }
      catch (err) {
        console.log(err);
      }
    }
  else{
  res.json({message:"title char should be between 3 and 20"})
  }
});

app.post("/api/upload",isAuth,/*upload.single('profilePic'),*/async(req,res)=>{
  /*if(!req.file){
return res.status(400).json({error:"no file uploaded"});
    }
 try{
const result=await db.query("SELECT image FROM user_info WHERE id=$1",[req.user.id]);
if(result.rows[0].image!=null){
  const oldImagePath=result.rows[0].image;
  if (oldImagePath && fs.existsSync(oldImagePath)) {
    deleteFile(oldImagePath);
  }
}
 }
 catch(err){
  console.log(err);
 }
const imageurl=req.file.path;
    console.log(imageurl);*/
    const {url}=req.body;
    try{
      const result=await db.query("SELECT image from user_info WHERE id=$1",[req.userId]);
      const oldImageUrl=result.rows[0].image;
      if(oldImageUrl!=null){
        deleteOldImageFB(oldImageUrl)
      }
        try{
          const result=await db.query("UPDATE user_info SET image=$1 WHERE id=$2",[url,req.userId]);
          res.json({message:"upload completed"})
          }
          catch(err){
          console.log(err);
          }
      }
      catch(err){
        console.log(err);
      }
});

app.get("/api/upload",isAuth,async(req,res)=>{
res.json({message:"true"})
})

app.post("/api/post/edit",isAuth, async (req, res) => {
  const [id] = req.body;
    try {
      res.json({ message: "true", id: id.id })
    }
    catch (err) {
      console.log(err);
    }
});
app.get("/api/newpost",isAuth, (req, res) => {
  console.log(`the id for newpost user:${req.userId}`);
    res.json({ message: "true", id:req.userId });
});

app.post(
  "/api/login",
  passport.authenticate("local"), (req, res) => {
    console.log(req.isAuthenticated());
    console.log(req.user.email);
    console.log(req.user.id);
    const token=jwt.sign({
      email:req.user.email,
    id:req.user.id
    },process.env.JWT_SECRET,{
      expiresIn:"1d"
    });
    res.json({ message: 'true',token:token });
  });

app.patch("/api/updatepassword", isAuth,async (req, res) => {
    const { oldPassword, newPassword, cfnewPassword } = req.body;

    try {
      if (newPassword === cfnewPassword) {
        bcrypt.hash(newPassword, saltRounds, async (err, hash) => {
          if (err) {
            console.error("Error hashing password:", err);
          }
          else {
            const result = await db.query("SELECT password FROM user_info WHERE id=$1", [req.userId]);
            const storedHashedPassword = result.rows[0].password;
            bcrypt.compare(oldPassword, storedHashedPassword, (err, valid) => {
              if (err) {
                //Error with password check
                console.error("Error comparing passwords:", err);
                return err;
              } else {
                if (valid) {
                  //pass password check
                  try {
                    db.query("UPDATE user_info SET password=$1 WHERE id=$2", [hash, req.userId]);
                  }
                  catch (err) {
                    console.log(err);
                  }
                  res.json({ message: "changing password is complete" });
                } else {
                  //Did not pass password check
                 res.json({message:"invaild password"});
                }
              }
            });
          }
        });

      }
      else {
        res.json({ message: "doesn't match" })
      }
    }
    catch (err) {
      console.log(err);
    }
});

app.patch("/api/updatename", isAuth,async (req, res) => {
    const { newfname, newlname } = req.body;
    try {
      const result = await db.query("UPDATE user_info SET (first_name,last_name)=($1,$2) WHERE id=($3)", [newfname, newlname, req.userId])
      res.json({ message: "done" });
    }
    catch (err) {
      console.log(err);
    }
});
app.get("/api/my-page", isAuth,async (req, res) => {
    const page=parseInt(req.query.page)||1;
    const limit=5;
    const offset=(page-1)*limit;
    try {
      const totalResults=await db.query("SELECT COUNT (*) FROM posts WHERE id_post=$1",[req.userId]);
      const totalPages = Math.ceil(totalResults.rows[0].count / limit);
      const result = await db.query("SELECT posts.id,post,date,id_post,post_title,first_name,last_name FROM posts JOIN user_info ON posts.id_post = user_info.id WHERE posts.id_post= $1 ORDER BY id ASC LIMIT $2 OFFSET $3", [req.userId,limit,offset]);
      res.json({ data: result.rows, message: "true", userid: req.userId,totalPages:totalPages  });
    }
    catch (err) {
      console.log(err);
    }
});
app.get("/api/logout", (req, res) => {
  req.logout(async function (err) {
    if (err) {
    console.log(err);
    }
    res.clearCookie("jwt")
    await db.query("DELETE FROM session WHERE expire<NOW()")
    res.json({ message: "logout" });
   
  });
});
app.post("/api/posting", isAuth,async (req, res) => {
  
    const { postTitle, postContent } = req.body;
    const dateString = new Date().toLocaleDateString('en-GB').split('/').join('/');
    if(validator.isLength(postTitle,{min:3,max:20})){
      if(!validator.isEmpty(postContent)){

   
      try {
        const result0= await db.query("INSERT INTO posts (post_title,post,id_post,date) VALUES ($1,$2,$3,$4) RETURNING * ", [postTitle, postContent,req.userId, dateString]);
        const result1=await db.query("SELECT first_name,last_name FROM user_info WHERE id=$1",[req.userId]);
        const Result1=result1.rows[0];
        const Result0=result0.rows[0];
    const Result={...Result0,...Result1};
        io.emit('posts',{action:'create',post:Result});
        res.json({ message: "done" });
          
        }
        catch (error) {
          console.log(error);
        }
    }
    else{
    res.json({message:"content shouldn't be null"})
    }
  }

else{
  res.json({message:"char should be between 3 and 20"})
}
});
app.post("/api/signup", async (req, res) => {
  const { fname, lname, email, password, confirmPassword } = req.body;
 
  if (password === confirmPassword&&validator.isAlphanumeric(password)&&validator.isLength(password,{min:6,max:12})) {
    if(validator.isEmail(email)){
    try {
      const checkResult = await db.query("SELECT * FROM user_info WHERE email = $1", [
        email,
      ]);
      if (checkResult.rows.length > 0) {
        console.log("email is already exist")
        res.json({ message: "email is already exist" });
      }
      else {
        bcrypt.hash(password, saltRounds, async (err, hash) => {
          if (err) {
            console.error("Error hashing password:", err);
          }
          else {
            const result = await db.query(
              "INSERT INTO user_info (email,password,first_name,last_name) VALUES ($1,$2,$3,$4) RETURNING *", [email, hash, fname, lname]

            );
            const user = result.rows[0];
            
const token=jwt.sign({
  email:email,
id:result.rows[0].id.toString()
},process.env.JWT_SECRET,{
  expiresIn:"1d"
});
res.json({ message: "success" ,token:token});
            req.login(user, (err) => {
           
             

            });
          }
        });

      }

    }
    catch (err) {
      res.status(500).json({ message: "error with sign up" })
    }
  }
  else{
    res.json({message:"invalid email"})
  }
}
  else {
    res.json({ message: "password invalid" })
  }
});

passport.use("local",
  new Strategy(async function verify(username, password, cb) {
    try {
      console.log(username);
      const result = await db.query("SELECT * FROM user_info WHERE email = $1 ", [
        username
      ]);
      console.log(result.rows[0]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            //Error with password check
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else {
            if (valid) {
             
              //Passed password check
              return cb(null, user);
            } else {
              //Did not pass password check
             
              return cb(null, false);
            }
          }
        });
      } else {
        return cb("User not found");
      }
    } catch (err) {
      console.log(err);
    }
  })
);
passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://v-blog-4grx.onrender.com/auth/google/home",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        console.log(profile);
        const result = await db.query("SELECT * FROM user_info WHERE email = $1", [
          profile.email,
        ]);
        if (result.rows.length === 0) {
          const newUser = await db.query(
            "INSERT INTO user_info (email, password ,first_name ,last_name) VALUES ($1,$2,$3,$4)  RETURNING * ",
            [profile.email, "google", profile.given_name, profile.family_name]
          );
          return cb(null, newUser.rows[0]);
        } else {
          return cb(null, result.rows[0]);
        }
      } catch (err) {
        return cb(err);
      }
    }
  )
);

/*passport.use(
  "facebook",
  new faaceBookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: "https://v-blog-4grx.onrender.com/auth/facebook/home",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        console.log(profile);
        const result = await db.query("SELECT * FROM user_info WHERE email = $1", [
          profile.email,
        ]);
        if (result.rows.length === 0) {
          const newUser = await db.query(
            "INSERT INTO user_info (email, password ,first_name ,last_name) VALUES ($1,$2,$3,$4)  RETURNING * ",
            [profile.email, "facebook", profile.given_name, profile.family_name]
          );
          return cb(null, newUser.rows[0]);
        } else {
          return cb(null, result.rows[0]);
        }
      } catch (err) {
        return cb(err);
      }
    }
  )
);
*/
passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {

 
  cb(null, user);
});

httpServer.listen(PORT, () => {
  console.log(`the srever is runing on the port ${PORT}`);
})
