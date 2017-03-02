import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

class AccountsUIWrapper extends Component {
  constructor(props) {
    super(props);

    this.state = {
      token: null,
      username: null,
    }
  }

  onSubmit(event) {
    event.preventDefault();

    const login = ReactDOM.findDOMNode(this.refs.login).value.trim();
    const password = ReactDOM.findDOMNode(this.refs.password).value.trim();

    this.props.login({variables: {username: login, password: password}})
      .then(({ data }) => {
        this.setState({
          token: data.loginWithPassword.token,
          username: data.loginWithPassword.username,
        });
        this.props.setSession(data.loginWithPassword.userId, data.loginWithPassword.token);
      }).catch((error) => {
        console.log('Error during mutation: ' + error);
      });
  }

  logout() {
    this.props.logout({variables: {token: this.state.token}})
      .then(({ data }) => {
        this.setState({
          token: null,
          username: null,
        });
        this.props.setSession(null, "no-token");
      }).catch((error) => {
        console.log('Error during mutation: ' + error);
      });
  }

  render() {
    if (!this.state.token) {
      return (
        <form onSubmit={this.onSubmit.bind(this)}>
          <input name="login" placeholder="Login" ref="login" />
          &nbsp;
          <input name="password" type="password" placeholder="Password" ref="password" />
          &nbsp;
          <input type="submit" value="Login" />
        </form>
      );
    }
    return (
      <p>
        Hello, { this.state.username }!
        &nbsp;&nbsp;
        <button value="logout" onClick={this.logout.bind(this)}>Logout</button>
      </p>
    );
  }
}

AccountsUIWrapper.propTypes = {
  setSession: PropTypes.func.isRequired,
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
};

const loginWithPassword = gql`
  mutation loginWithPassword($username: String!, $password: String!) {
    loginWithPassword(username: $username, password: $password) {
      userId
      username
      token
    }
  }
`;

const logout = gql`
  mutation logout($token: String!) {
    logout(token: $token) {
      ok
    }
  }
`;

export default AccountsUIWrapperWithMutations = graphql(loginWithPassword,
    {name: 'login'})(graphql(logout, {name: 'logout'})(AccountsUIWrapper));
