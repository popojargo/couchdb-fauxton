// Licensed under the Apache License, Version 2.0 (the 'License'); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

import {connect} from 'react-redux';
import ValidatorEditor from './ValidatorEditor';
import Actions from '../actions';
import {getSaveDesignDoc, getDesignDocList, getSelectedDesignDocPartitioned} from '../reducers';
import {bindActionCreators} from "redux";

const mapStateToProps = ({validatorEditor, databases}, ownProps) => {
  const isSelectedDDocPartitioned = getSelectedDesignDocPartitioned(validatorEditor, databases.isDbPartitioned);
  return {
    database: validatorEditor.database,
    isNewValidator: validatorEditor.isNewValidator,
    designDocs: validatorEditor.designDocs,
    designDocList: getDesignDocList(validatorEditor),
    originalDesignDocName: validatorEditor.originalDesignDocName,
    isNewDesignDoc: validatorEditor.isNewDesignDoc,
    designDocId: validatorEditor.designDocId,
    designDocPartitioned: isSelectedDDocPartitioned,
    newDesignDocName: validatorEditor.newDesignDocName,
    newDesignDocPartitioned: validatorEditor.newDesignDocPartitioned,
    saveDesignDoc: getSaveDesignDoc(validatorEditor, databases.isDbPartitioned),
    validator: validatorEditor.validator,
    isLoading: validatorEditor.isLoading,
    isDbPartitioned: databases.isDbPartitioned,
    partitionKey: ownProps.partitionKey
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({
    ...Actions,
  }, dispatch);
};

const ValidatorEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ValidatorEditor);

export default ValidatorEditorContainer;
