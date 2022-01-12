/**
 * 
 * OctaValidate main JS V1.0
 * author: Simon Ugorji
 * Last Edit : 12th January 2022
 */
import octaValidations from './validate_lib.js';
//global Styling
let style = document.createElement("style");
style.id="octaValidate-global-style";
style.innerHTML = '.octaValidate-inp-error{border: 2px solid #e64a61 !important;}.octaValidate-txt-error{color : #e64a61;color: #e64a61;font-size: 17px;font-weight: 400;margin-top: 5px;}';
document.head.appendChild(style);

    //custom rules
    var OVCustomRules = [];
    function addOVCustomRules(rule, exp, text){
        OVCustomRules[rule] = [exp, text];
    }

    //more custom rules
    function addMoreOVCustomRules(rules){
        for(var r = 0; r < Object.keys(rules).length; ++r){
            var index = Object.keys(rules)[r]; //get index
            var exp = rules[index][0]; //get Regexpression
            var text = rules[index][1]; //get text
            
            (index && exp && text) ?
            addOVCustomRules(index,exp, text) : '';

        }
    }

    //build validation
    var validate = {};
    (function(){
        var octaValidators = document.querySelectorAll('[octavalidate]');
        //loop through
        for(var myv = 0; myv < octaValidators.length; ++myv){
            //get attr
            let attr = (octaValidators[myv].getAttribute("octaValidate")) ? octaValidators[myv].getAttribute("octaValidate") : null;
            //get id
            let id = (octaValidators[myv].getAttribute("id"))?octaValidators[myv].getAttribute("id") : null;
            //get type
            let type= (octaValidators[myv].getAttribute("type")) ? octaValidators[myv].getAttribute("type") : null;
            //exit if attribute existts but id is null
            if(attr && !id ){
                return false;
            }
            //build only when theres octaValidate attribute present
            if(attr !== null){
                if(Object.keys(validate).length !== octaValidators.length) {validate[id] = [type, attr]};
            }
            
        }
    })();
function octaValidate(){
    let errors = 0;
    //insert error
    function octaValidateNewError(inputID, error){
        //remove previous error
        octaValidateRemoveError(inputID);
        //add error to element
        var g = document.createElement("p");
        g.setAttribute("id", "octaValidate_"+inputID);
        g.setAttribute("class", "octaValidate-txt-error");
        g.innerText = error;

        //set class of input error
        var f = document.querySelector('#'+inputID);
        f.classList.toggle("octaValidate-inp-error");

        //append to form
        f.parentNode.appendChild(g);
    }
    //remove error
    function octaValidateRemoveError(inputID){
        //remove error text
        let errorElem = (document.querySelector('#octaValidate_'+inputID)) ? document.querySelector('#octaValidate_'+inputID) : null;
        let inputElem = (document.querySelector('#'+inputID)) ? document.querySelector('#'+inputID) : null ;
        //remove classlist
        if(inputElem !== null){
            (inputElem.classList.value.includes('octaValidate-inp-error')) ? 
            inputElem.classList.remove('octaValidate-inp-error') : '';
        }else{
            console.log("%cInput ID ( "+ inputID+" ) is missing!", "color:#ff0000");
            return false;
        }
        if(errorElem !== null){
            errorElem.remove();
        }
    }

    if(validate){
        //loop through validations
        for(var i = 0; i < Object.keys(validate).length; ++i){
            let index =  Object.keys(validate)[i]; // or input id
            let type =validate[index][0];
            let validations = validate[index][1].split(',');
            let continueValidation = 0;
            let validationInfo;
            let validationText;
            let elem = (document.querySelector('#'+index)) ? document.querySelector('#'+index) : null;
            if(elem === null){
                console.log("%cInput ID ( "+ index +" ) is missing!", "color:#ff0000");
                return false;
            }

            //create event
            function eventAction(){
                //elem is needed as an argument because the validation will contain a reference to the HTML element
                (!eval(validationInfo)) ?
                    octaValidateNewError(index, validationText)
                        :   (   
                                errors--,
                                octaValidateRemoveError(index)
                                
                            );
            }
                 //required
                if (validations.includes('R') || type == 'required') {
                    validationInfo = "elem.value";
                    validationText = "This field is required!";
                    if(!elem.value) {
                        errors++;
                        octaValidateNewError(index, "This Field is required!");
                        if(elem.addEventListener) {
                            elem.addEventListener("focusout", eventAction);
                        }else if(elem.attachEvent){
                            elem.attachEvent("focusout", eventAction);
                        }
                        
                    }else{continueValidation++;}
                }//required

            //user defined rule
            if(OVCustomRules){
                for(var cv = 0; cv < validations.length; ++cv){
                    if(continueValidation && (Object.keys(OVCustomRules).indexOf(validations[cv]) !== -1)){
                        let ruleIndex = validations[cv];
                        let pattern = OVCustomRules[ruleIndex][0];
                        let text = OVCustomRules[ruleIndex][1];
                        var regExp = new RegExp(pattern);

                        validationInfo = "regExp.test(elem.value)";
                        validationText = text;
                        if(!regExp.test(elem.value)) {
                            errors++;
                            octaValidateNewError(index, text);
                            if(elem.addEventListener) {
                                elem.addEventListener("focusout", eventAction);
                            }else if(elem.attachEvent){
                                elem.attachEvent("focusout", eventAction);
                            }
                            continueValidation = 0;
                        }else{continueValidation++;}
                }//custom
            }
            }
                if(continueValidation && (validations.includes('EMAIL') || type == 'email')){
                    if(!octaValidations.ValidateEmail(elem.value)) {
                        errors++;
                        validationInfo = "octaValidations.ValidateEmail(elem.value)";
                        validationText = "Please provide a Valid Email Address!";
                        octaValidateNewError(index, validationText);
                        if(elem.addEventListener) {
                            elem.addEventListener("focusout", eventAction);
                        }else if(elem.attachEvent){
                            elem.attachEvent("focusout", eventAction);
                        }
                        
                        continueValidation = 0;
                    }else{continueValidation++;}
                }//email

                if(continueValidation && validations.includes('ALPHA_ONLY')){
                    if(!octaValidations.ValidateAlpha_Only(elem.value)) {
                        errors++;
                        validationInfo = "octaValidations.ValidateAlpha_Only(elem.value)";
                        validationText = "Please enter only Alphabets!";
                        octaValidateNewError(index, validationText);
                        if(elem.addEventListener) {
                            elem.addEventListener("focusout", eventAction);
                        }else if(elem.attachEvent){
                            elem.attachEvent("focusout", eventAction);
                        }
                        
                        continueValidation = 0;
                    }else{continueValidation++;}
                }//ALPHABETS + SPACES

                if(continueValidation && validations.includes('ALPHA_SPACES')){
                    if(!octaValidations.ValidateAlpha_Spaces(elem.value)) {
                        errors++;
                        validationInfo = "octaValidations.ValidateAlpha_Spaces(elem.value)";
                        validationText = "Please enter only Alphabets or spaces!";
                        octaValidateNewError(index, validationText);
                        if(elem.addEventListener) {
                            elem.addEventListener("focusout", eventAction);
                        }else if(elem.attachEvent){
                            elem.attachEvent("focusout", eventAction);
                        }
                        
                        continueValidation = 0;
                    }else{continueValidation++;}
                }//ALPHABETS + SPACES

                if(continueValidation && validations.includes('ALPHA_NUMERIC')){
                    if(!octaValidations.ValidateAlpha_Numeric(elem.value)) {
                        errors++;
                        validationInfo = "octaValidations.ValidateAlpha_Numeric(elem.value)";
                        validationText = "Please enter only Alphabets or Numbers!";
                        octaValidateNewError(index, validationText);
                        if(elem.addEventListener) {
                            elem.addEventListener("focusout", eventAction);
                        }else if(elem.attachEvent){
                            elem.attachEvent("focusout", eventAction);
                        }
                        
                        continueValidation = 0;
                    }else{continueValidation++;}
                }//ALPHABETS + NUMBERS

                if(continueValidation && validations.includes('LOWER_ALPHA')){
                    if(!octaValidations.ValidateLower_Alpha(elem.value)) {
                        errors++;
                        validationInfo = "octaValidations.ValidateLower_Alpha(elem.value)";
                        validationText = "Only letters in lowercase are supported!";
                        octaValidateNewError(index, validationText);
                        if(elem.addEventListener) {
                            elem.addEventListener("focusout", eventAction);
                        }else if(elem.attachEvent){
                            elem.attachEvent("focusout", eventAction);
                        }
                        
                        continueValidation = 0;
                    }else{continueValidation++;}
                }//Lowercase letters

                if(continueValidation && validations.includes('UPPER_ALPHA')){
                    if(!octaValidations.ValidateUpper_Alpha(elem.value)) {
                        errors++;
                        validationInfo = "octaValidations.ValidateUpper_Alpha(elem.value)";
                        validationText = "Only letters in uppercase are supported!";
                        octaValidateNewError(index, validationText);
                        if(elem.addEventListener) {
                            elem.addEventListener("focusout", eventAction);
                        }else if(elem.attachEvent){
                            elem.attachEvent("focusout", eventAction);
                        }
                        
                        continueValidation = 0;
                    }else{continueValidation++;}
                }//Uppercase letters

                if(continueValidation && validations.includes('PWD')){
                    if(!octaValidations.ValidatePWD(elem.value)) {
                        errors++;
                        validationInfo = "octaValidations.ValidatePWD(elem.value)";
                        validationText = "Password Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters";
                        octaValidateNewError(index, validationText);
                        if(elem.addEventListener) {
                            elem.addEventListener("focusout", eventAction);
                        }else if(elem.attachEvent){
                            elem.attachEvent("focusout", eventAction);
                        }
                        
                        continueValidation = 0;
                    }else{continueValidation++;}
                }//Uppercase letters

                if(continueValidation && (validations.includes('DIGITS') || type == 'number')){
                    if(isNaN(elem.value)) {
                        errors++;
                        validationInfo = "!isNaN(elem.value)";
                        validationText = "Please provide a valid Number!";
                        octaValidateNewError(index, validationText);
                        if(elem.addEventListener) {
                            elem.addEventListener("focusout", eventAction);
                        }else if(elem.attachEvent){
                            elem.attachEvent("focusout", eventAction);
                        }
                        
                        continueValidation = 0;
                    }else{continueValidation++;}
                }//Numbers
                
                if(continueValidation && (validations.includes('URL') || type == 'url')){
                    if(!octaValidations.ValidateUrl(elem.value)) {
                        errors++;
                        validationInfo = "octaValidations.ValidateUrl(elem.value)";
                        validationText = "Please provide a valid URL that begins with http or https!";
                        octaValidateNewError(index, validationText);
                        if(elem.addEventListener) {
                            elem.addEventListener("focusout", eventAction);
                        }else if(elem.attachEvent){
                            elem.attachEvent("focusout", eventAction);
                        }
                        
                        continueValidation = 0;
                    }else{continueValidation++;}
                }//URL

                if(continueValidation && validations.includes('URL_QP')){
                    if(!octaValidations.ValidateUrl_QP(elem.value)) {
                        errors++;
                        validationInfo = "octaValidations.ValidateUrl_QP(elem.value)";
                        validationText = "Please provide a valid URL with a query parameter.";
                        octaValidateNewError(index, validationText);
                        if(elem.addEventListener) {
                            elem.addEventListener("focusout", eventAction);
                        }else if(elem.attachEvent){
                            elem.attachEvent("focusout", eventAction);
                        }
                        
                        continueValidation = 0;
                    }else{continueValidation++;}
                }//URL with query params

                if(continueValidation && validations.includes('DATE_MDY')){
                    if(!octaValidations.ValidateDate_MDY(elem.value)) {
                        errors++;
                        validationInfo = "octaValidations.ValidateDate_MDY(elem.value)";
                        validationText = "Please provide a date with the format mm/dd/yyyy.";
                        octaValidateNewError(index, validationText);
                        if(elem.addEventListener) {
                            elem.addEventListener("focusout", eventAction);
                        }else if(elem.attachEvent){
                            elem.attachEvent("focusout", eventAction);
                        }
                        
                        continueValidation = 0;
                    }else{continueValidation++;}
                }//date mm/dd/yyyy

                if(continueValidation && validations.includes('USERNAME')){
                    if(!octaValidations.ValidateUserName(elem.value)) {
                        errors++;
                        validationInfo = "octaValidations.ValidateUserName(elem.value)";
                        validationText = "Your username should contain alphanumeric characters only.";
                        octaValidateNewError(index, validationText);
                        if(elem.addEventListener) {
                            elem.addEventListener("focusout", eventAction);
                        }else if(elem.attachEvent){
                            elem.attachEvent("focusout", eventAction);
                        }
                        
                        continueValidation = 0;
                    }else{continueValidation++;}
                }//username
            }
        // end of validate    
        }else{
            return true; //nothing to validate
        }
        if (errors === 0) return(true); //no errors

        return false;
}
//make a global declaration
window.octaValidate = octaValidate;
window.addOVCustomRules = addOVCustomRules;
window.addMoreOVCustomRules = addMoreOVCustomRules;