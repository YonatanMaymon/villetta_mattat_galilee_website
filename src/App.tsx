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

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="our-story" element={<OurStoryPage />} />
        <Route path="villetta" element={<VillettaPage />} />
        <Route path="culinary" element={<FoodPage />} />
        <Route path="the-area" element={<AreaPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="written-about-us" element={<PressPage />} />
        <Route path="price" element={<PricePage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
