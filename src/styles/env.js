import axios from 'axios';

const offline=false;
var server="";
if(offline){
    server="http://127.0.0.1:8000";
}
else{
    server="https://api.alhikma-ye.com";
}

export const HOST_SERVER_NAME =server +'/api/';
export const HOST_SERVER_STORAGE = server+'/storage/';
