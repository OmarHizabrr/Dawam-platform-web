
const offline=false;
var server="";
if(offline){
    server="http://127.0.0.1:8000";
}
else{
    server=process.env.REACT_APP_API_URL;
    // server="https://api.alhikma-ye.com";
  //  server="https://api.taiz.dawam.alhikma-ye.com";
   //  server="https://api.dawam.app";

}

export const HOST_SERVER_NAME =process.env.REACT_APP_API_URL +'/api/';
export const HOST_SERVER_STORAGE = server+'/storage/';
