import Navbar from '../components/NavbarApp';
import Video from '../components/Video';

const AppHome = () => {
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