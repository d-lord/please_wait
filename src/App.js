import React from 'react';
import './App.css';
import ExtraInfo from './ExtraInfo.js';

class AutonomousTask extends React.Component {
  componentDidMount() {
    // console.log("AutonomousTask '" + this.props.text + "' mounted");
    setTimeout(this.props.onCompletion, this.props.duration);
  }

  render() {
    // duration from int ms to seconds + 's'; 0.9 to allow time for choppy CSS vs precise JS
    let animationDuration = (this.props.duration * 0.8) / 1000 + 's';
    let className = "meter animate";
    if (this.props.extras) {
      className += ' ' + this.props.extras;
    }
    return (
        /*
        <div class="task">
          Reticulating splines...
          <div class="meter animate">
            <span style="animationDuration: 5s" />
          </div>
        </div>
        */
      <div className="task">
        {this.props.text}
        <div className={className}>
          <span style={{ animationDuration: animationDuration }} />
        </div>
      </div>
    );
  }
}

function StartButton(props) {
  var message;
  if (props.hasOwnProperty("firstTime") && props.firstTime === false) {
    message = "Click here to restart";
  } else {
    message = "Click here to start";
  }

  return (
        <button className="start-button"
        onClick={props.onClick}>
          {message}
        </button>
  );
}


class App extends React.Component {
  constructor(props) {
    super(props);
    this.jobs = [
      // [duration (ms), message, optional space-separated extra classes]
      [1000, 'Crafting pickaxes...'],
      [1000, 'Enchanting pickaxes...'],
      [2000, 'Herding cats...'],
      [1000, 'Naming alpacas...'],
      [1000, 'Finding katana...'],
      [1000, 'Running into zombies...'],
      [2000, 'Respawning...'],
      [1000, 'Turning off and on again...'],
      [1000, 'Fireproofing servers...'],
      [1000, 'Starting fires...'],
      [2000, 'Waiting for the cloud to stop raining...'],
      [2000, 'Deploying new cloud...'],
      [4000, 'Writing more loading messages...', 'flipped'],
      [1500, 'Giving you up...'],
      [500,  'Letting you down...'],
      [500,  'Running around...'],
      [500,  'Deserting you...'],
      [1000, 'Writing more loading messages...', 'flipped'],
      [2000, 'Reticulating splines...'],
      [2000, 'Untangling splines...'],
      [1000, 'Tidying up...']
    ];
    this.state = { nextJobIndex: -1, showExtraInfo: false };
    this.jobComplete = this.jobComplete.bind(this);
    this.toggleShowExtraInfo = this.toggleShowExtraInfo.bind(this);
  }

  render() {
    let mainBody;
    const nextJobIndex = this.state.nextJobIndex;
    if (nextJobIndex < 0) {
      mainBody = (
        <div id="top-container">
        <h1 className="title">Please Wait</h1>
        <h2 className="subtitle">the game</h2>
        <StartButton onClick={()=>this.setState({nextJobIndex: 0})} />
        </div>
      );
    }
    else if (0 <= nextJobIndex && nextJobIndex < this.jobs.length) {
      let nextTask = this.jobs[nextJobIndex];
      // we use a key for individual tasks because otherwise the progress bar div is reused, and as I don't know how to restart CSS animations, it stays in its previous state, i.e. "full up and not moving"
      mainBody = 
        (
          <div id="top-container">
            <AutonomousTask text={nextTask[1]}
            duration={nextTask[0]}
            onCompletion={this.jobComplete}
            extras={nextTask[2]}
            key={nextJobIndex}/>
          </div>
        );
    } else {
        mainBody = (
          <div id="top-container">
          <h1 className="title">All done!</h1>
          <StartButton firstTime={false} onClick={()=>this.setState({nextJobIndex: 0})} />
          </div>
        );
    }
    return (
      <div className="App">
      {mainBody}
      <ExtraInfo show={this.state.showExtraInfo} onClick={this.toggleShowExtraInfo} />
      </div>
    );
  }

  jobComplete() {
    // this would not be atomic:
    //   this.setState(nextJobIndex: this.state.nextJobIndex + 1)
    // but this is:
    this.setState((prevState, props) => ({
      nextJobIndex: prevState.nextJobIndex + 1}));
    // see: https://reactjs.org/docs/state-and-lifecycle.html#state-updates-may-be-asynchronous
  }

  toggleShowExtraInfo() {
    this.setState((prevState, props) => ({
      showExtraInfo: !prevState.showExtraInfo}));
  }
}

export default App;
