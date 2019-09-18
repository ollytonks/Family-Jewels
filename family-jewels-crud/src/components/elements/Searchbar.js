import React, {Component} from 'react';
import './Searchbar.css';

const SearchBar = ( {handleSearch} ) => {
    return (
        <div>
            <input
                type="search"
                id="heirloomSearch"
                name="q"
                placeholder="Search..."
                required
            />
            <ul>...</ul>
        </div>
    );
};

export default SearchBar;