import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import firebase from '../Firebase';
import { Link } from 'react-router-dom';

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
                            <button type="submit" class="btn btn-outline-warning">Submit</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

export default Login;
