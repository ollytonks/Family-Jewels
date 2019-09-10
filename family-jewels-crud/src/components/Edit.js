import React, { Component } from 'react';
import firebase from '../Firebase';
import { Link } from 'react-router-dom';

class Edit extends Component {

    constructor(props) {
        super(props);
        this.state = {
            key: '',
            title: '',
            description: '',
            guardian: '',
            nextguardian: ''
        };
    }

    componentDidMount() {
        const ref = firebase.firestore().collection('boards').doc(this.props.match.params.id);
        ref.get().then((doc) => {
            if (doc.exists) {
                const board = doc.data();
                this.setState({
                key: doc.id,
                title: board.title,
                description: board.description,
                guardian: board.guardian,
                nextguardian: board.guardian
                });
            } else {
                console.log("No such document!");
            }
        });
    }

    onChange = (e) => {
        const state = this.state
        state[e.target.name] = e.target.value;
        this.setState({board:state});
    }

    onSubmit = (e) => {
        e.preventDefault();

        const { title, description, guardian, nextguardian } = this.state;

        const updateRef = firebase.firestore().collection('boards').doc(this.state.key);
        updateRef.set({
            title,
            description,
            guardian,
            nextguardian
        }).then((docRef) => {
            this.setState({
                key: '',
                title: '',
                description: '',
                guardian: '',
                nextguardian: ''
            });
            this.props.history.push("/show/"+this.props.match.params.id)
        })
        .catch((error) => {
        console.error("Error adding document: ", error);
        });
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
                EDIT BOARD
                </h3>
            </div>
            <div class="panel-body">
                <form onSubmit={this.onSubmit}>
                <div class="form-group">
                    <label for="title">Title:</label>
                    <input type="text" class="form-control" name="title" value={this.state.title} onChange={this.onChange} placeholder="Title" />
                </div>
                <div class="form-group">
                    <label for="description">Description:</label>
                    <input type="text" class="form-control" name="description" value={this.state.description} onChange={this.onChange} placeholder="Description" />
                </div>
                <div class="form-group">
                    <label for="guardian">Guardian:</label>
                    <input type="text" class="form-control" name="guardian" value={this.state.guardian} onChange={this.onChange} placeholder="Guardian" />
                </div>
                <div class="form-group">
                    <label for="nextguardian">Next Guardian:</label>
                    <input type="text" class="form-control" name="nextguardian" value={this.state.nextguardian} onChange={this.onChange} placeholder="Next guardian" />
                </div>
                <button type="submit" class="btn btn-success">Submit</button>
                <h4><Link to={`/show/${this.state.key}`} class="btn btn-danger">Cancel</Link></h4>
                </form>
            </div>
            </div>
        </div>
        </div>
        );
    }
}

export default Edit;
