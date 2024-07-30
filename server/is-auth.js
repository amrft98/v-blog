import jwt from "jsonwebtoken";
import express from 'express';
import cookieParser from "cookie-parser";
import cors from 'cors'
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'https://v-blog-react.onrender.com',
  credentials: true,
}));
export const isAuth= app.use((req, res, next)=> {
  
    const authHeader = req.get('Authorization');
    console.log(authHeader);
    if (!authHeader) {
      const error = new Error('Not authenticated.');
      error.statusCode = 401;
      throw error;
    }
    let token ;
    token= authHeader.split(' ')[1];
  
   
if(token==="null"){
token=req.cookies.jwt;
}
console.log(token);
    let decodedToken;
    try {
      decodedToken = jwt.verify(token,process.env.JWT_SECRET);
    } catch (err) {
        console.log(err);
        err.statusCode = 401;
        throw err;
    }
    if (!decodedToken) {
      const error = new Error('Not authenticated.');
      error.statusCode = 401;
      throw error;
    }
    req.userId = decodedToken.id;
    console.log("check if req userid is work",req.userId);
    next();
  });
  