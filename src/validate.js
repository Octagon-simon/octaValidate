/**
 * OctaValidate main JS V1.1.1
 * author: Simon Ugorji
 * Last Edit : 23rd May 2022
 */
(function(){
    //global Styling
    const ovStyle = document.createElement("style");
    ovStyle.id="octaValidate-global-style";
    ovStyle.innerHTML = `
    .octaValidate-inp-error:not([type="checkbox"]), .octaValidate-inp-error:not([type="radio"]){
        border-color: #e43f5a !important;
    } 
    .octaValidate-inp-success:not([type="checkbox"]), .octaValidate-inp-success:not([type="radio"]){
        border-color: #4caf50 !important;
    }
    .octaValidate-txt-error{
        color : #d10745;
        font-size: 1rem !important;
        font-weight: 400;
        margin: 5px 0px 0px 0px;
    }`;
    document.head.appendChild(ovStyle);
}());

function octaValidate(form_ID, userConfig){
    /**  reference functions **/
    let isObject = (obj) => {
        return(Object.prototype.toString.call(obj) === '[object Object]');
    };
    let findElem = (id) => {
        //argument must be passed by ID
        return(document.querySelector('#'+id) !== null);
    };

    //check if form id is present
    if(typeof form_ID === "undefined") 
        throw new Error("A valid Form Id must be passed as the first Argument during initialization");

    //check if userConfig exists and is passed as an object
    if(typeof userConfig !== "undefined" && !isObject(userConfig))
        throw new Error("Configuration options must be passed as a valid object");

    //store validation variables
    let errors = 0; let continueValidation = 0; let nextValidation = 0;
    
    //store primary validations
    let validate = {};
    //store Attribute validations [length,minlength,maxlength,equalto]
    let validateAttr = {};
    //success callback
    let cbSuccess = null;
    //error callback
    let cbError = null;
    //set form id (not publicly shown)
    let formID = form_ID;
    //store config
    let config = {
        successBorder : false,
        strictMode : false,
    };
    
    //store configuratiion
    if(typeof userConfig !== "undefined"){
        if(userConfig.successBorder !== undefined){
            (userConfig.successBorder == true || userConfig.successBorder == false) ? config.successBorder = userConfig.successBorder : null;
        }
        if(userConfig.strictMode !== undefined){
            (userConfig.strictMode == true || userConfig.strictMode == false) ? config.strictMode = userConfig.strictMode : null;
        }
    }
    //validation library
    let octaValidations = (function(){
            //check email
            function octaValidateEmail(email){
                if(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/.test(email)){
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
                if(/^[a-zA-Z][a-zA-Z0-9-_]+$/.test(uname)){
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
        
            //Validates general text
            function octaValidateTEXT(text){
                if(/^[a-zA-Z0-9\s\,\.\'\"\-\_\)\(\[\]\?\!\&\:\;\/]+$/.test(text)){
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
                ValidatePWD : octaValidatePWD,
                ValidateTEXT : octaValidateTEXT
            }
    }()); 

    //Set form id for public eyes
    this.form = (function(){
        return(formID);
    }());
    
    /* reference functions */
    //insert error
    let ovNewError = (inputID, error) =>{
        //remove previous error
        ovRemoveError(inputID);
        //add error to element
        const g = document.createElement("p");
        g.setAttribute("id", "octaValidate_"+inputID);
        g.setAttribute("class", "octaValidate-txt-error");
        g.innerText = error;

        //set class of input error
        const f = document.querySelector('#'+inputID);
        if(!f.classList.contains('octaValidate-inp-error')){
            f.classList.add("octaValidate-inp-error");
        }
        //append to form .nextSibling
        f.parentNode.appendChild(g, f);
    };
    //remove error
    let ovRemoveError = (inputID) => {
        //remove error text
        let errorElem = (document.querySelector('#octaValidate_'+inputID)) ? 
            document.querySelector('#octaValidate_'+inputID) : null;
        let inputElem = (document.querySelector('#'+inputID)) ? 
            document.querySelector('#'+inputID) : null ;
        //remove classlist
        if(inputElem !== null){
            (inputElem.classList.contains('octaValidate-inp-error')) ? 
                inputElem.classList.remove('octaValidate-inp-error') : null;
        }else{
            throw new Error(`Input ID ${inputID} is missing!`);
        }
        if(errorElem !== null){
            errorElem.remove();
        }
    };
    //insert success class name
    let ovNewSuccess = (inputID) =>{
        //check if user wants a success border
        if(config.successBorder == true){
            //remove previous error
            ovRemoveSuccess(inputID);
            //set class of input error
            const f = document.querySelector('#'+inputID);
            if(!f.classList.contains('octaValidate-inp-success')){
                f.classList.add("octaValidate-inp-success");
            }
        }
    };
    //remove success class name
    let ovRemoveSuccess = (inputID) => {
        let inputElem = (document.querySelector('#'+inputID)) ? 
            document.querySelector('#'+inputID) : null ;
        //check if user wants a success border
        if(config.successBorder == true){
            //remove classlist
            if(inputElem !== null){
                (inputElem.classList.contains('octaValidate-inp-success')) ? 
                    inputElem.classList.remove('octaValidate-inp-success') : null;
            }else{
                throw new Error(`Input ID ${inputID} is missing!`);
            }
        }
    };

    //build validation rules
    (function(form_id){
        //get all primary validations from the octavalidate attribute
        const ovPrimaryValidations = document.querySelectorAll(`#${form_id} [octavalidate]`);
        //get all minlengths
        const ovMinLengths = document.querySelectorAll(`#${form_id} [minlength]`);
        //get all maxlengths
        const ovMaxLengths = document.querySelectorAll(`#${form_id} [maxlength]`);
        //get all lengths
        const ovLengths = document.querySelectorAll(`#${form_id} [length]`);
        //get all equal to
        const ovEqualTo = document.querySelectorAll(`#${form_id} [equalto]`);

        //collect primary validations [octavalidate] attribute
        if(ovPrimaryValidations){
            let myv = 0; 

            while(myv < ovPrimaryValidations.length){
                //get id
                let id = (ovPrimaryValidations[myv].getAttribute("id"))? ovPrimaryValidations[myv].getAttribute("id") : null;
                //get attr
                let attr = (ovPrimaryValidations[myv].getAttribute("octavalidate")) ? ovPrimaryValidations[myv].getAttribute("octavalidate") : null;
                //get type
                let type= (ovPrimaryValidations[myv].getAttribute("type")) ? ovPrimaryValidations[myv].getAttribute("type") : null;
                //exit if attribute existts but id is null
                if(!id){
                    throw new Error(`One or more fields in ${f} is missing an Identifier`)
                }
                //build only when there's octaValidate attribute present
                if(Object.keys(validate).length !== ovPrimaryValidations.length)
                    validate[id] = [type, attr];
                //increment
                ++myv;
            }
        }

        //collect minlength validations
        if(ovMinLengths){
            let lv = 0;

            while(lv < ovMinLengths.length){
                let length = ovMinLengths[lv].getAttribute(`${f} minlength`);
                let id = ovMinLengths[lv].id;

                validateAttr[id] = ['MINLENGTH', length];
                ++lv;
            }
        }

        //collect all maxlength inputs
        if(ovMaxLengths){
            let lv = 0; 
            while(lv < ovMaxLengths.length){
                let length = ovMaxLengths[lv].getAttribute("maxlength");
                let id = ovMaxLengths[lv].id;

                validateAttr[id] = ['MAXLENGTH', length];
                ++lv;
            }
        }

        //collect all length inputs
        if(ovLengths){
            let lv = 0; 

            while(lv < ovLengths.length){
                let length = ovLengths[lv].getAttribute("length");
                let id = ovLengths[lv].id;
                validateAttr[id] = ['LENGTH', length];
                ++lv;
            }
        }

        //check for equal to
        if(ovEqualTo){
            let eqv = 0; //disabled validators :)

            while(eqv < ovEqualTo.length){
                let id = ovEqualTo[eqv].id;
                let val = document.querySelector('#'+id).getAttribute('equalto');
                validateAttr[id] = ['EQUALTO', val];
                ++eqv;
            }
        }
    }(formID)); //end of build validation rules
    
    //custom rules
    let customRules = [];
    //add single rule
    this.customRule = function (rule_title, regExp, text) {
        return(customRules[rule_title] = [regExp, text]);
    };
    //add multiple rules
    this.moreCustomRules = function(rules){
        if(!isObject(rules)) throw new Error("Argument must be an Object");

        let r = 0;

        while(r < Object.keys(rules).length){
            const rule_title = Object.keys(rules)[r]; //get index
            const regExp = rules[index][0]; //get Regexpression
            const text = rules[index][1].toString(); //get validation message
            
            if(rule_title && regExp && text) 
                customRules[rule_title] = [regExp, text] 
            else 
                throw new Error(`Validation rule at index ${r} is Invalid!`);

            ++r;
        }
    };
    
    //form validation callback [still in development mode]
    this.validateCallBack = function(success, error){
        if(typeof success === "function"){
            cbSuccess = success;
        }
        if(typeof error === "function"){
            cbError = error;
        }
    };

    //validate form
    this.validate = function(){
        //return validation status
        this.status = (function(){
            return(errors);
        }).bind(octaValidate);

        const form_id = formID;

        //check if form id exists in DOM
        if(!findElem(form_id)) throw new Error(`Form Element ${form_id} does not Exists in DOM`);
        //Begin validation and return result
        return(function validateForm(){
            //reset errors count anytime function is called
            errors = continueValidation = nextValidation = 0;
            elem = null;
            if(validate !== null ||
                    validateAttr !== null){
                //loop through all form elements with an ID attached to it
                let formInputs = document.querySelectorAll(`#${form_id} [octavalidate], [length], [maxlength], [minlength], [equalto]`);
                formInputs.forEach(input => {
                    //check if id exists within the element
                    if(input.id !== ""){
                        //errors is unique to the input id
                        let formInputId = input.id;
                        /* strict mode */
                        //check if strict mode is enabled
                        if(config.strictMode === true){
                            /* always reset the vcounters */
                            nextValidation = continueValidation = 0;
                            let index = formInputId;
                            let validationText; 
                            let elem = (document.querySelector('#'+formInputId)) ? document.querySelector('#'+formInputId) : null;
                        
                            if(elem === null){
                                throw new Error(`Input ID ${formInputId} is missing`);
                            }
                            //remove whitespace from start and end
                            elem.value = elem.value.trim();
                            if((elem.value !== "") && (elem.value == "null" || elem.value == "undefined" || elem.value == "NaN")){
                                errors++;
                                validationText = (elem.getAttribute('ov-strict:msg')) ? elem.getAttribute('ov-strict:msg').toString() : "The value you provided is not allowed";
                                ovRemoveSuccess(index);
                                ovNewError(index, validationText);
                                if(elem.addEventListener) {
                                    elem.addEventListener("change",  
                                        function(){
                                        if(this.value && (this.value == "null" || this.value == "undefined" || this.value == "NaN")){
                                            errors++;
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                        }else{
                                            errors--;
                                            ovRemoveError(index);
                                            ovNewSuccess(index);
                                        }
                                        validateForm();
                                    });
                                }else if(elem.attachEvent){
                                    elem.attachEvent("change", function(){
                                    if(elem.value === "null" || elem.value === "undefined" || elem.value === "NaN"){
                                        errors++;
                                        ovRemoveSuccess(index);
                                        ovNewError(index, validationText);
                                    }else{
                                        errors--;
                                        ovRemoveError(index);
                                        ovNewSuccess(index);
                                    }
                                    validateForm();
                                    });
                                }
                            }else{
                                nextValidation++;
                            }
                            if(errors === 0){
                                nextValidation++;
                            }
                        }else{
                            nextValidation++;
                        }
                        
                    //primary validation rules
                    if(validate[formInputId] !== undefined){
                        if(nextValidation){
                            let index = formInputId;
                            let type = validate[index][0];
                            let validations = validate[index][1].split(',');
                            continueValidation = 0;
                            nextValidation = 0;
                            let validationInfo;
                            let validationText; //store user's custom message to display on validation failure
                            let elem = (document.querySelector('#'+index)) ? 
                                document.querySelector('#'+index) : null;
                            
                            if(elem === null){
                                throw new Error(`Input ID ${index} is missing`);
                            }
    
                            //create event listener
                            let eventAction = () => {
                                if(type !== "radio" && type !== "checkbox"){
                                    if(elem.value){
                                        if(eval(validationInfo) === false) {
                                            errors++;
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                        }else{
                                            errors--;
                                            ovRemoveError(index);
                                            ovNewSuccess(index);
                                        }
                                    }else{
                                        ovRemoveError(index);
                                        ovNewSuccess(index);
                                    }
                                }else{
                                    if(eval(validationInfo) === false) {
                                        errors++;
                                        ovRemoveSuccess(index);
                                        ovNewError(index, validationText);
                                    }else{
                                        errors--;
                                        ovRemoveError(index);
                                        ovNewSuccess(index);
                                    }
                                }
                                validateForm();
                            }
                            //loop through validations
                            validations.forEach(item =>{
                            //required
                            if(item === 'R' || (elem.getAttribute('required') !== null)) {
                                validationText = (elem.getAttribute('ov-required:msg')) ? elem.getAttribute('ov-required:msg').toString() : "This field is required";
                                if(!elem.value || elem.value.trim() == "") {
                                errors++;
                                ovRemoveSuccess(index);
                                ovNewError(index, validationText);
                                if(elem.addEventListener) {
                                    elem.addEventListener("change",  function(){
                                        if(this.value.trim() == ""){
                                            errors++;
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                        }else{
                                            errors--;
                                            ovRemoveError(index);
                                            ovNewSuccess(index);
                                        }
                                        validateForm();
                                    });
                                }else if(elem.attachEvent){
                                    elem.attachEvent("change", function(){
                                        //make it inline
                                        if(this.value.trim() == ""){
                                            errors++;
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                        }else{
                                            errors--;
                                            ovRemoveError(index);
                                            ovNewSuccess(index);
                                        }
                                        validateForm();
                                    });
                            }
                                }else{continueValidation++;}
                            }else{
                                continueValidation++;
                            }//required
    
                            //handle custom validaton rules
                            if(elem.value && (Object.keys(customRules).length !== 0) && continueValidation){
                                //loop through custom validation rule
                                if(customRules[item] !== undefined){
                                    let pattern = customRules[item][0];
                                    let errText = customRules[item][1];
                                    let regExp = new RegExp(pattern);
                                    if(regExp.test(elem.value) === false) {
                                        errors++;
                                        validationInfo = `${regExp.test(elem.value) === false}`;
                                        validationText = errText.toString();
                                        ovRemoveSuccess(index);
                                        ovNewError(index, errText);
                                        if(elem.addEventListener) {
                                            elem.addEventListener("change", eventAction);
                                        }else if(elem.attachEvent){
                                            elem.attachEvent("change", eventAction);
                                        } 
                                        continueValidation = 0;
                                    }else{continueValidation++;}
                                }else{
                                    continueValidation++;
                                }
                            }else{
                                continueValidation++;
                            }//end of custom validaton rules
    
                            if(elem.value && continueValidation && (item ==='EMAIL' || type == 'email')){
                                if(octaValidations.ValidateEmail(elem.value) === false) {
                                    continueValidation = 0;
                                    errors++;
                                    validationInfo = `${octaValidations.ValidateEmail(elem.value) === false}`;
                                    validationText = (elem.getAttribute('ov-email:msg')) ? elem.getAttribute('ov-email:msg').toString() : "Please provide a valid email address";
                                    ovRemoveSuccess(index);
                                    ovNewError(index, validationText);
                                    if(elem.addEventListener) {
                                        elem.addEventListener("change", eventAction);
                                    }else if(elem.attachEvent){
                                        elem.attachEvent("change", eventAction);
                                    }
                                }else{
                                    continueValidation++;
                                }
                            }else{
                                continueValidation++;
                            }//email
    
                            if(elem.value && continueValidation && item === 'ALPHA_ONLY'){
                                if(!octaValidations.ValidateAlpha_Only(elem.value)) {
                                    errors++;
                                    validationInfo = "octaValidations.ValidateAlpha_Only(elem.value)";
                                    validationText = (elem.getAttribute('ov-alpha-only:msg:')) ? elem.getAttribute('ov-alpha-only:msg:').toString() : "Please enter only Alphabets!";
                                    ovRemoveSuccess(index);
                                    ovNewError(index, validationText);
                                    if(elem.addEventListener) {
                                        elem.addEventListener("change", eventAction);
                                    }else if(elem.attachEvent){
                                        elem.attachEvent("change", eventAction);
                                    }
                                    continueValidation = 0;
                                }else{continueValidation++;}
                            }else{
                                continueValidation++;
                            }//ALPHABETS + SPACES
    
                            if(elem.value && continueValidation && item === 'ALPHA_SPACES'){
                                if(!octaValidations.ValidateAlpha_Spaces(elem.value)) {
                                    errors++;
                                    validationInfo = "octaValidations.ValidateAlpha_Spaces(elem.value)";
                                    validationText = (elem.getAttribute('ov-alpha-spaces:msg')) ? elem.getAttribute('ov-alpha-spaces:msg').toString() : "Please enter only Alphabets or spaces!";
                                    ovRemoveSuccess(index);
                                    ovNewError(index, validationText);
                                    if(elem.addEventListener) {
                                        elem.addEventListener("change", eventAction);
                                    }else if(elem.attachEvent){
                                        elem.attachEvent("change", eventAction);
                                    }
    
                                    continueValidation = 0;
                                }else{continueValidation++;}
                            }else{
                                continueValidation++;
                            }//ALPHABETS + SPACES
    
                            if(elem.value && continueValidation && item === 'ALPHA_NUMERIC'){
                                if(!octaValidations.ValidateAlpha_Numeric(elem.value)) {
                                    errors++;
                                    validationInfo = "octaValidations.ValidateAlpha_Numeric(elem.value)";
                                    validationText = (elem.getAttribute('ov-alpha-numeric:msg')) ? elem.getAttribute('ov-alpha-numeric:msg').toString() : "Please enter only Alphabets or Numbers!";
                                    ovRemoveSuccess(index);
                                    ovNewError(index, validationText);
                                    if(elem.addEventListener) {
                                        elem.addEventListener("change", eventAction);
                                    }else if(elem.attachEvent){
                                        elem.attachEvent("change", eventAction);
                                    }
                            
                                    continueValidation = 0;
                                }else{continueValidation++;}
                            }else{
                                continueValidation++;
                            }//ALPHABETS + NUMBERS
    
                            if(elem.value && continueValidation && item === 'LOWER_ALPHA'){
                                if(!octaValidations.ValidateLower_Alpha(elem.value)) {
                                    errors++;
                                    validationInfo = "octaValidations.ValidateLower_Alpha(elem.value)";
                                    validationText = (elem.getAttribute('ov-lower-alpha:msg')) ? elem.getAttribute('ov-lower-alpha:msg').toString() : "Only letters in lowercase are supported!";
                                    ovRemoveSuccess(index);
                                    ovNewError(index, validationText);
                                    if(elem.addEventListener) {
                                        elem.addEventListener("change", eventAction);
                                    }else if(elem.attachEvent){
                                        elem.attachEvent("change", eventAction);
                                    }
                                    continueValidation = 0;
                                }else{continueValidation++;}
                            }else{
                                continueValidation++;
                            }//Lowercase letters
    
                            if(elem.value && continueValidation && item === 'UPPER_ALPHA'){
                                if(!octaValidations.ValidateUpper_Alpha(elem.value)) {
                                    errors++;
                                    validationInfo = "octaValidations.ValidateUpper_Alpha(elem.value)";
                                    validationText = (elem.getAttribute('ov-upper-alpha:msg')) ? elem.getAttribute('ov-upper-alpha:msg').toString() : "Only letters in uppercase are supported!";
                                    ovRemoveSuccess(index);
                                    ovRemoveSuccess(index);
                                    ovNewError(index, validationText);
                                    if(elem.addEventListener) {
                                        elem.addEventListener("change", eventAction);
                                    }else if(elem.attachEvent){
                                        elem.attachEvent("change", eventAction);
                                    }
    
                                    continueValidation = 0;
                                }else{continueValidation++;}
                            }else{
                                continueValidation++;
                            }//Uppercase letters
    
                            if(elem.value && continueValidation && item === 'PWD'){
                                if(!octaValidations.ValidatePWD(elem.value)) {
                                    errors++;
                                    validationInfo = "octaValidations.ValidatePWD(elem.value)";
                                    validationText = (elem.getAttribute('ov-pwd:msg')) ? elem.getAttribute('ov-pwd:msg').toString() : "Password Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters";
                                    ovRemoveSuccess(index);
                                    ovNewError(index, validationText);
                                    if(elem.addEventListener) {
                                        elem.addEventListener("change", eventAction);
                                    }else if(elem.attachEvent){
                                        elem.attachEvent("change", eventAction);
                                    }
                            
                                    continueValidation = 0;
                                }else{continueValidation++;}
                            }else{
                                continueValidation++;
                            }//Uppercase letters
    
                            if(elem.value && continueValidation && (item === 'DIGITS' || type == 'number')){
                                if(isNaN(elem.value)) {
                                    errors++;
                                    validationInfo = "!isNaN(elem.value)";
                                    validationText = (elem.getAttribute('ov-digits:msg')) ? 
                                        elem.getAttribute('ov-digits:msg').toString() : 
                                            "Please provide a valid Number!";
                                    ovRemoveSuccess(index);
                                    ovNewError(index, validationText);
                                    if(elem.addEventListener) {
                                        elem.addEventListener("change", eventAction);
                                    }else if(elem.attachEvent){
                                        elem.attachEvent("change", eventAction);
                                    }
                                    
                                    continueValidation = 0;
                                }else{continueValidation++;}
                            }else{
                                continueValidation++;
                            }//Numbers
                    
                            if(elem.value && continueValidation && (item === 'URL' || type == 'url')){
                                if(!octaValidations.ValidateUrl(elem.value)) {
                                    errors++;
                                    validationInfo = "octaValidations.ValidateUrl(elem.value)";
                                    validationText = (elem.getAttribute('ov-url:msg')) ? elem.getAttribute('ov-url:msg').toString() : "Please provide a valid URL that begins with http or https!";
                                    ovRemoveSuccess(index);
                                    ovNewError(index, validationText);
                                    if(elem.addEventListener) {
                                        elem.addEventListener("change", eventAction);
                                    }else if(elem.attachEvent){
                                        elem.attachEvent("change", eventAction);
                                    }
    
                                    continueValidation = 0;
                                }else{continueValidation++;}
                            }else{
                                continueValidation++;
                            }//URL
    
                            if(elem.value && continueValidation && item === 'URL_QP'){
                                if(!octaValidations.ValidateUrl_QP(elem.value)) {
                                    errors++;
                                    validationInfo = "octaValidations.ValidateUrl_QP(elem.value)";
                                    validationText = (elem.getAttribute('ov-url-qp:msg')) ? elem.getAttribute('ov-url-qp:msg').toString() : "Please provide a valid URL with a query parameter.";
                                    ovRemoveSuccess(index);
                                    ovNewError(index, validationText);
                                    if(elem.addEventListener) {
                                        elem.addEventListener("change", eventAction);
                                    }else if(elem.attachEvent){
                                        elem.attachEvent("change", eventAction);
                                    }
    
                                    continueValidation = 0;
                                }else{continueValidation++;}
                            }else{
                                continueValidation++;
                            }//URL with query params
    
                            if(elem.value && continueValidation && item === 'DATE_MDY'){
                                if(!octaValidations.ValidateDate_MDY(elem.value)) {
                                    errors++;
                                    validationInfo = "octaValidations.ValidateDate_MDY(elem.value)";
                                    validationText = (elem.getAttribute('ov-date-mdy:msg')) ? elem.getAttribute('ov-date-mdy:msg').toString() : "Please provide a date with the format mm/dd/yyyy.";
                                    ovRemoveSuccess(index);
                                    ovNewError(index, validationText);
                                    if(elem.addEventListener) {
                                        elem.addEventListener("change", eventAction);
                                    }else if(elem.attachEvent){
                                        elem.attachEvent("change", eventAction);
                                    }
    
                                    continueValidation = 0;
                                }else{continueValidation++;}
                            }else{
                                continueValidation++;
                            }//date mm/dd/yyyy
    
                            if(elem.value && continueValidation && item === 'USERNAME'){
                                if(!octaValidations.ValidateUserName(elem.value)) {
                                    errors++;
                                    validationInfo = "octaValidations.ValidateUserName(elem.value)";
                                    validationText = (elem.getAttribute('ov-username:msg')) ? elem.getAttribute('ov-username:msg').toString() : "Your username should contain alphanumeric characters only.";
                                    ovRemoveSuccess(index);
                                    ovNewError(index, validationText);
                                    if(elem.addEventListener) {
                                        elem.addEventListener("change", eventAction);
                                    }else if(elem.attachEvent){
                                        elem.attachEvent("change", eventAction);
                                    }
                                    continueValidation = 0;
                                }else{continueValidation++;}
                            }else{
                                continueValidation++;
                            }//username
    
                            if(elem.value && continueValidation && item === 'TEXT'){
                                if(!octaValidations.ValidateTEXT(elem.value)) {
                                    errors++;
                                    validationInfo = "octaValidations.ValidateTEXT(elem.value)";
                                    validationText = (elem.getAttribute('ov-text:msg')) ? 
                                    elem.getAttribute('ov-text:msg').toString() : 
                                    "This field contains invalid characters.";
                                    ovRemoveSuccess(index);
                                    ovNewError(index, validationText);
                                    if(elem.addEventListener) {
                                        elem.addEventListener("change", eventAction);
                                    }else if(elem.attachEvent){
                                        elem.attachEvent("change", eventAction);
                                    }
                                    continueValidation = 0;
                                }else{continueValidation++;}
                            }else{
                                continueValidation++;
                            }//text validation
    
                            if(continueValidation && item === 'CHECK' && 
                                ((type == 'checkbox') || (type == 'radio'))){
                                if(elem.checked === false) {
                                    errors++;
                                    validationInfo = "elem.checked";
                                    validationText = (elem.getAttribute("ov-check:msg")) ? elem.getAttribute("ov-check:msg").toString() : 'This checkbox is required';
                                    ovRemoveSuccess(index);
                                    ovNewError(index, validationText);
                                    if(elem.addEventListener) {
                                        elem.addEventListener("change", eventAction);
                                    }else if(elem.attachEvent){
                                        elem.attachEvent("change", eventAction);
                                    }
                                    continueValidation = 0;
                                }else{
                                    ovRemoveError(index);
                                    continueValidation++;}
                            }else{
                                continueValidation++;
                            }//check box validation
                            
                            }) //end of foreach loop on validations
                        }
                        //do next validation if this input element has no primary validation errors
                        if(errors === 0){
                            nextValidation++;
                        }
                    }else{
                        nextValidation++;
                    }//end of if id exists

                    //Attribute validations
                    if(validateAttr[formInputId] !== undefined){
                        if(nextValidation){
                            continueValidation = 0;
                            nextValidation = 0;
                            let index = formInputId;
                            let attr = validateAttr[index][0]; //attribute
                            let val = validateAttr[index][1]; //value specified
                            let validationInfo;
                            let validationText;
                            let EqualToElem; //for equal to
                            let elem = (document.querySelector('#'+index)) ? document.querySelector('#'+index) : null;
                            if(elem === null){
                                throw new Error(`Input ID ${index} is missing`);
                            };
                            let attributesEventAction = () => {
                                if(elem.value){
                                    if(eval(validationInfo) === false) {
                                        errors++;
                                        ovRemoveSuccess(index);
                                        ovNewError(index, validationText);
                                    }else {
                                        errors--;
                                        ovRemoveError(index);
                                        ovNewSuccess(index);
                                    }
                                }else{
                                    ovRemoveError(index);
                                    ovNewSuccess(index);
                                }
                                validateForm();
                            };
            
                            if(attr === 'MINLENGTH'){
                                if(elem.value.length < Number(val)) {
                                    errors++;
                                    validationInfo = "elem.value.length < val";
                                    validationText = (elem.getAttribute("ov-minlength:msg")) ? (elem.getAttribute("ov-minlength:msg")) : "Please provide "+val+" or more characters";
                                    ovRemoveSuccess(index);
                                    ovNewError(index, validationText);
                                    if(elem.addEventListener) {
                                        elem.addEventListener("change", attributesEventAction);
                                    }else if(elem.attachEvent){
                                        elem.attachEvent("change", attributesEventAction);
                                    }
                                    continueValidation = 0;
                                }else{
                                    continueValidation++;
                                }
                            }else{
                                continueValidation++;
                            }//minlength
            
                            if(attr === 'MAXLENGTH' && continueValidation){
                                if(elem.value.length > Number(val)) {
                                    errors++;
            
                                    validationInfo = "elem.value.length > val";
                                    validationText = (elem.getAttribute("ov-maxlength:msg"))? (elem.getAttribute("ov-maxlength:msg")) : "Please provide "+val+" characters or less.";
                                    ovRemoveSuccess(index);
                                    ovNewError(index, validationText);
                                    if(elem.addEventListener) {
                                        elem.addEventListener("change", attributesEventAction);
                                    }else if(elem.attachEvent){
                                        elem.attachEvent("change", attributesEventAction);
                                    }
                                    
                                    continueValidation = 0;
                                }else{
                                    continueValidation++;
                                }
                            }else{
                                continueValidation++;
                            }//maxlength
            
                            if(attr === 'LENGTH' && continueValidation){
                                if(elem.value.length !== Number(val)) {
                                    errors++;
                                    validationInfo = `${elem.value.length !== Number(val)}`;
                                    validationText = (elem.getAttribute("ov-length:msg")) ? (elem.getAttribute("ov-length:msg")) : "Please provide exactly "+val+" characters";
                                    ovRemoveSuccess(index);
                                    ovNewError(index, validationText);
                                    if(elem.addEventListener) {
                                        elem.addEventListener("change", attributesEventAction);
                                    }else if(elem.attachEvent){
                                        elem.attachEvent("change", attributesEventAction);
                                    }
            
                                    continueValidation = 0;
                                }else{
                                    continueValidation++;
                                }
                            }else{
                                continueValidation++;
                            }//length
    
                            if(attr === 'EQUALTO'  && continueValidation){
                                EqualToElem = document.querySelector('#'+val);
                                validationText = (elem.getAttribute('ov-equalto:msg')) ? elem.getAttribute('ov-equalto:msg').toString() : 'Both values do not match';
                                if(EqualToElem.value.trim() !== "" && 
                                    (elem.value !== EqualToElem.value)) {
                                    errors++;
                                    validationInfo = "elem.value === EqualToElem.value";
                                    ovRemoveSuccess(index);
                                    ovNewError(index, validationText);
                                    if(elem.addEventListener) {
                                        elem.addEventListener("change", attributesEventAction);
                                    }else if(elem.attachEvent){
                                        elem.attachEvent("change", attributesEventAction);
                                    }
                                    continueValidation = 0;
                                }else{
                                    ovRemoveError(index);
                                }
                            }else{
                                continueValidation++;
                            }
                        }
                        //do next validation if this input element has no attribute validation errors
                        if(errors === 0){
                            nextValidation++;
                        }
                    }else{
                        nextValidation++;
                    }//end of if id exists
                    }//end of check if id is provided
                }); //end of foreach loop
                }//end of checkif validations exist
                if(errors === 0){
                    //check if success callback is defined
                    if(cbSuccess !== null){
                        (function(){
                            cbSuccess();
                        }());
                    }
                    return true;
                }else{
                    //check if error callback is defined
                    if(cbError !== null){
                        (function(){
                            cbError();
                        }());
                    }
                    return false;
                }
        }());
    };
    //version info
    this.version = (function(){
        return(1.1);
    }());
}