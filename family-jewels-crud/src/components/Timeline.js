/**
 * Copyright (c) 2019
 *
 * Displays a timeline of heirlooms with date information
 *
 * @summary Displays a timeline of heirlooms
 * @author FamilyJewels
 *
 * Created at     : 2019-10-02
 * Last modified  : 2019-10-15
 */

 import React, { Component } from 'react';
import './Timeline.css';
import './../App.css';
import {firebase, firebaseAuth} from './../Firebase';
import homeIcon from './elements/familyjewelsgem.svg'
import { Redirect } from 'react-router-dom';



class Timeline extends Component {
    constructor(props) {
        super(props);
        this.ref = firebase.firestore().collection('boards');
        this.isArchiveBackground=false;
        this.unsubscribe = null;
        this.state = false;
        this.state = {
            heirlooms: [],
            switch: false,
            target: 'archived_boards',
            searchKey: '',
            searchResult: [],
            heading: 'HEIRLOOMS',
            searching: false,
            markers: null,
            showingInfoWindow: false,  //Hides or the shows the infoWindow
            activeMarker: {},          //Shows the active marker upon click
            selectedPlace: {},          //Shows the infoWindow to the selected place upon a marker
            user: firebase.auth().currentUser,
            isAuth: false
        };
        this.handleChange = this.handleChange.bind(this);
    }

    /* On querySnapshot event, gets Firebase colelction */
    onCollectionUpdate = (querySnapshot) => {
        const list = [];
        querySnapshot.forEach((doc) => {

            const { title, description, guardian, nextguardian, imagesLocations, date} = doc.data();
            firebase.storage().ref('images').child(imagesLocations[0]).getDownloadURL().then(url => {
                if (date) {
                    list.push({
                        key: doc.id,
                        icon: url,
                        doc, // DocumentSnapshot
                        title,
                        description,
                        guardian,
                        nextguardian,
                        imagesLocations,
                        date
                    });
                    this.forceUpdate();
                }
            })
        });
        if (this.state.searchKey !== '') {
            this.setState({
                heirlooms: list
            });
        }
        else {
            this.setState({
                heirlooms: list,
                searchResult : list
            });
        }
    }

    /**
     * On componenet mount, load locations from props and authentication info
     */
    componentDidMount() {
        this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
        var locstate = this.props.location.payload;
        if (typeof locstate !== 'undefined') {
            if (locstate.searching === true) {
                this.setState({
                    searching: true
                })
            }
        }
        firebaseAuth.onAuthStateChanged(user => {
            this.setState({ user: firebase.auth().currentUser });
            this.setState({ isAuth: true });
        });
    }

    /* Sets the current reference to Firebase collection to the target */
    setCollection() {
        this.ref = firebase.firestore().collection(this.state.target);
        this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
    }

    /**
     * On change in searchbar, filter heirlooms
     */
    handleChange(e){
        {
            console.log(e.target.value);
            let filter = e.target.value;
            if (filter !== "") {
                filter.toLowerCase();
            }
            this.setState({searchKey: filter});
        }
    }

    render() {
        /*prevent elements rendering until authentication variables have
          finished initialising*/
        if(this.state.isAuth === false){
            return(<div></div>)
        }
        //user is not logged in
        if(this.state.user === null && this.state.isAuth){
            console.log(" not authenticated");
            console.log(firebase.auth().currentUser);
            return <Redirect to= '/login'/>
        }

        document.title = "Timeline";

        // Filter items on searchbar input
        let tempList = [];
        let filter = this.state.searchKey;
        if (filter !== "") {
            filter.toLowerCase();
            let currentList = this.state.heirlooms;
            // Use .filter() to determine which items should be displayed
            // based on the search terms
            tempList = currentList.filter(item => {
                let lc = "" + item.title + ":" + item.description + ":" + item.guardian + ":" + item.nextguardian + ":" + item.date;
                lc = lc.toLowerCase();
                if (lc !== null) {
                    if (lc.includes(filter)) {
                        return 1;
                    }
                }
                return 0;
            });
            console.log(tempList);
        } else {
            // If the search bar is empty, set newList to original task list
            tempList = this.state.heirlooms;
        }
        var resultList = tempList
            .sort((a, b) => a.date.localeCompare(b.date));

        this.isArchiveBackground = this.state.switch;

        return (
        <div className={this.isArchiveBackground ? "mainbodyArchive" : "mainbodyClassic"}>
            <nav className="navbar navbar-default navbar-expand-lg d-none d-lg-block">
            <div className="collapse navbar-collapse">
                <ul className="nav navbar-nav">
                    <li className="navbar-brand nav-item nav-link" ><a href="/"> <img alt="Home icon" width="25" height="25" src={homeIcon}/> Family Jewels</a></li>
                    <li className="nav-item nav-link"><a href="/create"><i className="fa fa-plus-square"/> Heirloom</a></li>
                    <li className="nav-item nav-link"><a href="/map"><i className="fa fa-globe"/> Our map</a></li>
                    <li className="nav-item nav-link"><a href="/timeline"><i className="fa fa-calendar"/> Our history</a></li>
                </ul>
                <ul className="nav navbar-nav ml-auto">
                    <li className={this.state.searching ? '' : 'collapse'}>
                        <input
                            type="text"
                            className="input"
                            onChange={this.handleChange}
                            placeholder="Search..."
                            className="form-row"
                            ref={(input) => { this.nameInput = input; }}
                        />
                    </li>
                    <li className={this.state.searching ? 'collapse' : ''} className="navbar-brand nav-item nav-link">
                        <div onClick={() => {
                                this.setState({searching: true});
                        }}><i className="fa fa-search"/></div>
                    </li>
                    <li className="bigdivider"></li>
                    <li className="nav-item nav-link"><a href="/login"><i className="fa fa-user"/> Account</a></li>
                </ul>
            </div>

        </nav>
        <nav className="navbar navbar-default navbar-expand d-lg-none">
                <ul className="nav navbar-nav">
                    <li className="navbar-brand nav-item nav-link"><a href="/"><img alt="Home icon" width="16" height="16" src={homeIcon}/></a></li>
                    <li className="nav-item nav-link"><a href="/create"><i className="fa fa-plus-square"/></a></li>
                    <li className="nav-item nav-link"><a href="/map"><i className="fa fa-globe"/></a></li>
                    <li className="nav-item nav-link"><a href="/timeline"><i className="fa fa-calendar"/></a></li>
                </ul>
                <ul className="nav navbar-nav ml-auto">
                    <li className="nav-item nav-link"><a href="/login"><i className="fa fa-user"/></a></li>
                </ul>
                <input
                    type="text"
                    className="input"
                    onChange={this.handleChange}
                    placeholder="Search..."
                />
        </nav>
            <div className="container">
                <div className="panel">
                <div className="panel-body">

                    <div>
                    <div className="row">
                        <div className="col"></div>
                        <div className="col">
                            <h2 className="centre-title">
                            {'FAMILY TIMELINE'}
                            </h2>
                        </div>
                        <div className="col">
                        </div>
                    </div>
                </div>
                <div className="container mt-5 mb-5">
                <div className="row">
                    <div className="col-md-12">
                        <ul className="timeline">
                        {resultList.map(heirloom =>
                                <li key={heirloom.key}> <a href={`/show/boards/`+ heirloom.key}>
                                    <div className="header"><div target="_blank">{heirloom.date}: {heirloom.title}</div></div>
                                    <div className="timeline-row">
                                        <div className="left-image">
                                            <div className="imgbox">
                                                <img alt="Tile" className="tileimg" src={heirloom.icon}></img>
                                            </div>
                                        </div>
                                        <div className="right-text">
                                            <p>{heirloom.description}</p>
                                        </div>
                                    </div>

                                </a></li>
                        )}
                        </ul>
                    </div>
                </div>
            </div>
                </div>
            </div>
            </div>
        </div>
        );
    }
}

export default Timeline;
