import { Route, Routes } from 'react-router-dom'
import SiteLayout from './layouts/SiteLayout'
import HomePage from './pages/HomePage'
import OurStoryPage from './pages/OurStoryPage'
import VillettaPage from './pages/VillettaPage'
import FoodPage from './pages/FoodPage'
import AreaPage from './pages/AreaPage'
import GalleryPage from './pages/GalleryPage'
import PressPage from './pages/PressPage'
import PricePage from './pages/PricePage'
import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'

// The same pages are served twice: at the root (Hebrew) and under /en (English).
const pageRoutes = (
  <>
    <Route index element={<HomePage />} />
    <Route path="our-story" element={<OurStoryPage />} />
    <Route path="villetta" element={<VillettaPage />} />
    <Route path="culinary" element={<FoodPage />} />
    <Route path="the-area" element={<AreaPage />} />
    <Route path="gallery" element={<GalleryPage />} />
    <Route path="written-about-us" element={<PressPage />} />
    <Route path="price" element={<PricePage />} />
    <Route path="contact" element={<ContactPage />} />
  </>
)

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        {pageRoutes}
        <Route path="en">{pageRoutes}</Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
