import React from 'react';
import Navbar from '../components/NavbarApp';
import ForgotPasswordPage from '../components/ForgotPasswordPage';
import FooterLinks from '../components/FooterLinks';
import { useParams } from 'react-router-dom';

const ForgotPassword = () => {
  return (
    <>
      <div style={{ backgroundColor: "white", minHeight: "50vh" }}>
        <Navbar {...useParams()} />
        <ForgotPasswordPage {...useParams()} />
      </div>
      <FooterLinks />
    </>
  );
};

export default ForgotPassword;
