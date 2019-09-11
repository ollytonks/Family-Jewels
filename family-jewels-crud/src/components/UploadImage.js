import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import firebase from '../Firebase';
import Dropzone from 'react-dropzone'

const thumbsContainer = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16
};

const thumb = {
    display: 'inline-flex',
    borderRadius: 2,
    border: '1px solid #eaeaea',
    marginBottom: 8,
    marginRight: 8,
    width: 100,
    height: 100,
    padding: 4,
    boxSizing: 'border-box'
};

const thumbInner = {
    display: 'flex',
    minWidth: 0,
    overflow: 'hidden'
};

const img = {
    display: 'block',
    width: 'auto',
    height: '100%'
};

const imageMaxSize = 400000
const acceptedFileTypes = 'image/x-png, image/png, image/jpg, image/jpegf, image/jpeg'
const acceptedFileTypesArray = acceptedFileTypes.split(",").map((item) => {return item.trim()})
function uuidv4(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}
class UploadImage extends Component {
    constructor() {
        super();
        this.state = {
            image: null,
            url: '',
            progress: 0,
            title: '',
            images: [],
            imagesID: [],
            previews: []
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
        const images = this.state.images;
        var imagesID = [];
        for (var i = 0; i < images.length; i++){
            var id = uuidv4()
            imagesID.push([images[i], id]);
            this.individualUpload(images[i], id)
        }
        this.setState ({
            imagesID: imagesID
        })
    }
    individualUpload = (file, id) => {
        const uploadTask = firebase.storage().ref(`images/${id}`).put(file);
        uploadTask.on('state_changed', 
        (snapshot) => {
            // progrss function ....
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            this.setState({progress});
        }, 
        (error) => {
            // error function ....
            console.log(error);
        }, 
        () => {
            // complete function ....
            console.log("success");
        });
    }
    handleOnDrop = (files, rejectedFiles) => {
        console.log(files);
        if (rejectedFiles && rejectedFiles.length > 0 ){
            this.verifyFile(rejectedFiles)
        }
        if (files && files.length > 0){
            const isVerified = this.verifyFile(files)
            if (isVerified){
                this.setState ({
                    images: files,
                    previews: files.map(file => Object.assign(file, {
                        preview: URL.createObjectURL(file)}))
                });
            }
        }
    }
    verifyFile = (files) => {
        if (files && files.length > 0){
            const currentFile = files[0]
            const currentFileType = currentFile.type
            const currentFileSize = currentFile.size
            if(currentFileSize > imageMaxSize) {
                alert("This file is not allowed. " + currentFileSize/100000 + " Mb is too large")
                return false
            }
            if (!acceptedFileTypesArray.includes(currentFileType)){
                alert("This file is not allowed. Only images are allowed.")
                return false
            }
            return true
        }
    }
    render() {
        const thumbs = this.state.previews.map(file => (
             <div style={thumb} key={file.name}>
                <div style={thumbInner}>
                    <img
                    src={file.preview}
                    style={img}
                    />
                </div>
            </div>
        ));
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
                            {this.state.title}
                            </h3>
                    </div>
                </div>
                <div class = "panel-body">
                    <div class = "dropzone">
                        <Dropzone onDrop={this.handleOnDrop}
                            maxSize = {imageMaxSize}
                            accept = {acceptedFileTypes}>
                            {({getRootProps, getInputProps}) => (
                                <section>
                                    <div {...getRootProps()}>
                                        <input {...getInputProps()} />
                                        <p>Drag and drop files here, or click HERE to select files</p>
                                    </div>
                                    <aside style={thumbsContainer}>
                                        {thumbs}
                                    </aside>
                                </section>
                            )}
                        </Dropzone>
                    </div>
                    <div>
                        <button onClick={this.handleUpload} disabled={!this.state.images.length}>
                            Upload Files
                        </button>
                    </div>
                </div>
            </div>
            </div>
        )
    }
}

export default UploadImage;
