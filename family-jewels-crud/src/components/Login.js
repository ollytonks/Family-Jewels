import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {firebase, firebaseAuth} from '../Firebase';
import { Redirect } from 'react-router-dom';
import withFirebaseAuth from 'react-with-firebase-auth'
import firebaseApp from '../Firebase';
import '../App.css';

const provider = new firebase.auth.GoogleAuthProvider();

class Login extends Component {

    _isMounted = false;

    constructor() {
        super();
        this.state = {
            user : firebase.auth().currentUser,
            email : "",
            password : "",
            resetPassword: false,
            isAuth: false
        }
        this.editProfile = this.editProfile.bind(this);
        this.returnToLogin = this.returnToLogin.bind(this);
        this.createProfile = this.createProfile.bind(this);
    }

    componentDidMount() {
        //ensure mounted correctly
        this._isMounted = true;
        //check if still signed in
        if(this._isMounted) {
            firebaseAuth.onAuthStateChanged(user => {
                console.log("Auth state changed")
                this.setState({ user: firebase.auth().currentUser });
                this.setState({ isAuth: true });
                console.log(this.state.user)
            });
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
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
        //ensure email entered
        if(this.state.email == null || this.state.email == "") {
            alert("Email must be provided")
        }
        else {
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
    }

    //reset user password
    resetPassword = (e) => {
        //ensure email entered
        if(this.state.email == null || this.state.email == "") {
            alert("Email must be provided")
        }
        else {
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
    }

    //sign the user out
    logout() {
        firebase.auth().signOut();
    }

    //redirect to edit editProfile
    editProfile() {
        this.props.history.push("/editprofile");
    }

    //rederict to create a profile
    createProfile() {
        this.props.history.push("/createuser");
    }

    //rederict to Login page from password reset
    returnToLogin() {
        //refresh page to return to original sign in options
        window.location.reload();
    }

    render() {
        console.log(this.state.isAuth);
        /*prevent elements rendering until authentication variables have
          finished initialising*/
        if(this.state.isAuth == false){
            console.log("not finished initialising");
            return(<div></div>)
        }
        //ensure user is signed in
        else if(this.state.user) {
            var username;
            //verify if they have a display name
                if(this.state.user.displayName){
                     username = this.state.user.displayName;
                 }
                 //use email as display name
                 else {
                     username = this.state.user.email;
                 }
            return(
                <div>
                <nav class="navbar navbar-default navbar-expand-lg d-none d-lg-block">
                    <div class="collapse navbar-collapse">
                        <ul class="nav navbar-nav">
                            <li class="navbar-brand nav-item nav-link" ><a href="/">Family Jewels</a></li>
                            <li class="nav-item nav-link"><a href="/create">Add Heirloom</a></li>
                        </ul>
                        <ul class="nav navbar-nav ml-auto">
                        <li class="nav-item nav-link"><a href="/login">{username}</a></li>

                        </ul>
                    </div>
                </nav>
                <nav class="navbar navbar-default navbar-expand d-lg-none">
                        <ul class="nav navbar-nav">
                            <li class="navbar-brand nav-item nav-link"><a href="/">FJ</a></li>
                            <li class="nav-item nav-link"><a href="/create">Add Heirloom</a></li>
                        </ul>
                        <ul class="nav navbar-nav ml-auto">
                            <li class="nav-item nav-link"><a href="/login">{username}</a></li>
                        </ul>
                </nav>
                <div class="profile-container">
                    <div class="col-md-12" align="center">
                    <h2 class="panel-title">
                        Hello {username}
                    </h2>
                    </div>
                    <div class="col-md-12" align="center">
                    <button type="submit" class="btn btn-outline-warning" onClick={this.logout}>Sign out</button>
                    </div>
                    <div class="col-md-12" align="center">
                    <button type="submit" class="btn btn-outline-warning" onClick={this.editProfile}>Edit profile</button>
                    </div>
                </div>
                </div>
            );
        }
        console.log(this.state.user);
        //user not signed in, prompt login
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
                            <input type="email" class="form-control"
                            name="username" placeholder="Username" value={this.state.email}
                             onChange={e => this.setState({email: e.target.value})} />
                        </div>
                    </div>
                    {this.state.resetPassword
                    ? <div>
                        <div class="col-md-12" align="center">
                            <button type="submit" class="btn btn-outline-warning" onClick={this.resetPassword}>Send password reset</button>
                        </div>
                        <div class="col-md-12" align="center">
                            <button type="button" class="btn btn-outline-warning" onClick={this.returnToLogin}>Return</button>
                        </div>
                    </div>
                    :<div class="row">
                        <div class="col-md-12 form-group">
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
                        : <button type="submit" class="btn btn-outline-warning btn-block" onClick={this.submit}>Sign in</button>
                        }
                        </div>
                    </div>
                </form>
                <div class="row">
                    <div class="col-md-12" align="center">
                    {this.state.resetPassword
                        ? <p></p>
                        : <button class="btn btn-outline-warning btn-block" onClick={this.loginWithGoogle}>Sign in with Google</button>
                    }
                    </div>
                </div>
                <div class="row">
                </div>
                    <div class="col-md-12" align="center">
                    { this.state.resetPassword
                    ? <p></p>
                    : <div>
                        <div class="col-md-12" align="center">
                            <button class="btn btn-warning btn-sm" type="button" onClick={this.createprofile}>Create account</button>
                        </div>
                        <button class="btn btn-link btn-sm" onClick={() => {this.setState({resetPassword: true})}}>Forgot password</button>
                    </div>
                    }
                    </div>
            </div>
        );
    }
}

export default Login;
