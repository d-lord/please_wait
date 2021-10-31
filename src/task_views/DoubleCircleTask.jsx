import React from "react";
import TaskView from "./TaskView.js";
import './DoubleCircleTask.css';

/* Ideas:
- simply fill up once
- an indefinite load (eg 3 alternating fill-ups but it doesn't tell you how many in advance)
- have 4 circles counting to 16 in binary (requiring both fill up and empty)
* */

class DoubleCircleTask extends TaskView {
    render() {
        // duration from int ms to seconds + 's'; 0.9 to allow time for choppy CSS vs precise JS
        let animationDuration = (this.props.duration * 0.8) / 1000 + 's';
        let className = (this.props.show_border === true) ? "circle-outer circle-outer-border" :"circle-outer";
        return (
            <div className="task">
                <div className={className}>
                    <div className="circle-inner" />
                </div>
            </div>
        );
    }
}

export default DoubleCircleTask;