import Navbar from '../components/NavbarApp'
import Searchbar from '../components/ExploreSearch'
import FooterLinks from '../components/FooterLinks'

const explore = () => {
    return (
        <>
            <div style={{ backgroundColor: "white" }}>
                <Navbar />
                <Searchbar />
            </div>
            <FooterLinks />
        </>
    );
};

export default explore;