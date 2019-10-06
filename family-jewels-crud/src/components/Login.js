import React, { Component, useState } from 'react';
import ReactDOM from 'react-dom';
import {firebase, firebaseAuth} from '../Firebase';
import { Link, Redirect} from 'react-router-dom';
import { thisTypeAnnotation } from '@babel/types';
import withFirebaseAuth from 'react-with-firebase-auth'
//import * as firebase from 'firebase/app';
//import 'firebase/auth';
import firebaseApp from '../Firebase';

//const firebaseAppAuth = firebaseApp.auth();

/*const providers = {
  googleProvider: new firebase.auth.GoogleAuthProvider(),
};*/
const provider = new firebase.auth.GoogleAuthProvider();

class Login extends Component {


    constructor() {
        super();
        //this.log = this.onSubmit.bind(this);
        this.state = {
            user : firebase.auth().currentUser,
            email : null,
            password : null,
            resetPassword: false
        }
    }

    componentDidMount() {
        //check if still signed in
        firebaseAuth.onAuthStateChanged(user => {
            this.setState({ user: firebase.auth().currentUser });
        });

    }

    //sign in with Google
    loginWithGoogle = (e) => {
        e.preventDefault();
        firebase
        .auth()
        .setPersistence(firebase.auth.Auth.Persistence.SESSION)
          .then(() => {
            firebase
            .auth()
            .signInWithPopup(provider)
            .then(() => {
                //console.log.(" ")
                this.props.history.push("/");
                //this.user = firebase.auth().currentUser;
            })
            .catch(errors => {
                console.log(errors);
            })
        });

    }

    //sign in with email and password
    loginEmailPassword = (e) => {
        e.preventDefault();
        firebase
        .auth()
        .setPersistence(firebase.auth.Auth.Persistence.SESSION)
          .then(() => {
            firebase
            .auth()
            .signInWithEmailAndPassword(this.state.email, this.state.password)
            .then(() => {
                this.props.history.push("/")
            })
            .catch(errors => {
                console.log(errors);
                if(errors.code.includes("wrong-password")) {
                    alert("Incorrect password");
                }
                else if(errors.code.includes("user-not-found")) {
                    alert("Incorrect email");
                }
                else{
                    alert(errors.code);
                }
            })
        });
    }

    //reset user password
    resetPassword = (e) => {

        e.preventDefault();
        firebase
        .auth()
        .sendPasswordResetEmail(this.state.email)
        .then(() => {
            alert("Please check your email to reset your password.");
        })
        .catch(errors =>{
            console.log(errors);
            alert(errors.code);
        })

    }

    //update user's display name
    updateProfile(newDisplayName) {
        this.state.user.updateProfile( {
            displayName: newDisplayName
        });
    }

    //sign the user out
    logout() {
        firebase.auth().signOut();
    }

    render() {
        //check if user is signed in
        if(this.state.user) {
            var username;
            //verify if they signed in with Google
            if(firebase.auth().currentUser != null){
                if(this.state.user.displayName){
                     username = this.state.user.displayName;
                 }
                 //signed in with email and password
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
                    <button type="submit" class="btn btn-outline-warning" onClick={this.logout}>Sign out</button>
                    <button class="btn btn-outline-warning" >Edit profile</button>
                </div>
            );
        }
        console.log(this.state.user);
        console.log(this.state.email)
        //user not signed in
        return (
            <div class="login-container">
                <div class="panel-heading">
                <h2 class="panel-title">
                    LOGIN
                </h2>
                </div>
                <form onSubmit={this.loginEmailPassword}>
                    <div class="row">
                        <div class="col-md-12 form-group">
                            <label for="username">Email:</label>
                            <input type="email" class="form-control"
                            name="username" placeholder="Username" value={this.state.email}
                             onChange={e => this.setState({email: e.target.value})} />
                        </div>
                    </div>
                    {this.state.resetPassword
                    ? <button  type="submit" class="btn btn-outline-warning" onClick={this.resetPassword}>Send password reset</button>
                    :<div class="row">
                        <div class="col-md-12 form-group">
                            <label for="password">Password:</label>
                            <input type="password" class="form-control"
                            name="password" placeholder="Password"
                            value={this.state.password}
                            onChange={e => this.setState({password: e.target.value})} />
                        </div>
                    </div>
                    }
                    <div class="row">
                        <div class="col-md-12">
                        {this.state.resetPassword
                        ? <p></p>
                        : <button type="submit" class="btn btn-outline-warning" onClick={this.submit}>Sign in</button>
                        }
                        </div>
                    </div>
                </form>
                <div class="row">
                    <div class="col-md-12">
                    <button class="btn btn-outline-warning" onClick={this.loginWithGoogle}>Sign in with Google</button>
                    </div>
                </div>
                <div class="row">
                </div>
                    <div class="col-md-12">
                    { this.state.resetPassword
                    ? <p></p>
                    : <button class="btn btn-outline-warning" onClick={() => {this.setState({resetPassword: true})}}>Forgot password</button>
                    }
                    </div>
            </div>
        );
    }
}

export default Login;
