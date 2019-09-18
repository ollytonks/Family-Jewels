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
            heading: 'HEIRLOOMS'
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

    componentDidUpdate() {
        this.state.heading = this.state.switch ? "ARCHIVE" : "HEIRLOOMS";
    }

    render() {
        this.isArchiveBackground = this.state.switch;
        return (
        <div class={this.isArchiveBackground ? "mainbodyArchive" : "mainbodyClassic"}>
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
            <div class="panel-body">
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
                    {this.state.heirlooms.map(heirlooms =>
                    <tr>
                        <td>
                            <a class={this.isArchiveBackground ? "subArchive": "sub"} href={`/show/${this.state.switch ? 'archived_boards' : 'boards'}/${heirlooms.key}`
                            }>{heirlooms.title}
                            </a>
                        </td>
                        <td>
                            {(heirlooms.description.length > 150) ?
                                heirlooms.description.slice(0,120).concat("...")
                                :
                                heirlooms.description
                            }
                        </td>
                        <td>{heirlooms.guardian}</td>
                        <td>{heirlooms.nextguardian}</td>
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
