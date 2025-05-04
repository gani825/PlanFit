import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom' // BrowserRouter 임포트
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <HashRouter>
        <App />
    </HashRouter>

);
