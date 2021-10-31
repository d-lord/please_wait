import React from "react";

class TaskView extends React.Component {
    componentDidMount() {
        // console.log("TaskView '" + this.props.text + "' mounted");
        setTimeout(this.props.onCompletion, this.props.duration);
    }
}

export default TaskView;