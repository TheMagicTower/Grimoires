/**
 * Grimoires Runtime Module
 *
 * Exports all runtime components for hook execution.
 *
 * @version 0.3.0
 */

const bridge = require('./bridge');
const context = require('./context');
const matcher = require('./matcher');

module.exports = {
  // Bridge
  HooksBridge: bridge.HooksBridge,
  executeEvent: bridge.executeEvent,
  HookAction: bridge.HookAction,
  HookEvent: bridge.HookEvent,
  DEFAULT_PATHS: bridge.DEFAULT_PATHS,

  // Context
  buildContext: context.buildContext,
  createTestContext: context.createTestContext,
  serializeContext: context.serializeContext,
  exportToEnv: context.exportToEnv,
  CONTEXT_SOURCES: context.CONTEXT_SOURCES,

  // Matcher
  match: matcher.match,
  validate: matcher.validate
};
