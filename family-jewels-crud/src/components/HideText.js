import React, { Component } from 'react';

export default class HideText extends React.Component{
    constructor(props){
        super(props);
        this.state={
            textDisplay: false,
        }
    }

    ToggleButton(){
        this.setState((currentState) => ({
            textDisplay: currentState.textDisplay, 
        }));
    }

    render(){
        return(
            <div>
                <button onClick={() => this.ToggleButton()}>
                  Toggle
                </button>
                {!this.state.textDisplay && this.props.text}
            </div>
        )
    }
}