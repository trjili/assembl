import { combineReducers } from 'redux';
import { i18nReducer } from 'react-redux-i18n';
import client from '../client';
import Context from './contextReducer';
import Debate from './debateReducer';
import Posts from './postsReducer';
import Users from './usersReducer';
import Partners from './partnersReducer';
import Synthesis from './synthesisReducer';

export default combineReducers({
  apollo: client.reducer(),
  i18n: i18nReducer,
  context: Context,
  debate: Debate,
  posts: Posts,
  users: Users,
  partners: Partners,
  synthesis: Synthesis
});