/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const fs = require('fs');
const resolve = require('resolve');

const noop = function () { };

// In order to maintain consistent global scope across the files,
// and share natives like Array, etc, We will eval things within our sandbox
function requireval(path) {
  const res = resolve.sync(path, {basedir: __dirname});
  const filesrc = fs.readFileSync(res, 'utf8');
  // eslint-disable-next-line no-eval
  eval(filesrc + '\n\n//# sourceURL=' + path);
}

/**
 * Stubbery to allow portions of the DevTools frontend to be used in lighthouse. `WebInspector`
 * technically lives on the global object but should be accessed through a normal `require` call.
 */
module.exports = (function() {
  // Global pollution.
  // Check below is to make it worker-friendly where global is worker's self.
  if (global.self !== global) {
    global.self = global;
  }
  if (typeof global.window === 'undefined') {
    global.window = global;
  }

  // establish our sandboxed globals
  global.Runtime = class {};
  global.Protocol = class {};
  global.TreeElement = class { };

  // from generated externs.
  // As of node 7.3, instantiating these globals must be here rather than in api-stubs.js
  global.Accessibility = {};
  global.Animation = {};
  global.Audits = {};
  global.Audits2 = {};
  global.Audits2Worker = {};
  global.Bindings = {};
  global.CmModes = {};
  global.Common = {};
  global.Components = {};
  global.Console = {};
  global.DataGrid = {};
  global.Devices = {};
  global.Diff = {};
  global.Elements = {};
  global.Emulation = {};
  global.Extensions = {};
  global.FormatterWorker = {};
  global.Gonzales = {};
  global.HeapSnapshotWorker = {};
  global.Host = {};
  global.LayerViewer = {};
  global.Layers = {};
  global.Main = {};
  global.Network = {};
  global.Persistence = {};
  global.Platform = {};
  global.Profiler = {};
  global.Resources = {};
  global.Sass = {};
  global.Screencast = {};
  global.SDK = {};
  global.Security = {};
  global.Services = {};
  global.Settings = {};
  global.Snippets = {};
  global.SourceFrame = {};
  global.Sources = {};
  global.Terminal = {};
  global.TextEditor = {};
  global.Timeline = {};
  global.TimelineModel = {};
  global.ToolboxBootstrap = {};
  global.UI = {};
  global.UtilitySharedWorker = {};
  global.WorkerService = {};
  global.Workspace = {};

  global.Runtime.experiments = {};
  global.Runtime.experiments.isEnabled = exp => exp === 'timelineLatencyInfo';

  global.Runtime.queryParam = function(arg) {
    switch (arg) {
      case 'remoteFrontend':
        return false;
      case 'ws':
        return false;
      default:
        throw Error('Mock queryParam case not implemented.');
    }
  };
  Common.Settings = noop;
  Common.Settings._moduleSettings = {
    cacheDisabled: {
      addChangeListener() {},
      get() {
        return false;
      }
    },
    monitoringXHREnabled: {
      addChangeListener() {},
      get() {
        return false;
      }
    },
    showNativeFunctionsInJSProfile: {
      addChangeListener() {},
      get() {
        return true;
      }
    }
  };
  Common.moduleSetting = function(settingName) {
    return Common.Settings._moduleSettings[settingName];
  };

  // Enum from chromium//src/third_party/WebKit/Source/core/loader/MixedContentChecker.h
  global.Protocol.Network = {
    RequestMixedContentType: {
      Blockable: 'blockable',
      OptionallyBlockable: 'optionally-blockable',
      None: 'none'
    },
    BlockedReason: {
      CSP: 'csp',
      MixedContent: 'mixed-content',
      Origin: 'origin',
      Inspector: 'inspector',
      Other: 'other'
    },
    InitiatorType: {
      Other: 'other',
      Parser: 'parser',
      Redirect: 'redirect',
      Script: 'script'
    }
  };

  // Enum from SecurityState enum in protocol's Security domain
  global.Protocol.Security = {
    SecurityState: {
      Unknown: 'unknown',
      Neutral: 'neutral',
      Insecure: 'insecure',
      Warning: 'warning',
      Secure: 'secure',
      Info: 'info'
    }
  };
  // From https://chromium.googlesource.com/chromium/src/third_party/WebKit/Source/devtools/+/master/protocol.json#93
  global.Protocol.Page = {
    ResourceType: {
      Document: 'document',
      Stylesheet: 'stylesheet',
      Image: 'image',
      Media: 'media',
      Font: 'font',
      Script: 'script',
      TextTrack: 'texttrack',
      XHR: 'xhr',
      Fetch: 'fetch',
      EventSource: 'eventsource',
      WebSocket: 'websocket',
      Manifest: 'manifest',
      Other: 'other'
    }
  };


  // other neccessary stubs
  Protocol.TargetBase = noop;
  Protocol.Agents = {};

  UI.VBox = noop;
  UI.TreeElement = noop;

  DataGrid.ViewportDataGrid = noop;
  DataGrid.ViewportDataGridNode = noop;

  SDK.targetManager = {};
  SDK.targetManager.mainTarget = noop;


  // Dependencies for network-recorder
  requireval('chrome-devtools-frontend/front_end/common/Object.js');
  requireval('chrome-devtools-frontend/front_end/common/ParsedURL.js');
  requireval('chrome-devtools-frontend/front_end/common/ResourceType.js');
  requireval('chrome-devtools-frontend/front_end/common/UIString.js');
  requireval('chrome-devtools-frontend/front_end/platform/utilities.js');
  requireval('chrome-devtools-frontend/front_end/sdk/Target.js');
  requireval('chrome-devtools-frontend/front_end/sdk/TargetManager.js');
  requireval('chrome-devtools-frontend/front_end/sdk/NetworkManager.js');
  requireval('chrome-devtools-frontend/front_end/sdk/NetworkRequest.js');

  requireval('chrome-devtools-frontend/front_end/common/SegmentedRange.js');
  requireval('chrome-devtools-frontend/front_end/bindings/TempFile.js');

  requireval('chrome-devtools-frontend/front_end/sdk/TracingModel.js');
  requireval('chrome-devtools-frontend/front_end/sdk/ProfileTreeModel.js');
  requireval('chrome-devtools-frontend/front_end/timeline/TimelineUIUtils.js');
  requireval('chrome-devtools-frontend/front_end/timeline_model/TimelineJSProfile.js');
  requireval('chrome-devtools-frontend/front_end/sdk/CPUProfileDataModel.js');
  requireval('chrome-devtools-frontend/front_end/timeline_model/TimelineModel.js');
  requireval('chrome-devtools-frontend/front_end/data_grid/SortableDataGrid.js');

  requireval('chrome-devtools-frontend/front_end/timeline/TimelineTreeView.js');
  requireval('chrome-devtools-frontend/front_end/timeline_model/TimelineProfileTree.js');
  requireval('chrome-devtools-frontend/front_end/sdk/FilmStripModel.js');
  requireval('chrome-devtools-frontend/front_end/timeline_model/TimelineIRModel.js');
  requireval('chrome-devtools-frontend/front_end/timeline_model/TimelineFrameModel.js');

  // DevTools makes a few assumptions about using backing storage to hold traces.
  global.Bindings.DeferredTempFile = function() {};
  global.Bindings.DeferredTempFile.prototype = {
    write: _ => { },
    remove: _ => { },
    finishWriting: _ => { }
  };

  // Mock for WebInspector code that writes to console.
  SDK.ConsoleMessage = function() {};
  SDK.ConsoleMessage.MessageSource = {
    Network: 'network'
  };
  SDK.ConsoleMessage.MessageLevel = {
    Log: 'log'
  };
  SDK.ConsoleMessage.MessageType = {
    Log: 'log'
  };

  Common.Console = {
    error: str => log.error('devtools-frontend', str)
  };
  Common.settings = {
    createSetting() {
      return {
        get() {
          return false;
        },
        addChangeListener() {}
      };
    }
  };

  // Mock NetworkLog
  SDK.NetworkLog = function(target) {
    this._requests = new Map();
    target.networkManager.addEventListener(
      SDK.NetworkManager.Events.RequestStarted, this._onRequestStarted, this);
  };

  SDK.NetworkLog.prototype = {
    requestForURL: function(url) {
      return this._requests.get(url) || null;
    },

    _onRequestStarted: function(event) {
      const request = event.data;
      if (this._requests.has(request.url)) {
        return;
      }
      this._requests.set(request.url, request);
    }
  };

  // Dependencies for color parsing.
  requireval('chrome-devtools-frontend/front_end/common/Color.js');

  /**
   * Creates a new WebInspector NetworkManager using a mocked Target.
   * @return {!WebInspector.NetworkManager}
   */
  SDK.NetworkManager.createWithFakeTarget = function() {
    // Mocked-up WebInspector Target for NetworkManager
    const fakeNetworkAgent = {
      enable() {}
    };
    const fakeConsoleModel = {
      addMessage() {},
      target() {}
    };
    const fakeTarget = {
      _modelByConstructor: new Map(),
      get consoleModel() {
        return fakeConsoleModel;
      },
      networkAgent() {
        return fakeNetworkAgent;
      },
      registerNetworkDispatcher() { },
      model() { }
    };

    fakeTarget.networkManager = new SDK.NetworkManager(fakeTarget);
    fakeTarget.networkLog = new SDK.NetworkLog(fakeTarget);

    SDK.NetworkLog.fromTarget = () => {
      return fakeTarget.networkLog;
    };

    return fakeTarget.networkManager;
  };

  // Dependencies for CSS parsing.
  const gonzales = require('chrome-devtools-frontend/front_end/gonzales/gonzales-scss.js');

  requireval('chrome-devtools-frontend/front_end/common/TextRange.js');
  requireval('chrome-devtools-frontend/front_end/gonzales/SCSSParser.js');

  // Mostly taken from from chrome-devtools-frontend/front_end/gonzales/SCSSParser.js.
  Gonzales.SCSSParser.prototype.parse = function(content) {
    let ast = null;
    try {
      ast = gonzales.parse(content, {syntax: 'css'});
    } catch (e) {
      return {error: e};
    }

    /** @type {!{properties: !Array<!Gonzales.Node>, node: !Gonzales.Node}} */
    const rootBlock = {
      properties: [],
      node: ast
    };
    /** @type {!Array<!{properties: !Array<!Gonzales.Node>, node: !Gonzales.Node}>} */
    const blocks = [rootBlock];
    ast.selectors = [];
    Gonzales.SCSSParser.extractNodes(ast, blocks, rootBlock);

    return ast;
  };

  return global;
})();
