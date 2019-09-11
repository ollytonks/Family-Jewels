import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import firebase from '../Firebase';

class UploadImage extends Component {
    constructor() {
        super();
        this.state = {
            image: null,
            url: '',
            progress: 0,
            title: ''
        };
    }

    handleChange = e => {
        if (e.target.files[0]) {
            const image = e.target.files[0];
            this.setState(() => ({
                image
            }));
        }
    }
    handleUpload = () => {
        const {
            image
        } = this.state;
        const uploadTask = firebase.storage().ref(`images/${image.name}`).put(image);
        uploadTask.on('state_changed',
            (snapshot) => {
                // progress function ....
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                this.setState({
                    progress
                });
            },
            (error) => {
                // error function ....
                console.log(error);
            },
            () => {
                // complete function ....
                firebase.storage().ref('images').child(image.name).getDownloadURL().then(url => {
                    console.log(url);
                    this.setState({
                        url
                    });
                })
            });
    }
    render() {
            const style = {
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            };
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
        <div class="panel panel-default">
            <div class="panel-heading">
                <h4><Link to="/">Heirloom List</Link></h4>
                    <h3 class="panel-title">
                    {this.state.title}
                    </h3>
            </div>
            <div>
                <progress value={this.state.progress} max="100"/>
                <br/>
                <input type="file" onChange={this.handleChange}/>
                <button onClick={this.handleUpload}>Upload</button>
                <br/>
                <img src={this.state.url || 'http://via.placeholder.com/400x300'} alt="Uploaded images" height="300" width="400"/>
            </div>
        </div>
        </div>

        )
    }
}

export default UploadImage;
