import Navbar from '../components/NavbarApp';
import Video from '../components/Video';
import DynamicBody from "../components/AppHome";
import { useParams } from 'react-router-dom';

const AppHome = () => {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
        }}>
            <Navbar {...useParams()} />
            <Video {...useParams()} />
            <DynamicBody {...useParams()} />
        </div>
    );
};

export default AppHome;