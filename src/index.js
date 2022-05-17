import React from 'react';
import ReactDOM from 'react-dom';
import { render } from 'react-snapshot';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Dialogue from './Dialogue';
import {BrowserRouter as Router, Route, Link, Routes} from "react-router-dom";

render(
    <React.StrictMode>
    <Dialogue />
    {/* <Router>
      <Routes>
        <Route exact path="/dialogue" element={<Dialogue />}></Route>
        <Route exact path="/nomal" element={<App />}></Route>
      </Routes>
      <a href ="dialogue">Dialogue Mode</a>
      <a href ="nomal">Nomal Mode</a>             
    </Router> */}
    </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
