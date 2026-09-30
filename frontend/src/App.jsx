import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Fakehome from './pages/Fakehome';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Fakehome />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;