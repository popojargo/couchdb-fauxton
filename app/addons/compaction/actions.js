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

import FauxtonAPI from "../../core/api";
import {post} from "../../core/ajax";
import app from '../../app';
import {CMPNTS_DATABASES_UPDATECOMPACT_MODAL} from './actiontypes';

export const updateCompactDatabaseModal = (options) => async dispatch => {
  dispatch({
    type: CMPNTS_DATABASES_UPDATECOMPACT_MODAL,
    options: options
  });
};

export const compactDatabase = (databaseName) => async () => {
  const url = app.host + "/" + databaseName + "/_compact";
  try {
    const json = await post(url);
    if (json.ok) {
      FauxtonAPI.addNotification({
        msg: 'Database compaction has been accepted.',
        type:'success'
      });
    } else {
      throw new Error(json.reason);
    }
  } catch (error) {
    FauxtonAPI.addNotification({
      msg: 'Database compaction failed - reason: ' + error,
      type: 'error'
    });
  }
};
