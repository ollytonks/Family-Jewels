/**
 * Copyright (c) 2019
 *
 * The purpose of this file is to implement the create page and functionality
 * for the app. This involves the handling of text fields to send to Firebase
 * realtime database, as well as img files to upload to Firebase Storage. 
 *
 * @summary Creates an heirloom
 * @author FamilyJewels
 *
 * Created at     : 2019-08-28 
 * Last modified  : 2019-10-15
 */

// import all relevant libraries
import React, { Component } from 'react';
import {firebase, firebaseAuth} from '../Firebase';
import { Redirect } from 'react-router-dom';
import Dropzone from 'react-dropzone'
import Navbar from './elements/Navbar';
import MapContainer from './elements/MapContainer';

// accepted image types, don't want to accept files that are not images
const acceptedFileTypes =
    'image/x-png, image/png, image/jpg, image/jpegf, image/jpeg'
// turns the string into an array
const acceptedFileTypesArray = acceptedFileTypes.split(",").map((item) => 
    {return item.trim()})

/** When called returns a uniquely generated string ID 
 *  retrieved from: 
 *  https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 */
function uuidv4(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

class Create extends Component {

    /** Construct the create component react state */ 
    constructor() {
        super();
        
        // retrieve the firebase collection with our heirloom boards
        this.ref = firebase.firestore().collection('boards');

        /* set the initial state to be empty on load, as displaying creation
        all relevant states for heirloom data is present */
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

    /** Function that is called when the page is initially loaded, retrieves 
     *  the heirlooms from the database, to check for conflicting titles 
     *  for heirlooms. The snapshot retrieves all documents
     */
    onCollectionUpdate = (querySnapshot) => {
        const list = [];
        
        // get each document from the collection snapshot
        querySnapshot.forEach((doc) => {

            // retrieve information and add to heirlooms list
            const { title, date, description, guardian, nextguardian } 
                = doc.data();

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

        // update the state to have the list of heirlooms
        this.setState({
            heirlooms: list
        });
    }
    /** handles once the page is fully rendered */
    componentDidMount() {

        // unsubscribe from the collection reference after used
        this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
        
        // make sure the user is authenticated to use the page
        firebaseAuth.onAuthStateChanged(user => {
            this.setState({ user: firebase.auth().currentUser });
            this.setState({ isAuth: true });
        });
    }

    /** Function that is called when the input fields in the form change */
    onChange = (e) => {
        const state = this.state

        // Get information from the web page
        state[e.target.name] = e.target.value;
        this.setState(state);
    }

    /** Handles the dropzone when a file is dropped, or multiple files are
     *  dropped
     *  @param {File} files : array of all files added by user
     */
    handleOnDrop = (files) => {
        // Verify that there are files that can be uploaded
        if (files && files.length > 0){
            const isVerified = this.verifyFile(files)
            if (isVerified){

                // add to any existing images added by user then set the state
                files = this.state.images.concat(files);
                this.setState ({
                    images: files,

                    // generate the preview image to show in dropzone
                    previews: files.map(file => Object.assign(file, {
                        // create an image that can be displayed without hosting
                        preview: URL.createObjectURL(file)}))
                });
            }
        }
    }

    /** Verifies if supplied list of files are acceptable format
     *  @param {File} files : array of files added by user
     *  @return {Boolean}   : if acceptable files
     */
    verifyFile = (files) => {
        if (files && files.length > 0){
            const currentFile = files[0]
            const currentFileType = currentFile.type
            
            // check file types
            if (!acceptedFileTypesArray.includes(currentFileType)){
                alert("This file is not allowed. Only images are allowed.")
                return false
            }
            return true
        }
    }

    /** Uploads a single image to Firebase storage, prgressing the progress
     *  bar to visualise the update progress. As well as this waits until 
     *  all the images have been uploaded then sends user to home page
     *  @param {File} file     : file data to be uploaded
     *  @param {String} id     : generated ID to be used as the reference in  
     *  the database
     *  @param {Int} currFile  : represents index of file being uploaded
     *  @param {Int} numImages : total number of files to be uploaded
     */
    individualUpload = (file, id, currFile, numImages) => {
        // create upload reference on Firebase
        const uploadTask = firebase.storage().ref(`images/${id}`).put(file);

        /* if the current upload is the last, load the home page upon completion
        the copied code is necessary due to asyncronous call */
        if (currFile === numImages - 1) {uploadTask.on('state_changed',
            // called when Firebase returns an update snapshot
            (snapshot) => {
                // visualise progress
                const progress = Math.round((snapshot.bytesTransferred / 
                                             snapshot.totalBytes) * 100);
                this.setState({progress});
            },
            // if the upload isn't completed, show error to console
            (error) => {
                console.log(error);
            },
            // called when the upload task is complete. 
            () => {
                // reset progress, display success and load home page 
                const progress = 0;
                console.log("success");
                this.setState({progress});
                this.props.history.push("/")
            });
        } 
        // as above, with no homepage reset
        else { uploadTask.on('state_changed',
            (snapshot) => {
                const progress = Math.round((snapshot.bytesTransferred / 
                    snapshot.totalBytes) * 100);
                this.setState({progress});
            },
            (error) => {
                console.log(error);
            },
            () => {
                console.log("success - more to come");
            });
        }
        
    }

    /** Called when the form is submitted. Requires a unique title, guardian
     *  description and an image to be successful. Updates the state and 
     *  handles Firebase calls
     */
    onSubmit = (e) => {
        e.preventDefault();
        // used to check if pre-existing heirloom with same title
        let found = false;

        // get images, way to store id's and image locations
        const images = this.state.images;
        let imagesID = [];
        let imagesLocations = [];

        // check unique title
        for (let i=0; i < this.state.heirlooms.length; i++) {
            if (this.state.heirlooms[i].title === this.state.title) {
                found = true;
            }
        }
        
        // make sure correct length title
        if (this.state.title.length > 55) {
            window.alert("Title has a 55 character limit. You have " +
                            this.state.title.length.toString() + ".");
        } else if (!found) {
            const { title, date, marker, description, guardian, nextguardian } 
                = this.state;

            // make sure has all required fields, otherwise alert
            if (title && description && guardian && this.state.previews.length 
                != 0) {
                
                /* perform individual upload on each image, keeping track of 
                 all locations and ID's */
                for (let i = 0; i < images.length; i++) {
                    let id = uuidv4()
                    imagesID.push([images[i], id]);
                    imagesLocations.push(id);
                    this.individualUpload(images[i], id, i, images.length)
                }
                // add all information to the Firebase document
                this.ref.add({
                    title,
                    date,
                    marker,
                    description,
                    guardian,
                    nextguardian,
                    imagesLocations
                }).then((docRef) => {
                    // reset the page to have empty fields
                    this.setState({
                        title: '',
                        date: '',
                        marker: null,
                        description: '',
                        guardian: '',
                        nextguardian: '',
                        imagesLocations: ''
                    });
                }).catch((error) => {
                    console.error("Error adding document: ", error);
                });
            } else {
                window.alert("An heirloom must have a title, description," + 
                    "guardian, and at least one image.");
            }
        } else {
            window.alert("An heirloom already exists with that title.");
        }
    }

    /** Handles the removal of an image from the dropbox
     *  @param {Int} index : relevant preview to be removed
     */
    removePreview = (index) => {
        // get all images and previews
        let images = [], previews = [];
        images = images.concat(this.state.images);
        previews = previews.concat(this.state.previews);

        // remove relevant image from previews and tracked image files
        images.splice(index,1);
        previews.splice(index, 1);

        // update state
        this.setState({
            images: images,
            previews: previews
        });
    }

    /** Handles rendering of HTML to page. Is a react function that is called
     *  before componentDidMount()
     *  @return HTML page
     */
    render() {
        document.title = "Add heirloom";
        const { title, date, description, guardian, nextguardian } = this.state;
        /* takes the state previews which is a array of files and dynamically 
         generated display images and maps them to display within the dropzone
         also generates a remove button that calls remove preview*/
        const thumbs = this.state.previews.map((file,index) => (
            <div className="thumb" key={file.name}>
                <button type="button" className="close" aria-label="Close" 
                    onClick={() => this.removePreview(index)}>
                        <span aria-hidden="true">&times;</span>
                </button>
                <div className="thumb-inner">
                    <img alt="Thumb" src={file.preview} className="thumb-img"/>
                </div>
           </div>
        ));

        // check authentication
        if(this.state.isAuth == false){
            return (<div></div>);
        }
        // user is not logged in
        if(this.state.user == null && this.state.isAuth){
            console.log(" not authenticated");
            console.log(firebase.auth().currentUser);
            return <Redirect to= '/login'/>
        }

        // return rest of structure
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
                    <input type="text" 
                        className="form-control form-control-text-major" 
                        name="title" value={title} onChange={this.onChange} 
                        placeholder="Title*"/>
                    <input type="text" 
                        className="form-control form-control-text-minor" 
                        name="date" value={date} onChange={this.onChange} 
                        placeholder="Origin year"/>
                </div>
                <div className="form-group">
                    <textArea className="form-control" name="description" 
                        onChange={this.onChange} placeholder="Description" 
                        cols="80" rows="3">{description}</textArea>
                </div>
                <div className="form-group">
                    <input type="text" className="form-control" name="guardian" 
                        value={guardian} onChange={this.onChange} 
                        placeholder="Guardian*" />
                </div>
                <div className="form-group">
                    <input type="text" className="form-control" 
                        name="nextguardian" value={nextguardian} 
                        onChange={this.onChange} placeholder="Next guardian" />
                </div>
                <Dropzone name="imageDropzone" onDrop={this.handleOnDrop} 
                    accept={acceptedFileTypes}>
                    {({getRootProps, getInputProps}) => (
                        <section className="dropzone">
                            <div {...getRootProps()}>
                                <input {...getInputProps()} />
                                <p>Drag and drop files here, or 
                                    click HERE to select files*</p>
                            </div>
                            <aside className="thumbs-container">
                                {thumbs}
                            </aside>
                        </section>
                    )}
                </Dropzone>
                <div className="divider"/>
                <div className="progress">
                    <div className="progress-bar progress-bar-striped progress-bar-animated" 
                    style={{width: this.state.progress+'%'}}></div>
                </div>
                <div className="divider"/>
                <div/>
                <label for="submitButton"><i>* fields are mandatory</i></label>
                <br></br>
                <a>Click a location relevant to the item</a>
                <br></br>
                <a>{this.state.marker ? 'Currently selected: ' + 
                    this.state.marker[0] + ', ' + this.state.marker[1] : 
                    'Nothing selected'}</a>
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
                        <button name="submitButton" type="submit" 
                        className="btn btn-outline-warning" 
                        disabled={!this.state.images.length}>Submit</button>
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

export default Create;
