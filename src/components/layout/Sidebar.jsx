import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, IconButton, Typography } from '@mui/material';
import { 
  Home as HomeIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  Science as ScienceIcon,
  LocalPharmacy as PharmacyIcon,
  AttachMoney as CashierIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Reception', icon: <PersonIcon />, path: '/reception' },
    { text: 'Clinicians', icon: <HospitalIcon />, path: '/clinicians' },
    { text: 'Laboratory', icon: <ScienceIcon />, path: '/laboratory' },
    { text: 'Pharmacy', icon: <PharmacyIcon />, path: '/pharmacy' },
    { text: 'Cashier', icon: <CashierIcon />, path: '/cashier' }
  ];

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          right: isOpen ? 0 : '-300px',
          top: 0,
          height: '100%',
          width: '300px',
          background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
          boxShadow: '0 0 20px rgba(0,0,0,0.3)',
          transition: 'right 0.3s ease-in-out',
          zIndex: 1200,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255,255,255,0.1)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '4px',
          }
        }}
      >
        <Box sx={{ 
          p: 3, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          position: 'sticky',
          top: 0,
          background: 'rgba(26,35,126,0.95)',
          backdropFilter: 'blur(10px)',
          zIndex: 1
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              color: 'white',
              fontWeight: 800,
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
              letterSpacing: '1px'
            }}
          >
            Tosh Hospital
          </Typography>
          <IconButton 
            onClick={toggleSidebar} 
            size="small"
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                transform: 'scale(1.1)',
                transition: 'all 0.3s ease'
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>

        <List sx={{ mt: 2 }}>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => {
                navigate(item.path);
                toggleSidebar();
              }}
              sx={{
                py: 2,
                mx: 2,
                my: 0.5,
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'translateX(-5px)',
                  '& .MuiListItemIcon-root': {
                    color: '#64ffda',
                    transform: 'scale(1.1)'
                  },
                  '& .MuiListItemText-primary': {
                    color: '#64ffda'
                  }
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: 'rgba(255,255,255,0.7)',
                transition: 'all 0.3s ease',
                minWidth: '40px'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  '& .MuiTypography-root': {
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '1.1rem',
                    transition: 'all 0.3s ease'
                  }
                }} 
              />
            </ListItem>
          ))}
        </List>
      </Box>
      {isOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 1199,
            display: { xs: 'block', sm: 'none' }
          }}
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar; 