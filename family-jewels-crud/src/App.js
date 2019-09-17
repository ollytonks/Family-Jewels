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
                <SearchBar
                    handleSearch={() =>
                        {
                            this.state.searchResult = [];
                            var arrayLength = this.state.heirlooms.length;
                            for (var i = 0; i < arrayLength; i++){
                                if (this.state.heirlooms[i].title.includes(searchKey)       ||
                                    this.state.heirlooms[i].description.includes(searchKey) ||
                                    this.state.heirlooms[i].guardian.includes(searchKey)    ||
                                    this.state.heirlooms[i].nextguardian.includes(searchKey))
                                {
                                    this.state.searchResult.push(this.state.heirlooms[i]);
                                }
                            }
                            this.state.heirlooms = this.state.searchResult;
                        }
                    }
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
                    {this.state.heirlooms.map(board =>
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
