import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize Firebase SDK
import './config/firebase'

createRoot(document.getElementById("root")!).render(<App />);
