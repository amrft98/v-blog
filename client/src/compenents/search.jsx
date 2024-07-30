import React, { useState,useContext } from "react";
import './search.css';
import axios from 'axios';
import { AuthContext } from "./authContext";
import { useLocation, useNavigate } from "react-router-dom";
function Search() {
    const navigate = useNavigate();
    const location = useLocation();
    const [text, settext] = useState(null);
    const {token}=useContext(AuthContext);
    function handleChange(e) {
        const { value } = e.target;
        settext(value);
    }
    const handleClick = async () => {
        try{
            const response=await axios.get(`https://v-blog-4grx.onrender.com/api/search/${text}`,{headers:{Authorization:`Bearer ${token}`}} ,{withCredentials:true});
            if( response.data.message==="true"){
             navigate(`/search/${text}`);
            }
            else{
                navigate("/");
                }
        }
        catch(err){
            if (err.response.status ===401||err.response.status===500) {
                navigate("/");
            }
        }


    }
    return <div className="search">
        <input required name="search" value={text} onChange={handleChange} type="text" className="search__input" placeholder="Type your text" />
        <button className="search__button" onClick={handleClick}>
            <svg className="search__icon" aria-hidden="true" viewBox="0 0 24 24">
                <g>
                    <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
                </g>
            </svg>
        </button>
    </div>
}
export default Search