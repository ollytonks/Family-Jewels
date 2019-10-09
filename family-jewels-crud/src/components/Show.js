import React, { Component } from 'react';
import firebase from '../Firebase';
import { saveAs } from 'file-saver';
import { Gallery, GalleryImage } from "react-gesture-gallery";


class Show extends Component {

    constructor(props) {
        super(props);
        this.state = {
            heirloom: {},
            key: '',
            title: '',
            images: [],
            target: this.props.match.params.collection,
            archive_text: '',

            description: '',
            guardian: '',
            nextguardian: '',
            imagesLocations: [],
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
                console.log(data);
                this.setState({
                    heirloom: doc.data(),
                    key: doc.id,
                    isLoading: false,

                    title: data.title,
                    description: data.description,
                    guardian: data.guardian,
                    nextguardian: data.nextguardian,
                    imagesLocations: data.imagesLocations,
                });
                firebase.storage().ref('images').child(data.imagesLocations[0]).getDownloadURL().then(url => {
                    for (var i = 0; i < data.imagesLocations.length; i++){
                        firebase.storage().ref('images').child(data.imagesLocations[i]).getDownloadURL().then(url => {
                            imageRefs.push(url);
                            this.setState({
                                images: imageRefs,
                                isLoading: false,
                            });
                        });
                    }
                });
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
                firebase.firestore().collection(dest).add(this.state.heirloom);
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
                if (this.state.nextguardian) {
                    ng = this.state.nextguardian;
                }
                var blob = new Blob(["Title: ", this.state.title, "\nDescription: ",
                    this.state.description, "\nGuardian: ", this.state.guardian,
                    "\nNext guardian: ", ng], {type: "text/plain;charset=utf-8"});
                saveAs(blob, this.state.title + ".txt");
            }
            }).catch((error) => {
                console.error("Error duplicating document: ", error);
            });
    }

    /* Changes nextguardian to guardian, asks for new nextguardian */
    inherit(id){
        var futureguardian = prompt("Optional: Please state the new Next Guardian.");
        console.log("Old Guardian: " + this.state.guardian);
        console.log("New Guardian: " + this.state.nextguardian);
        console.log("Future Guardian: " + futureguardian);
        const updateRef = firebase.firestore().collection('boards').doc(this.state.key);
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

    renderEditDelete() {
        if (this.state.target === 'boards') {
            if (this.state.nextguardian === ''){
                return(
                    <div>
                        <a href={`/edit/${this.state.key}`} class = "btn btn-outline-warning">Edit</a>
                        <div class="divider"></div>
                        <button onClick={this.downloadTxtFile.bind(this, this.state.key)} class = "btn btn-outline-warning">Download</button>
                        <div class="divider"></div>
                        <button onClick={this.archive.bind(this, this.state.key)} class="btn btn-outline-warning">{this.state.archive_text}</button>
                    </div>
                );
            }
            else {
            return(
                <div>
                    <a href={`/edit/${this.state.key}`} class = "btn btn-outline-warning">Edit</a>
                    <div class="divider"></div>
                    <button onClick={this.downloadTxtFile.bind(this, this.state.key)} class = "btn btn-outline-warning">Download</button>
                    <div class="divider"></div>
                    <button onClick={this.archive.bind(this, this.state.key)} class="btn btn-outline-warning">{this.state.archive_text}</button>
                    <div class="divider"></div>
                    <button onClick = {this.inherit.bind(this, this.state.key)} class = "btn btn-outline-warning">Inherit</button>
                </div>
                );
            }
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
        return (
            <div>
            <nav class="navbar navbar-default navbar-expand-lg d-none d-lg-block">
                <div class="collapse navbar-collapse">
                    <ul class="nav navbar-nav">
                        <li class="navbar-brand nav-item nav-link"><a href="/">Family Jewels</a></li>
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
                <div class="panel-heading">
                <h3 class="panel-title">
                    {this.state.heirloom.title}
                </h3>
                </div>
                <div class="panel-body">
                <dl>
                    <dt>Description</dt>
                    <dd>{this.state.heirloom.description}</dd>
                    <dt>Guardian</dt>
                    <dd>{this.state.heirloom.guardian}</dd>
                    <dt>{this.state.heirloom.nextguardian === "" ? "" : "Next guardian"}</dt>
                    <dd>{this.state.heirloom.nextguardian}</dd>
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
