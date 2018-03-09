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


import React from "react";
import {Modal} from "react-bootstrap";
import FauxtonAPI from '../../../core/api';

export default class CompactDatabaseModal extends React.Component {

  constructor() {
    super();


    FauxtonAPI.registerExtension('database:modifiylinks', {
      title: 'Compact',
      icon: 'fonticon-trash', //TODO: Use another icon :D
      onClick: (databaseName) => this.props.showModal(databaseName)
    });


    this.onCompactClick = this.onCompactClick.bind(this);
    this.close = this.close.bind(this);
  }

    static propTypes = {};

    close = (e) => {
      if (e) {
        e.preventDefault();
      }
      this.props.hideModal();
    };

    onCompactClick = (e) => {
      e.preventDefault();
      this.props.hideModal();
      this.props.compact(this.props.dbId);
    };

    render() {
      const {modalVisible, dbId} = this.props;
      return (
        <Modal dialogClassName="`compact-db-modal" show={modalVisible} onHide={this.close}>
          <Modal.Header closeButton={true}>
            <Modal.Title>Confirm compaction</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
                        Warning: This action will permanently remove old revisions from <code>{dbId}</code>.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <a href="#" onClick={this.close} data-bypass="true" className="cancel-link">Cancel</a>
            <button
              onClick={this.onCompactClick}
              className="btn btn-danger compact">
              <i className="icon compact-icon"/> Compact Database
            </button>
          </Modal.Footer>
        </Modal>
      );
    }
}
