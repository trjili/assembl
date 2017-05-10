import { loadTranslations, setLocale, syncTranslationWithStore } from 'react-redux-i18n';

import { updateSelectedLocale } from '../actions/adminActions';
import configureStore from './configureStore';
import middlewares from './middlewares';
import rootReducer from '../reducers/rootReducer';
import { getLocale } from '../utils/globalFunctions';
import Translations from '../utils/translations';

export default function createAppStore(initialState) {
  const store = configureStore(initialState, rootReducer, middlewares);
  const browserLanguage = navigator.language || navigator.userLanguage;
  const isStoragedlocale = localStorage.getItem('locale') !== null;
  const userLocale = isStoragedlocale ? localStorage.getItem('locale') : getLocale(browserLanguage);
  syncTranslationWithStore(store);
  store.dispatch(loadTranslations(Translations));
  store.dispatch(setLocale(userLocale));
  store.dispatch(updateSelectedLocale(userLocale));
  return store;
}