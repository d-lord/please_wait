import React from 'react';
import TaskView from "./TaskView.js";
import './PsychedelicBoxer.css';


class PsychedelicBoxer extends TaskView {
    render() {
        return (
            <div className={"boxer" + (this.props.extras.green === true ? " green" : "")}>
                <div className="wiggler"><h1>{this.props.text}</h1></div>
                {/*<div className="tracker"><div className="tracker-meter" /></div>*/}
            </div>
        );
    }
}

export default PsychedelicBoxer;