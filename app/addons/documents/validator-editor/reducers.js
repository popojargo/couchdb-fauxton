// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

import ActionTypes from './actiontypes';
import Resources from '../resources';
import Helpers from '../helpers';

const defaultValidator = 'function(newDoc, oldDoc, userCtx) {\n  throw({forbidden : \'no way\'});\n}';

const initialState = {
  designDocs: new Backbone.Collection(),
  isLoading: true,
  validator: defaultValidator,
  database: {id: '0'},
  designDocId: '',
  isNewDesignDoc: false,
  newDesignDocName: '',
  newDesignDocPartitioned: true,
  isNewValidator: false,
  originalDesignDocName: '',
};

function editValidator(state, options) {
  const newState = {
    ...state,
    isLoading: false,
    newDesignDocName: '',
    isNewValidator: options.isNewValidator,
    isNewDesignDoc: options.isNewDesignDoc || false,
    designDocs: options.designDocs,
    designDocId: options.designDocId,
    originalDesignDocName: options.designDocId,
    database: options.database
  };
  newState.validator = getValidator(newState);
  return newState;
}

function getValidator(state) {
  if (state.isNewValidator || state.isNewDesignDoc) {
    return defaultValidator;
  }

  const designDoc = state.designDocs.find(ddoc => {
    return state.designDocId == ddoc.id;
  }).dDocModel();
  return designDoc.get('validate_doc_update');
}

export function getSelectedDesignDocPartitioned(state, isDbPartitioned) {
  const designDoc = state.designDocs.find(ddoc => {
    return state.designDocId === ddoc.id;
  });
  if (designDoc) {
    return Helpers.isDDocPartitioned(designDoc.get('doc'), isDbPartitioned);
  }
  return false;
}

export function getSaveDesignDoc(state, isDbPartitioned) {
  if (state.designDocId === 'new-doc') {
    const doc = {
      _id: '_design/' + state.newDesignDocName,
      views: {},
      language: 'javascript'
    };
    const dDoc = new Resources.Doc(doc, {database: state.database});
    if (isDbPartitioned) {
      dDoc.setDDocPartitionedOption(state.newDesignDocPartitioned);
    }
    return dDoc;
  }

  if (!state.designDocs) {
    return null;
  }

  const foundDoc = state.designDocs.find(ddoc => {
    return ddoc.id === state.designDocId;
  });

  return foundDoc ? foundDoc.dDocModel() : null;
}

// returns a simple array of design doc IDs. Omits mango docs
export function getDesignDocList(state) {
  if (!state.designDocs) {
    return [];
  }
  return state.designDocs.filter(doc => {
    return !doc.isMangoDoc();
  }).map(doc => {
    return doc.id;
  });
}

export default function validatorEditor(state = initialState, action) {
  const {options} = action;
  switch (action.type) {

    case ActionTypes.VALIDATOR_CLEAR:
      return {
        ...initialState
      };

    case ActionTypes.VALIDATOR_EDIT:
      return editValidator(state, options);

    case ActionTypes.VALIDATOR_EDIT_NEW:
      return editValidator(state, options);

    case ActionTypes.VALIDATOR_DESIGN_DOC_CHANGE:
      return {
        ...state,
        designDocId: options.value
      };

    case ActionTypes.VALIDATOR_SAVED:
      return state;

    case ActionTypes.VALIDATOR_CREATED:
      return state;

    case ActionTypes.VALIDATOR_ADD_DESIGN_DOC:
      return {
        ...state,
        designDocId: action.designDoc._id
      };

    case ActionTypes.VALIDATOR_UPDATE_CODE:
      return {
        ...state,
        validator: action.code
      };

    case ActionTypes.VALIDATOR_DESIGN_DOC_NEW_NAME_UPDATED:
      return {
        ...state,
        newDesignDocName: options.value
      };

    case ActionTypes.VALIDATOR_DESIGN_DOC_NEW_PARTITIONED_UPDATED:
      return {
        ...state,
        newDesignDocPartitioned: options.value
      };

    default:
      return state;
  }
}
