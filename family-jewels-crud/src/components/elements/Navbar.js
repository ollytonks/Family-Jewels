import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import homeIcon from './familyjewelsgem.svg'

/* This is a simple class for a navbar which can be used on any page. */

const Navbar = () => {
    return (
        <div>
            <nav class="navbar navbar-default navbar-expand-lg d-none d-lg-block">
                <div class="collapse navbar-collapse">
                    <ul class="nav navbar-nav">
                        <li class="navbar-brand nav-item nav-link"><a href="/"><img width="25" height="25" src={homeIcon}/> Family Jewels</a></li>
                        <li class="nav-item nav-link"><a href="/create"><i className="fa fa-plus-square"/> Heirloom</a></li>
                        <li class="nav-item nav-link"><a href="/map"><i className="fa fa-globe"/> Our map</a></li>
                        <li class="nav-item nav-link"><a href="/timeline"><i className="fa fa-calendar"/> Our history</a></li>
                    </ul>
                    <ul class="nav navbar-nav ml-auto">
                        <li class="navbar-brand nav-item nav-link">
                            <Link to={{ pathname: '/', payload: { searching: true} }}><i className="fa fa-search"/></Link>
                        </li>
                        <li class="bigdivider"></li>
                        <li class="nav-item nav-link"><a href="/login"><i className="fa fa-user"/> Login</a></li>
                    </ul>
                </div>
            </nav>
            <nav class="navbar navbar-default navbar-expand d-lg-none">
                    <ul class="nav navbar-nav">
                        <li class="navbar-brand nav-item nav-link"><a href="/"><img width="16" height="16" src={homeIcon}/> </a></li>
                        <li class="nav-item nav-link"><a href="/create"><i className="fa fa-plus-square"/></a></li>
                        <li class="nav-item nav-link"><a href="/map"><i className="fa fa-globe"/></a></li>
                        <li class="nav-item nav-link"><a href="/timeline"><i className="fa fa-calendar"/></a></li>
                    </ul>
                    <ul class="nav navbar-nav ml-auto">
                        <li class="nav-item nav-link"><a href="/login"><i className="fa fa-user"/></a></li>
                    </ul>
                    <input
                        type="text"
                        className="input"
                        //onChange={this.handleChange}
                        placeholder="Search..."
                    />
            </nav>
        </div>
    );
};

export default Navbar;