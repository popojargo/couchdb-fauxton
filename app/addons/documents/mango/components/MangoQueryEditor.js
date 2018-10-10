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

import React, { Component } from "react";
import ReactSelect from "react-select";
import "../../../../../assets/js/plugins/prettify";
import app from "../../../../app";
import FauxtonAPI from "../../../../core/api";
import ReactComponents from "../../../components/react-components";
import ExecutionStats from './ExecutionStats';
import Helper from '../mango.helper';

const PaddedBorderedBox = ReactComponents.PaddedBorderedBox;
const CodeEditorPanel = ReactComponents.CodeEditorPanel;
const getDocUrl = app.helpers.getDocUrl;

export default class MangoQueryEditor extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    prettyPrint();
    this.props.loadQueryHistory({ databaseName: this.props.databaseName });
    // Clear results list in case it was populated by other pages
    this.props.clearResults();

    // Add key binding to run query when doing Ctrl-Enter
    const editor = this.codeEditor.codeEditor.editor;
    const runQueryCmdName = "runQuery";
    if (!editor.commands.byName[runQueryCmdName]) {
      editor.commands.addCommand({
        name: runQueryCmdName,
        bindKey: {win: 'Ctrl-Enter', mac: 'Command-Option-Enter'},
        exec: () => {
          this.runQuery({preventDefault: () => {}});
        },
        readOnly: true
      });
    }
  }

  componentDidUpdate (prevProps) {
    prettyPrint();
    if (prevProps.history != this.props.history) {
      // Explicitly set value because updating 'CodeEditorPanel.defaultCode' won't change the editor once it's already loaded.
      this.setEditorValue(this.props.history[0].value);
    }
  }

  setEditorValue (newValue = '') {
    return this.codeEditor.getEditor().setValue(newValue);
  }

  getEditorValue () {
    return this.codeEditor.getValue();
  }

  editorHasErrors () {
    return this.codeEditor.getEditor().hasErrors();
  }

  onHistorySelected(selectedItem) {
    this.setEditorValue(selectedItem.value);
  }

  editor() {
    return (
      <div className="mango-editor-wrapper">
        <form className="form-horizontal" onSubmit={(ev) => {this.runQuery(ev);}}>
          <div className="padded-box">
            <ReactSelect
              className="mango-select"
              options={this.props.history}
              ref={node => this.history = node}
              placeholder="Query history"
              searchable={false}
              clearable={false}
              autosize={false}
              onChange={(elem) => {this.onHistorySelected(elem);}}
            />
          </div>
          <PaddedBorderedBox>
            <CodeEditorPanel
              id="query-field"
              ref={node => this.codeEditor = node}
              title={this.props.editorTitle}
              docLink={getDocUrl('MANGO_SEARCH')}
              defaultCode={this.props.queryFindCode} />
          </PaddedBorderedBox>
          <div className="padded-box">
            <div className="control-group">
              <button type="submit" id="create-index-btn" className="btn btn-primary btn-space">Run Query</button>
              <button type="button" id="explain-btn" className="btn btn-secondary btn-space"
                onClick={(ev) => {this.runExplain(ev);} }>Explain</button>
              <a className="edit-link" style={{} } onClick={(ev) => {this.manageIndexes(ev);}}>manage indexes</a>
            </div>
            <div>
              <ExecutionStats {...this.props} />
            </div>
          </div>
        </form>
      </div>
    );
  }

  render () {
    if (this.props.isLoading) {
      return (
        <div className="mango-editor-wrapper">
          <ReactComponents.LoadLines />
        </div>
      );
    }

    return this.editor();
  }

  notifyOnQueryError() {
    if (this.editorHasErrors()) {
      FauxtonAPI.addNotification({
        msg:  'Please fix the JSON errors and try again.',
        type: 'error',
        clear: true
      });

      return true;
    }

    return false;
  }

  isRegexValid(selector = {}) {
    const regexes = Helper.getSelectorRegexes(selector);
    const errors = _.reduce(regexes, (acc, val) => {
      try {
        new RegExp(val);
      } catch (e) {
        acc.push(e.message);
      }
      return acc;
    }, []);

    if (Object.keys(errors).length > 0) {

      FauxtonAPI.addNotification({
        msg:  'There was some regex errors. Errors: ' + errors.join('. '),
        type: 'error',
        clear: true
      });
      return false;
    }

    return true;

  }

  manageIndexes(event) {
    event.preventDefault();

    this.props.manageIndexes();

    const manageIndexURL = '#' + FauxtonAPI.urls('mango', 'index-app', encodeURIComponent(this.props.databaseName));
    FauxtonAPI.navigate(manageIndexURL);
  }

  runExplain(event) {
    event.preventDefault();

    if (this.notifyOnQueryError()) {
      return;
    }

    const queryCode = JSON.parse(this.getEditorValue());

    if (!this.isRegexValid(queryCode.selector)) {
      return;
    }

    this.props.runExplainQuery({
      databaseName: this.props.databaseName,
      queryCode: queryCode
    });
  }

  runQuery (event) {
    event.preventDefault();

    if (this.notifyOnQueryError()) {
      return;
    }

    const queryCode = JSON.parse(this.getEditorValue());

    if (!this.isRegexValid(queryCode.selector)) {
      return;
    }

    this.props.clearResults();
    this.props.runQuery({
      databaseName: this.props.databaseName,
      queryCode: queryCode,
      fetchParams: {...this.props.fetchParams, skip: 0}
    });
  }
}

MangoQueryEditor.propTypes = {
  description: PropTypes.string.isRequired,
  editorTitle: PropTypes.string.isRequired,
  queryFindCode: PropTypes.string.isRequired,
  queryFindCodeChanged: PropTypes.bool,
  databaseName: PropTypes.string.isRequired,
  runExplainQuery: PropTypes.func.isRequired,
  manageIndexes: PropTypes.func.isRequired,
};
