import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import Edit from './components/Edit';
import Create from './components/Create';
import Show from './components/Show';
import Login from './components/Login';
import FamilyMap from './components/FamilyMap';
import Timeline from './components/Timeline';
import 'font-awesome/css/font-awesome.min.css';


ReactDOM.render(
    <Router>
        <div>
            <Route exact path='/' component={App} />
            <Route path='/edit/:id' component={Edit} />
            <Route path='/create' component={Create} />
            <Route path='/show/:collection/:id' component={Show} />
            <Route path ='/login' component={Login} />
            <Route path ='/map' component={FamilyMap} />
            <Route path ='/timeline' component={Timeline} />
        </div>
    </Router>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
