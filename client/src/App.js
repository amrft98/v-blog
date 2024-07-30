import ResponsiveAppBar from "./compenents/bar"
import React from "react";
import { BrowserRouter as Router, Route, Routes, } from 'react-router-dom';
import Pagecreate from "./compenents/page"
import SignIn from "./compenents/signin";
import SignUp from "./compenents/signup";
import Footer from "./compenents/Footer";
import Post from "./compenents/newpost"
import Edit from "./compenents/edit";
import MULTI from "./compenents/multibutton";
import SearchPosts from "./compenents/singlepost";
import Profile from "./compenents/profile";
import Home from "./compenents/home";
import Setting from "./compenents/setting";
import EditProfile from "./compenents/profileEdit";
import ResetPassword from "./compenents/Reset-password";
import AuthCallBack from "./compenents/authgoogle";
function App() {
  const auth=true;

  return (<div>
<Router>

  <Routes>
  <Route  path="/" element={<SignIn/>}/>
  <Route path="/Signup" element={<SignUp/>} />
  <Route path="/auth/callback" element={<AuthCallBack/>} />
  <Route path="/forget-password" element={<ResetPassword/>}/>
  <Route path="/My-page" element={auth ? <Pagecreate/> : <SignIn/>}/>
  <Route path="/Login" element={<SignIn/>}/>
  <Route path="/NewPost" element={auth? <Post/>:<SignIn/>}/>
  <Route path="/Edit/:id" element={<Edit/>}/>
  <Route path="/Multi" element={<MULTI/>}/>
  <Route path="/Search/:text" element={<SearchPosts/>}/>
  <Route path="/Profile/:id" element={<Profile/>}/>
  <Route path="/Home" element={<Home/>}/>
  <Route path="/Setting" element={<Setting/>}/>
  <Route path="/Edit/Profile" element={<EditProfile/>}/>
</Routes>
</Router>
<Footer/>
</div>
  );
}

export default App;
