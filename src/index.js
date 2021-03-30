import React from 'react';
import { render } from 'react-dom';
import App from './App';

// function App() {
//     return (
//         <p> Hello React!</p>
//     );
// }

render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);
