import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';

import TaskWithMutations from './Task.jsx';
import AccountsUIWrapperWithMutations from './AccountsUIWrapper.jsx';

import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hideCompleted: false,
      userId: null,
      token: "no-token",
    };
  }

  handleSubmit(event) {
    event.preventDefault();

    // Find the text field via the React ref
    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

    this.props.addTask({ variables: { token: this.state.token, text: text } })
      .then(({ data }) => {
        this.props.data.refetch();
      }).catch((error) => {
        console.log('Error during addTask: ' + error);
      });

    // Clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = '';
  }

  toggleHideCompleted() {
    this.setState({
      hideCompleted: !this.state.hideCompleted,
    });
  }

  setSession(id, token) {
      // setting state directly (this.state.foo = bar) wouldn't cause re-render (like setState)
      // but data.refetch does this
      this.state.userId = id;
      this.state.token  = token;
      this.props.data.refetch({ token: token });
  }

  renderTasks() {
    // sometimes data are still loading
    if (this.props.data.loading)
        return null;

    let filteredTasks = this.props.data.tasks;
    if (this.state.hideCompleted) {
      filteredTasks = filteredTasks.filter(task => !task.checked);
    }
    return filteredTasks.map((task) => {
      // IMPORTANT: task.owner.id and this.state.userId are strings
      const showPrivateButton = task.owner.id === this.state.userId;

      return (
        <TaskWithMutations
          key={'task_'+task.id}
          task={task}
          showPrivateButton={showPrivateButton}
          token={this.state.token}
        />
      );
    });
  }

  render() {
    return (
      <div className="container">
        <header>
          <h1>Todo List</h1>

          <label className="hide-completed">
            <input
              type="checkbox"
              readOnly
              checked={this.state.hideCompleted}
              onClick={this.toggleHideCompleted.bind(this)}
            />
            Hide Completed Tasks
          </label>

          <AccountsUIWrapperWithMutations setSession={this.setSession.bind(this)} />

          { this.state.userId ?
            <form className="new-task" onSubmit={this.handleSubmit.bind(this)} >
              <input
                type="text"
                ref="textInput"
                placeholder="Type to add new tasks"
              />
            </form> : ''
          }
        </header>

        <ul>
          {this.renderTasks()}
        </ul>
      </div>
    );
  }
}

App.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    tasks: PropTypes.array,
  }).isRequired,
};

const getTasks = gql`
  query getTasks($token: String!) {
    tasks(token: $token) {
      id
      text
      createdAt
      checked
      private
      owner {
        id
        username
      }
    }
  }
`;

const addTask = gql`
  mutation addTask($token: String!, $text: String!) {
    addTask(token: $token, text: $text) {
      taskId
    }
  }
`;

// graphql(Query): Component -> Component
// from ES2016 can be used as decorator: @graphql(Query)

export default AppWithData = graphql(getTasks, {
    options: { variables: { token: "no-token" } },
})(graphql(addTask, {name: 'addTask'})(App));
