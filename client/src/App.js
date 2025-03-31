import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// レイアウト
import Layout from './components/Layout';

// ページ
import Home from './pages/Home';
import Explore from './pages/Explore';
import PromptDetail from './pages/PromptDetail';
import CreatePrompt from './pages/CreatePrompt';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/prompt/:id" element={<PromptDetail />} />
            <Route path="/create" element={<CreatePrompt />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
