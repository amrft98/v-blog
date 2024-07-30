import jwt from "jsonwebtoken";
import express from 'express';
import cookieParser from "cookie-parser";
const app = express();
app.use(express.json());
app.use(cookieParser());
export const isAuth= app.use((req, res, next)=> {
    
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      const error = new Error('Not authenticated.');
      error.statusCode = 401;
      throw error;
    }
    let token ;
    token= authHeader.split(' ')[1];
    console.log(`req cookie is${req.cookies.jwt}`)
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
    next();
  });
  