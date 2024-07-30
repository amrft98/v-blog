import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "./authContext";
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import axios from "axios";
import "./loading.css";
function AuthCallBack() {
    const navigate = useNavigate();
    const location = useLocation();
    const { setToken } = useContext(AuthContext);
    useEffect(() => {
        const showpage = async () => {
            const queryParams = new URLSearchParams(location.search);
  const usertk = queryParams.get('usertk');
  console.log(usertk);
            try {
                const response = await axios.get(`https://v-blog-4grx.onrender.com/auth/google/callback/${usertk}`, { withCredentials: true });
                console.log(response);
                if (response.data.message === "true") {
                    setToken(response.data.token);
                    navigate("/home");
                }
                else {
                    navigate("/")
                }
            }
            catch (err) {
console.log(err);
            }
        }
        showpage();
    }, []);

    return <div>
<div class="loader"></div>
    </div>
}
export default AuthCallBack;