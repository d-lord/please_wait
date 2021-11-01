import React from "react";
import TaskView from "./TaskView.js";
import './BinaryCounter.css';

class BinaryCounter extends TaskView {
    /*
    Counts to 15 in binary using 4 dots. Could trivially be extended to count to larger numbers,
    or you could teach it to determine the right number of dots, but in the context of the project is anyone going to wait around for 60 seconds? Maybe yes?
    Here's how it works:
        - it ticks internally and knows what number it's currently showing
         - it updates the props of each BinaryDot to tell it whether to be full or empty
    Room for improvement:
    - allow displaying an arbitrary number and determining the right number of BinaryDots
    - tweak the animation so that dots fill up or empty, instead of simply being full or empty
        - unsure how to make CSS do this
        - maybe you could even do something super fancy with the contents of eg 1, 2 and 4 flowing over to fill up the 8 dot
     */
    constructor(props) {
        super(props);
        this.state = {ticks: 0};
        this.max_ticks = 15;
    }

    componentDidMount() {
        super.componentDidMount();
        this.speed = this.props.speed !== undefined ? this.props.speed : this.props.duration / (this.max_ticks+2);
        this.timerID = setInterval(() => this.tick(), this.speed);
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    tick() {
        this.setState((state) => ({ticks: state.ticks + 1}));
    }


    render() {
        let underlying_number;
        let dots_class = "dots";
        let tick_text;
        if (this.props.extras.flipped) {
            underlying_number = Math.max(15 - this.state.ticks, 0);
            tick_text = underlying_number >= 0 ? underlying_number : "0";
        } else {
            underlying_number = Math.min(this.state.ticks, this.max_ticks);
            tick_text = underlying_number < this.max_ticks ? underlying_number : this.max_ticks;
        }

        return (
            <div className="task">
                <h1>{this.props.text}</h1>
                <div className={dots_class}>
                    <BinaryDot full={((underlying_number & 8) > 0)} static={this.state.ticks === 0}/>
                    <BinaryDot full={((underlying_number & 4) > 0)} static={this.state.ticks === 0}/>
                    <BinaryDot full={((underlying_number & 2) > 0)} static={this.state.ticks === 0}/>
                    <BinaryDot full={((underlying_number & 1) > 0)} static={this.state.ticks === 0}/>
                </div>
                <h2>{tick_text}</h2>
            </div>
        );
    }
}

class BinaryDot extends React.Component {
    render() {
        let innerClassName = "dot-inner";
        if (this.props.full) {
            innerClassName += " full";
        } else {
            innerClassName += " empty";
        }
        if (this.props.static) {
            /* then it should not animate *to* the intended state; just start in that state */
            innerClassName += " static";
        }
        return (
            <div className="dot-outer">
                <div className={innerClassName}/>
            </div>
        );
    }
}

export default BinaryCounter;