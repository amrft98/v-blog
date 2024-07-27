import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import Diversity1Icon from '@mui/icons-material/Diversity1';
import SearchIcon from '@mui/icons-material/Search';
import Search from './search';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';



function ResponsiveAppBar() {
  const navigate=useNavigate();
  const [settings]=React.useState([
    {name:'Profile',action:()=>navigate("/edit/profile")},
    {name:'Account',action:()=>navigate("/setting")},
    {name: 'Logout',action:async ()=>{
try{
const response= await axios.get('/api/logout');
if(response.data.message==='logout'){
  localStorage.clear();
navigate('/');
}
}
catch(err){
console.log(err);
}
    }}
    ]);
  const [pages,setpages]=React.useState([
    {name:"Home",action:()=>{navigate("/home")}},
    {name:'',action:()=>navigate('/my-page')},
    {name:'New Post',action:()=>navigate("/newPost")},
   
  ]);
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  const [data2,setData2]=React.useState("");
React.useEffect(()=>{
  const showpage = async () => {
const [response1,response2]= await Promise.all([
 axios.get(`http://localhost:8000/api/bar`, { withCredentials: true })
 ,axios.get(`http://localhost:8000/api/profile/pic`, { withCredentials: true })
]);
const fname=response1.data.fullname.first_name;
const lname=response1.data.fullname.last_name;
const updatename=[...pages];
updatename[1]={
...updatename[1],name:fname+" "+lname
};
setpages(updatename);
console.log(response2.data.message.image);
setData2(response2.data.message.image);
  };
  showpage();
},[]);
console.log(data2)
  return (

    <AppBar style={{ background: '#2E3B55' }} position="static" >

      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Diversity1Icon sx={{ display: { xs: 'none', md: 'flex' }, mr: 4 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/home"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
             
            }}
          >
VBLOG
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>

            <IconButton
              //three icons when i small the screen 
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (

                <MenuItem key={page} onClick={handleCloseNavMenu}>

                  <Typography onClick={page.action} textAlign="center">{page.name} </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
  
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page,index) => (
              <Button
                key={index}
                onClick={page.action}
                
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page.name}
              </Button>
            ))}
           
          </Box>
         <Search/>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt={pages.name} src={data2} /*{`http://localhost:8000/${data2}`}*/ />
                
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting,index) => (

                <MenuItem  key={setting} onClick={handleCloseUserMenu}>

                  <Typography key={index} onClick={setting.action} textAlign="center">{setting.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
