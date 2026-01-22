import Navbar from '../components/NavbarApp';
import VideoArchaMap from '../components/VideoArchaMap';
import VideoSocioMap from '../components/VideoSocioMap';
import HomeArchaMap from '../components/HomeArchaMap';
import HomeSocioMap from '../components/HomeSocioMap';

const AppHome = (appType) => {
    const type = appType?.toLowerCase();

    const VideoComponent = type === 'archamap' ? VideoArchaMap : VideoSocioMap;
    const HomeComponent = type === 'archamap' ? HomeArchaMap : HomeSocioMap;

    return {
        element: (
            <div style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
            }}>
                <Navbar />
                <VideoComponent />
                <HomeComponent />
            </div>
        ),
    };
};

export default AppHome