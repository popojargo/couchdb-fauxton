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

import PropTypes from 'prop-types';
import React, {Component} from 'react';
import app from '../../../../app';
import FauxtonAPI from '../../../../core/api';
import ReactComponents from '../../../components/react-components';
import DesignDocSelector from '../../index-editor/components/DesignDocSelector';

const getDocUrl = app.helpers.getDocUrl;
const {CodeEditorPanel, ConfirmButton, LoadLines} = ReactComponents;

export default class ValidatorEditor extends Component {

  constructor(props) {
    super(props);
    this.saveValidator = this.saveValidator.bind(this);
    this.updateValidatorCode = this.updateValidatorCode.bind(this);
  }

  // the code editor is a standalone component, so if the user goes from one edit view page to another, we need to
  // force an update of the editor panel
  componentDidUpdate(prevProps) {
    if (this.props.validator !== prevProps.validator && this.validatorEditor) {
      this.validatorEditor.update();
    }
  }

  saveValidator(el) {
    el.preventDefault();

    if (!this.designDocSelector.validate()) {
      return;
    }

    const url = this.getAllDocsLink();

    this.props.saveValidator({
      database: this.props.database,
      isNewValidator: this.props.isNewValidator,
      designDoc: this.props.saveDesignDoc,
      designDocId: this.props.designDocId,
      isNewDesignDoc: this.props.isNewDesignDoc,
      originalDesignDocName: this.props.originalDesignDocName,
      validator: this.validatorEditor.getValue(),
      designDocs: this.props.designDocs
    }, url);
  }

  updateValidatorCode(code) {
    this.props.updateValidatorCode(code);
  }

  getAllDocsLink() {
    const encodedDatabase = encodeURIComponent(this.props.database.id);
    const encodedPartitionKey = this.props.partitionKey ? encodeURIComponent(this.props.partitionKey) : '';
    return '#' + FauxtonAPI.urls('allDocs', 'app', encodedDatabase, encodedPartitionKey);
  }

  render() {
    if (this.props.isLoading) {
      return (
        <div className="define-validator">
          <LoadLines/>
        </div>
      );
    }

    const pageHeader = (this.props.isNewValidator) ? 'New validation function' : 'Edit validation function';
    const btnLabel = (this.props.isNewValidator) ? 'Create Document' : 'Save Document';
    return (
      <div className="define-validator">
        <form className="form-horizontal validator-query-save" onSubmit={this.saveValidator}>
          <h3 className="simple-header">{pageHeader}</h3>

          <div className="new-ddoc-section">
            <DesignDocSelector
              ref={(el) => {
                this.designDocSelector = el;
              }}
              designDocList={this.props.designDocList}
              isDbPartitioned={this.props.isDbPartitioned}
              selectedDesignDocName={this.props.designDocId}
              selectedDesignDocPartitioned={this.props.designDocPartitioned}
              newDesignDocName={this.props.newDesignDocName}
              newDesignDocPartitioned={this.props.newDesignDocPartitioned}
              onSelectDesignDoc={this.props.selectDesignDoc}
              onChangeNewDesignDocName={this.props.updateNewDesignDocName}
              onChangeNewDesignDocPartitioned={this.props.updateNewDesignDocPartitioned}
              docLink={getDocUrl('DESIGN_DOCS')}/>
          </div>

          <CodeEditorPanel
            id={'validator-function'}
            ref={(el) => {
              this.validatorEditor = el;
            }}
            title={"Validation function"}
            docLink={getDocUrl('VALIDATE_FUNCS')}
            blur={this.updateValidatorCode}
            allowZenMode={false}
            defaultCode={this.props.validator}/>
          <div className="padded-box">
            <div className="control-group">
              <ConfirmButton id="save-validator" text={btnLabel}/>
              <a href={this.getAllDocsLink()} className="validator-cancel-link">Cancel</a>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

ValidatorEditor.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  isNewValidator: PropTypes.bool.isRequired,
  database: PropTypes.object.isRequired,
  isDbPartitioned: PropTypes.bool.isRequired,
  designDocId: PropTypes.string.isRequired,
  newDesignDocName: PropTypes.string.isRequired,
  isNewDesignDoc: PropTypes.bool.isRequired,
  originalDesignDocName: PropTypes.string,
  designDocs: PropTypes.object,
  saveDesignDoc: PropTypes.object,
  partitionKey: PropTypes.string,
  updateNewDesignDocName: PropTypes.func.isRequired,
  saveValidator: PropTypes.func.isRequired,
  updateValidatorCode: PropTypes.func.isRequired
};
