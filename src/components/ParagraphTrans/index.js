import React,{useState,useEffect,useRef,useReducer} from 'react';
import './style.css';
import Textarea from 'react-textarea-autosize';
import {api} from '../../api'
import uuid from 'uuid'
import { Dialog, Button } from 'react-desktop/macOs';


export function ParagraphTrans({dispatchPTrans,ParaTransHistoryState}){
    const [inputValue, setInputValue] = useState('')
    const [fromLang, setFromLang] = useState('en')
    const [toLang, setToLang] = useState('zh')
    const [transRes, setTransRes] = useState()
    
    const [showTo, setShowTo] = useState([])
    const [historyTo, setHistoryTo] = useState('')

    const [showDialog, setShowDialog] = useState(false)

    const input = useRef()

   


    useEffect(() => {
        
    }, [])
    
    async function fetchTranslateRes(){
        if(input.current.value){
            if(input.current.value.length>3000) return setShowDialog(true)
            setInputValue(input.current.value)
            let [from,to,text] = [fromLang,toLang,input.current.value]
            let resData = await api.post(from,to,text)
           
            let newTransRes = resData.translation[0].translated
            setTransRes(newTransRes)
            let newParaTrans = {newTransRes, from:input.current.value, fromLang, toLang}
            dispatchPTrans({type:'store_new_trans',newParaTrans})
        }

    }
    function exchangeLangs(){
        setFromLang(toLang)
        setToLang(fromLang)
    }
    function addShowTo(index){
        let newShowTo = [...new Set([...showTo,index])];
        setShowTo(newShowTo)
    }
    function deleteShowTo(index){
        let newShowTo = showTo.filter(e=>e!==index)
        setShowTo(newShowTo)
    }
    function clear(){
        setTransRes(null)
        setInputValue(null)
        setHistoryTo(null)
        input.current.value = null
    }
    function showToPannel(from,to){
       // console.log(from,to)
        input.current.value = from
        setTransRes(null)
        setHistoryTo(to)

    }
    function clearHistory(){
        dispatchPTrans({type:'clear_history'})
    }
    function renderDialogIcon(){
        return(
            <i className="fa fa-exclamation-triangle" aria-hidden="true"></i> 
        )
    }
    return(
        <div id='paragraph-body'>
            {
                showDialog ?
                <Dialog
                    title="翻译出错，字数大于3000"
                    message="请将字数限制在3000字以内"
                    icon={renderDialogIcon()}
                    verticalAlignment= "top"
                    horizontalAlignment='center'
                    buttons={[
                    <Button color="blue" onClick={() => setShowDialog(false)}>确认</Button>,
                    ]}
                />
                :
                null
            }
         <div id='text-view'> 
             <Textarea id='text-input' 
                       minRows={20} 
                       maxRows={20} 
                       inputRef={input}  
                       placeholder='在这里 输入 / 粘贴 您要翻译的原文'
                       autoFocus/>
             <div id='middle-view'>
               <div>
                   <span>{fromLang==='en'? '英文':'中文'}</span>
                   <i className="fa fa-arrows-h fa-2x" aria-hidden="true" onClick={() => exchangeLangs()}></i>
                   <span>{toLang==='en'? '英文':'中文'}</span>
               </div>
              
               <div onClick={() => fetchTranslateRes()} id='trans-btn'>
                   翻译
               </div>
               <div id='clear-btn' onClick={() => clear()}>
                   <i className="fa fa-trash" aria-hidden="true"></i>
                   清空
               </div>
             </div>
             <div id='translate-output'>
              {
                  historyTo ?
                  historyTo
                  :
                  null
              }
              {
                  transRes ?
                  transRes.map( (ele,i) => 
                    <span key={uuid()} >
                      {ele.text}
                    </span>
                    )
                    : null
            }
             </div>
         </div>
         <div id='paragraph-trans-history'>
             <div id='title'>
                翻译记录 {ParaTransHistoryState.length || ''}
                <span onClick={()=>clearHistory()} id='clear-history-btn'>
                    <i className="fa fa-trash" aria-hidden="true"></i> 
                    <span id='clear-description'>清除记录</span>
                </span>
             </div>
             <div>

            
             {
                 ParaTransHistoryState ?
                 ParaTransHistoryState.map( (ele,i) => 
                 <div key={i} className='trans-item'>
                    <div className='trans-direction'>
                        <span>{ele.fromLang==='en'? '英文':'中文'}</span>
                        译
                        <span>{ele.toLang==='en'? '英文':'中文'}</span>
                        <div    className='show-to-pannel' 
                                onClick={()=>
                                showToPannel(ele.from, 
                                    ele.newTransRes.length > 1 ?
                                    ele.newTransRes.reduce((a,b)=>`${a.text||a}${b.text}`)
                                    :
                                    ele.newTransRes[0].text
                                    )}>
                                <i class="fa fa-arrow-circle-up" aria-hidden="true"></i>
                                <span >在翻译面板上显示</span>
                        </div>
                        <div className='showTo-btn'>
                            <span>译文</span>
                            <div>
                                <div onClick={()=>addShowTo(i)} 
                                    className={showTo.some(el=>el===i)? 'selected':null}>
                                    
                                </div>
                                
                                <div onClick={()=>deleteShowTo(i)}
                                    className={showTo.some(el=>el===i)? null:'selected'}
                                >
                                </div>
                            </div>
                            <span>原文</span>
                        </div>
                    </div>
                    <div className='trans-content'>
                        {
                            !(showTo.some(el=>el===i)) ?
                            <div>{ele.from}</div>
                            :
                            <div>
                                {ele.newTransRes.map( (e,i) => 
                                <span key={uuid()} >
                                {e.text}
                                </span>
                                )}
                            </div>
                        }   
                    </div>
                 </div>
                 )
                 :null
             }
           </div>
         </div>
        </div>
    )
}