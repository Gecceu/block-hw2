import './index.css'
import {Button, Input, Space, Table} from 'antd';
import { lotteryContract, myERC20Contract, web3 } from '../../utils/contracts';
import { useEffect, useState } from 'react';
import {  
  UserOutlined ,
  WalletOutlined,
  MoneyCollectOutlined
}from '@ant-design/icons';
import Operation from 'antd/lib/transfer/operation';



const { TextArea } = Input;

const GanacheTestChainId = '0x539' // Ganache默认的ChainId = Hex(1337)
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545'



const AppPage = () =>{
  const [account, setAccount] = useState('')
  const [accountBalance, setAccountBalance] = useState(0)
  const [input_name, setInput_name] = useState('')
  const [input_text, setInput_text] = useState('')
  const [propoNumber, setNumber] = useState(666)
  const [all_data,setList] =useState([{
      id:666,
      name: '666',
      text: '666',
      builder: '666',
      voteEnd: '666',
      VoteCount: '666'
  }])//提案列表
  
  /*表格样式*/
  const columns = [
    {
      title: '编号',
      dataIndex: 'id',
      key: 'id',
      width:80
    },
    {
      title: '提案',
      dataIndex: 'name',
      key: 'name',
      width:80
    },
    {
      title:'提案内容',
      dataIndex:'text',
      key:'text'
    },
    {
      title:'提案人',
      dataIndex:'builder',
      key:'builder'
    },
    {
      title:'提案截止时间',
      dataIndex:'voteEnd',
      key:'voteEnd'
    },
    {
      title:'投票数',
      dataIndex:'VoteCount',
      key:'VoteCount',
      width:80
    },
    {
      title:'操作',
      key:'Operation',
      render:(row: any,_: any)=>(
        <Space size="middle">
          <Button onClick={()=>voteEvent1(row,1)}>同意</Button>
          <Button onClick={()=>voteEvent1(row,2)}>不同意</Button>
        </Space>
      )
    }
  ];
  
  let flag=0;/*确保不多次获取列表导致多个相同值*/

  /*投票事件*/
  const voteEvent1 = async (row: any,opinion: number)=>{
    if(account === '') {
      alert('钱包尚未连接')
      return
    }
    let proposalid;
    proposalid=row.id;
    if(proposalid===666){
      alert('测试提案，请跳过')
      return
    }
    if (lotteryContract && myERC20Contract){
      try{
        await lotteryContract.method.vote(opinion,proposalid).call()
        alert('投票成功，感谢你的参与')
      }catch(error: any){
        alert(error.message)
      }
    }
    else {
      alert('Contract not exists.')
    }
  }
  
  useEffect(() => {
    // 初始化检查用户是否已经连接钱包
    // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
    const initCheckAccounts = async () => {
        // @ts-ignore
        const {ethereum} = window;
        if (Boolean(ethereum && ethereum.isMetaMask)) {
            // 尝试获取连接的用户账户
            const accounts = await web3.eth.getAccounts()
            if(accounts && accounts.length) {
                setAccount(accounts[0])
            }
        }
    }

    initCheckAccounts()
  }, [])


  //调用钱包余额值
  useEffect(() => {
    const getAccountInfo = async () => {
        if (myERC20Contract) {
            const ab = await myERC20Contract.methods.balanceOf(account).call()
            setAccountBalance(ab)
        } else {
            alert('Contract not exists.')
        }
    }

    if(account !== '') {
        getAccountInfo()
    }
  }, [account])

  //调用提案数组
  useEffect(()=>{
    const getList = async () => {
      if(lotteryContract){
        flag=1;
        const mnum=await lotteryContract.methods.proposal_number().call()
        setNumber(mnum)
        let temp_list=all_data
        for(var i=0;i<propoNumber;i++)
        { 
          const mlist=await lotteryContract.methods.proposal_list(i).call()
          const my_list={
            id:i,
            name: mlist[0],
            text: mlist[1],
            builder: mlist[2],
            voteEnd: mlist[3],
            VoteCount: mlist[4]
          }
          temp_list.push(my_list)
          temp_list=[...temp_list]
          setList(temp_list)
        }
        
      }else {
        alert('Contract not exists.')
      }
    }
    
    if(flag==0){
    getList()
    }
  },[])

  const onClickConnectWallet = async () => {
    // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
    // @ts-ignore
    const {ethereum} = window;
    if (!Boolean(ethereum && ethereum.isMetaMask)) {
        alert('MetaMask is not installed!');
        return
    }

    try {
        // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
        if (ethereum.chainId !== GanacheTestChainId) {
            const chain = {
                chainId: GanacheTestChainId, // Chain-ID
                chainName: GanacheTestChainName, // Chain-Name
                rpcUrls: [GanacheTestChainRpcUrl], // RPC-URL
            };

            try {
                // 尝试切换到本地网络
                await ethereum.request({method: "wallet_switchEthereumChain", params: [{chainId: chain.chainId}]})
            } catch (switchError: any) {
                // 如果本地网络没有添加到Metamask中，添加该网络
                if (switchError.code === 4902) {
                    await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain]
                    });
                }
            }
        }
        // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
        await ethereum.request({method: 'eth_requestAccounts'});
        // 获取小狐狸拿到的授权用户列表
        const accounts = await ethereum.request({method: 'eth_accounts'});
        // 如果用户存在，展示其account，否则显示错误信息
        setAccount(accounts[0] || 'Not able to get accounts');
    } catch (error: any) {
        alert(error.message)
    }
  }

  //领取积分事件
  const onClaimTokenAirdrop = async () => {
    if(account === '') {
        alert('钱包尚未连接')
        return
    }
    if (myERC20Contract) {
        try {
            await myERC20Contract.methods.airdrop().send({
                from: account
            })
            alert('积分成功领取')
            window.location.reload()
        } catch (error: any) {
            alert(error.message)
        }
    } else {
        alert('合约不存在')
    }
  }

  //提交提案事件
  const onBallot = async () => {
    if(account === '') {
      alert('钱包未连接')
      return  
    }
    if(input_name === ''){
      alert('名称不能为空')
      return  
    }
    if (lotteryContract && myERC20Contract) {
      try {
          await myERC20Contract.methods.approve(lotteryContract.options.address, 30).send({
              from: account
          })
          await lotteryContract.methods.Ballot(input_name,input_text,2).send({
              from: account
          })
          alert('发起提案成功,投票时间为120秒')
          resetvlaue() //清空
      } catch (error: any) {
          alert(error.message)
      }
    } 
    else{
      alert('合约不存在')
    }
  }

  //重置按钮事件
  const resetvlaue = async () => {
    setInput_name('');
    setInput_text('');
    /*console.log(propoNumber)
    console.log(all_data)*/
  }

    return (
      <div className='all'>
        <div className='title'>
          <h1 className='title_text'>去中心化社团管理系统</h1>
        </div>

        <div className='body_container'>
          <div className='introuduce1'>欢迎来到本系统，您可使用30积分提出提案</div>
          <div className='introuduce2'>可使用10积分投票提案，提案通过奖励50积分，首次可领取100积分</div>
          <div><hr className='cutdown'></hr></div>
          
          <div className='inituser'>
            {account === '' && <Button onClick={onClickConnectWallet}>连接钱包</Button>}
            <div className='inittext'><UserOutlined />  当前用户地址：{account === '' ? '无用户连接,请刷新页面' : account}  </div><p></p>
            <div className='inittext'><WalletOutlined />  通行证积分剩余数量：{account === '' ? 0 : accountBalance}</div>
            <Button className='takebutton' onClick={onClaimTokenAirdrop} type='primary' shape='round' icon={<MoneyCollectOutlined />} size='large'>免费领取100积分</Button>
          </div>
          
          <div>
              <Input  className='inputpoprosal' placeholder="输入提案名称" size='large' value={input_name}
                  onChange={ e=>{
                    setInput_name(e.target.value) 
                    }
              }></Input>
              <p></p><p></p><p></p><p></p>
              <TextArea className='inputpoprosal' rows={4} placeholder="输入提案内容"  size='large' value={input_text}
                  onChange={e=>{
                    setInput_text(e.target.value) 
                    }
              }></TextArea>
          </div>

          <div className='submitbutton'>
            <Space size={80}>
              <Button onClick={onBallot} type='primary' shape='round'>提交提案</Button> 
              <Button onClick={resetvlaue} type='primary' shape='round'>重置</Button>
            </Space>
          </div>
          
          <div>
            <br></br><br></br><br></br><div><hr className='cutdown'></hr></div>
            <div>
              <Button className='resultbutton' type='primary' shape='round' size='large'>结算</Button>
              <Table className='table' dataSource={all_data} columns={columns}  pagination={{ pageSize: 20 }} scroll={{ y: 250 }}></Table>
            </div>
          </div>
          
        </div>
      </div>    
      )
}
  
export default AppPage;
