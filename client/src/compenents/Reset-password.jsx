import React,{useState} from 'react';
import axios from 'axios';
import {  useNavigate } from "react-router-dom";
import './Reset-password.css';

function ResetPassword(){
    const navigate = useNavigate();
    const [step,setStep]=useState(1);
    const [email,setemail]=useState("");
    const [message,setmessage]=useState(false);
    const [message0,setmessage0]=useState(false);
    const[message1,setmessage1]=useState(false);
    const [otp,setotp]=useState({
    input1:'',
    input2:'',
    input3:'',
    input4:'',
    })
    const [passwordData, setPasswordData] = useState({  newPassword: '' ,cfnewPassword:''});
   function handlePasswordChange(e){
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
   }
  async function handlePasswordSubmit(e){
    e.preventDefault();
    try{
const response=await axios.patch(`https://v-blog-4grx.onrender.com/api/setnewpassword`,{email:email,otp:otp,passwords:passwordData},{withCredentials:true});
if(response.data.message==="Changed successfully"){
    console.log(response.data)
    navigate("/login");
}
else{
setmessage1(true);
}
    }
    catch(err){
console.log(err);
    }
   }
   
    function handlEchange(e){
        const { name, value } = e.target;
        setotp({ ...otp, [name]: value });
    }
    function handleChange(e){
        setemail(e.target.value);
    }
   async function handleSubmit(e){
    e.preventDefault();
const response =await axios.post(`https://v-blog-4grx.onrender.com/api/reset-password/verify-email`,{email:email},{withCredentials:true});
if(response.data.message==="success"){
    setStep(2);
}
else if(response.data.message==="email not found"){
setmessage(true);
}
    }
    async function handleClick(e){
        e.preventDefault();
        const response = await axios.post(`https://v-blog-4grx.onrender.com/api/reset-password/verify-otp`,{otp:otp,email:email},{withCredentials:true});
if(response.data.message==="comparison was successful"){
    setStep(3);
  
}
else{
    setmessage0(true);
}
    }
    return <div>
      {step===1&&(
<div class="form-container-reset-password">
      <div class="logo-container-reset-password">
        Forgot Password
      </div>

      <form class="form-reset-password">
        <div class="form-group-reset-password">
          <label for="email">Email</label>
          <input type="text" required value={email} onChange={handleChange}id="email" name="email" placeholder="Enter your email" />
        </div>

        <button class="form-submit-btn-reset-password" onClick={handleSubmit} type="submit">Send Email</button>
      </form>
      {message?<p class="signup-link-reset-password">This email is not registered</p>:null}
     <p class="signup-link-reset-password">
        Don't have an account?
        <a href="/signup" class="signup-link-reset-password link-reset-password"> Sign up now</a>
      </p>
    </div>
)}
{step===2&&(
<div>
<form class="form-Verification-Code"> 
    <div class="title-Verification-Code">OTP</div> 
    <div class="title-Verification-Code">Verification Code</div> 
    <p class="message-Verification-Code">We have sent a verification code to your mobile number</p>
     <div class="inputs-Verification-Code"> 
        <input id="input1-Verification-Code" type="text" name="input1" value={otp.input1}  onChange={handlEchange} maxlength="1"/> 
        <input id="input2-Verification-Code" type="text" name="input2" value={otp.input2}   onChange={handlEchange} maxlength="1"/>
         <input id="input3-Verification-Code" type="text" name="input3" value={otp.input3}   onChange={handlEchange} maxlength="1"/> 
         <input id="input4-Verification-Code" type="text" name="input4" value={otp.input4}   onChange={handlEchange} maxlength="1"/> 
         </div> 
         {message0?<p class="signup-link-reset-password">The code entered is incorrect.</p>:null}
         <button onClick={handleClick} class="action-Verification-Code">verify me</button> 
         </form>
</div>
)}
{step===3&&(
<div>
<div className="account-settings-app-container">
<form className="account-settings-form" onSubmit={handlePasswordSubmit}>
          <div className="account-settings-form-group">
            <label>New Password</label>
            <input
              
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className="account-settings-form-group">
            <label>Confirm New Password</label>
            <input
       
              type="password"
              name="cfnewPassword"
              value={passwordData.cfnewPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          {message1?<p class="signup-link-reset-password">Some thing Wrong try again</p>:null}
          <button className="account-settings-submit-button" type="submit">Update password</button>
        </form>
        </div>
</div>

)}
    </div>
}
export default ResetPassword;
