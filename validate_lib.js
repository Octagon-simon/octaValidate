/**
 * 
 * OctaValidate RegExp Library V1.0
 * author: Simon Ugorji
 * Last Edit : 12th January 2022
 */
function octaValidations(){
    //check email
    function octaValidateEmail(email){
        if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
            return true;
        }   
    return false;
    }

    //check Alphabets only
    function octaValidateALPHA_ONLY(text){
        if(/^[a-zA-Z]+$/.test(text)){
            return true;
        }
    return false;
    }

    //check lowercase alphabets only
    function octaValidateLOWER_ALPHA(text){
        if(/^[a-z]+$/.test(text)){
            return true;
        }
    return false;
    }

    //check uppercase alphabets only
    function octaValidateUPPER_ALPHA(text){
        if(/^[A-Z]+$/.test(text)){
            return true;
        }
    return false;
    }

    //check Alphabets and spaces
    function octaValidateALPHA_SPACES(text){
        if(/^[a-zA-Z\s]+$/.test(text)){
            return true;
        }
    return false;
    }

    //check Alpha Numberic strings
    function octaValidateALPHA_NUMERIC(text){
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

    //password - 8 characters or more
    function octaValidatePWD(password){
        if(/^((?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,})+$/.test(password)){
            return true;
        }else{
            return false;
        }
    }

    return{
        ValidateEmail : octaValidateEmail,
        ValidateAlpha_Only : octaValidateALPHA_ONLY,
        ValidateLower_Alpha : octaValidateLOWER_ALPHA,
        ValidateUpper_Alpha : octaValidateUPPER_ALPHA, 
        ValidateAlpha_Spaces : octaValidateALPHA_SPACES,
        ValidateAlpha_Numeric : octaValidateALPHA_NUMERIC, 
        ValidateUrl : octaValidateUrl,
        ValidateUrl_QP: octaValidateUrl_QP,
        ValidateUserName : octaValidateUserName,
        ValidateDate_MDY : octaValidateDate_MDY,
        ValidatePWD : octaValidatePWD
    }

}

export default octaValidations()