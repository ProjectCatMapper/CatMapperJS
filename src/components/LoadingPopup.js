import React from 'react';
import PropTypes from 'prop-types';
import './LoadingPopup.css';

const LoadingPopup = ({ isOpen, message }) => {
  return (
    isOpen && (
      <div className="loading-popup">
        <div className="loading-spinner" />
        <p>{message || 'Loading...'}</p>
      </div>
    )
  );
};

LoadingPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  message: PropTypes.string,
};

export default LoadingPopup;