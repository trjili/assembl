import ApolloClient, { createNetworkInterface } from 'apollo-client';
import { getDiscussionSlug } from './utils/globalFunctions';
import { getFullPath } from './utils/routeMap';
import fetch from 'isomorphic-fetch';  // eslint-disable-line

const client = new ApolloClient({
  networkInterface: createNetworkInterface({
    uri: getFullPath('graphql', { slug: getDiscussionSlug() }),
    opts: {
      credentials: 'same-origin'
    }
  })
});

export default client;