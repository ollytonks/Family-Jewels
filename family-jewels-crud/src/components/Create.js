import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import firebase from '../Firebase';
import { Link } from 'react-router-dom';
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

const acceptedFileTypes = 'image/x-png, image/png, image/jpg, image/jpegf, image/jpeg'
const acceptedFileTypesArray = acceptedFileTypes.split(",").map((item) => {return item.trim()})
function uuidv4(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}
class Create extends Component {

    constructor() {
        super();
        this.ref = firebase.firestore().collection('boards');
        this.state = {
            heirlooms: [],
            title: '',
            description: '',
            author: '',
            nextguardian: '',
            progress: 0,
            images: [],
            imagesLocations: [],
            previews: []
        };
    }

    onCollectionUpdate = (querySnapshot) => {
        const list = [];
        querySnapshot.forEach((doc) => {
            const { title, description, guardian, nextguardian } = doc.data();
            list.push({
                key: doc.id,
                doc, // DocumentSnapshot
                title,
                description,
                guardian,
                nextguardian
            });
        });
        this.setState({
            heirlooms: list
        });
    }

    componentDidMount() {
        this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
    }

    onChange = (e) => {
        const state = this.state
        state[e.target.name] = e.target.value;
        this.setState(state);
    }

    dropzoneChange = e => {
        if (e.target.files[0]) {
            const image = e.target.files[0];
            this.setState(() => ({
                image
            }));
        }
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
            if (!acceptedFileTypesArray.includes(currentFileType)){
                alert("This file is not allowed. Only images are allowed.")
                return false
            }
            return true
        }
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
    onSubmit = (e) => {
        e.preventDefault();
        var found = false;
        const images = this.state.images;
        var imagesID = [];
        var imagesLocations = [];
        
        for (let i=0; i < this.state.heirlooms.length; i++) {
            if (this.state.heirlooms[i].title === this.state.title) {
                found = true;
            }
        }
        if (!found) {
            const { title, description, guardian, nextguardian } = this.state;
            if (title && description && guardian) {
                for (var i = 0; i < images.length; i++){
                    var id = uuidv4()
                    imagesID.push([images[i], id]);
                    imagesLocations.push(id);
                    this.individualUpload(images[i], id)
                }
                this.ref.add({
                    title,
                    description,
                    guardian,
                    nextguardian,
                    imagesLocations
                }).then((docRef) => {
                this.setState({
                    title: '',
                    description: '',
                    guardian: '',
                    nextguardian: '',
                    imagesLocations: ''
                });
                this.props.history.push("/")
                })
                .catch((error) => {
                console.error("Error adding document: ", error);
                });
            } else {
                window.alert("An heirloom must have a title, description, and guardian.");
            }
        } else {
            window.alert("An heirloom already exists with that title.");
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
        const { title, description, guardian, nextguardian } = this.state;
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
                    </div>
                </div>
                <form class="form-inline">
                <a class="nav-item nav-link" href="/login">Login</a>
                </form>
            </nav>
        <div class="container">
            <div class="panel panel-default">
            <div class="panel-heading">
                <h3 class="panel-title">
                ADD HEIRLOOM
                </h3>
            </div>
            <div class="panel-body">
                <form onSubmit={this.onSubmit}>
                <div class="form-group">
                    <label for="title">Title:</label>
                    <input type="text" class="form-control" name="title" value={title} onChange={this.onChange} placeholder="Title" />
                </div>
                <div class="form-group">
                    <label for="description">Description:</label>
                    <textArea class="form-control" name="description" onChange={this.onChange} placeholder="Description" cols="80" rows="3">{description}</textArea>
                </div>
                <div class="form-group">
                    <label for="guardian">Guardian:</label>
                    <input type="text" class="form-control" name="guardian" value={guardian} onChange={this.onChange} placeholder="Guardian" />
                </div>
                <div class="form-group">
                    <label for="nextguardian">Next Guardian:</label>
                    <input type="text" class="form-control" name="nextguardian" value={nextguardian} onChange={this.onChange} placeholder="Next guardian" />
                </div>
                <label for="imageDropzone">Images: </label>
                <div class = "dropzone">
                    <Dropzone onDrop={this.handleOnDrop} accept={acceptedFileTypes} name="imageDropzone">
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
                <button type="submit" class="btn btn-success" disabled={!this.state.images.length}>Submit</button>
                </form>
            </div>
            </div>
        </div>
        </div>
        );
    }
}

export default Create;
