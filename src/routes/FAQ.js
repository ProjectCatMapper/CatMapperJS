import Navbar from '../components/NavbarHome'
import FAQContent from '../components/FAQ'
import '../components/FAQ.css'

const FAQPage = () => {
    return (
        <div className="faq-page">
            <Navbar />
            <FAQContent />
        </div>
    )
}

export default FAQPage;
