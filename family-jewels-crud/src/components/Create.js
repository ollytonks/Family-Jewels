import React, { Component } from 'react';
import {firebase, firebaseAuth} from '../Firebase';
import { Redirect } from 'react-router-dom';
import Dropzone from 'react-dropzone'
import Navbar from './elements/Navbar';
import MapContainer from './elements/MapContainer';


const acceptedFileTypes =
    'image/x-png, image/png, image/jpg, image/jpegf, image/jpeg'
const acceptedFileTypesArray = acceptedFileTypes.split(",").map((item) => 
    {return item.trim()})
function uuidv4(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
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
            data: '',
            description: '',
            author: '',
            nextguardian: '',
            progress: 0,
            images: [],
            imagesLocations: [],
            previews: [],
            user: firebase.auth().currentUser,
            isAuth: false,
            marker: null,
            googleReverseGeolocation:null,
            date: ''
        };
    }

    onCollectionUpdate = (querySnapshot) => {
        const list = [];
        querySnapshot.forEach((doc) => {
            const { title, date, description, guardian, nextguardian } = doc.data();
            list.push({
                key: doc.id,
                doc, // DocumentSnapshot
                title,
                date,
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
        //authentication
        firebaseAuth.onAuthStateChanged(user => {
            this.setState({ user: firebase.auth().currentUser });
            this.setState({ isAuth: true });
        });
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
        if (this.state.title.length > 55) {
            window.alert("Title has a 55 character limit. You have " + this.state.title.length.toString() + ".");
        } else if (!found) {
            const { title, date, marker, description, guardian, nextguardian } = this.state;
            if (title && description && guardian && this.state.previews.length !== 0) {
                for (var i = 0; i < images.length; i++){
                    var id = uuidv4()
                    imagesID.push([images[i], id]);
                    imagesLocations.push(id);
                    this.individualUpload(images[i], id, i, images.length)
                    uploads = true;
                }
                this.ref.add({
                    title,
                    date,
                    marker,
                    description,
                    guardian,
                    nextguardian,
                    imagesLocations
                }).then((docRef) => {
                this.setState({
                    title: '',
                    date: '',
                    marker: null,
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
/*
    createMap() {
        return (
            <div className="map-box">
              <Map google={this.props.google}
                style={style}
                initialCenter={{
                    lat: -37.794921,
                    lng: 144.961446
                }}
                zoom={5}
                onClick={this.saveMarker}
              >
              {this.createMarker}
              </Map>
            </div>
          );
    }

    saveMarker (t, map, c) {
        this.setState({
            marker: [c.latLng.lat(),c.latLng.lng()]
        })
    }*/
/*
    createMarker() {
        console.log("being called");
        if (this.state.marker) {
            return (
                <Marker
                    title={this.state.title}
                    name={this.state.title}
                    position={{ lat: this.state.marker[0], lng:this.state.marker[1]}}
                />
            );
        } else {
            return (null);
        }
    }*/

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
        document.title = "Add heirloom";
        const thumbs = this.state.previews.map((file,index) => (
            <div className="thumb" key={file.name}>
                <button type="button" className="close" aria-label="Close" onClick={() => this.removePreview(index)}>
                        <span aria-hidden="true">&times;</span>
                </button>
                <div className="thumb-inner">
                    <img alt="Thumb" src={file.preview} className="thumb-img"/>
                </div>
           </div>
        ));
        const { title, date, description, guardian, nextguardian } = this.state;
        if(this.state.isAuth === false){
            return (<div></div>);
        }
        //user is not logged in
        if(this.state.user === null && this.state.isAuth){
            console.log(" not authenticated");
            console.log(firebase.auth().currentUser);
            return <Redirect to= '/login'/>
        }

        return (
            <div className="create-container-main">
            <Navbar/>
            <div className="create-container">
            <div className="panel panel-default">
            <div className="panel-heading">
                <h3 className="panel-title">
                ADD HEIRLOOM
                </h3>
            </div>
            <div className="panel-body">
                <form onSubmit={this.onSubmit}>
                <div className="form-group form-control-text">
                    <input type="text" className="form-control form-control-text-major" name="title" value={title} onChange={this.onChange} placeholder="Title*"/>
                    <input type="text" className="form-control form-control-text-minor" name="date" value={date} onChange={this.onChange} placeholder="Origin year"/>
                </div>
                <div className="form-group">
                    <textArea className="form-control" name="description" onChange={this.onChange} placeholder="Description" cols="80" rows="3">{description}</textArea>
                </div>
                <div className="form-group">
                    <input type="text" className="form-control" name="guardian" value={guardian} onChange={this.onChange} placeholder="Guardian*" />
                </div>
                <div className="form-group">
                    <input type="text" className="form-control" name="nextguardian" value={nextguardian} onChange={this.onChange} placeholder="Next guardian" />
                </div>
                <Dropzone name="imageDropzone" onDrop={this.handleOnDrop} accept={acceptedFileTypes}>
                    {({getRootProps, getInputProps}) => (
                        <section className="dropzone">
                            <div {...getRootProps()}>
                                <input {...getInputProps()} />
                                <p>Drag and drop files here, or click HERE to select files*</p>
                            </div>
                            <aside className="thumbs-container">
                                {thumbs}
                            </aside>
                        </section>
                    )}
                </Dropzone>
                <div className="divider"/>
                <div className="progress">
                    <div className="progress-bar progress-bar-striped progress-bar-animated" style={{width: this.state.progress+'%'}}></div>
                </div>
                <div className="divider"/>
                <div/>
                <label for="submitButton"><i>* fields are mandatory</i></label>
                <br></br>
                <a>Click a location relevant to the item</a>
                <br></br>
                <a>{this.state.marker ? 'Currently selected: ' + this.state.marker[0] + '°, ' + this.state.marker[1] + '°' : 'Nothing selected'}</a>
                <div/>
                <div className="map-container">
                    {<MapContainer
                        saveMarker={(t, map, c) => {
                            this.setState({
                                marker: [c.latLng.lat(),c.latLng.lng()]
                            })
                        }}>
                    </MapContainer>}
                </div>
                <div className="floating-button">
                    <div class ="floating-button-tile">
                        <button name="submitButton" type="submit" className="btn btn-outline-warning" disabled={!this.state.images.length}>Submit</button>
                    </div>
                </div>
                </form>
            </div>
            </div>
        </div>
        </div>
        );
    }
}

const style = {
    width: '80%',
    height: '50%',
    'max-height': '300px'
}

export default Create;
