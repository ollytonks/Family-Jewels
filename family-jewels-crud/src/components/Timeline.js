import React, { Component } from 'react';
import './Timeline.css';
import './../App.css';
import {firebase} from './../Firebase';
import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';
import homeIcon from './elements/familyjewelsgem.svg'



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
            selectedPlace: {}          //Shows the infoWindow to the selected place upon a marker
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

    componentDidMount() {
        this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
        var locstate = this.props.location.payload;
        if (locstate !== undefined) {
            if (locstate.searching == true) {
                this.setState({
                    searching: true
                })
            }
        }
    }

    /* Sets the current reference to Firebase collection to the target */
    setCollection() {
        this.ref = firebase.firestore().collection(this.state.target);
        this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
    }

    componentDidUpdate() {
        this.state.heading = this.state.switch ? "ARCHIVE" : "HEIRLOOMS";
        if (this.state.searching) {
            this.nameInput.focus();
        }
    }

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

    onMarkerClick = (props, marker, e) =>
        this.setState({
            selectedPlace: props,
            activeMarker: marker,
            showingInfoWindow: true
    });

    onClose = () => {
        if (this.state.showingInfoWindow) {
        this.setState({
            showingInfoWindow: false,
            activeMarker: null
        });
    }}

    render() {
        document.title = "Family map";

        let map;
        let markers = [];
        let infowds = [];

        let tempList = [];
        let filter = this.state.searchKey;
        if (filter !== "") {
            filter.toLowerCase();
            let currentList = this.state.heirlooms;
            // Use .filter() to determine which items should be displayed
            // based on the search terms
            tempList = currentList.filter(item => {
                let lc = "" + item.title + ":" + item.description + ":" + item.guardian + ":" + item.nextguardian;
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
        <div class={this.isArchiveBackground ? "mainbodyArchive" : "mainbodyClassic"}>
            <nav class="navbar navbar-default navbar-expand-lg d-none d-lg-block">
            <div class="collapse navbar-collapse">
                <ul class="nav navbar-nav">
                    <li class="navbar-brand nav-item nav-link" ><a href="/"> <img width="25" height="25" src={homeIcon}/> Family Jewels</a></li>
                    <li class="nav-item nav-link"><a href="/create"><i className="fa fa-plus-square"/> Heirloom</a></li>
                    <li class="nav-item nav-link"><a href="/map"><i className="fa fa-globe"/> Our map</a></li>
                    <li class="nav-item nav-link"><a href="/timeline"><i className="fa fa-calendar"/> Our history</a></li>
                </ul>
                <ul class="nav navbar-nav ml-auto">
                    <li class={this.state.searching ? '' : 'collapse'}>
                        <input
                            type="text"
                            className="input"
                            onChange={this.handleChange}
                            placeholder="Search..."
                            class="form-row"
                            ref={(input) => { this.nameInput = input; }}
                        />
                    </li>
                    <li className={this.state.searching ? 'collapse' : ''} class="navbar-brand nav-item nav-link">
                        <div onClick={() => {
                                this.setState({searching: true});
                        }}><i className="fa fa-search"/></div>
                    </li>
                    <li class="bigdivider"></li>
                    <li class="nav-item nav-link"><a href="/login"><i className="fa fa-user"/> Login</a></li>
                </ul>
            </div>

        </nav>
        <nav class="navbar navbar-default navbar-expand d-lg-none">
                <ul class="nav navbar-nav">
                    <li class="navbar-brand nav-item nav-link"><a href="/"><img width="16" height="16" src={homeIcon}/> FJ</a></li>
                    <li class="nav-item nav-link"><a href="/create"><i className="fa fa-plus-square"/></a></li>
                    <li class="nav-item nav-link"><a href="/map"><i className="fa fa-globe"/></a></li>
                    <li class="nav-item nav-link"><a href="/timeline"><i className="fa fa-calendar"/></a></li>
                </ul>
                <ul class="nav navbar-nav ml-auto">
                    <li class="nav-item nav-link"><a href="/login"><i className="fa fa-user"/></a></li>
                </ul>
                <input
                    type="text"
                    className="input"
                    onChange={this.handleChange}
                    placeholder="Search..."
                />
        </nav>
            <div class="container">
                <div class="panel">
                <div class="panel-body">

                    <div>
                    <div class="row">
                        <div class="col"></div>
                        <div class="col">
                            <h2 class="centre-title">
                            {'TIMELINE'}
                            </h2>
                        </div>
                        <div class="col">
                        </div>
                    </div>
                </div>
                <div class="container mt-5 mb-5">
                <div class="row">
                    <div class="col-md-6">
                        <ul class="timeline">
                        {resultList.map(heirloom =>
                                <li> <a href={`/show/boards/`+ heirloom.key}>
                                    <div class="header"><a target="_blank">{heirloom.title}</a></div>
                                    <div class="timeline-row">
                                        <div class="left-image">
                                            <div class="imgbox">
                                                <img class="tileimg" src={heirloom.icon}></img>
                                            </div>
                                        </div>
                                        <div class="right-text">
                                            <a class="float-right">{heirloom.date}</a>
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
