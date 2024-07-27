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

const app=express();
const httpServer=createServer(app);
const PORT =8000;
const saltRounds = 10;
const io= new Server(httpServer,{
  cors:{
  origin:'http://localhost:3000',
  }
});

env.config();

//emailjs متغيرات
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
  origin: 'http://localhost:3000',
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
    saveUninitialized: true,
  })
);

app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/images',express.static(path.join(__dirname,'../images')));
app.use(passport.initialize());
app.use(passport.session());


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



app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"],
}));

app.get("/auth/google/my-page",
  passport.authenticate("google", {
    successRedirect: "http://localhost:3000/my-page",
    failureRedirect: "http://localhost:3000",

  })
);
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
        cc: 'else <else@your-email.com>',
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
const result=await db.query("UPDATE user_info SET password=$1,resetcode=$2 WHERE email=$3",[hash,null,email]);

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
app.get("/api/home", async (req, res) => {
  if (req.isAuthenticated() === true) {
    const page=parseInt(req.query.page)||1;
    const limit=5;
    const offset=(page-1)*limit;
    try {
      const totalResults=await db.query("SELECT COUNT (*) FROM posts");
      const totalPages = Math.ceil(totalResults.rows[0].count / limit);
      const result = await db.query("SELECT posts.id,post,date,id_post,post_title,first_name,last_name FROM posts JOIN user_info ON posts.id_post=user_info.id  ORDER BY id ASC LIMIT $1 OFFSET $2",[limit,offset]);
      res.json({ post: result.rows, userid: req.user.id,totalPages:totalPages });
    }
    catch (err) {
      console.log(err);
    }

  }
  else {
    res.json({ message: "false" });
  }
});
app.get("/api/bar", async (req, res) => {
if(req.isAuthenticated()===true){
  try {
    const result = await db.query("SELECT first_name,last_name FROM user_info WHERE id=$1", [req.user.id]);
    res.json({ fullname: result.rows[0] });

  }
  catch (err) {
console.log(err);
  }
}



});
app.get("/api/search/:text", async (req, res) => {
  if (req.isAuthenticated() === true) {
    res.json({ message: "true" });
  }
  else {
    res.json({ message: "false" });
  }
});
app.get("/api/profile/pic",async(req,res)=>{
if(req.isAuthenticated()===true){
  try{
    const result=await db.query("SELECT image FROM user_info WHERE id=$1",[req.user.id])
    
    res.json({message:result.rows[0]});
    }
    catch(err){
    console.log(err);
    }
}
});

app.get("/api/profile/:id", async (req, res) => {
  const id = req.params.id;
  if (req.isAuthenticated() === true) {
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
  
  }
  else {
    res.json({ message: "false" });
  }
});
app.get("/api/result/:text", async (req, res) => {
  const text = req.params.text;
  if (req.isAuthenticated() === true) {
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
  }
  else {
    res.json({ message: "false" });
  }
});
app.delete("/api/delete/:id", async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const result = await db.query("DELETE FROM posts WHERE id=$1 AND id_post=$2", [req.params.id, req.user.id]);
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
  }
  else {
res.json({message:"not auth"});
  }

});
app.get("/api/edit/:id", async (req, res) => {
  const id = req.params.id;
  if (req.isAuthenticated() === true) {
    try {
      const post = await db.query("SELECT * FROM posts WHERE id=$1 AND id_post=$2", [id, req.user.id]);
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
  }
  else {
    res.json({ message: "Not authenticated" })
  }

});
app.patch("/api/edit/:id", async (req, res) => {
  const id = req.params.id;
  const { postTitle, postContent } = req.body;
  const dateString = new Date().toLocaleDateString('en-GB').split('/').join('/');

  if (req.isAuthenticated() === true) {
    if(validator.isLength(postTitle,{min:3,max:20})&& !validator.isEmpty(postContent)){
      try {
        const result0 = await db.query("UPDATE posts SET (post,post_title,date)=($1,$2,$4) WHERE id=($3) RETURNING * ", [postContent, postTitle, id, dateString]);
        const result1=await db.query("SELECT first_name,last_name FROM user_info WHERE id=$1",[req.user.id]);
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
  }
  else {
    res.json({ message: "Not authenticated" });
  }
});

app.post("/api/upload",/*upload.single('profilePic'),*/async(req,res)=>{
if(req.isAuthenticated()===true){
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
    console.log(url);
    try{
    const result=await db.query("UPDATE user_info SET image=$1 WHERE id=$2",[url,req.user.id]);

    }
    catch(err){
    console.log(err);
    }
}
else{
res.status(401).json({message:"not authenticated"});
}

});

app.get("/api/upload",async(req,res)=>{
if(req.isAuthenticated()===true){
res.json({message:"true"})
}
else{
res.json({message:"not authenticated"})
}
})

app.post("/api/post/edit", async (req, res) => {
  const [id] = req.body;
 

  if (req.isAuthenticated() === true) {
    try {
      res.json({ message: "true", id: id.id })
    }
    catch (err) {
      console.log(err);
    }
  }
  else {
    res.json({ message: "false" });
  }
});
app.get("/api/newpost", (req, res) => {
  if (req.isAuthenticated() === true) {
    res.json({ message: "true", id: req.user.id });
  }
  else {
    res.json({ message: "false" });
  }
});

app.post(
  "/api/login",
  passport.authenticate("local"), (req, res) => {
    res.json({ message: 'true' });
  });

app.patch("/api/updatepassword", async (req, res) => {
  if (req.isAuthenticated() === true) {
    const { oldPassword, newPassword, cfnewPassword } = req.body;

    try {
      if (newPassword === cfnewPassword) {
        bcrypt.hash(newPassword, saltRounds, async (err, hash) => {
          if (err) {
            console.error("Error hashing password:", err);
          }
          else {
            const result = await db.query("SELECT password FROM user_info WHERE id=$1", [req.user.id]);
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
                    db.query("UPDATE user_info SET password=$1 WHERE id=$2", [hash, req.user.id]);
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
  }
  else {
    res.json({ message: "Not authenticated" });
  }
});

app.patch("/api/updatename", async (req, res) => {
  if (req.isAuthenticated() === true) {
    const { newfname, newlname } = req.body;
    try {
      const result = await db.query("UPDATE user_info SET (first_name,last_name)=($1,$2) WHERE id=($3)", [newfname, newlname, req.user.id])
      res.json({ message: "done" });
    }
    catch (err) {
      console.log(err);
    }
  }
  else {
    res.json({ message: "Not authenticated" })
  }

});
app.get("/api/my-page", async (req, res) => {
  if (req.isAuthenticated() === true) {
    const page=parseInt(req.query.page)||1;
    const limit=5;
    const offset=(page-1)*limit;
    try {
      const totalResults=await db.query("SELECT COUNT (*) FROM posts WHERE id_post=$1",[req.user.id]);
      const totalPages = Math.ceil(totalResults.rows[0].count / limit);
      const result = await db.query("SELECT posts.id,post,date,id_post,post_title,first_name,last_name FROM posts JOIN user_info ON posts.id_post = user_info.id WHERE posts.id_post= $1 ORDER BY id ASC LIMIT $2 OFFSET $3", [req.user.id,limit,offset]);
      res.json({ data: result.rows, message: "true", userid: req.user.id,totalPages:totalPages  });
    }
    catch (err) {
      console.log(err);
    }
  }
  else {
    res.json({ message: "false" });
  }
});
app.get("/api/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.json({ message: "logout" });
    console.log(req.isAuthenticated());
  });
});
app.post("/api/posting", async (req, res) => {
  if (req.isAuthenticated() === true) {
    const { postTitle, postContent } = req.body;
    const dateString = new Date().toLocaleDateString('en-GB').split('/').join('/');
    if(validator.isLength(postTitle,{min:3,max:20})){
      if(!validator.isEmpty(postContent)){

   
      try {
        const result0= await db.query("INSERT INTO posts (post_title,post,id_post,date) VALUES ($1,$2,$3,$4) RETURNING * ", [postTitle, postContent, req.user.id, dateString]);
        const result1=await db.query("SELECT first_name,last_name FROM user_info WHERE id=$1",[req.user.id]);
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
  }
  else {
    res.json({ message: "false" });
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

            req.login(user, (err) => {
           
              res.json({ message: "success" });

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
      callbackURL: "http://localhost:8000/auth/google/my-page",
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

passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {

 
  cb(null, user);
});

httpServer.listen(PORT, () => {
  console.log(`the srever is runing on the port ${PORT}`);
})
