import React, { Component } from 'react';
import './App.css';

import FileUploadControl from './FileUploadControl';
import ObjectViewer from './ObjectViewer';
import ConversationList from './ConversationList';
import ConversationViewer from './ConversationViewer';

console.log(ConversationList);

class App extends Component {
  constructor(props) {
    super(props);

    this.updateDump = this.updateDump.bind(this);
    this.setViewerItem = this.setViewerItem.bind(this);
    this.setConversation = this.setConversation.bind(this);

    this.state = {};
  }

  // Update chat dump data
  updateDump(dumpString) {
    let dump;
    try {
      dump = JSON.parse(dumpString);
    }
    catch (ex) {
      alert('Not a valid JSON file');
      return;
    }

    console.log('Dump updated');
    console.log(dump);
    this.setState({
      dump: dump
    });

    this.setViewerItem(dump);
  }

  // Set the item being inspected in the Object Viewer
  setViewerItem(obj) {
    this.setState({
      currentObject: obj
    });
  }

  setConversation(conv) {
    this.setViewerItem(conv);
    this.setState({
      currentConversation: conv
    });
  }

  render() {
    let objViewer;
    return (
      <div className="app">
        <div className="app-header">
          <h1 className="app-title">Hangouts Viewer</h1>
        </div>

        <div className="app-body">
          <div>
            <h2>Select your Hangouts JSON dump.</h2>
            <p>
              <strong>Warning:</strong> Depending on your file size, this operation may use up to hundreds of MB of memory.
            </p>
            <div className="panel">
              <FileUploadControl updateData={ this.updateDump } />
            </div>
          </div>

          <div>
            <h2>Object Viewer</h2>
            <p>Use Object Viewer to inspect chat data</p>
            <button className="btn btn-secondary"
              onClick={ () => this.setViewerItem(this.state.dump) }>
              Show full dump
            </button>
            <div className="panel">
              <ObjectViewer object={ this.state.currentObject } />
            </div>
            <div>
            </div>
          </div>

          <div>
            <h2>Conversations</h2>
            <div>
              <ConversationList dump={ this.state.dump }
                selectConversation={ this.setConversation } />
            </div>
          </div>

          <div>
            <h2>View conversation</h2>
            <ConversationViewer conversation={ this.state.currentConversation } onMessageClick={ (msg) => this.setViewerItem(msg) }/>
          </div>
        </div>

        <div className="app-footer">
          hangouts-viewer by sporeventexplosion
        </div>
      </div>
    );
  }
}

export default App;
