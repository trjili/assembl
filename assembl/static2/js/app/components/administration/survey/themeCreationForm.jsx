import React from 'react';
import { connect } from 'react-redux';
import { Translate, I18n } from 'react-redux-i18n';
import { FormGroup, FormControl } from 'react-bootstrap';

import { updateThemeTitle, updateThemeImage } from '../../../actions/adminActions';
import ImageUploader from '../../common/imageUploader';

const ThemeCreationForm = ({ id, image, selectedLocale, title, updateTitle, updateImage }) => {
  const trsl = I18n.t('administration.ph.title');
  const ph = `${trsl} ${selectedLocale.toUpperCase()}`;
  const index = (Number(id) + 1).toString();
  return (
    <div className="form-container">
      <div className="title">
        <Translate value="administration.themeNum" index={index} />
      </div>
      <FormGroup>
        <FormControl
          type="text"
          placeholder={ph}
          value={title}
          onChange={(e) => {
            return updateTitle(e.target.value);
          }}
        />
      </FormGroup>
      <FormGroup>
        <ImageUploader
          file={image}
          handleChange={(e) => {
            return updateImage(e.target.files);
          }}
        />
      </FormGroup>
      <div className="pointer right">
        <span className="assembl-icon-delete grey" />
      </div>
      <div className="separator" />
    </div>
  );
};

ThemeCreationForm.defaultProps = {
  title: ''
};

const mapStateToProps = ({ admin }, { id, selectedLocale }) => {
  const theme = admin.surveyThemesById[id];
  return {
    image: theme.image,
    title: theme.titlesByLocale[selectedLocale]
  };
};

const mapDispatchToProps = (dispatch, { id, selectedLocale }) => {
  return {
    updateTitle: (value) => {
      return dispatch(updateThemeTitle(id, selectedLocale, value));
    },
    updateImage: (files) => {
      return dispatch(updateThemeImage(id, files[0]));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ThemeCreationForm);