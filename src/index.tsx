import {render as renderReactApp} from 'react-dom'
import React from 'react';
import App from './App';

renderReactApp(
    <App />,
    document.getElementById('app')
);