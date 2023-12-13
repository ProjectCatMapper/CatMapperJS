import { User, useAuth0 } from '@auth0/auth0-react';

const LogoutButton = () => {
    const { logout, isAuthenticated } = useAuth0();

    return (
        isAuthenticated && (
            <button className='btn1' onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
                Sign Out
            </button>
        )
    )
}

export default LogoutButton
