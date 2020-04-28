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

import Documents from './shared-resources';
import DocumentsRouteObject from "./routes-documents";
import docEditor from "./routes-doc-editor";
import IndexEditorRouteObject from "./routes-index-editor";
import ValidatorRouteObject from './routes-validator-editor';
import Mango from "./routes-mango";

Documents.RouteObjects = [
  docEditor.DocEditorRouteObject,
  DocumentsRouteObject,
  ValidatorRouteObject,
  IndexEditorRouteObject,
  Mango.MangoIndexEditorAndQueryEditor
];

export default Documents;
