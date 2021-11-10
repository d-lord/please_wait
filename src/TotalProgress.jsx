import React from 'react';
import './TotalProgress.css';

class TotalProgress extends React.Component {
    constructor(props) {
        super(props);
        const sum_length = this.props.tasks.reduce((a, b) => a + b.duration, 0);
        const proportional_widths = this.props.tasks.map(
            (task) => task.duration / sum_length
        );
        this.state = {proportional_widths: proportional_widths, sum_length: sum_length};
    }

    render() {
        const boxes = this.props.tasks.map(
            (task, index) => {
                var className;
                if (index < this.props.currentTaskIndex) {
                    className = "total-progress-box total-progress-box-done";
                } else if (index === this.props.currentTaskIndex) {
                    className = "total-progress-box total-progress-box-current";
                } else {
                    className = "total-progress-box total-progress-box-not-started";
                }
                return <div className={className} style={{ flex: this.state.proportional_widths[index] }}/>;
            })
        ;
        return (<div className="total-progress">
            {boxes}
        </div>)
    }
}

export default TotalProgress;