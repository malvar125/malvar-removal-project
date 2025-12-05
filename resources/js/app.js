
require('./bootstrap');

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import React from 'react';
import ReactDOM from 'react-dom';
import Router from './Router';

if (document.getElementById('app')) {
	ReactDOM.render(<Router />, document.getElementById('app'));
}
