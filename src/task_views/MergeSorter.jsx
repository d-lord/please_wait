import TaskView from "./TaskView";
import './MergeSorter.css';
import React from 'react';

/**
 *
 * A fun (landscape) animated merge sort.
 * Divides the screen up into columns, and displays each phase of the sort in a column.
 * The data being sorted is both a number and a position in a gradient, so once it starts to be sorted, you can grok the order intuitively.
 * When loaded, shows the initial data on the left with a pop-in animation (I wish it were a shuffle, but ¯\_(ツ)_/¯)
 * then runs through the sort,
 * then enters an end phase where we sit idle and invite the audience to marvel at its beauty, since frankly the animation
 * doesn't make that very clear. The end phase also has a simple progress bar at the bottom to tell you how long you've got.
 *
 * Features it could use:
 * make the actual sorting visually smoother - the way it's implemented atm, React just pops the new values
 *      and colours in immediately, and the background has to catch up.
 * show the TaskView.message prop (a kind of fade-out intro text?)
 * allow variable array size (currently fixed at 16)
 */

const ITEM_SHOWN_WHEN_NOT_YET = '?'; // what to put in eg the third column onwards when we're still sorting the second column

class MergeSorter extends TaskView {
    /* Implements a merge-sort on 16 values (hard-coded to 16 at the moment).
    * Since log2(16) is 4, it'll require 4 stages.
    * There's also a final period where nothing happens
    * but the audience is invited to marvel at its beauty, since it ought to be satisfying.
    *
    * Extra props: {
    *                delay_at_end: <how long (in ms) to pause at the final screen>}
    *              }
    *
    * options for 'state':
    * {phases: [[totally shuffled], [slightly sorted], [quite sorted], [very sorted]]}
    * {phases: [[[half 1], [half 2]],
    *           [[q1], [q2], [q3], [q4]],
    *           [[eighth 1], [eighth 2], ..., [eighth 8]],
    *           [[1], [2], [3], ..., [16]]] (totally sorted)
    * {phase_1: [shuffled items], phase_2: [items given one phase of sort], phase_3: [phase_2 sorted again], phase_4: [phase_3 sorted again, now fully sorted]}

    * This view ignores the 'message' parameter.
    */
    phase_timer = undefined;
    end_timer = undefined;

    constructor(props) {
        super(props);
        let values = Array.from({length: 16}, (x, i) => i + 1);  // JS version of list(range(1,17))
        values = this.shuffle(values);

        this.state = {phases: [this.partition(values, 2), [], [], []]};
        this.state = {
            phases: [
                this.partition(values, 16),
                this.partition(Array.from({length: 16}, (x, i) => ITEM_SHOWN_WHEN_NOT_YET), 8),
                this.partition(Array.from({length: 16}, (x, i) => ITEM_SHOWN_WHEN_NOT_YET), 4),
                this.partition(Array.from({length: 16}, (x, i) => ITEM_SHOWN_WHEN_NOT_YET), 2),
                this.partition(Array.from({length: 16}, (x, i) => ITEM_SHOWN_WHEN_NOT_YET), 1),
            ],
            current_phase: 0 // index of last completed phase. at the start, the first phase is the input, so counts as completed.
        };
    }

    componentDidMount() {
        super.componentDidMount();
        this.phase_timer = setInterval(() => this.tick(), this.phase_duration());
    }

    componentWillUnmount() {
        // destroy timers, in case they haven't already been removed
        if (this.phase_timer !== undefined) {
            // tick() should also clean this up, but we want to be sure
            clearInterval(this.phase_timer);
        }
        if (this.state.end_timer !== undefined) {
            clearInterval(this.end_timer);
        }
    }

    render() {
        let columns = [];
        this.state.phases.forEach((clusters, column_index) => {
            let cluster_cells;
            cluster_cells = clusters.map(
                (cluster, cluster_index) => <Cluster key={`cluster-${column_index}-${cluster_index}`} items={cluster} should_pop_in={column_index === 0}/>
            );

            let column_classes = 'col';
            // apply the 'wash' animation class. once a column is already washed, we leave the class on it so it stays in the post-animation state and doesn't reset to its initial colour.
            if (this.state.current_phase >= column_index && column_index !== 0) {
                column_classes += ' wash';
            }
            //
            let css_style_duration = {'--duration': `${this.phase_duration()}ms`};
            columns.push(
                <div className={column_classes} key={`col-${column_index}`} style={css_style_duration}>
                    {cluster_cells}
                </div>
            )
            }
        )
        return (<div className="merge-sorter">
            {columns}
            <EndPhaseBar showtime={this.state.end_timer !== undefined} duration={this.delay_at_end()} delay={this.phase_duration()} />
        </div>)
    }

    shuffle(array) {
        /* Copied wholesale from https://bost.ocks.org/mike/shuffle/, which is also a very very neat demo. */
        var m = array.length, t, i;
        // While there remain elements to shuffle…
        while (m) {
            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);
            // And swap it with the current element.
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    }

    partition(array, num_partitions) {
        /* Divides the array into N partitions. Only intended for cases where it divides exactly (ie don't divide 5 into 3).
         * [1, 2, 3, 4], N=2: [[1, 2], [3, 4]]
         * [1, 2, 3, 4], N=4: [[1], [2], [3], [4]]
         * [1, 2, 3, 4, 5, 6, 7, 8], N=4: [[1, 2], [3, 4], [5, 6], [7, 8]]
         */

        const partition_size = array.length / num_partitions;
        let result = [];
        let current_partition = [];
        for (let item of array) {
            current_partition.push(item);
            if (current_partition.length === partition_size) {
                result.push(current_partition);
                current_partition = [];
            }
        }
        return result;
    }

    tick() {
        /* Update the whole display during the main routine.
         There's also an end phase which this will hand over to, where we just sit idle and let the audience admire the result..

        So:
        1. The initial tick pops in the left column.
        2. The rest of the ticks do an entire phase of merge-sort, ie populate a new column.
        3. Last tick starts the end phase timer.

        There's also a final-final phase, after the idle phase where we delete ourself and hand back control,
        but that's implemented by TaskView.
        */

        // the final loop
        if (this.state.current_phase + 2 === this.state.phases.length) {
            // the +2 is:
            // +1 because we'll increment it below
            // another +1 for the usual 0-index vs length (i.e. [foo] has length 1 but its last element is at 0)
            clearInterval(this.phase_timer);
            delete this.phase_timer;
            this.schedule_end_phase();
            // don't return as we still need to advance the final phase
        }

        // merge sort let's go
        this.setState((state, props) => {
            let index = state.current_phase;
            const current_phase = state.phases[index];
            let next_phase = [];
            for (let i = 0; i < current_phase.length; i += 2) {
                let first = Array.from(current_phase[i]);
                let merged = [];
                if (i + 1 === current_phase.length) {  // if there's an odd number of clusters, then the last one won't have anything to pair with, so just return it
                    next_phase.push(first);
                    continue
                }
                let second = Array.from(current_phase[i + 1]);
                // otherwise, selectively take from them to build up 'merged'
                while (first.length > 0 || second.length > 0) {
                    let f = first[0];
                    let s = second[0];
                    if (s === undefined || f <= s) {
                        merged.push(f);
                        first.shift();
                    }
                    if (f === undefined || s < f) {
                        merged.push(s);
                        second.shift();
                    }
                }
                next_phase.push(merged);
            }

            const new_index = index + 1;
            state.phases[new_index] = next_phase;
            return {
                phases: state.phases,
                current_phase: new_index
            }
        });
    }

    delay_at_end() {
        // Answers the question: how long do we sit at the end to admire the result? (in ms)
        // basically, I couldn't find a better way to set a default for a prop inside 'extras'.
        return this.props.extras.delay_at_end ?? 2000;
    }

    phase_duration() {
        /* Answers the question: how long should each phase last? (in ms)
        * Total phases are log2(size of array)+1:
        * log2 because that's the algorithm, and +1 to include showing the initial unsorted phase. */
        return (this.props.duration - this.delay_at_end()) / (Math.log2(16) + 1);
    }

    schedule_end_phase() {
        /* Sorta does nothing at the moment - just sets a timer. The super TaskView will close up shop anyway.
         * The timer is used to check whether to schedule the end bar, but there are shorter ways to do that.
         * Leaving it 'cause it feels like a useful extra lifecycle method for future use. */
        let end_timer = setInterval(() => {
            clearInterval(this.end_timer);
            delete this.end_timer;
        }, this.delay_at_end());
        this.setState((state, props) => ({...state, end_timer}));
    }
}

class Cluster extends React.Component {
    /* A cluster of items. See diagram in the corresponding CSS.
    *
    * Props:
    * 'items': An iterable of values to display in this cluster.
    * 'should_pop_in': (bool) Should the items use the pop-in animation? Defaults to false
    *  */
    static defaultProps = {
        should_pop_in: false
    };

    render() {
        /* The unknown stuff is a quick hack to prevent duplicate ITEM_SHOWN_WHEN_NOT_YET values causing a React key error.
        * It's more like a "not yet" than a true "unknown", since it's used for columns which the current phase hasn't reached yet.
        */
        let unknown_counter = 0;
        function count() {
            unknown_counter += 1;
            return `none-${unknown_counter - 1}`;
        }

        return (<div className="cluster">
            {this.props.items.map((item) =>
                <Item key={`item-${item === ITEM_SHOWN_WHEN_NOT_YET ? count() : item}`} value={item} should_pop_in={this.props.should_pop_in}/>
            )}
        </div>);
    }
}

class Item extends React.Component {
    /* A box containing an item, ie one element of the list being sorted.

    * Props:
    * 'key': normal React
    * 'value': The value that goes in the box.
    * 'should_pop_in': Whether to use the pop-in animation.
    */
    static defaultProps = {
        should_pop_in: false
    }

    compute_background_for(n, total) {
            /* Implements an arbitrary gradient based on the background below.
             * Picks the right background colour for the Nth item cell out of 'total'.
             *
             * Done in JS and not CSS because you can't use the 'n' in CSS' nth-child (without setting up SASS or something).
             * NB: This doesn't account for the border and margin between items. Should it?
             */
            if (n === ITEM_SHOWN_WHEN_NOT_YET) {
                return {} // inherits the background colour
            }
            return {
                // deep ocean:
                // 'background': 'linear-gradient(0deg, rgb(30, 51, 77), rgb(77, 121, 161), rgb(102, 153, 204))',
                // pink/orange sunset:
                'background': 'linear-gradient(to bottom, #fabdff, #ffb7e5, #ffb9bf, #ffc797, #ffdf78, #f9f871)',
                'backgroundSize': `100% ${total*100}%`,
                'backgroundPosition': `left ${(n/total).toPrecision(3)*100}%`
            }
        }

    render() {
        let style = {...this.compute_background_for(this.props.value, 16)};
        let className = 'merge-sorter-item';
        if (this.props.should_pop_in) {
            className = className + ' pop-in';
        }
        return <div className={className} style={style}>{this.props.value}</div>
    }
}

class EndPhaseBar extends React.Component {
    /* Props:
     * showtime: Whether to start the animation
     * duration: How long the animation should last (in ms)
     * delay: How long to wait before starting (in ms)
     */
    render() {
        let className = "merge-sorter";
        let style;
        if (this.props.showtime) {
            className += " showtime";
        }
        // if (this.props.duration !== undefined) {
        style = {"--duration": `${this.props.duration}ms`, "--delay": `${this.props.delay}ms`};
        // }
        return <div className={className} id="end-phase-bar" style={style}/>
    }
}

export default MergeSorter;
