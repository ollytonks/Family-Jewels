/**
 * Copyright (c) 2019
 *
 * File creates a user profile through firebase.
 *
 * @summary Creates user profile
 * @author FamilyJewels
 *
 * Created at     : 2019-09-30
 * Last modified  : 2019-10-15
 */
import React, { Component } from 'react';
import {firebase} from '../Firebase';
import '../App.css';
import loginLogo from './elements/loginlogo.svg'

/* Create User component to handle user profile creation */
class CreateUser extends Component {

    /** React function to initialise CreateUser component and its state
    **/
    constructor() {
        super();
        this.state = {
            email : "",
            password : "",
        }
        this.returnToLogin = this.returnToLogin.bind(this);
    }

    /** Creates a user profile through firebase
    **/
    createUser = (e) => {
        //ensure email entered
        if(this.state.email === null || this.state.email === "") {
            alert("Please enter an email")
        }
        //ensure password entered
        else if(this.state.password === null || this.state.password === "") {
            alert("Please enter a password")
        }
        //create user on firebase
        else {
            e.preventDefault();
            firebase
            .auth()
            .createUserWithEmailAndPassword(this.state.email, this.state.password).then(() => {
                this.props.history.push("/login")
            })
            .catch(errors => {
                alert(errors.message);
            });
        }
    }

    //rederict to Login page
    returnToLogin() {
        this.props.history.push("/Login");
    }

    /** React's render function which renders the CreateUser component to the UI
        @return HTML to be rendered
    **/
    render() {
        return (
            <div class="login-container">
                <div class="panel-heading">
                <div className="login-logo">
                    <div className="col-md-12" align="center">
                        <img width="200" height="200" src={loginLogo}/>
                    </div>
                </div>
                    <h2 class="panel-title">
                        Create Account
                    </h2>
                </div>
                <form onSubmit={this.createUser}>
                    <div class="row">
                    <div className="col-md-3 col-md-offset-3"></div>
                    <div className="col-md-6 form-group">
                            <input type="email" class="form-control"
                            name="email" placeholder="Email"
                            value={this.state.email}
                             onChange={e => this.setState({email:
                                 e.target.value})} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-3 col-md-offset-3"></div>
                        <div className="col-md-6 form-group">
                            <input type="password" className="form-control"
                            name="password" placeholder="Password"
                            value={this.state.password}
                            onChange={e => this.setState({password:
                                 e.target.value})} />
                        </div>
                    </div>
                    <div class="row">
                    <div className="col-md-5 col-md-offset-5"></div>
                        <div class="col-md-2">
                        <div className="profile-btn">
                         <button type="submit"
                         class="btn btn-outline-warning btn-block"
                         onClick={this.submit}>Create Account
                         </button>
                        </div>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

export default CreateUser;
