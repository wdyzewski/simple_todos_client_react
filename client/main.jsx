import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

import '../imports/startup/accounts-config.js';
import AppWithData from '../imports/ui/App.jsx';

import ApolloClient, { createNetworkInterface } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';

const client = new ApolloClient({
  networkInterface: createNetworkInterface({ uri: 'http://localhost:8000/graphql'}),
});

Meteor.startup(() => {
  render(
    <ApolloProvider client={client}>
      <AppWithData />
    </ApolloProvider>,
    document.getElementById('render-target'));
});
