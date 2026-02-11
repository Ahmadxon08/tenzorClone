import AnalyticsInsightsSection from "../../components/landing/AnaliticSection"
import CodeCollaborationSection from "../../components/landing/CodeCollbaration"
import FeaturesSection from "../../components/landing/FeautersSection"
import Footer from "../../components/landing/Footer"
import Hero from "../../components/landing/Hero"
import Navbar from "../../components/landing/Navbar"
import Partners from "../../components/landing/Partners"
const Home = () => {
  return (
    <div className="relative w-full min-h-screen text-white">
      <div
        className="fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(70% 55% at 50% 50%, #2a5d77 0%, #184058 18%, #0f2a43 34%, #0a1b30 50%, #071226 66%, #040d1c 80%, #020814 92%, #01040d 97%, #000309 100%), radial-gradient(160% 130% at 10% 10%, rgba(0,0,0,0) 38%, #000309 76%, #000208 100%), radial-gradient(160% 130% at 90% 90%, rgba(0,0,0,0) 38%, #000309 76%, #000208 100%)",
        }}
      />
      <div className="relative z-10">
        <header className="mb-16"  >
          <Navbar />
        </header>
        <main>
          <section id="home"  >
            <Hero />
          </section>
          <section id="partners" className="scroll-mt-20" >
            <Partners />
          </section>
          <section id="features" className="scroll-mt-20" >
            <FeaturesSection />
          </section>
          <section id="collaboration" className="scroll-mt-20" >
            <CodeCollaborationSection />
          </section>
          <section id="analytics" className="scroll-mt-20" >
            <AnalyticsInsightsSection />
          </section>
        </main>
        <footer>
          <Footer />
        </footer>
      </div>
    </div>
  )
}
export default Home
