import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';

import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

// Task component - represents a single todo item
class Task extends Component {
  constructor(props) {
    super(props);

    this.state = {
      deleted: false,
      checked: this.props.task.checked,
      private: this.props.task.private,
    };
  }

  deleteThisTask() {
    this.props.deleteTask({
      variables: { token: this.props.token, id: parseInt(this.props.task.id) }
    }).then(({ data }) =>{
      this.setState({ deleted: true });
    }).catch((error) => {
      console.log('Error during deleteTask: ' + error);
    });
  }

  toggleChecked() {
    this.props.toggleChecked({
      variables: { token: this.props.token, id: parseInt(this.props.task.id) }
    }).then(({ data }) =>{
      this.setState({ checked: data.toggleChecked.checked });
    }).catch((error) => {
      console.log('Error during toggleChecked: ' + error);
    });
  }

  togglePrivate() {
    this.props.togglePrivate({
      variables: { token: this.props.token, id: parseInt(this.props.task.id) }
    }).then(({ data }) =>{
      this.setState({ private: data.togglePrivate.private });
    }).catch((error) => {
      console.log('Error during togglePrivate: ' + error);
    });
  }

  render() {
    // Give tasks a different className when they are checked off,
    // so that we can style them nicely in CSS
    const taskClassName = classnames({
      checked: this.state.checked,
      private: this.state.private,
    });

    if (this.state && this.state.deleted)
        return null;
    return (
      <li className={taskClassName}>
        <button className="delete" onClick={this.deleteThisTask.bind(this)}>
          &times;
        </button>

        <input
          type="checkbox"
          readOnly
          checked={this.state.checked}
          onClick={this.toggleChecked.bind(this)}
        />

        { this.props.showPrivateButton ? (
          <button className="toggle-private" onClick={this.togglePrivate.bind(this)}>
            { this.state.private ? 'Private' : 'Public' }
          </button>
        ) : ''}

        <span className="text">
          <strong>{this.props.task.owner.username}</strong>: {this.props.task.text}
        </span>
      </li>
    );
  }
}

Task.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  task: PropTypes.object.isRequired,
  token: PropTypes.string.isRequired,
  deleteTask: PropTypes.func.isRequired,
};

const deleteTask = gql`
  mutation deleteTask($token: String!, $id: Int!) {
    deleteTask(token: $token, taskId: $id) {
      ok
    }
  }
`;

const toggleChecked = gql`
  mutation toggleChecked($token: String!, $id: Int!) {
    toggleChecked(token: $token, taskId: $id) {
      checked
    }
  }
`;

const togglePrivate = gql`
  mutation togglePrivate($token: String!, $id: Int!) {
    togglePrivate(token: $token, taskId: $id) {
      private
    }
  }
`;

export default TaskWithMutations = graphql(deleteTask, {name: 'deleteTask'})(
  graphql(toggleChecked, {name: 'toggleChecked'})(
    graphql(togglePrivate, {name: 'togglePrivate'})(Task)
  )
);
