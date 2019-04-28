 
import React,{useState,useEffect,useRef,useReducer} from 'react';
import './App.css';
import {If,Else,Then} from 'react-if';
import {ParagraphTrans} from '../components/ParagraphTrans';
import {DocumentTrans} from '../components/DocumentTrans';
const electron = window.electron;
const {ipcRenderer} = electron;
console.log('ipcRenderer',ipcRenderer)


import uuid from 'uuid'

const translate_Type = {
  paragraph:'PARAGRAPH',
  document:'DOCUMENT'
}

function Para_transHistoryReducer(state=[],action){
  switch (action.type){
      case 'store_new_trans':{
          console.log(state)
          return [...new Set([action.newParaTrans,...state])]
      }
      case 'clear_history':{
          return []
      }
  }

}

function Doc_TransHistoryReducer(state=[],action){
  switch (action.type){
    case 'new_trans':{
      return [...new Set([action.newDocTrans,...state])]
    }
    case 'clear':{
      return []
    }
  }
}

function App() {
  const [translate, setTranslate] = useState(translate_Type.paragraph)
  const [Files, setFiles] = useState([])
  const [filesTransed, setFilesTransed] = useState([])
  const [selectedFileName, setSelectedFileName] = useState('')
  const [mouseOverFile, setMouseOverFile] = useState(-1)

  const [ParaTransHistoryState, dispatchPTrans] = useReducer(Para_transHistoryReducer,[])
  const [DocTransHistoryState, dispatchDTrans] = useReducer(Doc_TransHistoryReducer, [])

  const fileInput = useRef()

  useEffect(() => {
 
  }, [])

  function openFile(e){
    let file = fileInput.current.files[0]
    if(file){
     
      let files = [...new Set([...Files])]
      files.push(file)
      setFiles(files)
    }
  }
  async function docTrans(file){
    if( filesTransed.some(ele => ele.localoFileInfo.name===file.name) ){
      let selected = filesTransed.filter(e=>e.localoFileInfo.name===file.name)[0].localoFileInfo.name
      setSelectedFileName(selected)
      return  setTranslate(translate_Type.document) 
    }
    ipcRenderer.send('transNewDoc', {from:'zh',to:'en',filePath:file.path})
    await ipcRenderer.on('transDocRes',(event, result)=>{
      console.log(result)
     
      let filesTrans =  [...filesTransed] 
      filesTrans.push({
        localoFileInfo: file, 
        sourceFile: result.sourceFile, 
        transedText:  typeof result.transedText=== 'number'? result.transedText :JSON.parse(result.transedText.replace(/\ufeff/g,''))
      })
      filesTrans = [...new Set(filesTrans)]
      console.log(filesTrans)
      setFilesTransed(filesTrans)
      setTranslate(translate_Type.document)
    })
  }

  return (
    <div className="App">
        <header>
          <div id='buttons'>
            <div id='open-file'>
              <label for="file-input">
                <i className="fa fa-folder-open-o" aria-hidden="true"></i> 
                打开
              </label>
              <input type='file' 
                     name='file' 
                     id='file-input'
                     onChange={(e)=>openFile(e)}
                     ref={fileInput}
              />
            </div>
            <div id='open-history'>
              <i class="fa fa-history" aria-hidden="true"></i> 
              历史
            </div>
          </div>
          <h3>论文翻译助手</h3>
          <div id='about'>
            <span>关于</span>
            <i className="fa fa-info-circle" aria-hidden="true"></i>
          </div>
        </header>
        <div id='side-and-content'>
          <div id='side-bar'>
            <div onClick={()=>setTranslate(translate_Type.paragraph)}
                 className={translate===translate_Type.paragraph ? 'selected':null}
            >
              <i className="fa fa-paragraph" aria-hidden="true"></i> 
              <span>段落翻译</span>
            </div>
            <div onClick={()=>setTranslate(translate_Type.document)}
             className={translate===translate_Type.document ? 'selected':null}
            >
              <i className="fa fa-file-text-o" aria-hidden="true"></i>
              <span>文档翻译</span>
            </div>
            <div id='files-bar'>
              <h3>{
                Files.length ?
                '载入文档'
                :null
              }</h3>
              {
                Files.map((ele,i) => 
                  <div key={uuid()} className='file-item' 
                       onMouseOver={()=>setMouseOverFile(i)} 
                       onMouseOut={()=>setMouseOverFile(-1)}>
                      <i class="fa fa-file" aria-hidden="true"></i>
                      {ele.name}
                      <div className={mouseOverFile===i ? 'file-over':'file-notover'}>
                        <span onClick={()=>docTrans(ele)}>
                          翻译
                          <i className="fa fa-globe" aria-hidden="true"></i>
                        </span>
                      </div>
                  </div>
                  )
              }
            </div>
          </div>
          <div id='route-content'>
            <If condition={ translate===translate_Type.paragraph}>
               <Then>
                 <ParagraphTrans ParaTransHistoryState={ParaTransHistoryState}  
                                 dispatchPTrans={dispatchPTrans} 
                 />
               </Then>
               <Else>
                 <DocumentTrans Files={filesTransed} 
                                selectedFileName={selectedFileName}
                                DocTransHistoryState={DocTransHistoryState} 
                                dispatchDTrans={dispatchDTrans}
                 />
               </Else>
            
            </If>
          </div>
        </div>
    </div>
  );
}

export default App;
