import React, {Component} from 'react';

class SearchBar extends Component {
    render(){
    return (
        <div>
            <input type="text" className="input" onChange={this.handleChange} placeholder="Search..."/>
        </div>
    );
    }
}

export default SearchBar;