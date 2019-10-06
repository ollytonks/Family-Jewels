import React, { Component } from 'react';
import {firebase, firebaseAuth} from '../Firebase';
import { Link, Redirect} from 'react-router-dom';
import { saveAs } from 'file-saver';

class Show extends Component {

    constructor(props) {
        super(props);
        this.state = {
            heirlooms: {},
            key: '',
            title: '',
            icon: '',
            target: this.props.match.params.collection,
            archive_text: '',
            user: firebase.auth().currentUser
        };
        console.log(this.state.hlist);
        this.unsubscribe = null;
    }

    componentDidMount() {
        const ref = firebase.firestore().collection(this.state.target).doc(this.props.match.params.id);
        ref.get().then((doc) => {
            if (doc.exists) {
                var data = doc.data();
                console.log(data);
                firebase.storage().ref('images').child(data.imagesLocations[0]).getDownloadURL().then(url => {
                    this.setState({
                        heirlooms: doc.data(),
                        key: doc.id,
                        icon: url,
                        isLoading: false
                    });
                })
            } else {
                console.log("No such document!");
            }
        });
        this.state.archive_text = this.state.target === 'boards' ? 'Archive' : 'Restore';

        //authentication
        firebaseAuth.onAuthStateChanged(user => {
            this.setState({ user: firebase.auth().currentUser });
        });
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

    render() {
        var username = "Login";
        if(firebase.auth().currentUser != null){
             username = this.state.user.displayName;
             console.log(this.state.user.displayName);
        }
        //user is not logged in
        /*if(this.state.user == null){
            console.log(" not authenticated");
            console.log(firebase.auth().currentUser);
            return <Redirect to= '/login'/>
        }*/
        console.log(this.state.user);
        console.log(firebase.auth().currentUser);
        return (
            <div>
            <nav class="navbar navbar-default navbar-expand-lg d-none d-lg-block">
                <div class="collapse navbar-collapse">
                    <ul class="nav navbar-nav">
                        <li class="navbar-brand nav-item nav-link"><a href="/">Family Jewels</a></li>
                        <li class="nav-item nav-link"><a href="/create">Add Heirloom</a></li>
                    </ul>
                    <ul class="nav navbar-nav ml-auto">
                        <li class="nav-item nav-link"><a href="/login">{username}</a></li>
                    </ul>
                </div>
            </nav>
            <nav class="navbar navbar-default navbar-expand d-lg-none">
                    <ul class="nav navbar-nav">
                        <li class="navbar-brand nav-item nav-link"><a href="/">FJ</a></li>
                        <li class="nav-item nav-link"><a href="/create">Add Heirloom</a></li>
                    </ul>
                    <ul class="nav navbar-nav ml-auto">
                        <li class="nav-item nav-link"><a href="/login">{username}</a></li>
                    </ul>
            </nav>
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
                    <dd><img class="singleDisplayImg" src={this.state.icon}></img></dd>
                </dl>
                <a href={`/edit/${this.state.key}`} class = "btn btn-outline-warning">Edit</a>
                <div class="divider"></div>
                <button onClick={this.downloadTxtFile.bind(this, this.state.key)} class = "btn btn-outline-warning">Download</button>
                <div class="divider"></div>
                <button onClick={this.archive.bind(this, this.state.key)} class="btn btn-outline-warning">{this.state.archive_text}</button>
                </div>
            </div>
            </div>
            </div>
        );
    }
}

export default Show;
