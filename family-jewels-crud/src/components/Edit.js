import React, { Component } from 'react';
import firebase from '../Firebase';
import Navbar from './elements/Navbar';
import MapContainer from './elements/MapContainer';


class Edit extends Component {

    constructor(props) {
        super(props);
        this.state = {
            key: '',
            title: '',
            description: '',
            guardian: '',
            nextguardian: '',
            imagesLocations: [],
            date: '',
            marker: null
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
                imagesLocations: board.imagesLocations,
                });
                if (board.date !== undefined) {
                    console.log("Setting date");
                    this.setState ({
                        date: board.date,
                    })
                }
                if (board.marker !== undefined) {
                    this.setState ({
                        marker: board.marker,
                    })
                }
            } else {
                console.log("No such document!");
            }
            console.log(this.state);
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

        const { title, description, guardian, nextguardian, imagesLocations, date, marker } = this.state;
        if (title && description && guardian) {
            const updateRef = firebase.firestore().collection('boards').doc(this.state.key);
            updateRef.set({
                title,
                description,
                guardian,
                nextguardian,
                date,
                marker,
                imagesLocations
            }).then((docRef) => {
                this.setState({
                    key: '',
                    title: '',
                    description: '',
                    guardian: '',
                    nextguardian: '',
                    imagesLocations: [],
                    date: '',
                    marker: null
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
            <div class="create-container-main">
                <Navbar/>
                <div class="create-container">
                    <div class="panel panel-default">
                    <div class="panel-heading">
                        <h3 class="panel-title">
                        EDIT HEIRLOOM
                        </h3>
                    </div>
                    <div class="panel-body">
                        <form onSubmit={this.onSubmit}>
                        <div class="form-group form-control-text">
                            <input type="text" class="form-control form-control-text-major" name="title" value={this.state.title} onChange={this.onChange} placeholder="Title" />
                            <input type="text" class="form-control form-control-text-minor" name="date" value={this.state.date} onChange={this.onChange} placeholder="Origin date"/>
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
                        <a>{this.state.marker ? 'Currently selected: ' + this.state.marker[0] + ', ' + this.state.marker[1] : 'Nothing selected'}</a>
                        <div class="map-container">
                            {<MapContainer
                                saveMarker={(t, map, c) => {
                                    this.setState({
                                        marker: [c.latLng.lat(),c.latLng.lng()]
                                    })
                                }}>
                            </MapContainer>}
                        </div>
                        <div class="floating-button-large">
                            <div class ="floating-button-tile">
                                <button name="submitButton" type="submit" class="btn btn-outline-warning" disabled={!this.state.imagesLocations.length}>Submit</button>
                                <a href={`/show/boards/${this.state.key}`} class="btn btn-outline-danger">Cancel</a>
                            </div>
                        </div>
                        </form>
                    </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Edit;
