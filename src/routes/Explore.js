import Navbar from '../components/NavbarApp'
import Searchbar from '../components/ExploreSearch'
import FooterLinks from '../components/FooterLinks'
import { useParams } from 'react-router-dom';

const Explore = () => {
    return (
        <>
            <div style={{ backgroundColor: "white" }}>
                <Navbar {...useParams()} />
                <Searchbar {...useParams()} />
            </div>
            <FooterLinks />
        </>
    );
};

export default Explore;