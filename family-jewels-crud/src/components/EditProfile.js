/**
 * Copyright (c) 2019
 *
 * File handles management of user display information.
 *
 * @summary Manages user display information
 * @author FamilyJewels
 *
 * Created at     : 2019-09-28
 * Last modified  : 2019-10-15
 */
import React, { Component } from 'react';
import {firebase, firebaseAuth} from '../Firebase';
import { Redirect} from 'react-router-dom';
import '../App.css';
import Navbar from './elements/Navbar';

/* EditProfile component to manage user display information */
class EditProfile extends Component {

    /** React function to initialise EditProfile component and its state
    **/
    constructor() {
        super();
        this.state = {
            user : firebase.auth().currentUser,
            isAuth : false,
            displayName : ""
        }
    }

    /** React function called when components have been mounted
     *  Loads authentication information from firebase
    **/
    componentDidMount() {
        //check if still signed in
        firebaseAuth.onAuthStateChanged(user => {
            this.setState({ user: firebase.auth().currentUser });
            this.setState({ isAuth: true});
        });

    }

    /** Update user's display name through firebase
    **/
    updateProfile = (e) => {
        //ensure user has entered a name
        if(this.state.displayName == null || this.state.displayName == ""){
            alert("No name entered")
        }
        //update display name
        else {
            this.state.user.updateProfile( {
                displayName: this.state.displayName
            });
            //redirect to app
            this.props.history.push("/");
        }
    }

    /** React's render function which renders the EditProfile component to the UI
        @return HTML to be rendered
    **/
    render() {
        //check if user is signed in
        if(this.state.user === null && this.state.isAuth){
            //user not authenticated, redirect to login page
            this.props.history.push("/Login");
            return <Redirect to= '/login'/>
        }
        //user is signed in
        var username = "";
        //verify if they have a display name
        if(this.state.user){
            if(this.state.user.displayName){
                username = this.state.user.displayName;
            }
            //use email as username
            else {
                username = this.state.user.email;
            }
        }
        return(
            <div>
            <Navbar/>
                <div className="profile-container">
                <div className="col-md-12" align="center">
                    <div className="col">
                        <h2 className="centre-title">
                        {username}
                        </h2>
                    </div>
                </div>
                    <input type="text" className="form-control"
                    name="displayName" placeholder={username} value={this.state.displayName}
                        onChange={e => this.setState({displayName: e.target.value})}/>
                    <div className="col-md-12" align="center">
                     <button type="button" className="btn btn-outline-warning" onClick= {this.updateProfile}>
                        Save</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default EditProfile;
