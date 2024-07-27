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

function App() {
  const auth=true;

  return (<div>
<Router>

  <Routes>
  <Route  path="/" element={<SignIn/>}/>
  <Route path="/Signup" element={<SignUp/>} />
  <Route path="/forget-password" element={<ResetPassword/>}/>
  <Route path="/my-page" element={auth ? <Pagecreate/> : <SignIn/>}/>
  <Route path="/login" element={<SignIn/>}/>
  <Route path="/newPost" element={auth? <Post/>:<SignIn/>}/>
  <Route path="/edit/:id" element={<Edit/>}/>
  <Route path="/Multi" element={<MULTI/>}/>
  <Route path="/search/:text" element={<SearchPosts/>}/>
  <Route path="/profile/:id" element={<Profile/>}/>
  <Route path="/home" element={<Home/>}/>
  <Route path="/setting" element={<Setting/>}/>
  <Route path="/edit/Profile" element={<EditProfile/>}/>
</Routes>
</Router>
<Footer/>
</div>
  );
}

export default App;
