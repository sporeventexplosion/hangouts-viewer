import React, { Component } from 'react';
import './ObjectViewer.css';

function getSplitLevel(n) {
  return Math.pow(10, Math.ceil(Math.log10(n)) - 1);
}

function range(start, end, step) {
  if (typeof end === 'undefined') {
    end = start;
    start = 0;
  }
  step = typeof step !== 'undefined' ? step : 1;

  let length = Math.ceil((end - start) / step);
  let arr = Array.from({length: length}).fill(0);

  for (let i = 0; i < length; i++) {
    arr[i] = start + step * i;
  }

  return arr;
}

class ObjectViewer extends Component {
  constructor(props) {
    super(props);

    this.toggleSubtree = this.toggleSubtree.bind(this);

    this.state = {
      hasSubtree: typeof props.object === 'object',
      showSubtree: false
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      hasSubtree: typeof nextProps.object === 'object',
    });
  }

  toggleSubtree() {
    if (this.state.hasSubtree) {
      this.setState({showSubtree: !this.state.showSubtree});
    }
  }

  render() {
    const val = this.props.object;
    const valType = typeof val;
    const showSubtree = this.state.showSubtree
    let displayElement;
    let subtreeElement;
    let hasSubtree = this.state.hasSubtree;

    if (valType === 'number') {
      displayElement = <div className="obj-value obj-number">{val}</div>;
    }
    else if (valType === 'string') {
      displayElement = <div className="obj-value">{'"'}<span className="obj-string">{val}</span>{'"'}</div>;
    }
    else if (valType === 'undefined') {
      displayElement = <div className="obj-value obj-undefined">undefined</div>;
    }
    else if (valType === 'boolean') {
      displayElement = <div className="obj-value obj-boolean">{val ? 'true' : 'false'}</div>;
    }
    else if (valType === 'function') {
      displayElement = <div className="obj-value obj-function">function {val.name}() {'{}'}</div>;
    }
    else if (valType === 'symbol') {
      displayElement = <div className="obj-value obj-symbol">{val}</div>;
    }
    else if (val instanceof Array) {
      if (this.props.isIntervalArray) {
        let offset = this.props.offset || 0;
        displayElement = (<div className="obj-value obj-interval">
          {`[${offset} ... ${offset + val.length - 1}]`}
        </div>);
        if (showSubtree) {
          subtreeElement = <ArrayContentViewer offset={offset} object={val} />;
        }
      }
      else {
        displayElement = <div className="obj-value obj-array">Array({val.length})</div>;
        if (showSubtree) {
          subtreeElement = <ArrayContentViewer object={val} />;
        }
      }
    }
    else if (valType === 'object') {
      displayElement = <div className="obj-value obj-object">Object {'{}'}</div>;
      if (showSubtree) {
        subtreeElement = <ObjectContentViewer object={val} />;
      }
    }
    else  {
      displayElement = <div className="obj-value obj-unknown">Unknown type</div>;
    }

    let objectName;
    if (typeof this.props.objectName !== 'undefined') {
      objectName = <span className="obj-attr-name">{this.props.objectName}: </span>
    }

    let subtreeClass;
    if (hasSubtree) {
      subtreeClass = showSubtree ? 'subtree-show' : 'subtree-hide'
    }

    return (<div className="obj-viewer">
      <div onClick={this.toggleSubtree} className={'obj-viewer-info ' + subtreeClass}>
        {objectName}
        {displayElement}
      </div>
      <div>
        {subtreeElement}
      </div>
    </div>)
  }
}

class ObjectContentViewer extends Component {
  render() {
    let obj = this.props.object
    let keys = Object.getOwnPropertyNames(obj);
    return (<div>
      <ul className="obj-list">
        {keys.map(
          key => (<li key={key}><ObjectViewer objectName={key} object={obj[key]} /></li>)
        )}
      </ul>
    </div>);
  }
}

class ArrayContentViewer extends Component {
  render() {
    let arr = this.props.object;
    let length = arr.length;
    let offset = this.props.offset || 0;

    if (arr.length > 100) {
      let splitLevel = getSplitLevel(arr.length);
      let sections = range(0, length, splitLevel)

      return (
        <div>
          <ul className="obj-list">
            {sections.map(
              (section, start) => (<li key={section}>
              <ObjectViewer object={arr.slice(section, section + splitLevel)}
                isIntervalArray
                offset={offset + section} />
            </li>)
            )}
          </ul>
        </div>
      )
    }
    return (<div>
      <ul className="obj-list">
        {arr.map(
          (el, i) => {
            i += offset;
            return <li key={i}><ObjectViewer objectName={i} object={el} /></li>;
          }
        )}
      </ul>
    </div>);
  }
}

export default ObjectViewer;
