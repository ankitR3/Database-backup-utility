import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './components/Home';
import { BackupDashboard } from './components/BackupDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<BackupDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;