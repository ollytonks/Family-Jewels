import React, { Component, useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css';
import firebase from './Firebase';
import Switch from './components/elements/Switch';
import SearchBar from './components/elements/Searchbar';

class App extends Component {
    constructor(props) {
        super(props);
        this.ref = firebase.firestore().collection('boards');
        this.unsubscribe = null;
        this.state = false;
        this.state = {
            heirlooms: [],
            switch: false,
            target: 'archived_boards',
            searchResult: []
        };
        this.handleChange = this.handleChange.bind(this);
    }

    onCollectionUpdate = (querySnapshot) => {
        const list = [];
        querySnapshot.forEach((doc) => {
            const { title, description, guardian, nextguardian } = doc.data();
            list.push({
                key: doc.id,
                doc, // DocumentSnapshot
                title,
                description,
                guardian,
                nextguardian
            });
        });
        if (this.state.searchResult == null) {
            this.setState({
                searchResult : this.state.heirlooms
            });
        }
        this.setState({
            heirlooms: list
        });

    }

    componentDidMount() {
        this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
    }

    setCollection() {
        this.ref = firebase.firestore().collection(this.state.target);
        this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
        console.log(this.ref);
    }

    handleChange(e){
        {
            //window.alert(e.target.value);

            let currentList = [];
            let newList = [];
            // If the search bar isn't empty
            if (e.target.value !== "") {
                currentList = this.state.heirlooms;
                // Use .filter() to determine which items should be displayed
                // based on the search terms
                newList = currentList.filter(item => {
                    // change search term to lowercase
                    var filter = e.target.value;
                    let lc = "" + item.title;//.lowerCase();
                    if (lc !== null) {
                        if (lc.includes(filter)) {
                            console.log(lc);
                            return 1;
                        }
                    }
                    /**
                    lc = item.description;//.lowerCase();
                    if (lc !== null) {
                        if (lc.includes(filter)) {
                            return 1;
                        }
                    }
                    lc = item.guardian;//.lowerCase();
                    if (lc !== null) {
                        if (lc.includes(filter)) {
                            return 1;
                        }
                    }
                    lc = item.nextguardian;//.lowerCase();
                    if (lc !== null) {
                        if (lc.includes(filter)) {
                            return 1;
                        }
                    }
                    */
                    return 0;
                });
            } else {
                // If the search bar is empty, set newList to original task list
                newList = this.state.heirlooms;
            }
            console.log(newList.length);
            this.state.searchResult = newList;
            console.log(this.state.searchResult.length);
            this.forceUpdate();
        }
    }

    render() {
        return (
        <div class="panel nav-bar">
        <nav class="navbar navbar-expand-lg">
            <a class="navbar-brand" href="/">Family Jewels</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                <div class="navbar-nav">
                <a class="nav-item nav-link" href="/create">Add Heirloom</a>
                <a class="nav-item nav-link" href="/uploadimage">Upload Image</a>
                </div>
            </div>
            <form class="form-inline">
            <a class="nav-item nav-link" href="/login">Login</a>
            </form>
        </nav>
        <div class="container">
            <div class="panel panel-default">
            <div class="panel-heading">
                <h3 class="panel-title">
                HEIRLOOM LIST
                </h3>
            </div>
            <div class="panel-body">
                <h4><Link to="/login">Login</Link></h4>
                <div>
                    <input
                        type="text"
                        className="input"
                        onChange={this.handleChange}
                        placeholder="Search..."
                    />
                </div>

                <div>
                <Switch
                    isOn={this.state.switch}
                    handleToggle={() => 
                        {
                            this.setState(prevState => ({switch: !prevState.switch}));
                            this.setState(prevState => ({target: this.state.switch ? 'archived_boards' : 'boards'}));
                            this.setCollection();
                        }
                    }
                />
                {this.state.switch ? "Archive" : ""}
                </div>
                <h4><Link to="/create">Add Heirloom</Link></h4>
                <br></br>
                <h4><Link to="/uploadimage">Upload an Image</Link></h4>

                <table class="table table-stripe">
                <thead>
                    <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Guardian</th>
                    <th>Next guardian</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.searchResult.map(board =>
                    <tr>
                        <td><Link to={`/show/${board.key}`}>{board.title}</Link></td>
                        <td>{board.description}</td>
                        <td>{board.guardian}</td>
                        <td>{board.nextguardian}</td>
                    </tr>
                    )}
                </tbody>
                </table>
            </div>
            </div>
        </div>
        </div>
        );
    }
}

export default App;
