// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./MyERC20.sol";

contract Lottery{
    MyERC20 public myERC20; //相关的代币合约
    uint256 constant public Vote_AMOUNT = 10; //投票需要金额
    uint256 constant public Publish_AMOUNT = 30;   //发起提案需要金额
    uint256 constant public Award_AMOUNT = 50; //奖励金额
    uint256 public proposal_number=0;

    struct proposal{
        string    name;    //提案名称
        string    text;    //提案内容
        address   builder; //发起人
        uint256   voteEnd; //提案截止时间
        uint    VoteCount; //投票计数
    }
    
    address student;

    proposal[] public proposal_list;//保存所有提案

    constructor() {//部署合约
        myERC20 = new MyERC20("ZJUToken", "ZJUTokenSymbol");
    }

    //发起提案
    function Ballot(string memory name_,string memory text_,uint voteTime_) public {
        myERC20.transferFrom(msg.sender,address(this),Publish_AMOUNT);//支付发起提案

        proposal memory temp=proposal(name_,text_,msg.sender,block.timestamp+voteTime_*60,0);//提案构造初始化
        proposal_number++;
        proposal_list.push(temp);//保存提案
    }

    //投票,opinion为投票意见，1同意，2不同意
    function vote(uint opinion,uint proposalid) public {
        myERC20.transferFrom(msg.sender,address(this),Vote_AMOUNT);//支付投票费用
        if(opinion==1){//同意
            proposal_list[proposalid].VoteCount++;
        }
        else if(opinion==2){//不同意
            proposal_list[proposalid].VoteCount--;
        }
    }

    //计票函数，到截止时间后正数则通过，给予奖励
    function result() public returns (string  memory msg_){
        for(uint i=0;i<proposal_list.length;i++){
            if(block.timestamp>=proposal_list[i].voteEnd){ //投票时间到
                if(proposal_list[i].VoteCount>0){ //通过
                    msg_="Congratulations, pass!!!";
                    myERC20.transfer(proposal_list[i].builder,Award_AMOUNT);//通过给予奖励
                    delete proposal_list[i];//删除提案
                }
                else{
                    msg_="Sorry,not pass!!!";
                    delete proposal_list[i];//删除提案
                }
            }   
        }
    }

    function getbackArrary() view public returns(proposal[] memory arrary){
        
    }

}