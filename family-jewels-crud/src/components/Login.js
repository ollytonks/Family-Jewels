import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import firebase from '../Firebase';
import { Link, Redirect} from 'react-router-dom';
import { thisTypeAnnotation } from '@babel/types';
import withFirebaseAuth from 'react-with-firebase-auth'
//import * as firebase from 'firebase/app';
import 'firebase/auth';
import firebaseApp from '../Firebase';

const firebaseAppAuth = firebaseApp.auth();

/*const providers = {
  googleProvider: new firebase.auth.GoogleAuthProvider(),
};*/
const provider = new firebase.auth.GoogleAuthProvider();

class Login extends Component {

    constructor() {
        super();
        this.state = {
            username: '',
            password: '',
            authenticated: false
        };
    }

    onSubmit = (e) => {
        e.preventDefault();
        const { username, password } = this.state;

        /*this.setState({
            title: '',
            description: '',
            author: ''
        });*/
        //this.props.history.push("/")
    }
    login = () => {
        //authenticate user
        firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // ...
        }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
        //if authenticated, redirect to apps
        //redirect to app = true (redirection handled in render)
        this.setState(() => ({
            authenticated: true
      }));
    //s.render();
    }


    render() {
        const {
          user,
          signOut,
          signInWithGoogle,
        } = this.props;
        //user has logged in successfully
        if(this.authenticated || firebase.auth().currentUser != null){
            console.log("authenticated");
            console.log(firebase.auth().currentUser);
            return <Redirect to= '/'/>
        }
        //else
        console.log("not authenticated");
        return (
            <div class="login-container">
                <div class="panel-heading">
                <h2 class="panel-title">
                    LOGIN
                </h2>
                </div>
                <form onSubmit={this.onSubmit}>
                    <div class="row">
                        <div class="col-md-12 form-group">
                        {
                            user
                              ? <h2>Hello, {user.displayName}</h2>
                              : <h2>Please sign in</h2>
                          }
                            <label for="username">Username:</label>
                            <input type="text" class="form-control" name="username" placeholder="" />
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-12 form-group">
                            <label for="password">Password:</label>
                            <input type="password" class="form-control" name="password" placeholder="" />
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-12">
                        {
                            user
                            ? <button type="submit" class="btn btn-outline-warning" onClick={signOut}>Sign out</button>
                            : <button type="submit" class="btn btn-outline-warning" onClick={this.login}>Sign in with Google</button>
                            //<button type="submit" class="btn btn-outline-warning">Submit</button>
                        }
                        </div>

                    </div>
                </form>
            </div>
        );
    }
}



export default withFirebaseAuth({
  provider,
  firebaseAppAuth,
}) (Login);
