import {classifyDiff, DIFF_TYPES} from './deepDiff'
import {getDisplayName} from './getDisplayName'
import {normalizeOptions} from './normalizeOptions'
import {shouldInclude} from './shouldInclude'

function createComponentDidUpdate (opts) {
  return function componentDidUpdate (prevProps, prevState) {
    const displayName = getDisplayName(this)

    if (!shouldInclude(displayName, opts)) {
      return
    }

    const propsDiff = classifyDiff(prevProps, this.props, `${displayName}.props`)
    if (propsDiff.type === DIFF_TYPES.UNAVOIDABLE) {
      return
    }

    const stateDiff = classifyDiff(prevState, this.state, `${displayName}.state`)
    if (stateDiff.type === DIFF_TYPES.UNAVOIDABLE) {
      return
    }
    opts.notifier(opts.groupByComponent, opts.collapseComponentGroups, displayName, [propsDiff, stateDiff])
  }
}

export const whyDidYouUpdate = (React, opts = {}) => {
  const _componentDidUpdate = React.Component.prototype.componentDidUpdate
  opts = normalizeOptions(opts)

  React.Component.prototype.componentDidUpdate = createComponentDidUpdate(opts)

  let _createClass = null;
  try {
    _createClass = React.createClass;

    if (_createClass) {
      React.createClass = function createClass (obj) {
        const Mixin = {
          componentDidUpdate: createComponentDidUpdate(opts)
        }

        if (obj.mixins) {
          obj.mixins = [Mixin].concat(obj.mixins)
        } else {
          obj.mixins = [Mixin]
        }

        return _createClass.call(React, obj)
      }
    }
  } catch(e) {}

  React.__WHY_DID_YOU_UPDATE_RESTORE_FN__ = () => {
    React.Component.prototype.componentDidUpdate = _componentDidUpdate
    if (_createClass) {
      React.createClass = _createClass
    }
    delete React.__WHY_DID_YOU_UPDATE_RESTORE_FN__
  }

  return React
}

export default whyDidYouUpdate
