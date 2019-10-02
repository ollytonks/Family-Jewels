import React, { Component } from 'react';

class App extends Component {

    constructor() {
        super();
        this.state = {
            searchKey: ''
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e){
        {
            console.log(e.target.value);
            let filter = e.target.value;
            if (filter !== "") {
                filter.toLowerCase();
            }            
            this.setState({searchKey: filter});
        }
    }

    render() {
        return (
            <div>
                <input
                    type="search"
                    className="input"
                    
                    onChange={this.handleChange}
                    name="term"
                    placeholder="Search..."
                    class="form-row" 
                />
                <input
                    type="submit"
                />
                {this.state.searchKey}
            </div>
        );
    }
}

export default App;
