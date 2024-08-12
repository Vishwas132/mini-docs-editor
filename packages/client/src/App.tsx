import TextEditor from './TextEditor.tsx';
import { Navigate } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={`/documents/${uuidV4()}`} />}
        ></Route>
        <Route path="/documents/:id" element={<TextEditor />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
