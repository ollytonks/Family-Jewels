import React, { Component } from 'react';
import { Link } from 'react-router-dom';


class MainList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            heirlooms: [],
            searchKey: ''
        };
    }

    render () {
        let tempList = [];
        let resultList = [];
        let filter = this.state.searchKey;
        if (filter !== "") {
            filter.toLowerCase();
        }
        if (filter !== "") {
            let currentList = this.state.heirlooms;
            // Use .filter() to determine which items should be displayed
            // based on the search terms
            tempList = currentList.filter(item => {
                let lc = "" + item.title + item.description + item.guardian + item.nextguardian;
                lc = lc.toLowerCase();
                if (lc !== null) {
                    if (lc.includes(filter)) {
                        return 1;
                    }
                }
                return 0;
            });
            console.log(tempList.length);
        } else {
            // If the search bar is empty, set newList to original task list
            tempList = this.state.heirlooms;
        }
        resultList = tempList
        return(
            <table class="table table-stripe">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Guardian</th>
                        <th>Next guardian</th>
                    </tr>
                </thead>
                <tbody>
                    {resultList.map(board =>
                        <tr>
                            <td><Link to={`/show/${board.key}`}>{board.title}</Link></td>
                            <td>{board.description}</td>
                            <td>{board.guardian}</td>
                            <td>{board.nextguardian}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        );
    }
}

export default MainList;