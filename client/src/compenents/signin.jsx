import React ,{useState,useContext} from "react";
import {useNavigate} from 'react-router-dom'
import './signin.css';
import axios from "axios";
import { AuthContext } from "./authContext";
function SignIn(){
  const [logindata, setlogin] = useState({
username:'',
password:'',
  });
  const  [message,setmessage]=useState("");
  const [anothermessage,setanothermessage]=useState("");
  const {setToken}=useContext(AuthContext);
  function handleChange (e) {
    const { name, value } = e.target;
    setlogin({ ...logindata, [name]: value });
  }
  const navigate=useNavigate();

function handleSignUPClick(){
    navigate ('/Signup')
}
function handleForgetPasswordClick(){
  navigate ('/forget-password')
}
const logInSubmit=async (e)=>{
  e.preventDefault();
  console.log(logindata);
  try{
    const response= await axios.post('https://v-blog-4grx.onrender.com/api/login',logindata,{withCredentials:true});
    console.log(response.data)
   if(response.data.message==="true"){
setToken(response.data.token)
navigate('/home');
   }
  }
  catch(err){
    setmessage("email or password wrong!");
    setanothermessage("did you forget password?")
  }

}
function googlebutton(){
  navigate("http://localhost:8000/auth/google");
}
return  <div className="form-container">
<p class="TitlE">Welcome V blog</p>
<form onSubmit={logInSubmit} class="Form">
  <input type="email" name="username" className="input" placeholder="Email" value={logindata.username} onChange={handleChange}/>
  <input type="password" name="password" className="input" placeholder="Password" value={logindata.password} onChange={handleChange}/>
  <span style={{color: "#FF4C4C",fontSize:"small"}}>{message}</span>
 <span> <a className="a-forget" onClick={handleForgetPasswordClick}>{anothermessage}</a></span>
  <button  className="form-btn">Log in</button>
</form>
<p class="sign-up-label">
  Don't have an account?<span onClick={handleSignUPClick} class="sign-up-link">Sign up</span>
</p>
<div class="buttons-container">
  <div class="google-login-button">
    <svg stroke="currentColor" fill="currentColor" stroke-width="0" version="1.1" x="0px" y="0px" class="google-icon" viewBox="0 0 48 48" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571
c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
    <a className="google-button" href="https://v-blog-4grx.onrender.com/auth/google">Countinue with Google</a>
  </div>
</div>
</div>
}
export default SignIn