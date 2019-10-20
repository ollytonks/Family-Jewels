/**
 * Copyright (c) 2019
 *
 * File displays an heirloom using data recorded in attached firebase
 * collection. If the item is archived it offers a restore option, otherwise
 * a user can edit, archive, or download the item's textual information.
 * If the item has a necxt guardian, the item can be inherited.
 *
 * @summary Displays an heirloom
 * @author FamilyJewels
 *
 * Created at     : 2019-08-28
 * Last modified  : 2019-10-15
 */

import React, { Component } from 'react';
import {firebase, firebaseAuth} from './../Firebase';
import { saveAs } from 'file-saver';
import { Gallery, GalleryImage } from "react-gesture-gallery";
import Navbar from './elements/Navbar';
import './Show.css';
import {Map, Marker, GoogleApiWrapper} from 'google-maps-react';
import { Redirect } from 'react-router-dom';


class Show extends Component {
    constructor(props) {
        super(props);
        this.state = {
            heirlooms: {},
            key: '',
            title: '',
            images: [],
            target: this.props.match.params.collection,
            archive_text: '',
            index: 0
        };
        console.log(this.state.hlist);
        this.unsubscribe = null;
    }

    /**
     * React component runs once the show component is mounted. It retrieves
     * the targeted firebase item and saves it in the state.
     */
    componentDidMount() {
        //authentication
        firebaseAuth.onAuthStateChanged(user => {
            this.setState({ user: firebase.auth().currentUser });
            this.setState({ isAuth: true });
        });

        const ref = firebase.firestore().collection(this.state.target).doc(this.props.match.params.id);
        var imageRefs = [];
        ref.get().then((doc) => {
            if (doc.exists) {
                var data = doc.data();
                for (var i = 0; i < data.imagesLocations.length; i++){
                    firebase.storage().ref('images').child(data.imagesLocations[i]).getDownloadURL().then(url => {
                        imageRefs.push(url);
                        this.setState({
                            heirlooms: doc.data(),
                            key: doc.id,
                            images: imageRefs,
                            isLoading: false
                        });
                    });
                }
            } else {
                console.log("No such document!");
            }
            if (this.state.target === 'boards') {
                this.setState({
                    archive_text: 'Archive'
                })
            } else {
                this.setState({
                    archive_text: 'Restore'
                })
            }
        });

    }

    /* If current, archives. If archived, unarchives. */
    archive(id){
        var current = this.state.target;
        var dest = '';
        dest = current === 'boards' ? 'archived_boards' : 'boards';
        firebase.firestore().collection(current).doc(id).get().then((doc) => {
            if (doc.exists) {
                firebase.firestore().collection(dest).add(this.state.heirlooms);
            }
            console.log("Document successfully duplicated!");
            firebase.firestore().collection(current).doc(id).delete();
            console.log("Document successfully deleted!");
            this.props.history.push("/")
            }).catch((error) => {
                console.error("Error duplicating document: ", error);
            });
    }

    /**
     * Creates a text file of heirloom info server-side then downloads it.
     */
    downloadTxtFile(id){
        firebase.firestore().collection(this.state.target).doc(id).get().then((doc) => {
            if (doc.exists) {
                var ng = "None assigned";
                if (this.state.heirlooms.nextguardian) {
                    ng = this.state.heirlooms.nextguardian;
                }
                var blob = new Blob([JSON.stringify(this.state.heirlooms)],
                    {type: "text/plain;charset=utf-8"});
                saveAs(blob, this.state.heirlooms.title + ".txt");
            }
            }).catch((error) => {
                console.error("Error duplicating document: ", error);
            });
    }

    /**
     * Changes nextguardian to guardian, asks for new nextguardian
     */
    inherit(id){
        var futureguardian = prompt(
            "Optional: Please state the new Next Guardian.");
        console.log("Old Guardian: " + this.state.guardian);
        console.log("New Guardian: " + this.state.nextguardian);
        console.log("Future Guardian: " + futureguardian);
        const updateRef = firebase.firestore().collection('boards')
            .doc(this.state.key);
        updateRef.set({
            title:this.state.title,
            description:this.state.description,
            guardian:this.state.nextguardian,
            nextguardian:futureguardian,
            imagesLocations:this.state.imagesLocations
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
            console.error("Error performing Inheritance: ", error);
            window.alert("Error performing Inheritance, please edit manually.")
        });
    }

    /**
     * Renders the required buttons dynamically, depending on whether the
     * item is archived or not and if it has a next guardian.
     */
    renderEditDelete() {
        if (this.state.target === 'boards') {
            if (this.state.nextguardian === ''){
                return(
                    <div className='floating-button'>
                        <a href={`/edit/${this.state.key}`} className =
                            "btn btn-outline-warning">Edit</a>
                        <div className="divider"></div>
                        <button onClick={this.downloadTxtFile.bind(this, 
                            this.state.key)} className =
                            "btn btn-outline-warning">Download</button>
                        <div className="divider"></div>
                        <button onClick={this.archive.bind(this,
                            this.state.key)} className="btn btn-outline-warning">
                            {this.state.archive_text}</button>
                    </div>
                );
            }
            else {
            return(
                <div  className='floating-button'>
                    <a href={`/edit/${this.state.key}`} className =
                        "btn btn-outline-warning">Edit</a>
                    <div className="divider"></div>
                    <button onClick={this.downloadTxtFile.bind(this,
                        this.state.key)} className =
                        "btn btn-outline-warning">Download</button>
                    <div className="divider"></div>
                    <button onClick = {this.inherit.bind(this, this.state.key)} 
                        className = "btn btn-outline-warning">Inherit</button>
                    <div className="divider"></div>
                    <button onClick={this.archive.bind(this, this.state.key)}
                        className="btn btn-outline-warning">
                        {this.state.archive_text}</button>
                </div>
                );
            }
        } else {
            return(
                <div  className='floating-button'>
                <button onClick={this.archive.bind(this, this.state.key)}
                className="btn btn-outline-warning">{this.state.archive_text}
                </button>
                </div>);
        }
    }

    /**
     * Sets index for OLIVER
     */
    setIndex(i) {
        if (i === this.state.images.length) {
            return 0;
        } else {
            return i++;
        }
    }

    /**
     * React function which renders component
     */
    render() {
        // Authentication process
        if(this.state.user == null && this.state.isAuth){
            return <Redirect to= '/login'/>
        }

        document.title = this.state.heirlooms.title;

        // Set up map and markers
        let map = "No location given.";
        let markers = [];
        // Create markers
        if(this.state.heirlooms.marker) {
            markers.push(
                <Marker
                key={0}
                position={{
                    lat: this.state.heirlooms.marker[0],
                    lng: this.state.heirlooms.marker[1]}}/>
            )
        }
        // Create map
        if (this.state.heirlooms.marker) {map =
            <Map google={this.props.google}
                    style={style}
                    initialCenter={{
                        lat: this.state.heirlooms.marker[0],
                        lng: this.state.heirlooms.marker[1]
                    }}
                    zoom={4}
                >
                {markers}
            </Map>
        }

        // Load page
        return (
            <div>
            <Navbar/>
            <div className="container show-container">
                <h3 className="panel-title">
                    {this.state.heirlooms.title} {this.state.heirlooms.date ? ("- " + this.state.heirlooms.date) : ""}
                </h3>
                <div className="show-grid">
                    <div className="show-description">
                        <dt>Description</dt>
                    </div>
                    <div className="show-description-info">
                        <dt>{this.state.heirlooms.description}</dt>
                    </div>
                    <div className="show-guardian">
                        <dt>Guardian</dt>
                    </div>
                    <div className="show-guardian-info">
                        <dt>{this.state.heirlooms.guardian}</dt>
                    </div>
                    <div className="show-nextguardian">
                        <dt>Next guardian</dt>
                    </div>
                    <div className="show-nextguardian-info">
                        <dt>{this.state.heirlooms.nextguardian === "" ? "None" : this.state.heirlooms.nextguardian}</dt>
                    </div>
                    <div className="show-images">
                        <dd className="image-dd"><Gallery className="gallery" index={this.state.index}
                            onRequestChange={i => {
                                this.setState({
                                    index: this.setIndex(i)
                                })
                            }}>
                                {this.state.images.map(image => (
                                    <GalleryImage className="galleryImage" objectFit="contain" key={image} src={image} />
                                    ))}
                    </Gallery></dd>
                    </div>
                    <div className="show-map">
                            {this.state.heirlooms.marker || this.state.heirlooms.marker !== "" ? map : "No location set"}
                    </div>
                </div>
                <div>{this.renderEditDelete()}</div>
            </div>
            </div>
        );
    }
}

const style = {
    width: '95%',
    height: '100%',
    margin: 'auto',
}

export default GoogleApiWrapper({
    apiKey: ('AIzaSyDNows5nkmeLel6-_ecsqGzlK1E2xqr4bs')
  })(Show);
