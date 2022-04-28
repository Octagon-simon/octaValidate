/**
 * OctaValidate main JS V1.0.4
 * author: Simon Ugorji
 * Last Edit : 28th April 2022
 */
import lib from './validate_lib.js';
//force it to be accessible by binding it to a variable
var octaValidations = lib; 

//global Styling
let style = document.createElement("style");
style.id="octaValidate-global-style";
style.innerHTML = `
.octaValidate-inp-error:not([type="checkbox"]){
    border-color: #e64a61 !important;
}
.octaValidate-txt-error{
    color : #e64a61;
    font-size: 17px;
    font-weight: 400;
    margin: 5px 0px 0px 0px;
}`;
document.head.appendChild(style);

    //custom rules
    var OVCustomRules = [];
    function addOVCustomRules(rule, exp, text){
        OVCustomRules[rule] = [exp, text];
    }

    function addMoreOVCustomRules(rules){
        let r = 0;

        while(r < Object.keys(rules).length){
            var index = Object.keys(rules)[r]; //get index
            var exp = rules[index][0]; //get Regexpression
            var text = rules[index][1].toString(); //get validation message
            
            (index && exp && text) ?
            addOVCustomRules(index,exp, text) : null;

            ++r;
        }
    }

    //store primary validations
    var validate = {};
    //store length validations
    var validateLength = {};
    //store Attribute validations
    var validateAttr = {};
    //build validations
    (function(){
        //get all octavalidate attribute
        var octaValidators = document.querySelectorAll('[octavalidate]');
        //get all minlengths
        var octaMinLengths = document.querySelectorAll('[minlength]');
        //get all maxlengths
        var octaMaxLengths = document.querySelectorAll('[maxlength]');
        //get all lengths
        var octaLengths = document.querySelectorAll('[length]');
        //get all equal to
        var octaEqualTo = document.querySelectorAll('[equalto]');

        //collect and loop through octavalidate attribute
        if(octaValidators){
            let myv = 0; //octavalidate attribute :)

            while(myv < octaValidators.length){
                //get id
                let id = (octaValidators[myv].getAttribute("id"))?octaValidators[myv].getAttribute("id") : null;
                //get attr
                let attr = (octaValidators[myv].getAttribute("octavalidate")) ? octaValidators[myv].getAttribute("octavalidate") : null;
                //get type
                let type= (octaValidators[myv].getAttribute("type")) ? octaValidators[myv].getAttribute("type") : null;
                //exit if attribute existts but id is null
                if(!id){
                    return false;
                }
                //build only when there's octaValidate attribute present
                if(Object.keys(validate).length !== octaValidators.length) {validate[id] = [type, attr]};
                ++myv;
            }
        }

        //collect all minlength inputs
        if(octaMinLengths){
            let lv = 0; //length validators :)

            while(lv < octaMinLengths.length){
                let length = octaMinLengths[lv].getAttribute("minlength");
                let id = octaMinLengths[lv].id;
                let elem = document.querySelector('#'+id);

                validateLength[id] = ['MINLENGTH', length];
                ++lv;
            }
        }

        //collect all maxlength inputs
        if(octaMaxLengths){
            let lv = 0; //length validators :)

            while(lv < octaMaxLengths.length){
                let length = octaMaxLengths[lv].getAttribute("maxlength");
                let id = octaMaxLengths[lv].id;
                let elem = document.querySelector('#'+id);

                validateLength[id] = ['MAXLENGTH', length];
                ++lv;
            }
        }

        //collect all length inputs
        if(octaLengths){
            let lv = 0; //length validators :)

            while(lv < octaLengths.length){
                let length = octaLengths[lv].getAttribute("length");
                let id = octaLengths[lv].id;
                let elem = document.querySelector('#'+id);
                validateLength[id] = ['LENGTH', length];
                ++lv;
            }
        }

        //check for equal to
        if(octaEqualTo){
            let eqv = 0; //disabled validators :)

            while(eqv < octaEqualTo.length){
                let id = octaEqualTo[eqv].id;
                let elem = document.querySelector('#'+id);
                let val = elem.getAttribute('equalto');
                validateAttr[id] = ['EQUALTO', val];
                ++eqv;
            }
        }
    })();

function octaValidate(form){
    let form_id;
    //check if form id is passed as dom element
    if(form instanceof Element){
        form_id = form.id;
    }else{
        //form id is passed as string
        form_id = form;
    }
    let errors = 0;
    let nextValidation = 0;
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
        if(!f.classList.contains('octaValidate-inp-error')){
            f.classList.add("octaValidate-inp-error");
        }
        //append to form .nextSibling
        f.parentNode.appendChild(g, f);
    }
    //remove error
    function octaValidateRemoveError(inputID){
        //remove error text
        let errorElem = (document.querySelector('#octaValidate_'+inputID)) ? document.querySelector('#octaValidate_'+inputID) : null;
        let inputElem = (document.querySelector('#'+inputID)) ? document.querySelector('#'+inputID) : null ;
        //remove classlist
        if(inputElem !== null){
            (inputElem.classList.contains('octaValidate-inp-error')) ? 
            inputElem.classList.remove('octaValidate-inp-error') : '';
        }else{
            console.log("%cInput ID ( "+ inputID+" ) is missing!", "color:#ff0000");
            return false;
        }
        if(errorElem !== null){
            //console.log('removing '+errorElem);
            errorElem.remove();
        }
    }

    if(validate){
        //handle max size in coming update, 
        let fly = 0; //from the song One day I'm gonna fly away by Unknown  :)
        while(fly < Object.keys(validate).length){
            let fly_id = Object.keys(validate)[fly]; //check the input ID that flew away.
            if (!document.querySelector("#"+fly_id)){
                console.log("%cInput ID ( "+ fly_id+" ) is missing!", "color:#ff0000");
                return false;
            }
            ++fly;
        }
        //loop through all form elements with an ID attached to it
        let formInputs = document.querySelectorAll('#'+form_id+' [id]');
        formInputs.forEach(input => {
            let formInputId = input.id;
            //check if id exists in our validation variable
            if(validate[formInputId]){
                let index =  formInputId;
                let type =validate[index][0];
                let validations = validate[index][1].split(',');
                let continueValidation = 0;
                let validationInfo;
                let validationText; //store user's custom message to display on validation failure
                let elem = (document.querySelector('#'+index)) ? document.querySelector('#'+index) : null;
                //console.log(elem);
                if(elem === null){
                    console.log("%cInput ID ( "+ index +" ) is missing!", "color:#ff0000");
                    return false;
                }

                //create event listener
                function eventAction(){
                    //elem is needed as an argument because the validation will contain a reference to the  HTML element
                    if(elem.value){
                        if(eval(validationInfo) === false) {
                            octaValidateNewError(index, validationText);
                        }else{
                            errors--,
                            octaValidateRemoveError(index);
                        }
                    }else{
                        //remove the error when the value is empty
                        octaValidateRemoveError(index);
                    }
                }

                //loop through validations
                validations.forEach(item =>{
                //required
                if(item === 'R' || type == 'required') {
                    validationText = (elem.getAttribute('ov-required:msg')) ? elem.getAttribute('ov-required:msg').toString() : "This field is required!";
                    if(!elem.value || elem.value.trim() == "") {
                        errors++;
                        octaValidateNewError(index, validationText);
                        if(elem.addEventListener) {
                            elem.addEventListener("change", function(){
                                //make it inline
                                if(this.value.trim() == ""){
                                    octaValidateNewError(index, validationText);
                                }else{
                                    errors--;
                                    octaValidateRemoveError(index);
                                }
                            });
                        }else if(elem.attachEvent){
                            elem.attachEvent("change", function(){
                                //make it inline
                                if(this.value.trim() == ""){
                                    octaValidateNewError(index, validationText);
                                }else{
                                    errors--;
                                    octaValidateRemoveError(index);
                                }
                            });
                        }
                        
                    }else{continueValidation++;}
                }else{
                    continueValidation++;
                }//required

                //user defined rule - custom validaton rules
                if(elem.value && OVCustomRules && continueValidation){
                    for(var cv = 0; cv < validations.length; ++cv){
                        if(continueValidation && (Object.keys(OVCustomRules).indexOf(validations[cv]) !== -1)){
                        let ruleIndex = validations[cv];
                        let pattern = OVCustomRules[ruleIndex][0];
                        let text = OVCustomRules[ruleIndex][1];
                        var regExp = new RegExp(pattern);

                        validationInfo = "regExp.test(elem.value)";
                        validationText = text.toString();
                        if(!regExp.test(elem.value)) {
                            errors++;
                            octaValidateNewError(index, text);
                            if(elem.addEventListener) {
                                elem.addEventListener("change", eventAction);
                            }else if(elem.attachEvent){
                                elem.attachEvent("change", eventAction);
                            }
                            continueValidation = 0;
                        }else{continueValidation++;}
                        }//custom
                    }
                }

                if(elem.value && continueValidation && (item ==='EMAIL' || type == 'email')){
                    if(!octaValidations.ValidateEmail(elem.value)) {
                        errors++;
                        validationInfo = "octaValidations.ValidateEmail(elem.value)";
                        validationText = (elem.getAttribute('ov-email:msg')) ? elem.getAttribute('ov-email:msg').toString() : "Please provide a Valid Email Address!";
                        octaValidateNewError(index, validationText);
                        if(elem.addEventListener) {
                            elem.addEventListener("change", eventAction);
                        }else if(elem.attachEvent){
                            elem.attachEvent("change", eventAction);
                        }
                        continueValidation = 0;
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
                        octaValidateNewError(index, validationText);
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
                        octaValidateNewError(index, validationText);
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
                        octaValidateNewError(index, validationText);
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
                        octaValidateNewError(index, validationText);
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
                        octaValidateNewError(index, validationText);
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
                        octaValidateNewError(index, validationText);
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
                        validationText = (elem.getAttribute('ov-digits:msg')) ? elem.getAttribute('ov-digits:msg').toString() : "Please provide a valid Number!";
                        octaValidateNewError(index, validationText);
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
                        octaValidateNewError(index, validationText);
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
                        octaValidateNewError(index, validationText);
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
                        octaValidateNewError(index, validationText);
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
                        octaValidateNewError(index, validationText);
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
                        validationText = (elem.getAttribute('ov-text:msg')) ? elem.getAttribute('ov-text:msg').toString() : "This field contains invalid characters.";
                        octaValidateNewError(index, validationText);
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
                        octaValidateNewError(index, validationText);
                        if(elem.addEventListener) {
                            //use onchange because its a checkbox
                            elem.addEventListener("change", eventAction);
                        }else if(elem.attachEvent){
                            elem.attachEvent("change", eventAction);
                        }
                        continueValidation = 0;
                    }else{
                        octaValidateRemoveError(index);
                        continueValidation++;}
                }else{
                    continueValidation++;
                }//text validation
                
            }) //end of foreach loop on validations

            //console.log(errors); -- use this to debug
            //console.log(validate); -- use this to debug
            }//end of if id exists
        }); //end of foreach loop

       (errors === 0) ? nextValidation++ : ''; //do next validation when this one passed our tests
    }else{
        nextValidation++; //do next validation
    }
    
    //length validators
    if(nextValidation && validateLength){
        //prevent next validation
        nextValidation = 0;

        let fly = 0; //from the song One day I'm gonna fly away by Unknown  :)
        while(fly < Object.keys(validateLength).length){
            let fly_id = Object.keys(validateLength)[fly]; //check the input ID that flew away.
            if (!document.querySelector("#"+fly_id)){
                console.log("%cInput ID ( "+ fly_id+" ) is missing!", "color:#ff0000");
                return false;
            }
            ++fly;
        }

        //do length validation
        let formInputsLength = document.querySelectorAll('#'+form_id+' [id]');
        formInputsLength.forEach(input => {
            let index = input.id;

            //check if id is present in object
            if(validateLength[index]){
                let validations = validateLength[index][0]; //validation rule
                let len = validateLength[index][1]; //length specified

                let continueValidation = 0;
                let validationInfo;
                let validationText;
                let elem = (document.querySelector('#'+index)) ? document.querySelector('#'+index) : null;
                if(elem === null){
                    console.log("%cInput ID ( "+ index +" ) is missing!", "color:#ff0000");
                    return false;
                }

                //This tiny function enables our event listener to function properly
                function ComparisonEventAction(){
                    (eval(validationInfo)) ?
                    octaValidateNewError(index, validationText)
                        :   (   
                                errors--,
                                octaValidateRemoveError(index)
                            );
                }

                if(validations === 'MINLENGTH'){
                    if(elem.value.length < len) {
                        errors++;
                        validationInfo = "elem.value.length < len";
                        /*Consider adding attribute for attribute valiation text*/
                        validationText = "Please enter "+len+" or more characters, you're currently at "+elem.value.length+"";
                        octaValidateNewError(index, validationText);
                        if(elem.addEventListener) {
                            elem.addEventListener("change", ComparisonEventAction);
                        }else if(elem.attachEvent){
                            elem.attachEvent("change", ComparisonEventAction);
                        }
                        
                        continueValidation = 0;
                    }
                }//minlength

                if(validations === 'MAXLENGTH'){
                    if(elem.value.length > len) {
                        errors++;

                        validationInfo = "elem.value.length > len";
                        validationText = "Please enter "+len+" characters or less. You're currently at "+elem.value.length+"";
                        octaValidateNewError(index, validationText);
                        if(elem.addEventListener) {
                            elem.addEventListener("change", ComparisonEventAction);
                        }else if(elem.attachEvent){
                            elem.attachEvent("change", ComparisonEventAction);
                        }
                        
                        continueValidation = 0;
                    }
                }//maxlength

                if(validations === 'LENGTH'){
                    if(elem.value.length != len) {
                        errors++;
                        
                        validationInfo = "elem.value.length != len";
                        validationText = "Please provide exactly "+len+" characters, you're currently at "+elem.value.length+"";
                        octaValidateNewError(index, validationText);
                        if(elem.addEventListener) {
                            elem.addEventListener("change", ComparisonEventAction);
                        }else if(elem.attachEvent){
                            elem.attachEvent("change", ComparisonEventAction);
                        }

                        continueValidation = 0;
                    }
                }//length

            }//end of if id exists
        });
        (errors === 0) ? nextValidation++ : ''; //do next validation when this one passed our tests
    }else{
        nextValidation++; //do next validation
    }

    /**ATTRIBUTES VALIDATION */
    //equal to
    if(nextValidation && validateAttr){
        
        nextValidation = 0;//prevent next validation
        var EqualToElem; //store the element to check against
        var EqualToMsg; //store the validate message
        //check if user removed an input ID using the inspect element
        let fly = 0; //from the song One day I'm gonna fly away by Unknown  :)
        while(fly < Object.keys(validateAttr).length){
            let fly_id = Object.keys(validateAttr)[fly]; //check the input ID that flew away.
            if (!document.querySelector("#"+fly_id)){
                console.log("%cInput ID ( "+ fly_id+" ) is missing!", "color:#ff0000");
                return false;
            }
            ++fly;
        } //end of fly check

        //do attributes validation
        let formInputsLength = document.querySelectorAll('#'+form_id+' [id]');
        formInputsLength.forEach(input => {
            let index = input.id;

            //check if id is present in object
            if(validateAttr[index]){
                let validation = validateAttr[index][0]; //validation rule
                let val = validateAttr[index][1]; //value of the attribute specified

                let continueValidation = 0;
                let validationInfo;
                let validationText;
                let elem = (document.querySelector('#'+index)) ? document.querySelector('#'+index) : null;
                if(elem === null){
                    console.log("%cInput ID ( "+ index +" ) is missing!", "color:#ff0000");
                    return false;
                }

                //This tiny function enables our event listener to function properly
                function AttributesEventAction(){
                    if(elem.value){
                        if(eval(validationInfo) === false) {
                            octaValidateNewError(index, validationText)
                        }else {
                            //only minus when validation passes
                            errors--;
                            octaValidateRemoveError(index);
                        }
                    }else{
                        octaValidateRemoveError(index);
                    }
                }

                if(validation === 'EQUALTO'){
                    
                    EqualToElem = document.querySelector('#'+val);
                    EqualToMsg = (elem.getAttribute('ov-equalto:msg')) ? elem.getAttribute('ov-equalto:msg').toString() : 'Both Values do not match';
                    if(EqualToElem.value && (elem.value !== EqualToElem.value)) {
                        errors++;
                        validationInfo = "elem.value === EqualToElem.value";
                        validationText = EqualToMsg;
                        octaValidateNewError(index, validationText);
                        if(elem.addEventListener) {
                            elem.addEventListener("change", AttributesEventAction);
                        }else if(elem.attachEvent){
                            elem.attachEvent("change", AttributesEventAction);
                        }
                        
                        continueValidation = 0;
                    }
                }//equal to

            }//end of if id exists
        });
        (errors === 0) ? nextValidation++ : ''; //do next validation when this one passed our tests
    }
    //console.log(errors); //-- use this to debug
    if (errors === 0) return(true); //no errors

    return false;
}
//make a global declaration
window.octaValidate = octaValidate;
window.addOVCustomRules = addOVCustomRules;
window.addMoreOVCustomRules = addMoreOVCustomRules;