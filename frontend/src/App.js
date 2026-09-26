import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Students from './students';
import CreateStudent from './CreateStudent';
import UpdateStudent from './UpdateStudent';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';
import StudentProfile from './StudentProfile';
import Teachers from './Teachers';
import Courses from './Courses';
import Attendance from './Attendance';
import Announcements from './Announcements';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth pages — no sidebar */}
          <Route path='/login'  element={<Login />} />
          <Route path='/signup' element={<Signup />} />

          {/* App pages — wrapped with sidebar Layout */}
          <Route path='/' element={
            <Layout><Students /></Layout>
          } />
          <Route path='/dashboard' element={
            <Layout><Dashboard /></Layout>
          } />
          <Route path='/student/:studentId' element={
            <Layout><StudentProfile /></Layout>
          } />
          <Route path='/create' element={
            <Layout>
              <ProtectedRoute><CreateStudent /></ProtectedRoute>
            </Layout>
          } />
          <Route path='/update/:id' element={
            <Layout>
              <ProtectedRoute><UpdateStudent /></ProtectedRoute>
            </Layout>
          } />
          <Route path='/teachers' element={
            <Layout><Teachers /></Layout>
          } />
          <Route path='/courses' element={
            <Layout><Courses /></Layout>
          } />
          <Route path='/attendance' element={
            <Layout><Attendance /></Layout>
          } />
          <Route path='/announcements' element={
            <Layout><Announcements /></Layout>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
