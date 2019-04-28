import React,{useState,useEffect,useRef,useReducer} from 'react';
import './style.css';
import uuid from 'uuid';
import { Document, Page } from 'react-pdf';
import { ProgressCircle } from 'react-desktop/macOs';

export function DocumentTrans({Files, selectedFileName,DocTransHistoryState, dispatchDTrans}){
    const [translatedFiles, setTranslatedFiles] = useState(Files)
    const [selectedFileIndex, setselectedFileIndex] = useState(0)

    const [numPages, setNumPage] = useState(null)
    let [pageNumber, setPageNumber] = useState(1)

    useEffect(() => {
       setTranslatedFiles(Files)
       console.log(Files)
    }, [Files,selectedFileName])

    function onDocumentLoadSuccess({ numPages }) {
        setNumPage( numPages );
        setPageNumber(1)
    }
    function selectFile(fileIndex){
        setselectedFileIndex(fileIndex)
        
    }
    return(
        <div id='doc-trans-body'>
            <div id='header'>
               {
                   translatedFiles.map((ele,i) => 
                    <span key={uuid()} 
                          className={selectedFileIndex===i ? 'slected-file-name':'file-name'}
                          onClick={()=>selectFile(i)}
                          >
                          {ele.localoFileInfo.name.slice(0,10)+'...'}
                    </span>
                    )
               }
            </div>
            <div id='trans-result'>
               <div id='source-file'>
                    <h5>
                        {
                             translatedFiles.length > 0 ?
                            <div id='sourcefile-info-btn'>
                                原文件信息
                                <i className="fa fa-list" aria-hidden="true"></i>
                                <div id='hidden-info'>
                                    <div>
                                        <span className='key'>文件名</span>
                                        <span className='value'>
                                        {translatedFiles[selectedFileIndex]['localoFileInfo'] ? '' : translatedFiles[selectedFileIndex].localoFileInfo.name}
                                      </span>
                                    </div>
                                    <div>
                                        <span className='key'>创建者</span>
                                        <span className='value'>
                                        {translatedFiles[selectedFileIndex].sourceFile.info.Creator}
                                        </span>
                                    </div>
                                    <div>
                                        <span className='key'>最后修改时间</span>
                                        <span className='value'>
                                        {translatedFiles[selectedFileIndex].sourceFile.info.ModDate}
                                        </span>
                                    </div>
                                    <div>
                                        <span className='key'>文件路径</span>
                                        <span className='value'>
                                        {translatedFiles[selectedFileIndex].localoFileInfo ? '' : translatedFiles[selectedFileIndex].localoFileInfo.path}
                                        </span>
                                    </div>
                                </div>
                             </div>
                             :
                             null
                        }
                        <div>
                            <span>当前页码{pageNumber}/{numPages}  </span>
                            <span onClick={()=>setPageNumber(--pageNumber)} 
                                    className={ pageNumber > 1 ? 'page-btn-show':'page-btn-hidden'}>
                                    上一页</span>
                            <span onClick={()=>setPageNumber(++pageNumber)} 
                                  className={ pageNumber < numPages ? 'page-btn-show':'page-btn-hidden'} >
                                    下一页</span>
                        </div>
                    </h5>
                     
                    <div >
                        {
                             translatedFiles.length > 0 ?
                            <Document
                                loading={<ProgressCircle size={55} id='pdf-loading'/>}
                                file={translatedFiles[selectedFileIndex].localoFileInfo.path}
                                onLoadSuccess={onDocumentLoadSuccess}
                                >
                                <Page pageNumber={pageNumber} scale={0.6} width={700} className='pdf-view'/>
                            </Document>
                            :
                            null
                        }
                    </div>
               </div>
               <div id='transed-res'>
                 <h5>
                    <span id='download-btn'>
                        <i className="fa fa-download" aria-hidden="true"></i>
                        下载译文
                    </span>
                 </h5>
              
                 {
                     translatedFiles.length > 0  ?
                     <div>
                        {
                           translatedFiles[selectedFileIndex].transedText===1 ?
                          <h4>字数大于3000字，建议选择段落翻译</h4>
                           :
                           translatedFiles[selectedFileIndex].transedText===2 ?
                           <h4>翻译出错</h4>
                           :
                           null
                        }
                         <h5>提取文本：</h5>
                         <div className='source-chacters'>
                             {translatedFiles[selectedFileIndex].sourceFile.text}
                         </div>
                    </div>
                     :
                     null
                }
                {   
                     translatedFiles.length > 0 && 
                     translatedFiles[selectedFileIndex].transedText!==1 &&
                     translatedFiles[selectedFileIndex].transedText!==2
                     ?
                     <div>
                         <h5>译文</h5>
                         <div className='transed-chacters'>
                             {
                                translatedFiles[selectedFileIndex].transedText.translation[0].translated.map(e=>
                                    <span key={uuid()}>
                                        {e.text}
                                    </span>
                                    
                                    )
                             }
                         </div>
                     </div>
                    : null
                 }
               </div>
            </div>
        </div>
    )
}
 