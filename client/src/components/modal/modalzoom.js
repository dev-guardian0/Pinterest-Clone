// displays pin zoom modal
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './modal.scss';

class PinZoom extends Component {

  constructor(props) {
    super(props);
    // initialize modal show state to false
    this.state = {
      show: false,
      styles: { width: '80%', visibility: 'hidden' },
    };
  }

  componentDidUpdate(prevProps) {
    const { message } = this.props;
    if ((prevProps.message === false) && (message === true)) {
      this.setState({
        show: true,
      });
    }
    if ((prevProps.message === true) && (message === false)) {
      this.setState({
        show: false,
      });
    }
  }

  close = () => {
    // note my modified modal now sends a reset callback after closing modalstate which clears
    // the message field
    const { reset } = this.props;
    this.setState({
      show: false,
      styles: { width: '80%', visibility: 'hidden' },
    }, () => reset());
  }

  handleImage = (i) => {
    const { width, height } = i.target;
    const { innerWidth, innerHeight } = window;
    const ans = (width / height) / (innerWidth / innerHeight);
    let styles;
    if (ans < 1.3) {
      styles = {
        width: `${Math.floor(ans * 70)}%`,
        visibility: 'visible',
      };
    } else {
      styles = {
        width: '100%',
        visibility: 'visible',
      };
    }

    this.setState({ styles });
  }

  open() {
    this.setState({
      show: true,
    });
  }


  render() {
    // use total pins to display how many have saved image
    // components brings in as prop zoominfo etire object containing pin information
    const { zoomInfo } = this.props;
    const { show, styles } = this.state;
    if (!zoomInfo.length) return null;
    const pinInformation = zoomInfo[0];
    const buttonInformation = zoomInfo[1];

    const totalPins = (pinInformation.savedBy) ? pinInformation.savedBy.length : 0;
    return (
      <div
        className={show ? 'zoom show' : 'zoom hide'}
      >
        <div className="header">
          <span id="zoomtitle">
            <div id="zoomdesc">{pinInformation.imgDescription}</div>
            <div id="zoomowner">{`Linked By: ${pinInformation.owner}`}</div>
          </span>
          <button type="submit" onClick={this.close}>Close</button>
        </div>
        <div className="content">
          <div id="zoomarea">
            <img alt="" className="pinzoom" src={pinInformation.imgLink} onLoad={this.handleImage} />
          </div>
        </div>
        <div className="footer">
          <span id="zoomtack">
            <i className="fa fa-thumb-tack" aria-hidden="true" />
            {`  ${totalPins}`}
          </span>
          {buttonInformation}
        </div>
      </div>
    );
  }

}

export default PinZoom;


PinZoom.propTypes = {
  message: PropTypes.bool.isRequired,
  zoomInfo: PropTypes.arrayOf(PropTypes.any).isRequired,
  reset: PropTypes.func.isRequired,
};
