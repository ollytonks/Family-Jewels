/**
 * Copyright (c) 2019
 *
 * Component loads a navbar at top of page
 *
 * @summary Loads navbar
 * @author FamilyJewels
 *
 * Created at     : 2019-10-02
 * Last modified  : 2019-10-15
 */

 import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import homeIcon from './familyjewelsgem.svg'

/* This is a simple class for a navbar which can be used on any page. */

const Navbar = () => {
    return (
        <div>
            <nav className="navbar navbar-default navbar-expand-lg d-none d-lg-block">
                <div className="collapse navbar-collapse">
                    <ul className="nav navbar-nav">
                        <li className="navbar-brand nav-item nav-link"><a href="/"><img alt="Home icon" width="25" height="25" src={homeIcon}/> Family Jewels</a></li>
                        <li className="nav-item nav-link"><a href="/create"><i className="fa fa-plus-square"/> Heirloom</a></li>
                        <li className="nav-item nav-link"><a href="/map"><i className="fa fa-globe"/> Our map</a></li>
                        <li className="nav-item nav-link"><a href="/timeline"><i className="fa fa-calendar"/> Our history</a></li>
                    </ul>
                    <ul className="nav navbar-nav ml-auto">
                        <li className="navbar-brand nav-item nav-link">
                            <Link to={{ pathname: '/', payload: { searching: true} }}><i className="fa fa-search"/></Link>
                        </li>
                        <li className="bigdivider"></li>
                        <li className="nav-item nav-link"><a href="/login"><i className="fa fa-user"/> Account</a></li>
                    </ul>
                </div>
            </nav>
            <nav className="navbar navbar-default navbar-expand d-lg-none">
                    <ul className="nav navbar-nav">
                        <li className="navbar-brand nav-item nav-link"><a href="/"><img alt="Home icon" width="16" height="16" src={homeIcon}/> </a></li>
                        <li className="nav-item nav-link"><a href="/create"><i className="fa fa-plus-square"/></a></li>
                        <li className="nav-item nav-link"><a href="/map"><i className="fa fa-globe"/></a></li>
                        <li className="nav-item nav-link"><a href="/timeline"><i className="fa fa-calendar"/></a></li>
                    </ul>
                    <ul className="nav navbar-nav ml-auto">
                        <li className="nav-item nav-link"><a href="/login"><i className="fa fa-user"/></a></li>
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
