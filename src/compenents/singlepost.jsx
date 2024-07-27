import React, { useEffect, useState, } from 'react';
import axios from 'axios';
import {useNavigate,useParams} from 'react-router-dom';
import ResponsiveAppBar from "./bar";



function SearchPosts(){
    const navigate=useNavigate();
    const intialPage=parseInt(localStorage.getItem('currentPagehome'))||1;
    const {text}=useParams();
    const [page,setPage]=useState(intialPage);
    const [totalPages,setTotalPages]=useState(1);
    const[post0,setpost]=useState([]);
 
    useEffect(()=>{
const showposts=async()=>{
    console.log(text);
try{
const response=await axios.get(`http://localhost:8000/api/result/${text}?page=${page}`,{withCredentials:true});
console.log(response.data);
if(response.data.message==="false"){
    navigate("/");
}
else{
const post=response.data.post;
if(post==="not found any match"){

}
else{
setpost([...post]);
setTotalPages(response.data.totalPages);
}
}

}
catch(err){
console.log(err);
}

};
showposts();
    },[text,page]);
    useEffect(()=>{
      localStorage.setItem('currentPagehome',page);
      },[page]);
    return (<div>
        <ResponsiveAppBar />
        {post0.map((pp,arr)=>{
       return <div key={arr} class="task" draggable="true">
    <div class="tags">
      <span class="tag">{pp.post_title}</span>
      <button class="options">
     
      </button>
    </div>
    <p>{pp.post}</p>
    <div class="stats">
      <div>
        <div><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g stroke-width="0" id="SVGRepo_bgCarrier"></g><g stroke-linejoin="round" stroke-linecap="round" id="SVGRepo_tracerCarrier"></g><g id="SVGRepo_iconCarrier"> <path stroke-linecap="round" stroke-width="2" d="M12 8V12L15 15"></path> <circle stroke-width="2" r="9" cy="12" cx="12"></circle> </g></svg>{pp.date}</div>
      
    
      </div>
      <div class="viewer">
      <div><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g stroke-width="0" id="SVGRepo_bgCarrier"></g><g stroke-linejoin="round" stroke-linecap="round" id="SVGRepo_tracerCarrier"></g><g id="SVGRepo_iconCarrier"> <path stroke-linejoin="round" stroke-linecap="round" stroke-width="1.5" d="M16 10H16.01M12 10H12.01M8 10H8.01M3 10C3 4.64706 5.11765 3 12 3C18.8824 3 21 4.64706 21 10C21 15.3529 18.8824 17 12 17C11.6592 17 11.3301 16.996 11.0124 16.9876L7 21V16.4939C4.0328 15.6692 3 13.7383 3 10Z"></path> </g></svg><a onClick={()=>{navigate(`/profile/${pp.id_post}`)}}>{`${pp.first_name} ${pp.last_name}`}</a></div>
    </div>
    </div>
    
  </div>

})}
        <div className="page-div">
<button className="page" onClick={() => setPage(page - 1)} disabled={page === 1}>
          Previous
     
        </button>
        <span>Page {page} of {totalPages}</span>
        <button className="page" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
          Next
        </button>
        </div>
</div> )
}
export default SearchPosts;