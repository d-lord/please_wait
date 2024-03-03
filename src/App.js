import React from 'react';
import './App.css';
import ExtraInfo from './ExtraInfo.js';
import SimpleBar from './task_views/SimpleBar.jsx';
import DoubleCircleTask from './task_views/DoubleCircleTask.jsx';
import BinaryCounter from './task_views/BinaryCounter.jsx';
import PsychedelicBoxer from './task_views/PsychedelicBoxer.jsx';
import MergeSorter from "./task_views/MergeSorter.jsx";


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

/*
  Task: (duration, message, optional display component, optional extra classes)
  App: this.tasks = [ [task 1 info], [task 2 info], ... ]
  TaskView: a component which is some kind of progress indicator (progress bar, binary counter, etc)
 */

class Task {
  // A single task to be shown on screen.
  // this would benefit from TypeScript, but it was too much of a hassle to set up
  constructor(duration, message, displayComponent, extras) {
    this.duration = duration;
    this.message = message;
    this.displayComponent = displayComponent;
    this.extras = extras != null ? extras : {};
  }

  duration;  // milliseconds
  message; // text to show
  displayComponent; // optional: a specific TaskView to use
  extras; // optional: a dictionary of parameters (specific to the TaskView)
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.tasks = [
      new Task(3000, 'Starting up...', SimpleBar),
      new Task(2000, 'Reticulating splines...'),
      new Task(2000, 'Untangling splines...'),

      new Task(4000, 'Loading new tricks...'),
      new Task(8000, 'Counting to 15 in binary...', BinaryCounter),
      new Task(8000, 'Counting back down...', BinaryCounter, {flipped: true}),
      new Task(4000, 'Loading previous loading bar...', null, {flipped: true}),

      new Task(1500, 'Implementing merge sort...', SimpleBar),
      new Task(25000, 'Implementing merge sort...', MergeSorter, {delay_at_end: 9000}),

      // new Task(2000, 'Fireproofing servers...'),
      // new Task(1000, 'Starting fires...'),
      // new Task(2000, 'Waiting for the cloud to stop raining...'),
      // new Task(2000, 'Deploying new cloud...'),
      // new Task(4000, 'Writing more loading messages...', null, {flipped: true}),

      new Task(2000, 'Dropping acid...', SimpleBar),
      new Task(4200, 'floating...', PsychedelicBoxer),
      new Task(4200, 'coming down...', PsychedelicBoxer, {green: true}),

      // new Task(3500, 'processing...', SimpleBar),
      new Task(2000, 'Turning off and on again...', SimpleBar, {unfill: true}),
      new Task(2000, 'Turning off and on again...', SimpleBar),

      // new Task(1500, 'Giving you up...'),
      // new Task(500, 'Letting you down...'),
      // new Task(500, 'Running around...'),
      // new Task(500, 'Deserting you...'),

      new Task(1500, 'Tidying up...'),
      // new Task(3000, 'Waving goodbye 👋'),
    ];
    // NB: set nextTaskIndex to -1 for normal mode, or 0 to skip the start screen
    this.state = { nextTaskIndex: -1, showExtraInfo: false };
    this.jobComplete = this.jobComplete.bind(this);
    this.toggleShowExtraInfo = this.toggleShowExtraInfo.bind(this);
  }

  render() {
    let mainBody;
    const nextTaskIndex = this.state.nextTaskIndex;
    if (nextTaskIndex < 0) {
      mainBody = (
        <div id="top-container">
        <h1 className="title">Please Wait</h1>
        <h2 className="subtitle">the game</h2>
        <StartButton onClick={() => this.setState({nextTaskIndex: 0})} />
        </div>
      );
    }
    else if (0 <= nextTaskIndex && nextTaskIndex < this.tasks.length) {
      let nextTask = this.tasks[nextTaskIndex];
      let taskTag = this.taskToView(nextTask, nextTaskIndex);

      // we use a key for individual tasks because otherwise the progress bar div is reused, and as I don't know how to restart CSS animations, it stays in its previous state, i.e. "full up and not moving"
      mainBody =
        (
          <div id="top-container">
            {taskTag}
          </div>
        );
    } else {
        mainBody = (
          <div id="top-container">
          <h1 className="title">All done!</h1>
          <StartButton firstTime={false} onClick={()=>this.setState({nextTaskIndex: 0})} />
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
    //   this.setState(nextTaskIndex: this.state.nextTaskIndex + 1)
    // but this is:
    this.setState((prevState, props) => ({
      nextTaskIndex: prevState.nextTaskIndex + 1}));
    // see: https://reactjs.org/docs/state-and-lifecycle.html#state-updates-may-be-asynchronous
  }

  toggleShowExtraInfo() {
    this.setState((prevState, props) => ({
      showExtraInfo: !prevState.showExtraInfo}));
  }

  taskToView(task, taskIndex) {
    /*
    This is a simple dispatcher to turn a Task into a TaskView.
    It only exists because I can't figure out how to return eg <{SomeTaskViewType}/> in JSX in the app render function.
    Defaults to SimpleBar.
     */
    if (task.displayComponent === BinaryCounter) {
      return <BinaryCounter text={task.message}
                            duration={task.duration}
                            onCompletion={this.jobComplete}
                            key={`task-${taskIndex}`}
                            show_border={true}
                            extras={task.extras}/>
    } else if (task.displayComponent === SimpleBar || task.displayComponent == null) {
      return <SimpleBar text={task.message}
                        duration={task.duration}
                        onCompletion={this.jobComplete}
                        key={`task-${taskIndex}`}
                        extras={task.extras}/>
    } else if (task.displayComponent === PsychedelicBoxer) {
      return <PsychedelicBoxer text={task.message}
                        duration={task.duration}
                        onCompletion={this.jobComplete}
                        key={`task-${taskIndex}`}
                        extras={task.extras}/>
    } else if (task.displayComponent === MergeSorter) {
      return <MergeSorter duration={task.duration}
                          onCompletion={this.jobComplete}
                          key={`task-${taskIndex}`}
                          extras={task.extras}/>
    }
    throw new Error("Unknown DisplayComponent type");
  }
}

export default App;
