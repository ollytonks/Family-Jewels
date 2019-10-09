import React, { Component } from 'react';
import firebase from '../Firebase';
import Dropzone from 'react-dropzone'

  

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
        if (rejectedFiles && rejectedFiles.length > 0 ){
            this.verifyFile(rejectedFiles)
        }
        if (files && files.length > 0){
            const isVerified = this.verifyFile(files)
            if (isVerified){
                files = this.state.images.concat(files);
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
    individualUpload = (file, id, currFile, numImages) => {
        const uploadTask = firebase.storage().ref(`images/${id}`).put(file);
        if (currFile === numImages - 1) {uploadTask.on('state_changed', 
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

    /* Creates a new heirloom in Firebase collection if:
        - Unique title
        - Title, description, and guardian fields non-empty */
    onSubmit = (e) => {
        e.preventDefault();
        var found = false;
        var uploads = false;
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
            if (title && description && guardian && this.state.previews.length != 0) {
                for (var i = 0; i < images.length; i++){
                    var id = uuidv4()
                    imagesID.push([images[i], id]);
                    imagesLocations.push(id);
                    this.individualUpload(images[i], id, i, images.length)
                    uploads = true;
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
                if (!uploads) {
                    this.props.history.push("/");
                }
                })
                .catch((error) => {
                console.error("Error adding document: ", error);
                });
            } else {
                window.alert("An heirloom must have a title, description, guardian, and at least one image.");
            }
        } else {
            window.alert("An heirloom already exists with that title.");
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
        const { title, description, guardian, nextguardian } = this.state;
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
                ADD HEIRLOOM
                </h3>
            </div>
            <div class="panel-body">
                <form onSubmit={this.onSubmit}>
                <div class="form-group">
                    <label for="title">Title: *</label>
                    <input type="text" class="form-control" name="title" value={title} onChange={this.onChange} placeholder="Title" />
                </div>
                <div class="form-group">
                    <label for="description">Description: </label>
                    <textArea class="form-control" name="description" onChange={this.onChange} placeholder="Description" cols="80" rows="3">{description}</textArea>
                </div>
                <div class="form-group">
                    <label for="guardian">Guardian: *</label>
                    <input type="text" class="form-control" name="guardian" value={guardian} onChange={this.onChange} placeholder="Guardian" />
                </div>
                <div class="form-group">
                    <label for="nextguardian">Next Guardian:</label>
                    <input type="text" class="form-control" name="nextguardian" value={nextguardian} onChange={this.onChange} placeholder="Next guardian" />
                </div>
                <label for="imageDropzone">Images: *</label>
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
                <div/>
                <label for="submitButton"><i>* fields are mandatory</i></label>
                <div/>
                <button name="submitButton" type="submit" class="btn btn-outline-warning" disabled={!this.state.images.length}>Submit</button>
                </form>
            </div>
            </div>
        </div>
        </div>
        );
    }
}

export default Create;
