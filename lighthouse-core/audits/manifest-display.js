/**
 * @license
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const Audit = require('./audit');

class ManifestDisplay extends Audit {
  /**
   * @return {!AuditMeta}
   */
  static get meta() {
    return {
      category: 'Manifest',
      name: 'manifest-display',
      description: 'Manifest\'s `display` property is set',
      helpText: 'Set the `display` property to specify how your app ' +
          'launches from the homescreen. [Learn ' +
          'more](https://developers.google.com/web/tools/lighthouse/audits/manifest-has-display-set).',
      requiredArtifacts: ['Manifest']
    };
  }

  /**
   * @param {string|undefined} val
   * @return {boolean}
   */
  static hasRecommendedValue(val) {
    return ['browser', 'fullscreen', 'minimal-ui', 'standalone'].includes(val);
  }

  /**
   * @param {!Artifacts} artifacts
   * @return {!AuditResult}
   */
  static audit(artifacts) {
    const manifest = artifacts.Manifest.value;
    const displayValue = manifest && manifest.display.value;

    const hasRecommendedValue = ManifestDisplay.hasRecommendedValue(displayValue);

    const auditResult = {
      rawValue: hasRecommendedValue,
      displayValue
    };
    if (manifest && !hasRecommendedValue) {
      auditResult.debugString = 'Manifest display property should be set.';
    }
    return ManifestDisplay.generateAuditResult(auditResult);
  }
}

module.exports = ManifestDisplay;
