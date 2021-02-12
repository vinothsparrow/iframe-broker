import React, { Component, useState } from 'react'
import Empty from './Empty'
import MessagesTable from './MessagesTable'
import { IntlProvider } from "react-intl"
import messages from './i8n'

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      locale: "en",
      messages: []
    };
    this.handleMessages = this.handleMessages.bind(this);
    this.postMessage = this.postMessage.bind(this);
    this.backgroundPageConnection = chrome.runtime.connect({
      name: "popup"
    });
  }

  componentDidMount() {
    this.backgroundPageConnection.onMessage.addListener(this.handleMessages);
    this.postMessage({isRefreshMessages: true});
  }

  componentWillUnmount() {
    this.backgroundPageConnection.onMessage.removeListener(this.handleMessages);
  }

  handleMessages(message) {
    this.setState(state => ({
      messages: message.messages
    }));
  }

  postMessage(message){
    this.backgroundPageConnection.postMessage(message);
  }

  render() {
    if(this.state.messages.length > 0) {
      return (
        <IntlProvider locale={this.state.locale} defaultLocale="en" messages={messages[this.state.locale]}>
          <MessagesTable messages={this.state.messages}></MessagesTable>
        </IntlProvider>
      )
    }
    return (
      <IntlProvider locale={this.state.locale} defaultLocale="en" messages={messages[this.state.locale]}>
        <Empty></Empty>
      </IntlProvider>
    )
  }
}
export default App