import React, { useEffect, useState,useContext } from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "./authContext";
import axios from 'axios';
export default function SplitButton(props) {
  const {token}=useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const anchorRef = React.useRef(null);
  function deletecall(){
    props.onChecked(props.value);
  }
function disabled(){
 
  if(props.userid==props.postuserid){
return false;
  }
  else{
    return true;
  }
}
  const [options] = React.useState([
    {
      name: 'Edit',
      id: props.value,
      action: async () => {
        try {
          const response = await axios.post('https://v-blog-4grx.onrender.com/api/post/edit', options,{headers:{Authorization:`Bearer ${token}`}} , { withCredentials: true });
          if (response.data.message !== 'true') {
            navigate("/");
          }
          else {
            console.log(response.data)
            navigate(`/edit/${props.value}`);
          }
        }
        catch (err) {
          if (err.response.status ===401||err.response.status===500) {
            navigate("/");
        }
        }
      }
    },
    {
      name: 'Delete',
      id: props.value,
      action: async () => {
        try {
          const response = await axios.delete(`https://v-blog-4grx.onrender.com/api/delete/${props.value}`,{headers:{Authorization:`Bearer ${token}`}} , { withCredentials: true });
          if(response.data.message==="0"){

          }          
        }
        catch (err) {
          if (err.response.status ===401||err.response.status===500) {
            navigate("/");
        }
        }
        setOpen(false);
        deletecall()
        
      }

    }
  ]);


  const handleMenuItemClick = (event, index) => {

    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  return (
    <React.Fragment>
      <ButtonGroup
        variant="contained"
        ref={anchorRef}
        aria-label="Button group with a nested menu"
      >

        <Button
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        sx={{
          zIndex: 1,
        }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>


                  {
                    options.map((option, index) => (
                      <MenuItem
                        key={option.id}

                        disabled={disabled()}

                        onClick={option.action}
                      >
                        {option.name}
                      </MenuItem>

                    ))
                  }

                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  );
}
