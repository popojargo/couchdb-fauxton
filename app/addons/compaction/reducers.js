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

import {CMPNTS_DATABASES_UPDATECOMPACT_MODAL} from "./actiontypes";
import _ from 'lodash';

const initialState = {
  showDatabaseCompactionModal: false,
  dbId: ''
};
export default function compaction(state = initialState, action) {
  const {type, options} = action;
  switch (type) {

    case CMPNTS_DATABASES_UPDATECOMPACT_MODAL:
      return _.merge({}, state, options);
    default:
      return state;
  }
}

export const shouldShowDatabaseCompactionModal = state => state.showDatabaseCompactionModal;
export const getDatabaseId = state => state.dbId;
