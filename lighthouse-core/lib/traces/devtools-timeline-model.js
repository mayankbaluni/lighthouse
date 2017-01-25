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

require('../web-inspector');
const Timeline = global.Timeline;

const ConsoleQuieter = require('../console-quieter');

// Polyfill the bottom-up and topdown tree sorting.
const TimelineModelTreeView =
    require('devtools-timeline-model/lib/timeline-model-treeview.js');

class TimelineModel {

  constructor(events) {
    this.init(events);
  }

  init(events) {
    // build empty models. (devtools) tracing model & timeline model
    //   from Timeline.TimelinePanel() constructor
    const tracingModelBackingStorage = new Bindings.TempFileBackingStorage('tracing');
    this._tracingModel = new SDK.TracingModel(tracingModelBackingStorage);
    this._timelineModel = new global.TimelineModel.TimelineModel(Timeline.TimelineUIUtils.visibleEventsFilter());

    if (typeof events === 'string') {
      events = JSON.parse(events);
    }
    if (events.hasOwnProperty('traceEvents')) {
      events = events.traceEvents;
    }

    // reset models
    //   from Timeline.TimelinePanel._clear()
    this._timelineModel.reset();

    ConsoleQuieter.mute({prefix: 'timelineModel'});
    // populates with events, and call TracingModel.tracingComplete()
    this._tracingModel.setEventsForTest(events);

    // generate timeline model
    //   from Timeline.TimelinePanel.loadingComplete()
    const loadedFromFile = true;
    this._timelineModel.setEvents(this._tracingModel, loadedFromFile);
    ConsoleQuieter.unmuteAndFlush();

    return this;
  }

  _createGroupingFunction(groupBy) {
    return Timeline.AggregatedTimelineTreeView.prototype._groupingFunction(groupBy);
  }

  timelineModel() {
    return this._timelineModel;
  }

  tracingModel() {
    return this._tracingModel;
  }

  topDown() {
    return this.topDownGroupBy(Timeline.AggregatedTimelineTreeView.GroupBy.None);
  }

  topDownGroupBy(grouping) {
    const filters = [];
    filters.push(Timeline.TimelineUIUtils.visibleEventsFilter());
    filters.push(new TimelineModel.ExcludeTopLevelFilter());
    const nonessentialEvents = [
      TimelineModel.TimelineModel.RecordType.EventDispatch,
      TimelineModel.TimelineModel.RecordType.FunctionCall,
      TimelineModel.TimelineModel.RecordType.TimerFire
    ];
    filters.push(new TimelineModel.ExclusiveNameFilter(nonessentialEvents));

    const groupingAggregator = this._createGroupingFunction(Timeline.AggregatedTimelineTreeView.GroupBy[grouping]);
    const topDownGrouped = TimelineModel.TimelineProfileTree.buildTopDown(this._timelineModel.mainThreadEvents(),
        filters, /* startTime */ 0, /* endTime */ Infinity, groupingAggregator);

    // from Timeline.CallTreeTimelineTreeView._buildTree()
    if (grouping !== Timeline.AggregatedTimelineTreeView.GroupBy.None)
      new TimelineModel.TimelineAggregator().performGrouping(topDownGrouped); // group in-place

    new TimelineModelTreeView(topDownGrouped).sortingChanged('total', 'desc');
    return topDownGrouped;
  }

  bottomUp() {
    return this.bottomUpGroupBy(Timeline.AggregatedTimelineTreeView.GroupBy.None);
  }

  /**
   * @param  {!string} grouping Allowed values: None Category Subdomain Domain URL EventName
   * @return {!TimelineModel.TimelineProfileTree.Node} A grouped and sorted tree
   */
  bottomUpGroupBy(grouping) {
    const topDown = this.topDownGroupBy(grouping);

    const bottomUpGrouped = TimelineModel.TimelineProfileTree.buildBottomUp(topDown);
    new TimelineModelTreeView(bottomUpGrouped).sortingChanged('self', 'desc');

    // todo: understand why an empty key'd entry is created here
    bottomUpGrouped.children.delete('');
    return bottomUpGrouped;
  }

  frameModel() {
    const frameModel = new TimelineModel.TimelineFrameModel(event =>
      Timeline.TimelineUIUtils.eventStyle(event).category.name
    );
    frameModel.addTraceEvents({ /* target */ },
      this._timelineModel.inspectedTargetEvents(), this._timelineModel.sessionId() || '');
    return frameModel;
  }

  filmStripModel() {
    return new SDK.FilmStripModel(this._tracingModel);
  }

  interactionModel() {
    const irModel = new TimelineModel.TimelineIRModel();
    irModel.populate(this._timelineModel);
    return irModel;
  }
}

module.exports = TimelineModel;
