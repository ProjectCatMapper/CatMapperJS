import Navbar from '../components/NavbarHome'
import '../components/People.css'


const People = () => {
  return (
    <div className='container'>
      <Navbar />
      <section className="team-section">
        <h1 className="title">Team</h1>
        <div className="team-grid">
          <div className="team-member">
            <h2 className="role">Project Lead</h2>
            <p className="name">Daniel Hruschka</p>
            <p className="position">Professor, Arizona State University</p>
          </div>
          <div className="team-member">
            <h2 className="role">Lead Developer</h2>
            <p className="name">Robert Bischoff</p>
            <p className="position">Senior Digital Data Specialist, Arizona State University</p>
          </div>
          <div className="team-member">
            <h2 className="role">Co-PI</h2>
            <p className="name">Sharon Hsiao</p>
            <p className="position">Assistant Professor, Santa Clara University</p>
          </div>
          <div className="team-member">
            <h2 className="role">Co-PI</h2>
            <p className="name">Matt Peeples</p>
            <p className="position">Associate Professor, Arizona State University</p>
          </div>
          <div className="team-member">
            <h2 className="role">Graduate Student</h2>
            <p className="name">Harsha Kasi</p>
            <p className="position">Santa Clara University</p>
          </div>
        </div>
      </section>
      <section className="advisory-section">
        <h1 className="title">Advisory Board</h1>
        <div className="advisory-grid">
          <div className="advisory-member">
            <p className="name">Johanna Birnir</p>
            <p className="position">Professor, University of Maryland</p>
          </div>
          <div className="advisory-member">
            <p className="name">Anke Becker</p>
            <p className="position">Assistant Professor, Harvard University</p>
          </div>
          <div className="advisory-member">
            <p className="name">Jessica Cheng</p>
            <p className="position">Assistant Professor, Rutgers University</p>
          </div>
          <div className="advisory-member">
            <p className="name">Carol Ember</p>
            <p className="position">President, Human Relations Area Files</p>
          </div>
          <div className="advisory-member">
            <p className="name">Robert Forkel</p>
            <p className="position">Head of Research Data Management, Department of Linguistic and Cultural Evolution, Max Planck Institute of Evolutionary Anthropology</p>
          </div>
          <div className="advisory-member">
            <p className="name">Michael Muthukrishna</p>
            <p className="position">Associate Professor, London School of Economics</p>
          </div>
          <div className="advisory-member">
            <p className="name">Chris Nicholson</p>
            <p className="position">Director, the Digital Archaeological Record</p>
          </div>
          <div className="advisory-member">
            <p className="name">Edward Slingerland</p>
            <p className="position">Professor, Arizona State University</p>
          </div>
          <div className="advisory-member">
            <p className="name">Emily Smith-Greenaway</p>
            <p className="position">Associate Professor, University of Southern California</p>
          </div>
          <div className="advisory-member">
            <p className="name">Jeroen Smits</p>
            <p className="position">Professor, Radboud University</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default People