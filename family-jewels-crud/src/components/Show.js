import React, { Component } from 'react';
import firebase from '../Firebase';
import { Link } from 'react-router-dom';

class Show extends Component {

    constructor(props) {
        super(props);
        this.state = {
            board: {},
            key: '',
            title: ''
        };
    }

    componentDidMount() {
        const ref = firebase.firestore().collection('boards').doc(this.props.match.params.id);
        ref.get().then((doc) => {
            if (doc.exists) {
                this.setState({
                    board: doc.data(),
                    key: doc.id,
                    isLoading: false
                });
            } else {
                console.log("No such document!");
            }
        });
    }

    delete(id){
        firebase.firestore().collection('boards').doc(id).delete().then(() => {
            console.log("Document successfully deleted!");
            this.props.history.push("/")
        }).catch((error) => {
            console.error("Error removing document: ", error);
        });
    }

    archive(id){
        firebase.firestore().collection('boards').doc(id).get().then((doc) => {
            if (doc.exists) {
                console.log(this.state.board)
                firebase.firestore().collection('archived_boards').add(this.state.board);
            }
            console.log("Document successfully duplicated!");
            firebase.firestore().collection('boards').doc(id).delete();
            console.log("Document successfully deleted!");
            this.props.history.push("/")
            }).catch((error) => {
                console.error("Error duplicating document: ", error);
            });
      }

    render() {
        return (
            <div class="container">
            <div class="panel panel-default">
                <div class="panel-heading">
                <h4><Link to="/">Heirloom List</Link></h4>
                <h3 class="panel-title">
                    {this.state.board.title}
                </h3>
                </div>
                <div class="panel-body">
                <dl>
                    <dt>Description:</dt>
                    <dd>{this.state.board.description}</dd>
                    <dt>Guardian:</dt>
                    <dd>{this.state.board.author}</dd>
                    <dt>Next guardian:</dt>
                    <dd>{this.state.board.nextguardian}</dd>
                </dl>
                <Link to={`/edit/${this.state.key}`} class="btn btn-success">Edit</Link>&nbsp;
                <button onClick={this.delete.bind(this, this.state.key)} class="btn btn-danger">Delete</button>
                <button onClick={this.archive.bind(this, this.state.key)} class="btn btn-danger">Archive</button>
                </div>
            </div>
            </div>
        );
    }
}

export default Show;
