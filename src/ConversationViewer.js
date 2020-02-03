import React, { Component } from 'react';
import './ConversationViewer.css';

import ObjectViewer from './ObjectViewer';

function getSortedConversation(conv) {
  return conv.map(getMessage).sort((a, b) => a.timestamp - b.timestamp);
}

function getChatString(chatMsg) {
  return chatMsg.chat_message.message_content.segment.filter(s => s.type === 'TEXT')
    .map(s => s.text)
    .join('');
}

function getMessage(msg) {
  let formattedMsg = {
    sender_id: msg.sender_id.chat_id,
    timestamp: parseFloat(msg.timestamp) / 1000,
    chat_message: msg.chat_message,
    hangout_event: msg.hangout_event,
    event_type: msg.event_type,
    isText: false,
  }
  if (msg.chat_message && msg.chat_message.message_content.segment) {
    formattedMsg.isText = true;
    formattedMsg.searchString = getChatString(msg).toLowerCase();
  }
  return formattedMsg;
}

function generateFallbackNameList(conv) {
  const data = conv.conversation.conversation.participant_data;
  const ret = {};
  data.forEach(p => ret[p.id.chat_id] = (p.fallback_name || '[Unknown]'));
  return ret;
}

const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 50;

class ConversationViewer extends Component {
  constructor(props) {
    super(props);

    this.updateShownMessages = this.updateShownMessages.bind(this);

    let state = {
      _strOffset: DEFAULT_OFFSET.toString(),
      _strLimit: DEFAULT_LIMIT.toString(),
      offset: DEFAULT_OFFSET,
      limit: DEFAULT_LIMIT
    };
    try {
      let oc = getSortedConversation(props.conversation.events);
      state.orderedConversation = oc;
      state.fallbackNames = generateFallbackNameList(props.conversation);
      this.state = state;
      this.updateShownMessages();
    }
    catch (ex) {
      this.state = state;
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.conversation !== this.props.conversation) {
      try {
        let oc = getSortedConversation(nextProps.conversation.events || []);
        let fallbackNames = generateFallbackNameList(nextProps.conversation);
        this.setState({
          orderedConversation: oc,
          fallbackNames: fallbackNames
        });
        this.updateShownMessages(oc);
      }
      catch (ex) {

      }
    }
  }

  updateShownMessages(oc) {
    let offset = parseInt(this.state._strOffset);
    let limit = parseInt(this.state._strLimit);
    if (isNaN(offset) || offset < 0) {
      offset = DEFAULT_OFFSET;
    }
    if (isNaN(limit) || limit < 0){
      limit = DEFAULT_LIMIT;
    }
    this.setState({
      offset: offset,
      limit: limit,
      shownMessages: oc.slice(offset, offset + limit)
    });
  }

  render() {
    if (this.state.orderedConversation && this.state.orderedConversation.length > 0) {
      return (
        <div>
          Offset
          <input value={this.state._strOffset} onChange={ev => this.setState({_strOffset: ev.target.value})} />
          Limit
          <input value={this.state._strLimit} onChange={ev => this.setState({_strLimit: ev.target.value})} />
          <button onClick={() => this.updateShownMessages(this.state.orderedConversation)}>Update Shown Messages</button>
          <ul className="cv-message-list">
            {this.state.shownMessages.map((msg, i) => {
              i += this.state.offset;
              let msgBody;

              if (msg.event_type === 'REGULAR_CHAT_MESSAGE' && msg.isText) {
                msgBody = <TextViewer segment={msg.chat_message.message_content.segment} />;
              }
              else if (msg.event_type === 'HANGOUT_EVENT') {
                msgBody = <div className="cv-hangout-event">{'[Hangout event] ' + msg.hangout_event.event_type}</div>;
              }
              else {
                msgBody = <div className="cv-non-text">This message contains only non-text information</div>;
              }

              let attachments;

              if (msg.event_type === 'REGULAR_CHAT_MESSAGE' && msg.chat_message.message_content.attachment) {
                attachments = <AttachmentViewer attachments={msg.chat_message.message_content.attachment} />
              }

              return (<li key={i} onClick={() => this.props.onMessageClick(msg.chat_message)}>
                <div className="cv-message">
                  <div>
                    <span className="cv-name">{this.state.fallbackNames[msg.sender_id] || '[Unknown]'}</span>
                    <span className="cv-timestamp">at {new Date(msg.timestamp).toGMTString()}</span>
                  </div>
                  <div className="cv-chat-box">
                    <div>{msgBody}</div>
                    <div>{attachments}</div>
                  </div>
                </div>
              </li>)
            })}
          </ul>
        </div>
      );
    }
    else {
      return (<div>No messages</div>)
    }
  }
}

function TextViewer(props) {
  return (<div className="cv-chat-text">
    {props.segment.map((seg, i) => {
      let style = {}
      let td = [];
      if (seg.formatting) {
        if (seg.formatting.bold) {
          style.fontWeight = 'bold';
        }
        if (seg.formatting.italics) {
          style.fontStyle = 'italic';
        }
        if (seg.formatting.underline) {
          td.push('underline');
        }
        if (seg.formatting.strikethrough) {
          td.push('line-through');
        }
        if (td.length > 0) {
          style.textDecoration = td.join(' ');
        }
      }
      let text;
      if (seg.type === 'LINK' && seg.link_data.link_target) {
        text = <a href={seg.link_data.link_target}>{seg.text}</a>
      }
      else {
        text = <span>{seg.text}</span>
      }
      return (<span key={i} style={style}>{text}</span>);
    })}
  </div>);
}

function AttachmentViewer(props) {
  return (<div className="cv-chat-attachments">
    {props.attachments.map((att, i) => {
      const item = att.embed_item;

      if (item.type.indexOf('PLUS_PHOTO') !== -1 && item['embeds.PlusPhoto.plus_photo']) {
        const photoData = item['embeds.PlusPhoto.plus_photo'];

        const url = photoData.url;
        const thumbUrl = photoData.thumbnail.url || photoData.thumbnail.image_url;

        return (<a href={url} target="_blank" key={i}>
          <img src={thumbUrl} alt="" />
        </a>);
      }
    })}
  </div>);
}

export default ConversationViewer;
