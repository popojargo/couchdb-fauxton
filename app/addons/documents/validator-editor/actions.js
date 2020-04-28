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

import FauxtonAPI from '../../../core/api';
import Documents from '../resources';
import ActionTypes from './actiontypes';
import SidebarActions from '../sidebar/actions';


const editValidator = options => ({
  type: ActionTypes.VALIDATOR_EDIT,
  options
});

const dispatchClearValidator = () => {
  FauxtonAPI.reduxDispatch({type: ActionTypes.VALIDATOR_CLEAR});
};

const dispatchFetchDesignDocsBeforeEdit = (options) => {
  options.designDocs.fetch({reset: true}).then(() => {
    FauxtonAPI.reduxDispatch(editValidator(options));
  }, xhr => {
    let errorMsg = 'Error';
    if (xhr.responseJSON && xhr.responseJSON.error === 'not_found') {
      const databaseName = options.designDocs.database.safeID();
      errorMsg = `The ${databaseName} database does not exist`;
      FauxtonAPI.navigate('/', {trigger: true});
    }
    FauxtonAPI.addNotification({
      msg: errorMsg,
      type: "error",
      clear: true
    });
  });
};

const saveValidator = (validateInfo, navigateToURL) => (dispatch) => {
  const designDoc = validateInfo.designDoc;
  designDoc.setDdocValidator(validateInfo.validator);

  FauxtonAPI.addNotification({
    msg: 'Saving validation function...',
    type: 'info',
    clear: true
  });

  designDoc.save().then(() => {
    FauxtonAPI.addNotification({
      msg: 'Validation function Saved.',
      type: 'success',
      clear: true
    });

    /**
     * if the user just saved an existing validate function to a different design doc, remove the validator~
     * from the old design doc
     */
    if (!validateInfo.isNewValidator && validateInfo.originalDesignDocName !== validateInfo.designDocId) {
      const oldDesignDoc = findDesignDoc(validateInfo.designDocs, validateInfo.originalDesignDocName);
      safeDeleteValidator(oldDesignDoc, validateInfo.designDocs, {
        onSuccess: () => {
          SidebarActions.dispatchUpdateDesignDocs(validateInfo.designDocs);
        }
      });
    }

    if (validateInfo.designDocId === 'new-doc') {
      addDesignDoc(designDoc);
    }
    SidebarActions.dispatchUpdateDesignDocs(validateInfo.designDocs);
    dispatch({type: ActionTypes.VALIDATOR_SAVED});
    FauxtonAPI.navigate(navigateToURL, {trigger: true});
  }, (xhr) => {
    FauxtonAPI.addNotification({
      msg: 'Save failed. ' + (xhr.responseJSON ? `Reason: ${xhr.responseJSON.reason}` : ''),
      type: 'error',
      clear: true
    });
  });
};

const addDesignDoc = (designDoc) => ({
  type: ActionTypes.VALIDATOR_ADD_DESIGN_DOC,
  designDoc: designDoc.toJSON()
});

const deleteValidator = (options) => {
  const onSuccess = () => {
    // if the user was on the index that was just deleted, redirect them back to all docs
    if (options.isOnIndex) {
      const url = FauxtonAPI.urls('allDocs', 'app', options.database.safeID());
      FauxtonAPI.navigate(url);
    }

    SidebarActions.dispatchUpdateDesignDocs(options.designDocs);

    FauxtonAPI.addNotification({
      msg: 'The validation function has been deleted.',
      type: 'info',
      escape: false,
      clear: true
    });
    SidebarActions.dispatchHideDeleteIndexModal();
  };

  return safeDeleteValidator(options.designDoc, options.designDocs, {onSuccess: onSuccess});
};

const gotoEditViewPage = (databaseName, partitionKey, designDocName, indexName) => {
  FauxtonAPI.navigate(
    '#' + FauxtonAPI.urls(
      'validator',
      'edit',
      encodeURIComponent(databaseName),
      (partitionKey ? encodeURIComponent(partitionKey) : ''),
      encodeURIComponent(designDocName),
      encodeURIComponent(indexName)
    )
  );
};

const updateValidatorCode = (code) => ({
  type: ActionTypes.VALIDATOR_UPDATE_CODE,
  code
});

const selectDesignDoc = (designDoc) => ({
  type: ActionTypes.VALIDATOR_DESIGN_DOC_CHANGE,
  options: {
    value: designDoc
  }
});

const updateNewDesignDocName = (designDocName) => ({
  type: ActionTypes.VALIDATOR_DESIGN_DOC_NEW_NAME_UPDATED,
  options: {
    value: designDocName
  }
});

const updateNewDesignDocPartitioned = (isPartitioned) => ({
  type: ActionTypes.VALIDATOR_DESIGN_DOC_NEW_PARTITIONED_UPDATED,
  options: {
    value: isPartitioned
  }
});

/**
 * Remove the validate function from the design document
 */
const safeDeleteValidator = (designDoc, designDocs, options) => {
  const opts = _.extend({
    onSuccess: () => {
    },
    onError: xhr => {
      const responseText = JSON.parse(xhr.responseText).reason;
      FauxtonAPI.addNotification({
        msg: 'Delete failed: ' + responseText,
        type: 'error',
        clear: true
      });
    }
  }, options);

  designDoc.unset('validate_doc_update');

  return designDoc.save().then(() => {
    opts.onSuccess();
  }, opts.onError);
};


// ---- helpers ----

const findDesignDoc = (designDocs, designDocName) => {
  return designDocs.find(doc => {
    return doc.id === designDocName;
  }).dDocModel();
};

const getDesignDoc = (designDocs, targetDesignDocName, newDesignDocName, newDesignDocPartitioned, database, isDbPartitioned) => {
  if (targetDesignDocName === 'new-doc') {
    const doc = {
      "_id": "_design/" + newDesignDocName,
      "views": {},
      "language": "javascript"
    };
    const dDoc = new Documents.Doc(doc, {database: database});
    if (isDbPartitioned) {
      dDoc.setDDocPartitionedOption(newDesignDocPartitioned);
    }
    return dDoc;
  }

  const foundDoc = designDocs.find(ddoc => {
    return ddoc.id === targetDesignDocName;
  });
  return (!foundDoc) ? null : foundDoc.dDocModel();
};


export default {
  helpers: {
    findDesignDoc,
    getDesignDoc
  },
  safeDeleteValidator,
  editValidator,
  dispatchClearValidator,
  dispatchFetchDesignDocsBeforeEdit,
  saveValidator,
  addDesignDoc,
  deleteValidator,
  gotoEditViewPage,
  updateValidatorCode,
  selectDesignDoc,
  updateNewDesignDocName,
  updateNewDesignDocPartitioned
};
