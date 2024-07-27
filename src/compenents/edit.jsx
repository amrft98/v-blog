import React, { useState,useEffect,useContext } from 'react';
import './newpost.css';
import {useNavigate,useParams} from 'react-router-dom';
import ResponsiveAppBar from "./bar";
import axios from 'axios';

function Edit(){
	const [postData,setPostData]=useState({
		postTitle:'',
		postContent:'',});

	const {id}=useParams();
	useEffect(()=>{
        const showpage = async ()=>{
            try{
				
                const response=await axios.get(`http://localhost:8000/api/newpost`,{withCredentials:true});
                console.log(response.data);
				
				console.log(id);
                if(response.data.message!='true'){
                    navigate("/");
                }
               else{
              try{
const response=await axios.get(`http://localhost:8000/api/edit/${id}`,{withCredentials:true});
if(response.data.post==="NOT MATCH"){
navigate("/my-page")
}

else{
	const title=response.data.post.post_title;
	const content=response.data.post.post;
	setPostData({postTitle:title,
		postContent:content,
	})
}

			  }
			  catch(err){
console.log(err);
			  }
               }
            }

            catch(err){
        console.log(err);
            }
        };
    showpage();
    },[]);
const navigate=useNavigate();
function exitClick(){
   navigate('/my-page');
}


function handleChange(e){
const {name,value}=e.target;
setPostData({...postData,[name]:value});
}
const handleSubmit =async (e) =>{
    e.preventDefault();
  try{
const response=await axios.patch(`http://localhost:8000/api/edit/${id}`,postData,{withCredentials:true});
console.log(response.data.message);
if(response.data.message==='done'){
navigate('/my-page');
}
else{
	navigate("/");
}
  }
  catch(e){
console.log(e)
  }
}
return <div>
	<ResponsiveAppBar />
    <div class="container">
	<form onSubmit={handleSubmit}>
	<div class="modal">
		<div class="modal__header">
			<span class="modal__title">Edit Post</span><button onClick={exitClick} class="button button--icon"><svg width="21" viewBox="0 0 24 24" height="24" xmlns="http://www.w3.org/2000/svg">
					<path fill="none" d="M0 0h24v24H0V0z"></path>
					<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg></button>
		</div>
		<div class="modal__body">
			<div class="input">
				<label class="input__label">Post title</label>
				<input required onChange={handleChange} name='postTitle' value={postData.postTitle} class="input__field" type="text"/> 
				<p class="input__description">The title must contain a maximum of 20 characters</p>
			</div>
			<div class="input">
								<label class="input__label">Content</label>
				<textarea required  onChange={handleChange} name='postContent' value={postData.postContent} class="input__field input__field--textarea"></textarea>
					<p class="input__description">Give your post a good Content so everyone know what's it for</p>
			</div>
		</div>
		<div class="modal__footer">
			<button  class="button button--primary">EDIT</button>
		</div>
	</div>
    </form>
</div>
</div>
}
export default Edit;