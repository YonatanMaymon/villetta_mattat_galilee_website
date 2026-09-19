import { Route, Routes } from 'react-router-dom'
import SiteLayout from './layouts/SiteLayout'
import HomePage from './pages/HomePage'
import OurStoryPage from './pages/OurStoryPage'
import VillettaPage from './pages/VillettaPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="our-story" element={<OurStoryPage />} />
        <Route path="villetta" element={<VillettaPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
