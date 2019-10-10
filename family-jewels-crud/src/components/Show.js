import React, { Component } from 'react';
import firebase from '../Firebase';
import { saveAs } from 'file-saver';
import { Gallery, GalleryImage } from "react-gesture-gallery";
import Navbar from './elements/Navbar';
import './Show.css';
import {Map, Marker, GoogleApiWrapper} from 'google-maps-react';


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

    componentDidMount() {
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
        });
        this.state.archive_text = this.state.target === 'boards' ? 'Archive' : 'Restore';
    }
    componentDidUpdate() {
        this.state.archive_text = this.state.target === 'boards' ? 'Archive' : 'Restore';
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

    /* Creates a text file of heirloom info server-side then downloads it */
    downloadTxtFile(id){
        firebase.firestore().collection(this.state.target).doc(id).get().then((doc) => {
            if (doc.exists) {
                var ng = "None assigned";
                if (this.state.heirlooms.nextguardian) {
                    ng = this.state.heirlooms.nextguardian;
                }
                var blob = new Blob(["Title: ", this.state.heirlooms.title, "\nDescription: ",
                    this.state.heirlooms.description, "\nGuardian: ", this.state.heirlooms.guardian,
                    "\nNext guardian: ", ng], {type: "text/plain;charset=utf-8"});
                saveAs(blob, this.state.heirlooms.title + ".txt");
            }
            }).catch((error) => {
                console.error("Error duplicating document: ", error);
            });
    }

    // Function downloads an image
    // Due to security limitations, only opens a single image in a new tab
    // Does not download
    downloadImgFile(id) {
        for (var i = 0; i < this.state.images.length; i++) {
            var link = document.createElement("a");
            link.id=i;
            link.download = this.state.images[i];
            link.href = this.state.images[i];
            link.click();
        }
    }

    renderEditDelete() {
        if (this.state.target === 'boards') {
            return(
            <div class="button-row floating-row">
            <a href={`/edit/${this.state.key}`} class = "btn btn-outline-warning">Edit</a>
            <div class="divider"></div>
            <button onClick={this.downloadTxtFile.bind(this, this.state.key)} class = "btn btn-outline-warning">Download</button>
            <div class="divider"></div>
            <button onClick={this.archive.bind(this, this.state.key)} class="btn btn-outline-warning">{this.state.archive_text}</button>
            </div>
            );
        } else {
            return( 
                <div class="button-row floating-row">
                    <button onClick={this.archive.bind(this, this.state.key)} class="btn btn-outline-warning">{this.state.archive_text}</button>
                </div>);
        }
    }
    setIndex(i){
        if (i == this.state.images.length) {
            return 0;
        } else {
            return i++;
        }
    }

    render() {
        document.title = this.state.heirlooms.title;

        let map;
        let markers = [];

        // Create markers
        if(this.state.heirlooms.marker !== undefined) {
            markers.push(
                <Marker
                key={0}
                position={{
                    lat: this.state.heirlooms.marker[0],
                    lng: this.state.heirlooms.marker[1]}}/>
            )
            console.log(this.state.heirlooms.marker);
        }

        // Create map
        if (this.state.heirlooms.marker !== undefined) {map = 
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

        return (
            <div>
            <Navbar/>
            <div class="container show-container">
                <h3 class="panel-title">
                    {this.state.heirlooms.title} {this.state.heirlooms.date !== undefined ? (": " + this.state.heirlooms.date) : ""}
                </h3>
                <div class="show-grid">
                    <div class="show-description">
                        <dt>Description</dt>
                    </div>
                    <div class="show-description-info">
                        <dt>{this.state.heirlooms.description}</dt>
                    </div>
                    <div class="show-guardian">
                        <dt>Guardian</dt>
                    </div>
                    <div class="show-guardian-info">
                        <dt>{this.state.heirlooms.guardian}</dt>
                    </div>
                    <div class="show-nextguardian">
                        <dt>Next guardian</dt>
                    </div>
                    <div class="show-nextguardian-info">
                        <dt>{this.state.heirlooms.nextguardian === "" ? "None" : this.state.heirlooms.nextguardian}</dt>
                    </div>
                    <div class="show-images">
                        <dd class="image-dd"><Gallery class="gallery" index={this.state.index}
                            onRequestChange={i => {
                                this.setState({
                                    index: this.setIndex(i)
                                })
                            }}>
                                {this.state.images.map(image => (
                                    <GalleryImage class="galleryImage" objectFit="contain" key={image} src={image} />
                                    ))}
                    </Gallery></dd>
                    </div>
                    <div class="show-map">
                            {this.state.heirlooms.marker !== undefined || this.state.heirlooms.marker !== "" ? map : "No location set"}
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