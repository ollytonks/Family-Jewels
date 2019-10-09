import React, { Component } from 'react';
import firebase from '../Firebase';
import Dropzone from 'react-dropzone';

const acceptedFileTypes = 'image/x-png, image/png, image/jpg, image/jpegf, image/jpeg'
const acceptedFileTypesArray = acceptedFileTypes.split(",").map((item) => {return item.trim()})
function uuidv4(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}
class Edit extends Component {

    constructor(props) {
        super(props);
        this.state = {
            key: '',
            title: '',
            description: '',
            guardian: '',
            nextguardian: '',
            imagesLocations: [],
            previews: [],
            images: []
        };
    }

    componentDidMount() {
        const ref = firebase.firestore().collection('boards').doc(this.props.match.params.id);
        var imageURLs = [];
        var imageRefs = [];
        ref.get().then((doc) => {
            if (doc.exists) {
                const board = doc.data();
                for (var i = 0; i < board.imagesLocations.length; i++){
                    firebase.storage().ref('images').child(board.imagesLocations[i]).getDownloadURL().then(url => {
                        imageURLs.push(url);
                        imageRefs.push(firebase.storage().ref('images/'+board.imagesLocations[i]));
                        this.setState({
                            key: doc.id,
                            title: board.title,
                            description: board.description,
                            guardian: board.guardian,
                            nextguardian: board.guardian,
                            imagesLocations: board.imagesLocations,
                            images: imageRefs,
                            previews: imageURLs.map(imageURL =>Object.assign(imageURL, {preview: imageURL}))
                        });
                    });
                }
            } else {
                console.log("No such document!");
            }
        });
    }

    onChange = (e) => {
        const state = this.state
        state[e.target.name] = e.target.value;
        this.setState({board:state});
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
        var filePreviews = [];
        if (rejectedFiles && rejectedFiles.length > 0 ){
            this.verifyFile(rejectedFiles)
        }
        if (files && files.length > 0){
            const isVerified = this.verifyFile(files);
            filePreviews = this.state.previews.concat(files);
            files = this.state.previews.concat(files);
            if (isVerified){
                this.setState ({
                    images: files,
                    previews: filePreviews.map(file => {
                        if (file instanceof File) {
                            return Object.assign(file, {
                                preview: URL.createObjectURL(file)
                            });
                        } else {
                            return Object.assign(file, {
                                preview: file
                            });
                        }
                    })
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
    individualUpload = (file, id, i, imagesLength) => {
        const uploadTask = firebase.storage().ref(`images/${id}`).put(file);
        
        if (i === imagesLength - 1) {uploadTask.on('state_changed', 
            (snapshot) => {
                // progress function ....
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                this.setState({progress});
            }, 
            (error) => {
                // error function ....
                console.log(error);
            }, 
            () => {
                // complete function ....
                const progress = 0;
                console.log("success");
                this.setState({progress});
                this.props.history.push("/")
            });
        } else { uploadTask.on('state_changed', 
            (snapshot) => {
                // progress function ....
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                this.setState({progress});
            }, 
            (error) => {
                // error function ....
                console.log(error);
            }, 
            () => {
                // complete function ....
                console.log("success - more to come");
            });
        }
    }

    removePreview = (index) => {
        var images = [], previews = [];
        images = images.concat(this.state.images);
        previews = previews.concat(this.state.previews);

        images.splice(index,1);
        previews.splice(index, 1);
        
        this.setState({
            images: images,
            previews: previews
        });    
    }

    /* Updates heirloom info on submit from forms */
    onSubmit = (e) => {
        e.preventDefault();
        const images = this.state.images;
        var uploads = false;
        var imagesID = [];
        var imagesLocations = [];
        var prevLocations = this.state.imagesLocations;

        const { title, description, guardian, nextguardian} = this.state;
        if (title && description && guardian && this.state.previews.length != 0) {
            const updateRef = firebase.firestore().collection('boards').doc(this.state.key);
            for (var i = 0; i < images.length; i++){
                if (images[i] instanceof File){
                    var id = uuidv4()
                    imagesID.push([images[i], id]);
                    imagesLocations.push(id);
                    this.individualUpload(images[i], id, i, images.length)
                    uploads = true;
                }
                else {
                    console.log(images[i]);
                    imagesLocations.push(prevLocations[0]);
                    prevLocations.shift();
                } 
            }
            updateRef.set({
                title,
                description,
                guardian,
                nextguardian,
                imagesLocations: imagesLocations
            }).then((docRef) => {
                this.setState({
                    key: '',
                    title: '',
                    description: '',
                    guardian: '',
                    nextguardian: '',
                    imagesLocations: []
                });
                if (!uploads) {
                    this.props.history.push("/");
                }
            })
            .catch((error) => {
            console.error("Error adding document: ", error);
            });
        } else {
            window.alert("An heirloom must have a title, description, guardian and at least one iamge.");
        }
    }

    render() {
        const thumbs = this.state.previews.map((file,index) => (
            <div class="thumb" key={file.name}>
                <button type="button" class="close" aria-label="Close" onClick={() => this.removePreview(index)}>
                        <span aria-hidden="true">&times;</span>
                </button>
                <div class="thumb-inner">
                    <img src={file.preview} class="thumb-img"/>
                </div>
           </div>
        ));
        return (
            <div class="panel nav-bar">
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
                EDIT HEIRLOOM
                </h3>
            </div>
            <div class="panel-body">
                <form onSubmit={this.onSubmit}>
                <div class="form-group">
                    <label for="title">Title:</label>
                    <input type="text" class="form-control" name="title" value={this.state.title} onChange={this.onChange} placeholder="Title" />
                </div>
                <div class="form-group">
                    <label for="description">Description:</label>
                    <input type="text" class="form-control" name="description" value={this.state.description} onChange={this.onChange} placeholder="Description" />
                </div>
                <div class="form-group">
                    <label for="guardian">Guardian:</label>
                    <input type="text" class="form-control" name="guardian" value={this.state.guardian} onChange={this.onChange} placeholder="Guardian" />
                </div>
                <div class="form-group">
                    <label for="nextguardian">Next Guardian:</label>
                    <input type="text" class="form-control" name="nextguardian" value={this.state.nextguardian} onChange={this.onChange} placeholder="Next guardian" />
                </div>
                <Dropzone name="imageDropzone" onDrop={this.handleOnDrop} accept={acceptedFileTypes}>
                    {({getRootProps, getInputProps}) => (
                        <section class="dropzone">
                            <div {...getRootProps()}>
                                <input {...getInputProps()} />
                                <p>Drag and drop files here, or click HERE to select files</p>
                            </div>
                            <aside class="thumbs-container">
                                {thumbs}
                            </aside>
                        </section>
                    )}
                </Dropzone>
                <div class="divider"/>
                <div class="progress">
                    <div class="progress-bar progress-bar-striped progress-bar-animated" style={{width: this.state.progress+'%'}}></div>
                </div>
                <div class="divider"/>
                <button type="submit" class="btn btn-outline-warning">Submit</button>
                <div class="divider"></div>
                <a href={`/show/boards/${this.state.key}`} class="btn btn-outline-danger">Cancel</a>
                </form>
            </div>
            </div>
        </div>
        </div>
        );
    }
}

export default Edit;
