import React,{useState} from "react";
import './signup.css';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
function SignUp (){
    const [formData, setFormData] = useState({
        fname: '',
        lname:'',
        email: '',
        password: '',
        confirmPassword: '',
      });

    const [passwordMatch, setPasswordMatch] = useState(true);
    function handleChange (e) {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'confirmPassword') {
          setPasswordMatch(formData.password === value);
        }
      };


      const handleSubmit =async (e) => {
        e.preventDefault();
        console.log(passwordMatch);
  
        if (!passwordMatch) {
            console.log("Passwords do not match");
            return;
      }
      else{
      try {
        const response = await axios.post('http://localhost:8000/api/signup', formData,{withCredentials:true});
     console.log(response.data.message);
   if(response.data.message==="email is already exist"){
    alert("email is already exist")
    
   }
   else if(response.data.message==="success"){
navigate('/my-page');
   }
      } catch (error) {
        console.log('Error:', error);
      }
      };}
const navigate=useNavigate();
function handleClick(){
navigate ('/')
}
return <div>
<form onSubmit={handleSubmit} class="form">
<p class="title">Register </p>
<p class="message">Signup now and get full access to our app. </p>
    <div class="flex">
    <label>
        <input required value={formData.fname}  onChange={handleChange}name="fname" placeholder="" type="text" class="input"/>
        <span>Firstname</span>
    </label>

    <label>
        <input required value={formData.lname}  onChange={handleChange} name="lname" placeholder="" type="text" class="input"/>
        <span>Lastname</span>
    </label>
</div>  
        
<label>
    <input required value={formData.email}  onChange={handleChange} name="email" placeholder="" type="email" class="input"/>
    <span>Email</span>
</label> 
    
<label>
    <input required value={formData.password}  onChange={handleChange} name="password" placeholder="" type="password" class="input"/>
    <span>Password</span>
</label>
<label>
    <input value={formData.confirmPassword}  onChange={handleChange} name="confirmPassword" required placeholder="" type="password" class="input"/>
    <span>Confirm password</span>
    {!passwordMatch  && <p style={{ color: 'red' }}>Passwords do not match</p>}
</label>
<button    class="submit">Submit</button>
<p class="signin">Already have an acount ? <a onClick={handleClick}>Signin</a> </p>
</form>
</div>
}
export default SignUp;