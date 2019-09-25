import React, { Component, useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css';
import firebase from './Firebase';
import Switch from './components/elements/Switch';
import { thisTypeAnnotation } from '@babel/types';


class App extends Component {
    constructor(props) {
        super(props);
        this.ref = firebase.firestore().collection('boards');
        this.isArchiveBackground=false;
        this.unsubscribe = null;
        this.state = false;
        this.state = {
            heirlooms: [],
            switch: false,
            target: 'archived_boards',
            searchKey: '',
            searchResult: [],
            heading: 'HEIRLOOMS'
        };
        this.handleChange = this.handleChange.bind(this);
    }

    /* On querySnapshot event, gets Firebase colelction */
    onCollectionUpdate = (querySnapshot) => {
        const list = [];
        querySnapshot.forEach((doc) => {
            var iconSource = '';
            const { title, description, guardian, nextguardian, imagesLocations} = doc.data();
            firebase.storage().ref('images').child(imagesLocations[0]).getDownloadURL().then(url => {
                list.push({
                    key: doc.id,
                    icon: url,
                    doc, // DocumentSnapshot
                    title,
                    description,
                    guardian,
                    nextguardian,
                    imagesLocations
                });
                this.forceUpdate();
            })
        });
        if (this.state.searchKey !== '') {
            this.setState({
                heirlooms: list
            });
        }
        else {
            this.setState({
                heirlooms: list, searchResult : list
            });
        }
    }

    componentDidMount() {
        this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
    }

    /* Sets the current reference to Firebase collection to the target */
    setCollection() {
        this.ref = firebase.firestore().collection(this.state.target);
        this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
    }

    componentDidUpdate() {
        this.state.heading = this.state.switch ? "ARCHIVE" : "HEIRLOOMS";
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
        let tempList = [];
        let filter = this.state.searchKey;
        if (filter !== "") {
            filter.toLowerCase();
        }
        if (filter !== "") {
            let currentList = this.state.heirlooms;
            // Use .filter() to determine which items should be displayed
            // based on the search terms
            tempList = currentList.filter(item => {
                let lc = "" + item.title + ":" + item.description + ":" + item.guardian + ":" + item.nextguardian;
                lc = lc.toLowerCase();
                if (lc !== null) {
                    if (lc.includes(filter)) {
                        return 1;
                    }
                }
                return 0;
            });
            console.log(tempList.length);
        } else {
            // If the search bar is empty, set newList to original task list
            tempList = this.state.heirlooms;
        }
        var resultList = tempList
            .sort((a, b) => a.title.localeCompare(b.title));

        this.isArchiveBackground = this.state.switch;
        
        return (
        <div class={this.isArchiveBackground ? "mainbodyArchive" : "mainbodyClassic"}>
        <nav class="navbar navbar-default navbar-expand-lg d-none d-lg-block">
            <div class="collapse navbar-collapse">
                <ul class="nav navbar-nav">
                    <li class="navbar-brand nav-item nav-link" ><a href="/">Family Jewels</a></li>
                    <li class="nav-item nav-link"><a href="/create">Add Heirloom</a></li>
                </ul>
                <ul class="nav navbar-nav ml-auto">
                    <li class="nav-item nav-link"><a href="/login">Login</a></li>
                </ul>
            </div>
        </nav>
        <nav class="navbar navbar-default navbar-expand d-lg-none">
                <ul class="nav navbar-nav">
                    <li class="navbar-brand nav-item nav-link"><a href="/">FJ</a></li>
                    <li class="nav-item nav-link"><a href="/create">Add Heirloom</a></li>
                </ul>
                <ul class="nav navbar-nav ml-auto">
                    <li class="nav-item nav-link"><a href="/login">Login</a></li>
                </ul>
        </nav>
        <div class="container">
            <div class="panel panel-default">
            <div class="panel-body">
                <div>
                    <input
                        type="text"
                        className="input"
                        onChange={this.handleChange}
                        placeholder="Search..."
                    />
                </div>

                <div>
                <div class="row">
                <div class="col-md-10">
                    <h2 class="panel-title">
                    {this.state.heading}
                    </h2>
                </div>
                <div class="col-md-2">
                <Switch
                    isOn={this.state.switch}
                    isArchiveBackground = {this.isArchiveBackground}
                    handleToggle={() =>
                        {
                            this.setState(prevState => ({switch: !prevState.switch}));
                            this.setState(prevState => ({target: this.state.switch ? 'archived_boards' : 'boards'}));
                            this.setCollection();
                        }
                    }
                />
                </div>

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
                        {resultList.map(board =>
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
            <div class="panel-body">
                <div class="grid">
                    {this.state.heirlooms.map(heirloom =>
                        <div class={this.isArchiveBackground ? "tileArchive" : "tile"}>
                            <div class="imgbox">
                                <img class="tileimg" src={heirloom.icon}></img>
                            </div>
                            <div class="infobox">
                                <a class={this.isArchiveBackground ? "subArchive" : "sub"} href={`/show/${this.state.switch ? 'archived_boards' : 'boards'}/${heirloom.key}`}>
                                    <b>{heirloom.title}</b>
                                    <br></br>
                                </a>
                                <a class="plain">
                                    {(heirloom.description.length > 80) ?
                                        heirloom.description.slice(0,80).concat("...")
                                        : heirloom.description
                                    }
                                    <br></br>
                                </a>
                                <a class="plain">
                                    {"Guardian: " + heirloom.guardian} <br></br>
                                </a>
                                <a class="plain">
                                    {heirloom.nextguardian == "" ? "" : "Next guardian: " + heirloom.nextguardian} <br></br>
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            </div>
        </div>
        </div>
        </div>
        );
    }
}

export default App;
