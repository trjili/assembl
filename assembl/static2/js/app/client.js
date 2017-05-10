import ApolloClient from 'apollo-client';
import { createNetworkInterface } from 'apollo-upload-client';
import { getDiscussionSlug } from './utils/globalFunctions';

const client = new ApolloClient({
  networkInterface: createNetworkInterface({
    uri: `${window.location.origin}/${getDiscussionSlug()}/graphql`,
    opts: {
      credentials: 'same-origin'
    }
  })
});

export default client;