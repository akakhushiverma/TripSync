class MessageParser {
  constructor(actionProvider) {
    this.actionProvider = actionProvider;
  }

  parse(message) {
    if (message.trim()) {
      this.actionProvider.handleChat(message);
    }
  }
}

export default MessageParser;