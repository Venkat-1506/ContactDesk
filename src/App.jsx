import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToTopButton from './components/ScrollToTopButton';
import Landing from './pages/Landing';
import AppWorkspace from './pages/AppWorkspace';
import DemoEntry from './pages/DemoEntry';
import Atlas from './pages/Atlas';
import People from './pages/People';
import Places from './pages/Places';
import Recent from './pages/Recent';
import Favorites from './pages/Favorites';
import Data from './pages/Data';
import AddContact from './pages/AddContact';
import EditContact from './pages/EditContact';
import ContactDetails from './pages/ContactDetails';
import NotFound from './pages/NotFound';
import './App.css';
import './styles/components.css';

function AppShell() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className={`app-layout${isLanding ? ' no-navbar' : ''}`}>
      {!isLanding && <Navbar />}
      <div className={isLanding ? 'app-main-content landing-mode' : 'app-main-content'}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<AppWorkspace />} />
          <Route path="/demo" element={<DemoEntry />} />
          <Route path="/insights" element={<Atlas />} />
          <Route path="/people" element={<People />} />
          <Route path="/places" element={<Places />} />
          <Route path="/recent" element={<Recent />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/data" element={<Data />} />
          <Route path="/add-contact" element={<AddContact />} />
          <Route path="/edit-contact/:id" element={<EditContact />} />
          <Route path="/contact/:id" element={<ContactDetails />} />
          <Route path="/atlas" element={<Navigate to="/insights" replace />} />
          <Route path="/contacts" element={<Navigate to="/people" replace />} />
          <Route path="/contact-desk" element={<Navigate to="/recent" replace />} />
          <Route path="/professional" element={<Navigate to="/people" replace />} />
          <Route path="/favorites-close" element={<Navigate to="/favorites" replace />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {!isLanding && <ScrollToTopButton />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}
