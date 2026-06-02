import Navbar from './component/Navbar'
import Hero from './component/Hero'
import SearchBar from './component/SearchBar'
import Features from './component/Features'
import Properties from './component/Properties'
import Stats from './component/Stats'
import Footer from './component/Footer'
{/* to get the component from component folder and ./ means in the same path */}
export default function Home() {
  {/* home it is a function name and export default is the function appears automatically when open next.js*/}
  return (
    <main>
      <Navbar />
      <Hero />
      <SearchBar />
      <Features />
      <Properties />
      <Stats />
      <Footer />
    </main>
  )
    {/* return to return jsx that will display in the web*/}
}