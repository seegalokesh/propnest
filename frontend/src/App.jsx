import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import PropertyList from './pages/PropertyList';
import PropertyDetail from './pages/PropertyDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import BookVisit from './pages/BookVisit';
import Favorites from './pages/Favorites';
import Compare from './pages/Compare';
import PostProperty from './pages/PostProperty';
import AgentDashboard from './pages/AgentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import InquiryManagement from './pages/InquiryManagement';
import LoadingSpinner from './components/LoadingSpinner';

export default function App() {
  const { loading } = useAuth();
  if (loading) return <div className="loading-center" style={{minHeight:'100vh'}}><div className="spinner"/></div>;

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/properties" />} />
        <Route path="/properties" element={<PropertyList />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/book-visit/:propertyId" element={
          <PrivateRoute roles={['buyer']}><BookVisit /></PrivateRoute>
        } />
        <Route path="/favorites" element={
          <PrivateRoute roles={['buyer']}><Favorites /></PrivateRoute>
        } />
        <Route path="/compare" element={<Compare />} />
        <Route path="/post-property" element={
          <PrivateRoute roles={['seller', 'admin']}><PostProperty /></PrivateRoute>
        } />
        <Route path="/agent/dashboard" element={
          <PrivateRoute roles={['agent']}><AgentDashboard /></PrivateRoute>
        } />
        <Route path="/admin/dashboard" element={
          <PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>
        } />
        <Route path="/admin/inquiries" element={
          <PrivateRoute roles={['admin', 'agent']}><InquiryManagement /></PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/properties" />} />
      </Routes>
    </>
  );
}
