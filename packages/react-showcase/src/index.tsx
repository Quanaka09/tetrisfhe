import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// Default FHEVM demos:
// import App from './App';
// Tetris game with FHEVM:
import TetrisApp from './TetrisApp';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    {/* Default FHEVM demos: */}
    {/* <App /> */}
    {/* Tetris game with FHEVM: */}
    <TetrisApp />
  </React.StrictMode>
);
