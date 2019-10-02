import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

/* This is a simple class for a navbar which can be used on any page. */

const Navbar = () => {
    return (
        <div>
            <nav class="navbar navbar-default navbar-expand-lg d-none d-lg-block">
                <div class="collapse navbar-collapse">
                    <ul class="nav navbar-nav">
                        <li class="navbar-brand nav-item nav-link"><a href="/"><i className="fa fa-home"/> Family Jewels</a></li>
                        <li class="nav-item nav-link"><a href="/create"><i className="fa fa-plus-square"/> Heirloom</a></li>
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
                        <li class="navbar-brand nav-item nav-link"><a href="/"><i className="fa fa-home"/> FJ</a></li>
                        <li class="nav-item nav-link"><a href="/create"><i className="fa fa-plus-square"/> Heirloom</a></li>
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