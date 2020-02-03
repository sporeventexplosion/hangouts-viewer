import React, { Component } from 'react';

function tryget(func, fallback) {
  try {
    return func();
  }
  catch (ex) {
    return fallback;
  }
}

class ConversationList extends Component {
  render() {
    let dump = this.props.dump;

    if (!(dump && dump.conversation_state && dump.conversation_state.length > 0)) {
      return <div>No conversations</div>;
    }

    let conversations = dump.conversation_state;

    return (<ul>
      {
        conversations.map((conv, i) => {
          let convData = conv.conversation_state.conversation;
          let numParticipants = convData.current_participant.length;
          let participants = {};
          let numEvents = tryget(() => conv.conversation_state.event.length, 0);
          convData.participant_data.forEach(participant => {
            if (typeof participant.fallback_name !== 'string') {
              participants[participant.id.chat_id] = '[Unknown]';
            }
            else {
              participants[participant.id.chat_id] = participant.fallback_name;
            }
          });

          let participantNames = convData.current_participant.map(obj => participants[obj.chat_id]);

          return (<li key={i} onClick={() => this.props.selectConversation(conv, i)}>
            {`Number ${i}, ${convData.name ? convData.name + ', ' : ''}${numParticipants} participants, ${numEvents} messages, ${participantNames.join(', ')}, ID ${tryget(() => conv.conversation_id.id, 'No ID')}`}
          </li>);
        })
      }
      </ul>
    );
  }
}

export default ConversationList;
