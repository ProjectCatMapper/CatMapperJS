import { useAuth0 } from '@auth0/auth0-react';
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';


const LoginButton = () => {
    const { loginWithRedirect, isAuthenticated } = useAuth0();

    return (
        !isAuthenticated && (
            <Box sx={{ flexGrow: 1 }}>
          <Button variant='outlined' onClick={() => loginWithRedirect()}>Login</Button>
          </Box>
           
        )
    )
}

export default LoginButton