/*******************************************************************************
 *
 *    Copyright 2018 Adobe. All rights reserved.
 *    This file is licensed to you under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License. You may obtain a copy
 *    of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software distributed under
 *    the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 *    OF ANY KIND, either express or implied. See the License for the specific language
 *    governing permissions and limitations under the License.
 *
 ******************************************************************************/

'use strict';

const ci = new (require('./ci.js'))();

ci.context();

ci.dir('runtime', () => {
    let pkg = ci.parsePackage("package.json");

    ci.stage('PROVISION PROJECT');
    ci.sh('npm install');

    if ("test" in pkg.scripts) {
        ci.stage('UNIT TESTS');
        ci.sh('mkdir -p test/results/unit');
        ci.sh('npm test');
    
        // Upload coverage to Codecov
        ci.sh('npm install codecov');
        ci.sh('$(npm bin)/codecov');
    }
});

ci.stage('BUILD DONE');