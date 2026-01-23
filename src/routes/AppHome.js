import Navbar from '../components/NavbarApp';
import Video from '../components/Video';
import DynamicFooter from "../components/Footer";

const AppHome = () => {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
        }}>
            <Navbar />
            <Video />
            <DynamicFooter />
        </div>
    );
};

export default AppHome;