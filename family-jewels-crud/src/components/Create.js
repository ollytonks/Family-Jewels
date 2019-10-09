import React, { Component } from 'react';
import firebase from '../Firebase';
import Dropzone from 'react-dropzone'
import Navbar from './elements/Navbar';
import MapContainer from './elements/MapContainer';
import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';

  

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
            data: '',
            description: '',
            author: '',
            nextguardian: '',
            progress: 0,
            images: [],
            imagesLocations: [],
            previews: [],
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


    /* Creates a new heirloom in Firebase collection if:
        - Unique title
        - Title, description, and guardian fields non-empty */
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
        if (this.state.title.length > 55) {
            window.alert("Title has a 55 character limit. You have " + this.state.title.length.toString() + ".");
        } else if (!found) {
            const { title, date, marker, description, guardian, nextguardian } = this.state;
            if (title && description && guardian) {
                for (var i = 0; i < images.length; i++){
                    var id = uuidv4()
                    imagesID.push([images[i], id]);
                    imagesLocations.push(id);
                    this.individualUpload(images[i], id)
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

    createMap() {
        return (
            <div class="map-box">
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
    }

    createMarker() {
        console.log("being called");
        if (this.state.marker) {
            console.log("rendering");
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
    }

    removePreview(index) {
        var images = this.state.images.splice(index, 1)
        console.log(images);
       
    }
    render() {             
        document.title = "Add heirloom";
        const thumbs = this.state.previews.map((file,index) => (
            <div class="thumb" key={file.name}>
                <button type="button" class="close" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                </button>
                <div class="thumb-inner">
                    <img src={file.preview} class="thumb-img"/>
                </div>
           </div>
        ));
        const { title, date, description, guardian, nextguardian } = this.state;
        return (
            <div class="create-container-main">
            <Navbar/>
            <div class="create-container">
            <div class="panel panel-default">
            <div class="panel-heading">
                <h3 class="panel-title">
                ADD HEIRLOOM
                </h3>
            </div>
            <div class="panel-body">
                <form onSubmit={this.onSubmit}>
                <div class="form-group form-control-text">
                    <input type="text" class="form-control form-control-text-major" name="title" value={title} onChange={this.onChange} placeholder="Title*"/>
                    <input type="text" class="form-control form-control-text-minor" name="date" value={date} onChange={this.onChange} placeholder="Origin date"/>
                </div>
                <div class="form-group">
                    <textArea class="form-control" name="description" onChange={this.onChange} placeholder="Description" cols="80" rows="3">{description}</textArea>
                </div>
                <div class="form-group">
                    <input type="text" class="form-control" name="guardian" value={guardian} onChange={this.onChange} placeholder="Guardian*" />
                </div>
                <div class="form-group">
                    <input type="text" class="form-control" name="nextguardian" value={nextguardian} onChange={this.onChange} placeholder="Next guardian" />
                </div>
                <Dropzone name="imageDropzone" onDrop={this.handleOnDrop} accept={acceptedFileTypes}>
                    {({getRootProps, getInputProps}) => (
                        <section class="dropzone">
                            <div {...getRootProps()}>
                                <input {...getInputProps()} />
                                <p>Drag and drop files here, or click HERE to select files*</p>
                            </div>
                            <aside class="thumbs-container">
                                {thumbs}
                            </aside>
                        </section>
                    )}
                </Dropzone>
                <div/>
                <label for="submitButton"><i>* fields are mandatory</i></label>
                <br></br>
                <a>Click a location relevant to the item</a>
                <br></br>
                <a>{this.state.marker ? 'Currently selected: ' + this.state.marker[0] + ', ' + this.state.marker[1] : 'Nothing selected'}</a>
                <div/>
                <div class="map-container">
                    {<MapContainer
                        saveMarker={(t, map, c) => {
                            this.setState({
                                marker: [c.latLng.lat(),c.latLng.lng()]
                            })
                        }}>
                    </MapContainer>}
                </div>
                <div class="floating-button">
                    <div class ="floating-button-tile">
                        <button name="submitButton" type="submit" class="btn btn-outline-warning" disabled={!this.state.images.length}>Submit</button>
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

/*                             const lat = event.latLng.lat();
                            const lng = event.latLng.lng();
                            let url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyDNows5nkmeLel6-_ecsqGzlK1E2xqr4bs`
                            axios.get(url).then(response => {
                                this.setState({
                                googleReverseGeolocation: response.data.results[0].formatted_address,
                                marker: {position:{lat:event.latLng.lat(),lng:event.latLng.lng()}},
                                });
                            this.props.onMapClickChange(lat, lng, response.data.results[0].formatted_address);
                            console.log(this.state); 
                            });*/

const style = {
    width: '80%',
    height: '50%',
    'max-height': '300px'
}

export default Create;
