import React from 'react';
import './ExtraInfo.css';

class ExtraInfo extends React.Component {
  render() {
    if (this.props.show === true) {
      // extended version
      // <button> keys prevent reuse which in Firefox leads to animations being continued between them
      return (
        <div className="extra-info-expanded">
        <button className="extra-info-expanded-button" onClick={this.props.onClick} key={0}>X</button>
        <h2>Credits</h2>
        This is built using <a href="https://reactjs.org">React</a>. The cute loading bar is from <a href="https://css-tricks.com/css3-progress-bars/">CSS Tricks</a>. The button you just clicked is adapted from <a href="https://fdossena.com/?p=html5cool/buttons/i.frag">Federico Dossena</a>.
        <h2>Why?</h2>
        I've never made anything this animated or interactive before, and it's a good exercise.
        </div>
      );
    } else {
      // floaty hint
      return (
        <div className="extra-info-hiding">
        <button className="extra-info-hiding-button" onClick={this.props.onClick} key={1}>More info</button>
        </div>
      );
    }
  }
}

export default ExtraInfo;
