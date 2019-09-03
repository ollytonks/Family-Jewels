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
      <div class="container">
        <div class="panel panel-default">
          <div class="panel-heading">
            <h3 class="panel-title">
              LOGIN
            </h3>
            <form onSubmit={this.onSubmit}>
              <div class="panel-body">
                <label for="description">Username:</label>
                <input type="text" class="form-control" name="username" placeholder="Username" />
              </div>
              <div class="panel-body">
                <label for="author">Password:</label>
                <input type="text" class="form-control" name="password" placeholder="" />
              </div>
              <button type="submit" class="btn btn-success">Submit</button>
            </form>
            </div>
          </div>
        </div>
    );
  }
}

export default Login;
