import React, { useState ,useEffect,useContext} from 'react';
import './profileEdit.css';
import {useNavigate} from 'react-router-dom'
import axios from 'axios';
import ResponsiveAppBar from "./bar";
import { storage } from '../firebase';
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { AuthContext } from "./authContext";
axios.defaults.withCredentials=true;
function EditProfile(){
  const {token}=useContext(AuthContext);
    useEffect(()=>{
        const showpage = async ()=>{
            try{
                const response=await axios.get('https://v-blog-4grx.onrender.com/api/upload',{headers:{Authorization:`Bearer ${token}`}} ,);
                console.log(response.data);
                if(response.data.message!='true'){
                    navigate("/");
                }
               
            }

            catch(err){
              if (err.response.status ===401||err.response.status===500) {
                navigate("/");
              }
            }
        };
    showpage();
    },[]);
    const [url,setUrl]=useState("");
const [selectedFile, setSelectedFile] = useState(null);
const [preview, setPreview] = useState("NO FILE SELECTED");
const [message,setmessage]=useState(false);
const navigate=useNavigate();
const handleFileChange = (e) => {
  const selectedFile=e.target.files[0];
  if(selectedFile){
    setSelectedFile(selectedFile);
    setPreview(e.target.files[0].name||"undefiened");
  }
else{
  setSelectedFile(prefile=>{
    return prefile
  });
  setPreview(prename=>{
    return prename;
  });
}
  };
async function submitupload (){
if(!selectedFile){
  console.log("please select an image first")
}
try{
const storageRef=ref(storage,`images/${Date.now()}_${selectedFile.name}`);
const uploadTask=await uploadBytesResumable(storageRef,selectedFile);
const downloadURL=await getDownloadURL(uploadTask.ref);
setUrl(downloadURL);
try{
  const response=await axios.post(`https://v-blog-4grx.onrender.com/api/upload`,{url:downloadURL},{headers:{Authorization:`Bearer ${token}`}} ,{withCredentials:true});
  if(response.data.message==="upload completed"){
setmessage(true);
}
}
catch(err){
console.log(err)
}
}
catch(err){
  console.log(err);
}
  //code for upload locally  
  /*const formData = new FormData();
    formData.append('profilePic', selectedFile);
    try{
const response=await axios.post(`http://localhost:8000/api/upload`, formData,{
headers:{
    'Content-Type': 'multipart/form-data',
},
},)
    }
    catch(err){
console.log(err)
    }*/
}
return <div>
           <ResponsiveAppBar />
<div class="container-pf"> 
 
<div class="header-pf"> 
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> 
    <path d="M7 10V9C7 6.23858 9.23858 4 12 4C14.7614 4 17 6.23858 17 9V10C19.2091 10 21 11.7909 21 14C21 15.4806 20.1956 16.8084 19 17.5M7 10C4.79086 10 3 11.7909 3 14C3 15.4806 3.8044 16.8084 5 17.5M7 10C7.43285 10 7.84965 10.0688 8.24006 10.1959M12 12V21M12 12L15 15M12 12L9 15" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg> <p>Browse Image to upload!</p>
</div> 
<label for="file" class="footer-pf"> 
  <svg fill="#000000" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M15.331 6H8.5v20h15V14.154h-8.169z"></path><path d="M18.153 6h-.009v5.342H23.5v-.002z"></path></g></svg> 
  <p>{preview}</p> 

</label> 
<input  onChange={handleFileChange} id="file" type="file"/> 
<button onClick={submitupload} className='button-pf'>
  <div className="svg-wrapper-1">
    <div className="svg-wrapper">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="30"
        height="30"
        class="icon"
      >
        <path
          d="M22,15.04C22,17.23 20.24,19 18.07,19H5.93C3.76,19 2,17.23 2,15.04C2,13.07 3.43,11.44 5.31,11.14C5.28,11 5.27,10.86 5.27,10.71C5.27,9.33 6.38,8.2 7.76,8.2C8.37,8.2 8.94,8.43 9.37,8.8C10.14,7.05 11.13,5.44 13.91,5.44C17.28,5.44 18.87,8.06 18.87,10.83C18.87,10.94 18.87,11.06 18.86,11.17C20.65,11.54 22,13.13 22,15.04Z"
        ></path>
      </svg>
    </div>
  </div>
  {message?<span>upload completed</span>:<span>save</span>}
</button>
</div>
</div>
}
export default EditProfile;