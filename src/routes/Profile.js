import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/NavbarApp';
import ProfilePage from '../components/ProfilePage';
import FooterLinks from '../components/FooterLinks';

const Profile = () => {
  const params = useParams();

  return (
    <>
      <div style={{ backgroundColor: 'white', minHeight: '50vh' }}>
        <Navbar {...params} />
        <ProfilePage {...params} />
      </div>
      <FooterLinks />
    </>
  );
};

export default Profile;
