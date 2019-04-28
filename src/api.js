import axios from 'axios';

const url = 'http://api.yeekit.com/dotranslate.php'

const app_kid = '5cbff8d66f3f6'
const app_key = '90dc2c37d4c4f5fa2a6b1344e16b0c4f'

export const api={
    post:async(from,to,text)=>{
        let res =  await axios.post(url+`?from=${from}&to=${to}&app_kid=${app_kid}&app_key=${app_key}&text=${encodeURIComponent(text)}`)
        return res.data
    },
}
