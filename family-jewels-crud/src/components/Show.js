import React, { Component } from 'react';
import firebase from '../Firebase';
import { Link } from 'react-router-dom';
import { saveAs } from 'file-saver';

class Show extends Component {

    constructor(props) {
        super(props);
        this.state = {
            heirlooms: {},
            key: '',
            title: '',
            target: this.props.match.params.collection,
            archive_text: ''
        };
        this.unsubscribe = null;
    }

    componentDidMount() {
        const ref = firebase.firestore().collection(this.state.target).doc(this.props.match.params.id);
        ref.get().then((doc) => {
            if (doc.exists) {
                this.setState({
                    heirlooms: doc.data(),
                    key: doc.id,
                    isLoading: false
                });
            } else {
                console.log("No such document!");
            }
        });
        this.state.archive_text = this.strcmp(this.state.target,'boards') >= 0 ? 'Archive' : 'Restore';
    }

    componentDidUpdate() {
        this.state.archive_text = this.strcmp(this.state.target,'boards') >= 0 ? 'Archive' : 'Restore';
    }

    delete(id) {
        firebase.firestore().collection(this.state.target).doc(id).delete().then(() => {
            console.log("Document successfully deleted!");
            this.props.history.push("/")
        }).catch((error) => {
            console.error("Error removing document: ", error);
        });
    }
    
    strcmp(str1, str2) {
        // http://kevin.vanzonneveld.net
        // +   original by: Waldo Malqui Silva
        // +      input by: Steve Hilder
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +    revised by: gorthaur
        // *     example 1: strcmp( 'waldo', 'owald' );
        // *     returns 1: 1
        // *     example 2: strcmp( 'owald', 'waldo' );
        // *     returns 2: -1
        return ( ( str1 == str2 ) ? 0 : ( ( str1 > str2 ) ? 1 : -1 ) );
    }

    // If current, archives. If archived, unarchives.
    archive(id){
        var current = this.state.target;
        var dest = '';
        console.log(this.strcmp(current, 'boards'))
        dest = this.strcmp(current, 'boards') >= 0 ? 'archived_boards' : 'boards';
        console.log(current);
        console.log(dest);
        firebase.firestore().collection(current).doc(id).get().then((doc) => {
            if (doc.exists) {
                console.log(this.state.board)
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
                console.log("Document successfully downloaded!");
            }
            }).catch((error) => {
                console.error("Error duplicating document: ", error);
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
                <h4><Link to="/">Heirloom List</Link></h4>
                <h3 class="panel-title">
                    {this.state.heirlooms.title}
                </h3>
                </div>
                <div class="panel-body">
                <dl>
                    <dt>Description:</dt>
                    <dd>{this.state.heirlooms.description}</dd>
                    <dt>Guardian:</dt>
                    <dd>{this.state.heirlooms.guardian}</dd>
                    <dt>Next guardian:</dt>
                    <dd>{this.state.heirlooms.nextguardian}</dd>
                </dl>
                <Link to={`/edit/${this.state.key}`} class="btn btn-success">Edit</Link>&nbsp;
                <button onClick={this.downloadTxtFile.bind(this, this.state.key)} class = "btn btn-primary">Download</button>
                <button onClick={this.delete.bind(this, this.state.key)} class="btn btn-danger">Delete</button>
                <button onClick={this.archive.bind(this, this.state.key)} class="btn btn-danger">{this.state.archive_text}</button>
                </div>
            </div>
            </div>
            </div>
        );
    }
}

export default Show;
