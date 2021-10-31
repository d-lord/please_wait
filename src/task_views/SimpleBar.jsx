import React from "react";
import TaskView from "./TaskView.js";
import './SimpleBar.css';


class SimpleBar extends TaskView {
    render() {
        // duration from int ms to seconds + 's'; 0.9 to allow time for choppy CSS vs precise JS
        let animationDuration = (this.props.duration * 0.8) / 1000 + 's';
        let className = "meter animate";
        if (this.props.extras.flipped) {
            className += ' flipped';
        }
        if (this.props.extras.unfill) {
            className += ' unfill';
        }
        return (
            <div className="task">
                <h1>{this.props.text}</h1>
                <div className={className}>
                    <span style={{animationDuration: animationDuration}}/>
                </div>
            </div>
        );
    }
}

export default SimpleBar;