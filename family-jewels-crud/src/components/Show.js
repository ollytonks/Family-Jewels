import React, { Component } from 'react';
import firebase from '../Firebase';
import { saveAs } from 'file-saver';
import { Gallery, GalleryImage } from "react-gesture-gallery";
import Navbar from './elements/Navbar';

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
            <div class="button-row">
            <a href={`/edit/${this.state.key}`} class = "btn btn-outline-warning">Edit</a>
            <div class="divider"></div>
            <button onClick={this.downloadTxtFile.bind(this, this.state.key)} class = "btn btn-outline-warning">Download</button>
            <div class="divider"></div>
            <button onClick={this.archive.bind(this, this.state.key)} class="btn btn-outline-warning">{this.state.archive_text}</button>
            </div>
            );
        } else {
            return( <button onClick={this.archive.bind(this, this.state.key)} class="btn btn-outline-warning">{this.state.archive_text}</button>);
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
        return (
            <div>
            <Navbar/>
            <div class="container">
            <div class="panel panel-default">
                <div class="panel-heading">
                <h3 class="panel-title">
                    {this.state.heirlooms.title}
                </h3>
                </div>
                <div class="panel-body">
                <dl>
                    <dt>Description</dt>
                    <dd>{this.state.heirlooms.description}</dd>
                    <dt>Guardian</dt>
                    <dd>{this.state.heirlooms.guardian}</dd>
                    <dt>{this.state.heirlooms.nextguardian === "" ? "" : "Next guardian"}</dt>
                    <dd>{this.state.heirlooms.nextguardian}</dd>
                    <dd><Gallery class="gallery" index={this.state.index}
                            onRequestChange={i => {
                                this.setState({
                                    index: this.setIndex(i)
                                })
                            }}>
                                {this.state.images.map(image => (
                            <GalleryImage class="galleryImage" objectFit="contain" key={image} src={image} />
                            ))}
                        </Gallery></dd>
                </dl>
                <div>{this.renderEditDelete()}</div>
                </div>
            </div>
            </div>
            </div>
        );
    }
}

export default Show;