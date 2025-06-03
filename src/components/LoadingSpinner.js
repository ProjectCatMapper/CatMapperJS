import "./LoadingSpinner.css";

const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="loading-overlay">
    <div className="loading-spinner">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  </div>
);

export default LoadingSpinner;
