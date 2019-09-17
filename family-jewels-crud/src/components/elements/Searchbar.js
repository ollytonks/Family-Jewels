import React, {Component} from 'react';
import './Searchbar.css';

const SearchBar = ( {handleSearch} ) => {
    return (
        <div>
            <input
                type="text"
                className="input"
                id="input"
                onChange={this.handleSearch}
                placeholder="Search..."
            />
        </div>
    );
};

export default SearchBar;