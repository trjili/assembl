import React from 'react';
import ThemeCreation from '../components/administration/survey/themeCreation';
import ThemeEdition from '../components/administration/survey/themeEdition';
import SurveyExport from '../components/administration/survey/surveyExport';

class SurveyAdmin extends React.Component {
  render() {
    const { section, locale, translations, selectedLocale } = this.props;
    return (
      <div className="survey-admin">
        {section === 'section1' &&
          <ThemeCreation
            locale={locale}
            translations={translations}
            selectedLocale={selectedLocale}
          />
        }
        {section === 'section2' &&
          <ThemeEdition />
        }
        {section === 'section3' &&
          <SurveyExport />
        }
      </div>
    );
  }
}

export default SurveyAdmin;