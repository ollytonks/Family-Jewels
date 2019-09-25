import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import firebase from '../Firebase';
import { Link } from 'react-router-dom';
import { thisTypeAnnotation } from '@babel/types';
import withFirebaseAuth from 'react-with-firebase-auth'
//import * as firebase from 'firebase/app';
import 'firebase/auth';
import firebaseApp from '../Firebase';

class Login extends Component {

    constructor() {
        super();
        this.state = {
            username: '',
            password: '',
        };
    }

    onSubmit = (e) => {
        e.preventDefault();
        const { username, password } = this.state;

        this.setState({
            title: '',
            description: '',
            author: ''
        });
        this.props.history.push("/")
    }

    render() {
        const {
          user,
          signOut,
          signInWithGoogle,
        } = this.props;
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
                        <div class="col-md-6">
                        {
                            user
                            ? <button type="submit" class="btn btn-outline-warning" onClick={signOut}>Sign out</button>
                            : <button type="submit" class="btn btn-outline-warning" onClick={signInWithGoogle}>Sign in with Google</button>
                            //<button type="submit" class="btn btn-outline-warning">Submit</button>
                        }
                        </div>
                        <div class="col-md-6">
                        {
                            user
                            ? <p></p>
                            : <button type="submit" class="btn btn-outline-warning">Sign in as Guest</button>
                        }
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

const firebaseAppAuth = firebaseApp.auth();

const providers = {
  googleProvider: new firebase.auth.GoogleAuthProvider(),
};

export default withFirebaseAuth({
  providers,
  firebaseAppAuth,
}) (Login);
