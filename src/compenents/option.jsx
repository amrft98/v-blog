import React, { useEffect, useState } from 'react';
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
import axios from 'axios';
export default function SplitButton(props) {

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
          const response = await axios.post('http://localhost:8000/api/post/edit', options, { withCredentials: true });
          if (response.data.message !== 'true') {
            navigate("/");
          }
          else {
            console.log(response.data)
            navigate(`/edit/${props.value}`);
          }
        }
        catch (err) {
          console.log(err);
        }
      }
    },
    {
      name: 'Delete',
      id: props.value,
      action: async () => {
        try {
          const response = await axios.delete(`http://localhost:8000/api/delete/${props.value}`, { withCredentials: true });
          if(response.data.message==="0"){

          }
          else{

          }
          
        }
        catch (err) {
          console.log(err);
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
