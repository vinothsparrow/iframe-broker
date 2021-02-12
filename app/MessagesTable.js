import React, { Component } from "react";
import { FormattedMessage } from "react-intl";
import {Table} from "react-bootstrap"

class MessagesTable extends Component {
  render() {
    const items = []

    for (const [index, value] of this.props.messages.entries()) {
        items.push(<tr key={index}>
            <td>{value.origin}</td>
            <td>{value.to}</td>
            <td>{value.data}</td>
        </tr>)
    }
    
    return (
        <Table striped bordered style={{ width: "100%", maxWidth: "600px" }} size="sm">
            <thead>
              <tr>
                <th><FormattedMessage id="from"></FormattedMessage></th>
                <th><FormattedMessage id="to"></FormattedMessage></th>
                <th><FormattedMessage id="message"></FormattedMessage></th>
              </tr>
            </thead>
            <tbody>
                {items}
            </tbody>
        </Table>
    );
  }
}
export default MessagesTable;
