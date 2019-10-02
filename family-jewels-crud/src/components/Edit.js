import React, { Component } from 'react';
import firebase from '../Firebase';
import Navbar from './elements/Navbar';


class Edit extends Component {

    constructor(props) {
        super(props);
        this.state = {
            key: '',
            title: '',
            description: '',
            guardian: '',
            nextguardian: '',
            imagesLocations: []
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
                nextguardian: board.guardian,
                imagesLocations: board.imagesLocations
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

    /* Updates heirloom info on submit from forms */
    onSubmit = (e) => {
        e.preventDefault();

        const { title, description, guardian, nextguardian, imagesLocations } = this.state;
        if (title && description && guardian) {
            const updateRef = firebase.firestore().collection('boards').doc(this.state.key);
            updateRef.set({
                title,
                description,
                guardian,
                nextguardian,
                imagesLocations: this.state.imagesLocations
            }).then((docRef) => {
                this.setState({
                    key: '',
                    title: '',
                    description: '',
                    guardian: '',
                    nextguardian: '',
                    imagesLocations: []
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
        document.title = "Edit heirloom";
        return (
            <div class="panel nav-bar">
            <Navbar/>
                <div class="container">
                    <div class="panel panel-default">
                    <div class="panel-heading">
                        <h3 class="panel-title">
                        EDIT HEIRLOOM
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
                        <button type="submit" class="btn btn-outline-warning">Submit</button>
                        <div class="divider"></div>
                        <a href={`/show/boards/${this.state.key}`} class="btn btn-outline-danger">Cancel</a>
                        </form>
                    </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Edit;
