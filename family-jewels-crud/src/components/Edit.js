/**
 * Copyright (c) 2019
 *
 * The purpose of this file is to implement edit page of the application.
 * This involves handling updating the database as well as the firebase storage
 * if there are new images to add, or old images that are redundant.
 *
 * @summary Edit an heirloom
 * @author FamilyJewels
 *
 * Created at     : 2019-09-01
 * Last modified  : 2019-10-15
 */

// Import relevant libraries
import React, { Component } from 'react';
import {firebase, firebaseAuth} from '../Firebase';
import { Redirect } from 'react-router-dom';
import Navbar from './elements/Navbar';
import MapContainer from './elements/MapContainer';
import Dropzone from 'react-dropzone';

// Used for the retrieved firebase image download URL
const IMAGE_URL = 87;
const IMAGE_LEN = 36;

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
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}
class Edit extends Component {

    /** Construct the edit component react state */ 
    constructor(props) {
        super(props);
        this.state = {
            key: '',
            title: '',
            description: '',
            guardian: '',
            nextguardian: '',
            imagesLocations: [],
            date: '',
            marker: null,
            previews: [],
            images: [],
            user: firebase.auth().currentUser,
            isAuth: false
        };
    }

    /** handles once the page is fully rendered. In the case of edit, needs 
     *  to retrieve and display all the documents information and images that
     *  can be edited.
     */
    componentDidMount() {
        // get wanted docs firebase reference
        const ref = firebase.firestore().collection('boards')
            .doc(this.props.match.params.id);
        let imageURLs = [], imageRefs = [];

        // once information has been retrieved, update all relevant areas
        ref.get().then((doc) => {
            // make sure it exists
            if (doc.exists) {
                const board = doc.data();

                // retrieve each image and keep track of all images
                for (let i = 0; i < board.imagesLocations.length; i++){
                    let currImage = board.imagesLocations[i];

                    // create asynchronous image retrieval
                    firebase.storage().ref('images').child(currImage).
                        getDownloadURL().then((url, currImage) => {
                        
                        // get image urls and file references
                        let id =  url.substr(IMAGE_URL,IMAGE_LEN)
                        imageURLs.push(url);
                        imageRefs.push(firebase.storage().ref('images/'+id));

                        // set al relevant information
                        this.setState({
                            key: doc.id,
                            title: board.title,
                            description: board.description,
                            guardian: board.guardian,
                            nextguardian: board.nextguardian,
                            
                            /* sort locations and images so correct information
                            is edited */
                            imagesLocations: board.imagesLocations.sort(),
                            images: imageRefs.sort(),

                            // create previewable images
                            previews: imageURLs.map(imageURL =>Object.assign(
                                    imageURL.substr(IMAGE_URL,IMAGE_LEN), 
                                    {preview: imageURL})).sort()
                        });
                        // update date if available
                        if (board.date !== undefined) {
                            this.setState ({
                                date: board.date,
                            })
                        }
                        // update marker if available
                        if (board.marker !== undefined) {
                            this.setState ({
                                marker: board.marker,
                            })
                        }
                    });
                }
            } else {
                console.log("No such document!");
            }
        });
        // get authentication
        firebaseAuth.onAuthStateChanged(user => {
            this.setState({ user: firebase.auth().currentUser });
            this.setState({ isAuth: true });
        });
    }

    /** Function that is called when the input fields in the form change */
    onChange = (e) => {
        const state = this.state
        state[e.target.name] = e.target.value;
        this.setState({board:state});
    }

    /** Handles the dropzone when a file is dropped, or multiple files are
     *  dropped. Manages files already uploaded to Firebase and those that
     *  aren't
     *  @param {File} files : array of all files added by user
     */
    handleOnDrop = (files) => {
        let filePreviews = [];
        // check if acceptable files to add
        if (files && files.length > 0){
            const isVerified = this.verifyFile(files);

            // get previous previews and files
            filePreviews = this.state.previews.concat(files);
            files = this.state.previews.concat(files);
            if (isVerified){
                this.setState ({
                    images: files,

                    /* map either a new id and dynamically generated display 
                    image if a new file is to be added, otherwise it is 
                    an already existing file with a display to be generated
                    from firebase storage */
                    previews: filePreviews.map(file => {
                        if (file instanceof File) {
                            return Object.assign(uuidv4(), {
                                preview: URL.createObjectURL(file)
                            });
                        } else {
                            return Object.assign(file, {
                                preview: file.preview
                            });
                        }
                    })
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

    /** Called when submit button is pressed, performs edit update */
    onSubmit = (e) => {
        e.preventDefault();

        // variables and constants to store information from page
        const images = this.state.images;
        const { title, description, guardian, nextguardian, date, marker }
            = this.state;
        let uploads = false;
        let imagesID = [];
        let imagesLocations = [];
        let prevLocations = this.state.previews;

        // make sure correct length title
        if (title.length > 55) {
            window.alert("Title has a 55 character limit. You have " 
                + title.length.toString() + ".");
        }
        // make sure desired fields are filled 
        else if (title && description && guardian && 
                this.state.previews.length !== 0) {

            // get document reference
            const updateRef = firebase.firestore().collection('boards')
                .doc(this.state.key);

            // perform image actions
            for (let i = 0; i < images.length; i++) {

                // if it is a new image, create an id, perform upload
                if (images[i] instanceof File) {
                    let id = uuidv4()
                    imagesID.push([images[i], id]);
                    imagesLocations.push(id);
                    this.individualUpload(images[i], id, i, images.length)
                    uploads = true;
                }
                // otherwise just keep the image location
                else {
                    imagesLocations.push(String(prevLocations[0]));
                    prevLocations.shift();
                }
            }
            // set document information
            updateRef.set({
                title,
                description,
                guardian,
                nextguardian,
                date,
                marker,
                imagesLocations: imagesLocations
            }).then((docRef) => {
                // clear the state
                this.setState({
                    key: '',
                    title: '',
                    description: '',
                    guardian: '',
                    nextguardian: '',
                    imagesLocations: [],
                    date: '',
                    marker: null,
                    previews: [],
                    images: []
                });
                // if no new images have been uploaded, revert to home page
                if (!uploads) {
                    this.props.history.push("/");
                }
            }).catch((error) => {
                console.error("Error adding document: ", error);
            });
        } else {
            window.alert("An heirloom must have a title, description, guardian and at least one image.");
        }
    }

    /** Handles rendering of HTML to page. Is a react function that is called
     *  before componentDidMount()
     *  @return HTML page
     */
    render() {
        document.title = "Edit heirloom";
        // user is not logged in
        if(this.state.user === null && this.state.isAuth){
            return <Redirect to= '/login'/>
        }
        let username = "";
        // user is authenticated
        if(this.state.user){
            if(this.state.user.displayName){
                 username = this.state.user.displayName;
             }
             else {
                 username = this.state.user.email;
             }
        }
        
        /* takes the state previews which is a array of files and dynamically 
         generated display or an image hosted by google firebase
         and maps them to display within the dropzone also generates a 
         remove button that calls remove preview */
        const thumbs = this.state.previews.map((file,index) => (
            <div className="thumb" key={index}>
                <button type="button" className="close" aria-label="Close" 
                    onClick={() => this.removePreview(index)}>
                        <span aria-hidden="true">&times;</span>
                </button>
                <div className="thumb-inner">
                    <img alt="Thumb" src={file.preview} className="thumb-img"/>
                </div>
           </div>
        ));

        // return rest of structure
        return (
            <div className="create-container-main">
                <Navbar/>
                <div className="create-container">
                    <div className="panel panel-default">
                    <div className="panel-heading">
                        <h3 className="panel-title">
                        EDIT HEIRLOOM
                        </h3>
                    </div>
                    <div className="panel-body">
                        <form onSubmit={this.onSubmit}>
                        <div className="form-group form-control-text">
                            <input type="text" className="form-control form-control-text-major" name="title" value={this.state.title} onChange={this.onChange} placeholder="Title" />
                            <input type="text" className="form-control form-control-text-minor" name="date" value={this.state.date} onChange={this.onChange} placeholder="Origin year"/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">Description:</label>
                            <input type="text" className="form-control" name="description" value={this.state.description} onChange={this.onChange} placeholder="Description" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="guardian">Guardian:</label>
                            <input type="text" className="form-control" name="guardian" value={this.state.guardian} onChange={this.onChange} placeholder="Guardian" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="nextguardian">Next Guardian:</label>
                            <input type="text" className="form-control" name="nextguardian" value={this.state.nextguardian} onChange={this.onChange} placeholder="Next guardian" />
                        </div>
                        <Dropzone name="imageDropzone" onDrop={this.handleOnDrop} accept={acceptedFileTypes}>
                            {({getRootProps, getInputProps}) => (
                                <section className="dropzone">
                                    <div {...getRootProps()}>
                                        <input {...getInputProps()} />
                                        <p>Drag and drop files here, or click HERE to select files</p>
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
                        <a>{this.state.marker ? 'Currently selected: ' + this.state.marker[0] + '°, ' + this.state.marker[1] + '°': 'Nothing selected'}</a>
                        <div className="map-container">
                            {<MapContainer
                                saveMarker={(t, map, c) => {
                                    this.setState({
                                        marker: [c.latLng.lat(),c.latLng.lng()]
                                    })
                                }}>
                            </MapContainer>}
                        </div>
                            <div className ="floating-button">
                                <button name="submitButton" type="submit" className="btn btn-outline-warning" disabled={!this.state.imagesLocations.length}>Submit</button>
                                <div className='divider'></div>
                                <a href={`/show/boards/${this.state.key}`} className="btn btn-outline-danger">Cancel</a>
                            </div>
                        </form>
                    </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Edit;
