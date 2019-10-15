import React, { Component } from 'react';
import {firebase} from '../Firebase';
import '../App.css';

class CreateUser extends Component {


    constructor() {
        super();
        this.state = {
            email : "",
            password : "",
        }
        this.returnToLogin = this.returnToLogin.bind(this);
    }

    componentDidMount() {
    }

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
            console.log("created new account" + this.state.email);
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

    //rederict to Login page from create user
    returnToLogin() {
        this.props.history.push("/Login");
    }

    render() {
        return (
            <div className="login-container">
                <div className="panel-heading">
                <h2 className="panel-title">
                    Create Account
                </h2>
                </div>
                <form onSubmit={this.createUser}>
                    <div className="row">
                        <div className="col-md-12 form-group">
                            <input type="email" className="form-control"
                            name="email" placeholder="Email" value={this.state.email}
                             onChange={e => this.setState({email: e.target.value})} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12 form-group">
                            <input type="password" className="form-control"
                            name="password" placeholder="Password"
                            value={this.state.password}
                            onChange={e => this.setState({password: e.target.value})} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                         <button type="submit" className="btn btn-outline-warning btn-block" onClick={this.submit}>Create Account</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

export default CreateUser;
