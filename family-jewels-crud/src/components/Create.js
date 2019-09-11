import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import firebase from '../Firebase';
import { Link } from 'react-router-dom';

class Create extends Component {

    constructor() {
        super();
        this.ref = firebase.firestore().collection('boards');
        this.state = {
            title: '',
            description: '',
            author: '',
            nextguardian: ''
        };
    }
    onChange = (e) => {
        const state = this.state
        state[e.target.name] = e.target.value;
        this.setState(state);
    }

    onSubmit = (e) => {
        e.preventDefault();

        const { title, description, guardian, nextguardian } = this.state;
        if (title && description && guardian) {
            this.ref.add({
                title,
                description,
                guardian,
                nextguardian
            }).then((docRef) => {
            this.setState({
                title: '',
                description: '',
                guardian: '',
                nextguardian: ''
            });
            this.props.history.push("/")
            })
            .catch((error) => {
            console.error("Error adding document: ", error);
            });
        } else {
            window.alert("An heirloom must have a title, description, and guardian.");
        }

    }

    render() {
        const { title, description, guardian, nextguardian } = this.state;
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
                ADD HEIRLOOM
                </h3>
            </div>
            <div class="panel-body">
                <h4><Link to="/" class="btn btn-primary">Heirloom List</Link></h4>
                <form onSubmit={this.onSubmit}>
                <div class="form-group">
                    <label for="title">Title:</label>
                    <input type="text" class="form-control" name="title" value={title} onChange={this.onChange} placeholder="Title" />
                </div>
                <div class="form-group">
                    <label for="description">Description:</label>
                    <textArea class="form-control" name="description" onChange={this.onChange} placeholder="Description" cols="80" rows="3">{description}</textArea>
                </div>
                <div class="form-group">
                    <label for="guardian">Guardian:</label>
                    <input type="text" class="form-control" name="guardian" value={guardian} onChange={this.onChange} placeholder="Guardian" />
                </div>
                <div class="form-group">
                    <label for="nextguardian">Next Guardian:</label>
                    <input type="text" class="form-control" name="nextguardian" value={nextguardian} onChange={this.onChange} placeholder="Next guardian" />
                </div>
                <button type="submit" class="btn btn-success">Submit</button>
                </form>
            </div>
            </div>
        </div>
        </div>
        );
    }
}

export default Create;
