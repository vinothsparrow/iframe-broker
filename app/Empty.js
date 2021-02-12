import React, { Component } from 'react'
import { FormattedMessage } from "react-intl";

class Empty extends Component {
    render() {
      return (
        <div className="container" style={{minWidth: "500px"}}>
            <div className="row">
                <div className="col-md-12">
                    <div className="error-template">
                        <h1><FormattedMessage id="oops"></FormattedMessage></h1>
                        <h2><FormattedMessage id="no_messages_title"></FormattedMessage></h2>
                        <div className="error-details">
                        <FormattedMessage id="no_messages"></FormattedMessage>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        );
    }
}
export default Empty