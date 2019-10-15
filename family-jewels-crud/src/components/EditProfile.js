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
            console.log("Auth state changed")
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
        console.log(this.state.user);
        console.log(this.state.isAuth);
        //user not authenticated, redirect to login page
        if(this.state.user === null && this.state.isAuth){
            console.log("not authenticated");
            console.log(firebase.auth().currentUser);
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
            <nav className="navbar navbar-default navbar-expand-lg d-none d-lg-block">
                <div className="collapse navbar-collapse">
                    <ul className="nav navbar-nav">
                        <li className="navbar-brand nav-item nav-link" ><a href="/">Family Jewels</a></li>
                        <li className="nav-item nav-link"><a href="/create">Add Heirloom</a></li>
                    </ul>
                    <ul className="nav navbar-nav ml-auto">
                    <li className="nav-item nav-link"><a href="/login">{username}</a></li>

                    </ul>
                </div>
            </nav>
            <nav className="navbar navbar-default navbar-expand d-lg-none">
                    <ul className="nav navbar-nav">
                        <li className="navbar-brand nav-item nav-link"><a href="/">FJ</a></li>
                        <li className="nav-item nav-link"><a href="/create">Add Heirloom</a></li>
                    </ul>
                    <ul className="nav navbar-nav ml-auto">
                        <li className="nav-item nav-link"><a href="/login">{username}</a></li>
                    </ul>
            </nav>
                <div className="profile-container">
                <div className="col-md-12" align="center">
                    <h2 className="panel-title">
                        Hello {username}
                    </h2>
                </div>
                    <input type="text" className="form-control"
                    name="displayName" placeholder="Your display name" value={this.state.displayName}
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
