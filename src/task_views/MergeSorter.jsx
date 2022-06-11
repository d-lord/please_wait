import TaskView from "./TaskView";
import './MergeSorter.css';
import React from 'react';

/** TODOs:
 *
 * + features:
 * show the TaskView.message prop (a kind of fade-out intro text?)
 * allow variable array size (currently fixed at 16)
 */

class MergeSorter extends TaskView {
    /* Implements a merge-sort on 16 values (hard-coded to 16 at the moment).
    * Since log2(16) is 4, it'll require 4 stages.
    * There's also a fifth stage where nothing happens
    * but the audience is invited to marvel at its beauty. It should be satisfying.
    *
    * options for 'state':
    * {phases: [[totally shuffled], [slightly sorted], [quite sorted], [very sorted]]}
    * {phases: [[[half 1], [half 2]],
    *           [[q1], [q2], [q3], [q4]],
    *           [[eighth 1], [eighth 2], ..., [eighth 8]],
    *           [[1], [2], [3], ..., [16]]] (totally sorted)
    * {phase_1: [shuffled items], phase_2: [items given one phase of sort], phase_3: [phase_2 sorted again], phase_4: [phase_3 sorted again, now fully sorted]}

    * Ignores the 'message' parameter.
    *  */
    constructor(props) {
        super(props);
        let values = Array.from({length: 16}, (x, i) => i + 1);  // JS version of list(range(1,17))
        values = this.shuffle(values);

        this.state = {phases: [this.partition(values, 2), [], [], []]};
        this.state = {
            phases: [
                this.partition(values, 16),
                this.partition(Array.from({length: 16}, (x, i) => '?'), 8),
                this.partition(Array.from({length: 16}, (x, i) => '?'), 4),
                this.partition(Array.from({length: 16}, (x, i) => '?'), 2),
                this.partition(Array.from({length: 16}, (x, i) => '?'), 1),
            ],
            current_phase: 0 // index of last completed phase. at the start, the first phase is the input, so counts as completed.
        };
    }

    componentDidMount() {
        super.componentDidMount();
        this.timer = setInterval(() => this.tick(), this.phase_duration());
    }

    componentWillUnmount() {
        if (this.timer !== undefined) {
            // tick() should also clean this up, but we want to be sure
            clearInterval(this.timer);
        }
    }

    render() {
        let columns = [];
        for (let col in this.state.phases) {
            let clusters = this.state.phases[col];
            // console.log(`clusters for column ${col} are:`)
            // console.log(clusters);

            let cluster_cells;
            cluster_cells = clusters.map(
                (cluster, cluster_index) => <Cluster key={`${col}-${cluster_index}`} items={cluster}/>
            );

            columns.push(
                <div className="col" key={col}>
                    {cluster_cells}
                </div>
            )
        }
        return (<div className="merge-sorter">
            {columns}
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
        /* Update the whole display. This can take two forms:
        1. Do an entire phase of merge-sort, ie populate a new column.
        2. The final phase where we just sit idle and let the audience admire the result.

        There's also a final-final phase, after the idle phase where we delete ourselves and hand back control,
        but that's implemented by TaskView.
        */

        if (this.state.current_phase + 2 === this.state.phases.length) {
            // this is
            // +1 because we'll increment it below
            // another +1 for the usual 0-index vs length (i.e. [foo] has length 1 but its last element is at 0)
            clearInterval(this.timer);
            delete this.timer;
        }

        this.setState((state, props) => {
            // merge sort let's go
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

    phase_duration() {
        /* Answers: how long should each phase last?
        * NB: there are log2(size of array)+1 total phases to encompass the whole sort and then a static 'complete' phase. */
        return this.props.duration / (Math.log2(16) + 1);
    }
}

class Cluster extends React.Component {
    render() {
        /* quick hack to prevent duplicate '?' values causing a React key error.
        * TODO: do this better - maybe by giving the Cluster a special param for "number and shape of ?s, if no actual data" */
        let unknown_counter = 0;

        function count() {
            unknown_counter += 1;
            return unknown_counter - 1;
        }

        return (<div className="cluster">
            {this.props.items.map((item) =>
                <div className="merge-sorter-item" key={`${this.props.index}-${item === '?' ? count() : item}`}>
                    <p>{item}</p>
                </div>)}
        </div>);
    }
}

class Item extends React.Component {
    render() {
        return <div className="merge-sorter-item">{this.props.name}</div>
    }
}

export default MergeSorter;
