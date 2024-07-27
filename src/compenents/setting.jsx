import React, { useState } from 'react';
import './setting.css';
import ResponsiveAppBar from "./bar";
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
function Setting (){
    const navigate=useNavigate();
  const [showNameForm, setShowNameForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [nameData, setNameData] = useState({ newfname: '', newlname: '' });
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' ,cfnewPassword:''});
const [err,seterror]=useState(false);
const [cferr,setcferr]=useState(false);
  const handleNameChange = (e) => {
    const { name, value } = e.target;
    setNameData({ ...nameData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    try{
const response= await axios.patch(`http://localhost:8000/api/updatename`,nameData,{withCredentials:true});
if(response.data.message==="done"){
    navigate("/home");
}
    }
    catch(err){
console.log(err);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try{
        const response= await axios.patch(`http://localhost:8000/api/updatepassword`,passwordData,{withCredentials:true});
        if(response.data.message==="changing password is complete"){
            console.log(response.data.message);
        navigate("/home");
        }
        else if (response.data.message==="invaild password"){
            console.log("old password is wrong ")
            seterror(true);
        }
        else if (response.data.message==="doesn't match"){
setcferr(true);
        }
    }
    catch(err){
console.log(err);
    }

  };

  return (
  <div>

<ResponsiveAppBar />
    <div className="account-settings-app-container">
      <h1 className="account-settings-title">Setting Account</h1>
      <div className="account-settings-button-group">
        <button className="account-settings-button" onClick={() => { setShowNameForm(true); setShowPasswordForm(false); }}>Change Name</button>
        <button className="account-settings-button" onClick={() => { setShowNameForm(false); setShowPasswordForm(true); }}>Change Password</button>
      </div>

      {showNameForm && (
        <form onSubmit={handleNameSubmit} className="account-settings-form" >
          <div className="account-settings-form-group">
            <label>New First Name </label>
            <input
              type="text"
              name="newfname"
              value={nameData.newfname}
              onChange={handleNameChange}
              required
            />
          </div>
          <div className="account-settings-form-group">
            <label>New Last Name </label>
            <input
              type="text"
              name="newlname"
              value={nameData.newlname}
              onChange={handleNameChange}
              required
            />
          </div>
          <button  className="account-settings-submit-button" type="submit">Update Name</button>
        </form>
      )}
    
      {showPasswordForm && (
        <form className="account-settings-form" onSubmit={handlePasswordSubmit}>
          <div className="account-settings-form-group">
            <label>Old Password</label>
            <input
             style= {{borderColor:err?"#E4003A":"#ccc"}}
              type="password"
              name="oldPassword"
              value={passwordData.oldPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className="account-settings-form-group">
            <label>New Password</label>
            <input
               style= {{borderColor:cferr?"#E4003A":"#ccc"}}
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
             style= {{borderColor:cferr?"#E4003A":"#ccc"}}
              type="password"
              name="cfnewPassword"
              value={passwordData.cfnewPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <button className="account-settings-submit-button" type="submit">Update password</button>
        </form>
      )}
    </div>
    </div>
  );
 
};

export default Setting;