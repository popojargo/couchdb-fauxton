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

import React from 'react';
import FauxtonAPI from "../../core/api";
import BaseRoute from "./shared-routes";
import DatabaseActions from '../databases/actions';
import Databases from "../databases/base";
import SidebarActions from './sidebar/actions';
import {SidebarItemSelection} from './sidebar/helpers';
import {DesignDocTabsSidebarLayout} from './layouts';
import ActionsValidatorEditor from "./validator-editor/actions";

const RoutesValidatorEditor = BaseRoute.extend({
  routes: {
    'database/:database/_partition/:partitionkey/new_validator': {
      route: 'createValidator',
      roles: ['fx_loggedIn']
    },
    'database/:database/_partition/:partitionkey/new_validator/:designDoc': {
      route: 'createValidator',
      roles: ['fx_loggedIn']
    },
    'database/:database/new_validator': {
      route: 'createValidatorNoPartition',
      roles: ['fx_loggedIn']
    },
    'database/:database/new_validator/:designDoc': {
      route: 'createValidatorNoPartition',
      roles: ['fx_loggedIn']
    },

    'database/:database/_partition/:partitionkey/_design/:ddoc/_validator/edit': {
      route: 'editValidator',
      roles: ['fx_loggedIn']
    },
    'database/:database/_design/:ddoc/_validator/edit': {
      route: 'editValidatorNoPartition',
      roles: ['fx_loggedIn']
    }
  },

  initialize (route, options) {
    var databaseName = options[0];
    this.databaseName = databaseName;
    this.database = new Databases.Model({id: databaseName});
    this.createDesignDocsCollection();
    this.addSidebar();
  },

  createValidatorNoPartition: function (databaseName, _designDoc) {
    return this.createValidator(databaseName, '', _designDoc);
  },

  createValidator: function (database, partitionKey, _designDoc) {
    let isNewDesignDoc = true;
    let designDoc = 'new-doc';

    if (_designDoc) {
      designDoc = '_design/' + _designDoc;
      isNewDesignDoc = false;
    }

    ActionsValidatorEditor.dispatchFetchDesignDocsBeforeEdit({
      isNewValidator: true,
      database: this.database,
      designDocs: this.designDocs,
      designDocId: designDoc,
      isNewDesignDoc: isNewDesignDoc
    });
    DatabaseActions.fetchSelectedDatabaseInfo(database);

    const selectedNavItem = new SidebarItemSelection('');
    const dropDownLinks = this.getCrumbs(this.database);

    return <DesignDocTabsSidebarLayout
      showValidatorEditView={true}
      showIncludeAllDocs={true}
      docURL={FauxtonAPI.constants.DOC_URLS.GENERAL}
      dbName={this.database.id}
      dropDownLinks={dropDownLinks}
      database={this.database}
      selectedNavItem={selectedNavItem}
      partitionKey={partitionKey}
    />;
  },

  editValidatorNoPartition: function (databaseName, ddocName) {
    return this.editValidator(databaseName, '', ddocName);
  },

  editValidator: function (databaseName, partitionKey, ddocName) {
    ActionsValidatorEditor.dispatchFetchDesignDocsBeforeEdit({
      isNewValidator: false,
      database: this.database,
      designDocs: this.designDocs,
      designDocId: '_design/' + ddocName
    });
    DatabaseActions.fetchSelectedDatabaseInfo(databaseName);

    const selectedNavItem = new SidebarItemSelection('designDoc', {
      designDocName: ddocName,
      designDocSection: 'validator'
    });
    SidebarActions.dispatchExpandSelectedItem(selectedNavItem);

    const docURL = FauxtonAPI.constants.DOC_URLS.GENERAL;
    const endpoint = FauxtonAPI.urls('validator', 'apiurl', databaseName, ddocName);
    const dropDownLinks = this.getCrumbs(this.database);

    return <DesignDocTabsSidebarLayout
      showIncludeAllDocs={true}
      showValidatorEditView={true}
      docURL={docURL}
      endpoint={endpoint}
      dbName={this.database.id}
      dropDownLinks={dropDownLinks}
      database={this.database}
      selectedNavItem={selectedNavItem}
      partitionKey={partitionKey}
    />;
  }

});

export default RoutesValidatorEditor;
