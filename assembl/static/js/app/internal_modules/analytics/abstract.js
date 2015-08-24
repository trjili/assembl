'use strict';

// UMD style module defintion. Simplified details below. Read comments to understand dependencies
var moduleName = 'Analytics_Abstract',
    dependencies = [];

(function(root, factory){
  if (typeof define === 'function' && define.amd){
    // AMD. Register as an anonymous module.
    define(dependencies, function(){ //Update list of args. eg. function($, _, someModule) 
      return (root[moduleName] = factory(arguments)); 
    });
  } else if (typeof module === 'object' && module.exports) {
    // Node-like environments. Not strict CommonJS but CommonJS-like env.
    // Update arguments here by adding require('dependency') as paramter to factory().
    // eg. module.exports = factory(require('jquery'));
    module.exports = factory();
  } else {
    // Browser global
    // Update arguments here by adding root.Dependecy as parameter to factory()
    // eg. root[moduleName] = factory(root.jquery);
    root[moduleName] = factory();
  }
})(this, function(){ //Update arguments to factory here
  
  /*
    TODO: Update category registry with well defined Categories
   */
  var _CATEGORY_DEFINITIONS = {
      TABLE_OF_IDEAS: 'TABLE_OF_IDEAS',
      SYNTHESIS: 'SYNTHESIS',
      IDEA_PANEL: 'IDEA_PANEL',
      MESSAGE_LIST: 'MESSAGE_LIST',
      MESSAGE: 'MESSAGE',
      NAVIGATION_PANEL: 'NAVIGATION_PANEL',
      SHARED_URL: 'SHARED_URL',
      NOTIFICATION: 'NOTIFICATION'
  };

  /*
    TODO: Update actions registry with well defined Actions to track
   */
  var _ACTION_DEFINITIONS = {
      READING: 'READING',
      FINDING: 'FINDING',
      INTERACTING: 'INTERACTING',
      PRODUCING: 'PRODUCING'
  };

  /**
   * eventDefinition.category, eventDefinition.action, eventDefinition.eventName
   */
  var _EVENT_DEFINITIONS = {
      NAVIGATION_OPEN_CONTEXT_SECTION: {action: 'FINDING', category: 'NAVIGATION_PANEL', eventName: 'OPEN_CONTEXT_SECTION'},
      NAVIGATION_OPEN_DEBATE_SECTION: {action: 'FINDING', category: 'NAVIGATION_PANEL', eventName: 'OPEN_DEBATE_SECTION'},
      NAVIGATION_OPEN_SYNTHESES_SECTION: {action: 'FINDING', category: 'NAVIGATION_PANEL', eventName: 'OPEN_SYNTHESES_SECTION'},
      NAVIGATION_OPEN_SPECIFIC_SYNTHESIS: {action: 'FINDING', category: 'NAVIGATION_PANEL', eventName: 'NAVIGATE_TO_SYNTHESIS'},
      NAVIGATION_OPEN_VISUALIZATIONS_SECTION: {action: 'FINDING', category: 'NAVIGATION_PANEL', eventName: 'OPEN_VISUALIZATIONS_SECTION'},
      SHOW_TABLE_OF_IDEAS: {action: 'FINDING', category: 'TABLE_OF_IDEAS', eventName: 'SHOW'},
      OPEN_IDEA_IN_TABLE_OF_IDEAS: {action: 'FINDING', category: 'TABLE_OF_IDEAS', eventName: 'OPEN_IDEA'},
      OPEN_IDEA_NEW_MESSAGES_IN_TABLE_OF_IDEAS: {action: 'FINDING', category: 'TABLE_OF_IDEAS', eventName: 'OPEN_IDEA_NEW_MESSAGES'},
      NAVIGATE_TO_IDEA_IN_TABLE_OF_IDEAS: {action: 'FINDING', category: 'TABLE_OF_IDEAS', eventName: 'NAVIGATE_TO_IDEA'},
      NAVIGATE_TO_IDEA_IN_SYNTHESIS: {action: 'FINDING', category: 'SYNTHESIS', eventName: 'NAVIGATE_TO_IDEA'},
      /*
      LOGIN_SUCCESS: 'LOGIN_SUCCESS',
      LOGIN_FAILED: 'LOGIN_FAILED',
      JOIN_GROUP:'JOIN_GROUP',
      JOIN_GROUP_REFUSED: 'JOIN_GROUP_REFUSED',
      NAVIGATE_IDEA: 'NAVIGATE_IDEA',
      REPLY_MESSAGE_START: 'REPLY_MESSAGE_START',
      REPLY_MESSAGE_COMPLETE: 'REPLY_MESSAGE_COMPLETE'
      */
  };

  /**
   * Pseudo URLs: (/TARGET/TRIGGER_INFO (NOT origin target ), ex: IDEA/SYNTHESIS,
   *  meaning an idea was navigated to from the synthesis (any synthesis) but NOT 
   *  IDEA/SYNTHESIS_SECTION (meaning an idea was navigated to from the synthesis
   *  section of the accordeon) 
   *  A dash (-) means that the TRIGGER_INFO in unknown, or irrelevent
   *  Ex: TODO
   */
  var _PAGE_DEFINITIONS = { 
      //IMPLEMENTED
      'SIMPLEUI_CONTEXT_SECTION': 'SIMPLEUI_CONTEXT_SECTION',
      'SIMPLEUI_DEBATE_SECTION': 'SIMPLEUI_DEBATE_SECTION',
      'SIMPLEUI_SYNTHESES_SECTION': 'SIMPLEUI_SYNTHESES_SECTION',
      'SIMPLEUI_VISUALIZATIONS_SECTION': 'SIMPLEUI_VISUALIZATIONS_SECTION',
      'IDEA': 'IDEA', //Context of a specific idea.  Means the state of the group was just set to this idea
      'MESSAGES': 'MESSAGES', //Context of messages.  Means the state of the group was just set to a null idea, or user is playing with the filters
      //NOT YET IMPLEMENTED
      'LOGIN/-': 'LOGIN/-',
      'SIGNUP/-': 'SINGUP/-',
      'JOIN_GROUP/-': 'JOIN_GROUP/-',
      'MESSAGE': 'MESSAGE', //Context of a specific message.  To be implemented in showMessageById
      'SYNTHESIS': 'SYNTHESIS' //Context of a specific synthesis.  To be implemented in showMessageById AND synthesisInNavigation.js

  };

  var CUSTOM_VARIABLES = {
    SAMPLE_CUSTOM_VAR: ['SAMPLE_CUSTOM_VAR', 1]
  }

  /**
   * Abstract Base Class for Analytics Wrapper 
   */
  function Wrapper() {
    if (this.constructor === Wrapper){
      throw new Error("Abstract class cannot be constructed!");
    }
  };

  Wrapper.prototype = {
    customVariableSize: 5,
    debug: true,
    events: _EVENT_DEFINITIONS,
    actions: _ACTION_DEFINITIONS,
    categories: _CATEGORY_DEFINITIONS,
    pages: _PAGE_DEFINITIONS,

    
    validateEventsArray: function() {
      var that = this;

      _.each(this.events, function(event) {
        if (!(event.action in that.actions)) {
          throw new Error("Action "+event.action+" not in _ACTION_DEFINITIONS");
        }
        if (!(event.category in that.categories)) {
          throw new Error("Category "+event.category+" not in _CATEGORY_DEFINITIONS");
        }
      });
    },
    
    initialize: function(options){
      throw new Error('Cannot call abstract method!');
    },

    /**
     * Change the state of the current page for other events, and log the navigation
     * to the new page.
     * 
     * Concrete implementions should call both piwik's updatePageUrl and updateTitle
     * (or whatever equivalent in the implementation)
     * 
     * @param page One of this.pages
     */
    changeCurrentPage: function(page, options) {
      throw new Error('Cannot call abstract method!');
    },

    trackEvent: function(eventDefinition, value, options) {
      throw new Error('Cannot call abstract method!');
    },

    setCustomVariable: function(name, value, options){
      throw new Error('Cannot call abstract method!');
    },
   
    deleteCustomVariable: function(options){
      throw new Error('Cannot call abstract method!');
    },

    trackLink: function(urlPath, options){
      throw new Error('Cannot call abstract method!');
    },

    trackGoal: function(goalId, options){
      throw new Error('Cannot call abstract method!');
    },

    createNewVisit: function(){
      throw new Error('Cannot call abstract method!');
    },

    setUserId: function(id) {
      throw new Error('Cannot call abstract method!');
    },

    //The below functions do not seem to have a correlation to GA, used by Piwik only
    trackImpression: function(contentName, contentPiece, contentTarget) {
      throw new Error('Cannot call abstract method!');
    },

    trackVisibleImpression: function(checkOnScroll, timeInterval){
      throw new Error('Cannot call abstract method!');
    },

    trackDomNodeImpression: function(domNode){
      throw new Error('Cannot call abstract method!');
    },

    trackContentInteraction: function(interaction, contentName, contentPiece, contentTarget){
      throw new Error('Cannot call abstract method!');
    },

    trackDomNodeInteraction: function(domNode, contentInteraction){
      throw new Error('Cannot call abstract method!');
    }
  };


  return Wrapper;
  
});
