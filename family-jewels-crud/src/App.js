import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import './App.css';
import {firebase, firebaseAuth} from './Firebase';
import Switch from './components/elements/Switch';
import homeIcon from './components/elements/familyjewelsgem.svg'


/**
 * @fileoverview App provides the React Component for the main page, as well as
 * providing the majority of initialisation functions.
 * @extends React.Component
 */
class App extends Component {
    constructor(props) {
        super(props);
        this.ref = firebase.firestore().collection('boards');
        this.isArchiveBackground=false;
        this.unsubscribe = null;
        //this.authenticated = true;
        this.state = false;
        this.state = {
            heirlooms: [],
            switch: false,
            target: 'archived_boards',
            searchKey: '',
            searchResult: [],
            heading: 'HEIRLOOMS',
            searching: false,
            user: firebase.auth().currentUser,
            isAuth: false
        };
        this.handleChange = this.handleChange.bind(this);
    }

    /**
     * On querySnapshot event, fetches Firebase and commits to local memory.
     */
    onCollectionUpdate = (querySnapshot) => {
        const list = [];
        querySnapshot.forEach((doc) => {
            const { title, description, guardian, nextguardian, 
                imagesLocations, date} = doc.data();
            firebase.storage().ref('images').child(imagesLocations[0])
                .getDownloadURL().then(url => {
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
            })
        });
        this.setState({
            heirlooms: list
        });
    }

    /**
     * Loaded
     * @override
     */
    componentDidMount() {
        this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
        firebaseAuth.onAuthStateChanged(user => {
            this.setState({ user: firebase.auth().currentUser });
            this.setState({ isAuth: true });
            console.log("Auth state changed");
            console.log(this.state.user);
        });

        var locstate = this.props.location.payload;
        if (locstate !== undefined) {
            if (locstate.searching === true) {
                this.setState({
                    searching: true
                })
            }
        }
    }

    /**
     * Sets the current reference to Firebase collection to the target
     */
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

    /**
     * Updates the current search term, called whenever search input is
     * changed.
     */
    handleChange(e){
        {
            let filter = e.target.value;
            if (filter !== "") {
                filter.toLowerCase();
            }
            this.setState({searchKey: filter});
        }
    }

    /**
     * Renders the main App page
     * @override
     */
    render() {
        /**
         * List of Heirlooms must be filtered based on current board
         * (Heirlooms/Archive), and filtered again based on Search Terms.
         *
         * Board filtering is implemented in setCollection(), and dictates
         * which Firebase board is being accessed. This Firebase board is later
         * filtered across Search terms.
         *
         * If Search term filtering is implemented as an 'OnChange' event for
         * the Search field, it will not update when the Boards toggle is
         * switched.
         * To ensure both filters are applied, instead Search filter is
         * implemented here, since any update to the main App page involves
         * changing filters (in which the Search filter is required) or
         * navigating to another page (in which the filters are irrelevant).
         */
        document.title = "Home";
        let tempList = [];
        if (this.state.searchKey !== "") {
            var filter = this.state.searchKey.toLowerCase();
            let currentList = this.state.heirlooms;
            // Use .filter() to determine which items should be displayed
            // based on the search terms
            tempList = currentList.filter(item => {
                let lc = "" + item.title + ":" + item.description + ":" + 
                    item.guardian + ":" + item.nextguardian + ":" + item.date;
                lc = lc.toLowerCase();
                if (lc !== null) {
                    if (lc.includes(filter)) {
                        return 1;
                    }
                }
                return 0;
            });
        } else {
            // If the search bar is empty, set newList to original task list
            tempList = this.state.heirlooms;
        }
        var resultList = tempList
            .sort((a, b) => a.title.localeCompare(b.title));

        this.isArchiveBackground = this.state.switch;

        //user not authenticated, redirect to login page
        if(this.state.user == null && this.state.isAuth){
            console.log("not authenticated");
            console.log(firebase.auth().currentUser);
            this.props.history.push("/Login");
            return <Redirect to= '/login'/>
        }
        console.log("authenticated");
        return (
        <div className={this.isArchiveBackground ? "mainbodyArchive" : "mainbodyClassic"}>
            <nav className="navbar navbar-default navbar-expand-lg d-none d-lg-block">
            <div className="collapse navbar-collapse">
                <ul className="nav navbar-nav">
                    <li className="navbar-brand nav-item nav-link"><a href="/"> <img alt="Home icon" width="25" height="25" src={homeIcon}/> Family Jewels</a></li>
                    <li className="nav-item nav-link"><a href="/create"><i className="fa fa-plus-square"/> Heirloom</a></li>
                    <li className="nav-item nav-link"><a href="/map"><i className="fa fa-globe"/> Our map</a></li>
                    <li className="nav-item nav-link"><a href="/timeline"><i className="fa fa-calendar"/> Our history</a></li>
                </ul>
                <ul className="nav navbar-nav ml-auto">

                    <li className={this.state.searching ? '' : 'collapse'}>
                        <input
                            type="search"
                            className="input"
                            onChange={this.handleChange}
                            placeholder="Search..."
                            className="form-row"
                            autoFocus
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
                    type="search"
                    className="input"
                    onChange={this.handleChange}
                    placeholder="Search..."
                    autoFocus
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
                            {'HEIRLOOMS'}
                            </h2>
                        </div>
                        <div className="col">
                        </div>
                    </div>
                </div>
                <div className="panel-body">
                    <div className="grid">
                        {resultList.map(heirloom =>
                            <div className={this.isArchiveBackground ? "tileArchive" : "tile"} key={heirloom.key} >
                                <b href={`/show/${this.state.switch ? 'archived_boards' : 'boards'}/${heirloom.key}`}>
                                <div className="tiletitle">
                                    <a className={this.isArchiveBackground ? "subArchive" : "sub"}>
                                        <b>{heirloom.title}</b>
                                        <br></br>
                                    </a>
                                </div>
                                <div className="imgbox">
                                    <img className="tileimg" src={heirloom.icon}></img>
                                </div>
                                </b>
                            </div>
                        )}
                    </div>
                </div>
                </div>
                <div className='floating'>
                    <div className="floating-tile">
                        <b>{this.isArchiveBackground ? "Return" : "Go to archive"}</b>
                        <Switch
                            isOn={this.state.switch}
                            isArchiveBackground = {this.isArchiveBackground}
                            handleToggle={() =>
                                {
                                    this.setState(prevState => ({switch: !prevState.switch}));
                                    this.setState(prevState => ({target: this.state.switch ? 'archived_boards' : 'boards'}));
                                    this.setCollection();
                                }
                            }
                        />
                    </div>
                </div>
            </div>
            </div>
        </div>
        );
    }
}



export default App;
