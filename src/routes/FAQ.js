import Navbar from '../components/NavbarHome'
import FAQContent from '../components/FAQ'
import FooterLinks from '../components/FooterLinks';
import '../components/FAQ.css'

const FAQPage = () => {
    return (
        <>
            <div className="faq-page">
                <Navbar />
                <FAQContent />
            </div>
            <FooterLinks />
        </>
    )
}

export default FAQPage;
