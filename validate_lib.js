/**
 * 
 * OctaValidate RegExp Library V1.0
 * author: Simon Ugorji
 * Last Edit : 28th December 2021
 */
function octaValidations(){
    //check email
    function octaValidateEmail(email){
        if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
            return true;
        }   
    return false;
    }

    //check Alphabets and spaces
    function octaValidateAS(text){
        if(/^[a-zA-Z ]{2,30}$/.test(text)){
            return true;
        }
    return false;
    }

    //check Alpha Numberic strings
    function octaValidateAN(text){
        if(/^[a-zA-Z0-9]+$/.test(text)){
            return true;
        }else{
            return false;
        }
    }

    //check DATE mm/dd/yyyy
    //source https://stackoverflow.com/a/15196623
    function octaValidateDate_MDY(date){
        if(/^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/.test(date)){
            return true;
        }
        return false;
    }

    //url 
    function octaValidateUrl(url){
        if(/^((?:http:\/\/)|(?:https:\/\/))(www.)?((?:[a-zA-Z0-9]+\.[a-z]{3})|(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1(?::\d+)?))([\/a-zA-Z0-9\.]*)$/i.test(url)){
            return true;
        }else{
            return false;
        }
    }

    //validate url with query params
    function octaValidateUrl_QP(url){
        if(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(url)){
            return true;
        }else{
            return false;
        }
    }

    //username
    function octaValidateUserName(uname){
        if(/[a-zA-Z][a-zA-Z0-9-_]/.test(uname)){
            return true;
        }else{
            return false;
        }
    }

    return{
        ValidateEmail : octaValidateEmail,
        ValidateAS : octaValidateAS,
        ValidateAN : octaValidateAN,
        ValidateUrl : octaValidateUrl,
        ValidateUrl_QP: octaValidateUrl_QP,
        ValidateUserName : octaValidateUserName,
        ValidateDate_MDY : octaValidateDate_MDY
    }

}

export default octaValidations()