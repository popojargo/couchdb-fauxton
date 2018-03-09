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

import {connect} from 'react-redux';

import CompactDatabaseModal from '../components/CompactDatabaseModal';

import {
  shouldShowDatabaseCompactionModal,
  getDatabaseId
} from '../reducers';

import {
  compactDatabase,
  updateCompactDatabaseModal
} from '../actions';


const mapStateToProps = ({compaction}) => {
  return {
    modalVisible: shouldShowDatabaseCompactionModal(compaction),
    dbId: getDatabaseId(compaction)
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideModal() {
      dispatch(updateCompactDatabaseModal({showDatabaseCompactionModal: false}));
    },
    showModal(databaseName) {
      dispatch(updateCompactDatabaseModal({showDatabaseCompactionModal: true, dbId: databaseName}));
    },
    compact(databaseName) {
      dispatch(compactDatabase(databaseName));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CompactDatabaseModal);
