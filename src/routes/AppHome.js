import Navbar from '../components/NavbarApp';
import Video from '../components/Video';

const AppHome = () => {
    // Return the JSX directly, not inside an object
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
        }}>
            <Navbar />
            <Video />
        </div>
    );
};

export default AppHome;