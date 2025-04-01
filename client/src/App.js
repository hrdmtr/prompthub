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
import EditPrompt from './pages/EditPrompt';
import ManagePrompts from './pages/ManagePrompts';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Version from './pages/Version';

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
            <Route path="/edit-prompt/:id" element={<EditPrompt />} />
            <Route path="/manage-prompts" element={<ManagePrompts />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/version" element={<Version />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
