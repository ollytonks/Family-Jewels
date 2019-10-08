import React, { Component, useState } from 'react';
import ReactDOM from 'react-dom';
import {firebase, firebaseAuth} from '../Firebase';
import { Link, Redirect} from 'react-router-dom';
import { thisTypeAnnotation } from '@babel/types';
import withFirebaseAuth from 'react-with-firebase-auth'
import firebaseApp from '../Firebase';

class EditProfile extends Component {

    constructor() {
        super();
        this.state = {
            user : firebase.auth().currentUser,
            isAuth : false,
            displayName : ""
        }
    }

    componentDidMount() {
        //check if still signed in
        firebaseAuth.onAuthStateChanged(user => {
            console.log("Auth state changed")
            this.setState({ user: firebase.auth().currentUser });
            this.setState({ isAuth: true});
        });

    }

    //update user's display name
    updateProfile = (e) => {
        if(this.state.displayName == null || this.state.displayName == ""){
            alert("No name entered")
        }
        else {
            this.state.user.updateProfile( {
                displayName: this.state.displayName
            });
            this.props.history.push("/");
        }
    }

    render() {
        //check if user is signed in
        console.log(this.state.user);
        console.log(this.state.isAuth);
        //user not authenticated, redirect to login page
        if(this.state.user == null && this.state.isAuth){
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
            <div class="login-container">
                <div class="panel-heading">
                    <h2 class="panel-title">
                        Hello {username}
                    </h2>
                </div>
                <div>
                    <label for="displayName">Display name:</label>
                    <input type="text" class="form-control"
                    name="displayName" placeholder="Your name" value={this.state.displayName}
                        onChange={e => this.setState({displayName: e.target.value})}/>
                     <button type="button" class="btn btn-outline-warning" onClick= {this.updateProfile}>
                        Save</button>
                </div>
            </div>
        );
    }
}

export default EditProfile;
