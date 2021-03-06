import React, { Component } from 'react';
import { connect } from 'react-redux';
import {TweenMax} from "gsap";

import * as actions from '../actions';
import CloseButtonPopup from './Others/CloseButtonPopup';
import ConfirmButtonPopup from './Others/ConfirmButtonPopup';
import Input from './Others/Input';

import $ from 'jquery';

const Tools = require('../utils/tools');

class UnlockWallet extends React.Component {
 constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.unlockWallet = this.unlockWallet.bind(this);
    // this._handleKeyPress = this._handleKeyPress.bind(this);
  }

  _handleKeyPress = (e) => {
   console.log(e);
    if (e.key === 'Enter') {
      this.handleConfirm();
    }
  };

  componentWillMount(){
    Tools.hideFunctionIcons();
  }

  async unlockWallet(){
    //const updated = await Tools.updateConfig(1);
    //if (updated){
        let batch = [];
        let obj = {
          method: 'walletpassphrase', parameters: [this.props.passwordVal, 31556926, true]
        };
        batch.push(obj);

        return this.props.wallet.command(batch).then((data) => {
          let result = false;
          console.log("data: ", data);
          data = data[0];
          if (data !== null && data.code === -14) {
            Tools.showTemporaryMessage('#wrongPassword');
          } else if (data !== null && data.code === 'ECONNREFUSED') {
            console.log("daemong ain't working mate :(")
          } else if (data === null) {
            this.props.setPassword("");
            this.props.setUnlocking(false);
            result = true;
          } else {
            console.log("error unlocking wallet: ", data)
          }
          this.props.setPopupLoading(false)
          return result;
        }).catch((err) => {
          console.log("err unlocking wallet: ", err);
          this.props.setPopupLoading(false)
          return false;
        });
     // }
  }

  componentWillUnmount()
  {
    this.props.setPopupLoading(false)
    this.props.setPassword("");
    Tools.showFunctionIcons();
  }

  handleChange(event) {
    const pw = event.target.value;
    if(pw.length === 0)
      TweenMax.set('#password', {autoAlpha: 1});
    else
      TweenMax.set('#password', {autoAlpha: 0});

    this.props.setPassword(pw);
  }

  handleConfirm(){
    if(this.props.passwordVal === ""){
      Tools.showTemporaryMessage('#wrongPassword');
      this.props.setPassword("");
      return;
    }
    this.props.setPopupLoading(true)
    this.unlockWallet().then((result) => {
      if(!result) return;
      return this.props.wallet.setGenerate().then(() => {
        setTimeout(() => this.props.setStaking(true), 1000)
      });
    });
  }

  handleCancel(){
    this.props.setUnlocking(false);
  }

  render() {
     return (
      <div className="unlockWallet">
        <CloseButtonPopup handleClose={this.handleCancel}/>
        <p className="popupTitle">{ this.props.lang.unlockWallet }</p>
        <p style={{fontSize: "16px", width: "400px", textAlign: "left", margin: "0 auto", paddingTop: "20px"}}>{this.props.lang.unlockWalletExplanation1 + " " + this.props.lang.unlockWalletExplanation2} <span className="ecc">ECC</span>.</p>
          <Input
            divStyle={{width: "400px"}}
            placeholder= { this.props.lang.password }
            placeholderId= "password"
            placeHolderClassName="inputPlaceholder inputPlaceholderUnlock"
            value={this.props.passwordVal}
            handleChange={this.handleChange.bind(this)}
            type="password"
            inputStyle={{width: "400px", top: "20px", marginBottom: "30px"}}
            onKeyPress={this._handleKeyPress}
            inputId="unlockWalletPassword"
            autoFocus={true}
          />
        <div>
          <p id="wrongPassword" className="wrongPassword">{ this.props.lang.wrongPassword }</p>
        </div>
        <ConfirmButtonPopup inputId="#unlockWalletPassword" handleConfirm={this.handleConfirm} textLoading={this.props.lang.confirming} text={ this.props.lang.confirm }/>
      </div>
      );
    }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    passwordVal: state.application.password,
    wallet: state.application.wallet
  };
};


export default connect(mapStateToProps, actions)(UnlockWallet);
