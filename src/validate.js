/**
 * OctaValidate main JS V1.1.4
 * author: Simon Ugorji
 * Last Edit : 11th July 2022
 */
(function () {
    //global Styling
    const ovStyle = document.createElement("style");
    ovStyle.id = "octaValidate-global-style";
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

function octaValidate(form_ID, userConfig) {
    ////---------------

    /** STORAGE AREA **/
    //store validation counters
    let errors = {}, continueValidation = {}, nextValidation = {};
    //store primary validations
    const validatePrimary = {};
    //store Attribute validations [length,minlength,maxlength,equalto]
    const validateAttr = {};
    //success callback
    let cbSuccess = null;
    //error callback
    let cbError = null;
    //set form id (not publicly shown)
    const formID = form_ID;
    //store config
    const config = {
        successBorder: false,
        strictMode: false,
        strictWords: ["null", "NaN", "undefined"]
    };
    //version number
    const versionNumber = "1.1.4";

    ////---------------

    ////---------------

    /** REFERENCE FUNCTIONS **/
    const isObject = (obj) => {
        return (Object.prototype.toString.call(obj) === '[object Object]');
    };
    const isArray = (ary) => {
        return (Object.prototype.toString.call(ary) === '[object Array]');
    };
    const findElem = (id) => {
        return (document.querySelector('#' + id) !== null);
    };
    //insert error
    //try to do form_id [input element] in assigning errors
    const ovNewError = (inputID, error) => {
        //remove previous error
        ovRemoveError(inputID);
        //add error to element
        const g = document.createElement("p");
        g.setAttribute("id", "octaValidate_" + inputID);
        g.setAttribute("class", "octaValidate-txt-error");
        g.innerText = error;

        //set class of input error
        const f = document.querySelector('#' + inputID);
        if (!f.classList.contains('octaValidate-inp-error')) {
            f.classList.add("octaValidate-inp-error");
        }
        //append to form .nextSibling
        f.parentNode.appendChild(g, f);
    };
    //remove error
    const ovRemoveError = (inputID) => {
        //remove error text
        let errorElem = (document.querySelector('#octaValidate_' + inputID)) ?
            document.querySelector('#octaValidate_' + inputID) : null;
        let inputElem = (document.querySelector('#' + inputID)) ?
            document.querySelector('#' + inputID) : null;
        //remove classlist
        if (inputElem !== null) {
            (inputElem.classList.contains('octaValidate-inp-error')) ?
                inputElem.classList.remove('octaValidate-inp-error') : null;
        } else {
            throw new Error(`Input ID ${inputID} is missing!`);
        }
        if (errorElem !== null) {
            errorElem.remove();
        }
    };
    //insert success
    const ovNewSuccess = (inputID) => {
        //check if user wants a success border
        if (config.successBorder == true) {
            //remove previous error
            ovRemoveSuccess(inputID);
            //set class of input error
            const f = document.querySelector('#' + inputID);
            if (!f.classList.contains('octaValidate-inp-success')) {
                f.classList.add("octaValidate-inp-success");
            }
        }
    };
    //remove success
    const ovRemoveSuccess = (inputID) => {
        let inputElem = (document.querySelector('#' + inputID)) ?
            document.querySelector('#' + inputID) : null;
        //check if user wants a success border
        if (config.successBorder == true) {
            //remove classlist
            if (inputElem !== null) {
                (inputElem.classList.contains('octaValidate-inp-success')) ?
                    inputElem.classList.remove('octaValidate-inp-success') : null;
            } else {
                throw new Error(`Input ID ${inputID} is missing!`);
            }
        }
    };

    //convert size
    const sizeInBytes = (size) => {
        const prevSize = size;
        //convert to lowercase
        size = size.toLowerCase().replaceAll(' ', '');
        //check size
        if (/[0-9]+(bytes|kb|mb|gb|tb|pb)+$/i.test(size) === false) {
            throw new Error(`The size ${prevSize} you provided is Invalid. Please check for typos or make sure that you are providing a size from bytes up to Petabytes`);
        }
        //get the number
        const sizeNum = Number(size.split('').map(sn => { return ((!(isNaN(sn)) ? sn : '')) }).join(''));
        //get the digital storage extension
        const sizeExt = (() => {
            const res = size.split('').map(s => { return (isNaN(s)) }).indexOf(true);
            return ((res !== -1) ? size.substring(res) : "");
        })();
        /**
         * 1KB = 1000 bytes
         * 1MB = 1 000 000 bytes
         * 1GB = 1 000 000 000 bytes 
         * 1TB = 1 000 000 000 000 bytes
         * 1PB = 1000 bytes ^ 5 [I stopped here. Add yours]
         */
        switch (sizeExt) {
            case "":
                return (Number(sizeNum));
            case "bytes":
                return (Number(sizeNum));
            case "kb":
                return (Number(sizeNum * 1000));
            case "mb":
                return (Number(sizeNum * 1000 * 1000));
            case "gb":
                return (Number(sizeNum * 1000 * 1000 * 1000));
            case "tb":
                return (Number(sizeNum * 1000 * 1000 * 1000 * 1000));
            case "pb":
                return (Number(sizeNum * 1000 * 1000 * 1000 * 1000 * 1000));
            default:
                return (0);
        }
    };

    ////---------------

    ////---------------

    /** ARGUMENTS CHECK **/
    //check if form id is present
    if (typeof form_ID === "undefined")
        throw new Error("A valid Form Id must be passed as the first Argument during initialization");
    //check if userConfig exists and is passed as an object
    if (typeof userConfig !== "undefined" && !isObject(userConfig))
        throw new Error("Configuration options must be passed as a valid object");
    //store configuratiion
    if (typeof userConfig !== "undefined") {
        if (userConfig.successBorder !== undefined) {
            (userConfig.successBorder == true || userConfig.successBorder == false) ? config.successBorder = userConfig.successBorder : null;
        }
        if (userConfig.strictMode !== undefined) {
            (userConfig.strictMode == true || userConfig.strictMode == false) ? config.strictMode = userConfig.strictMode : null;
        }
        if (userConfig.strictWords !== undefined && userConfig.strictMode !== undefined) {
            (userConfig.strictMode == true && userConfig.strictWords.length !== 0) ? config.strictWords.push(...userConfig.strictWords) : null;
        }
    }

    ////---------------

    ////---------------

    /** CORE VALIDATION LIBRARY**/
    //the validation library
    let octaValidations = (function () {
        //check email
        function octaValidateEmail(email) {
            if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/.test(email)) {
                return true;
            }
            return false;
        }

        //check Alphabets only
        function octaValidateALPHA_ONLY(text) {
            if (/^[a-zA-Z]+$/.test(text)) {
                return true;
            }
            return false;
        }

        //check lowercase alphabets only
        function octaValidateLOWER_ALPHA(text) {
            if (/^[a-z]+$/.test(text)) {
                return true;
            }
            return false;
        }

        //check uppercase alphabets only
        function octaValidateUPPER_ALPHA(text) {
            if (/^[A-Z]+$/.test(text)) {
                return true;
            }
            return false;
        }

        //check Alphabets and spaces
        function octaValidateALPHA_SPACES(text) {
            if (/^[a-zA-Z\s]+$/.test(text)) {
                return true;
            }
            return false;
        }

        //check Alpha Numberic strings
        function octaValidateALPHA_NUMERIC(text) {
            if (/^[a-zA-Z0-9]+$/.test(text)) {
                return true;
            } else {
                return false;
            }
        }

        //check DATE mm/dd/yyyy
        //source https://stackoverflow.com/a/15196623
        function octaValidateDate_MDY(date) {
            if (/^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/.test(date)) {
                return true;
            }
            return false;
        }

        //url 
        function octaValidateUrl(url) {
            if (/^((?:http:\/\/)|(?:https:\/\/))(www.)?((?:[a-zA-Z0-9]+\.[a-z]{3})|(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1(?::\d+)?))([\/a-zA-Z0-9\.]*)$/i.test(url)) {
                return true;
            } else {
                return false;
            }
        }

        //validate url with query params
        function octaValidateUrl_QP(url) {
            if (/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(url)) {
                return true;
            } else {
                return false;
            }
        }

        //username
        function octaValidateUserName(uname) {
            if (/^[a-zA-Z][a-zA-Z0-9-_]+$/.test(uname)) {
                return true;
            } else {
                return false;
            }
        }

        //password - 8 characters or more
        function octaValidatePWD(password) {
            if (/^((?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,})+$/.test(password)) {
                return true;
            } else {
                return false;
            }
        }

        //Validates general text
        function octaValidateTEXT(text) {
            if (/^[a-zA-Z0-9\s\,\.\'\"\-\_\)\(\[\]\?\!\&\:\;\/]+$/.test(text)) {
                return true;
            } else {
                return false;
            }
        }

        return {
            ValidateEmail: octaValidateEmail,
            ValidateAlpha_Only: octaValidateALPHA_ONLY,
            ValidateLower_Alpha: octaValidateLOWER_ALPHA,
            ValidateUpper_Alpha: octaValidateUPPER_ALPHA,
            ValidateAlpha_Spaces: octaValidateALPHA_SPACES,
            ValidateAlpha_Numeric: octaValidateALPHA_NUMERIC,
            ValidateUrl: octaValidateUrl,
            ValidateUrl_QP: octaValidateUrl_QP,
            ValidateUserName: octaValidateUserName,
            ValidateDate_MDY: octaValidateDate_MDY,
            ValidatePWD: octaValidatePWD,
            ValidateTEXT: octaValidateTEXT
        }
    }());

    //build rules
    (function (form_id) {
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
        //get size
        const ovSize = document.querySelectorAll(`#${form_id} [size]`);
        //get minsize
        const ovMinSize = document.querySelectorAll(`#${form_id} [minsize]`);
        //get maxsize
        const ovMaxSize = document.querySelectorAll(`#${form_id} [maxsize]`);
        //get total size
        const ovTotalSize = document.querySelectorAll(`#${form_id} [totalsize]`);
        //get total minsize
        const ovTotalMinSize = document.querySelectorAll(`#${form_id} [totalminsize]`);
        //get total maxsize
        const ovTotalMaxSize = document.querySelectorAll(`#${form_id} [totalmaxsize]`);
        //get accept
        const ovAccept = document.querySelectorAll(`#${form_id} [accept]`);
        //collect primary validations [octavalidate] attribute
        if (ovPrimaryValidations) {
            let e = 0;
            while (e < ovPrimaryValidations.length) {
                //get id
                const id = ovPrimaryValidations[e].id;
                //get attr
                const attrVal = (ovPrimaryValidations[e].getAttribute("octavalidate")) ? ovPrimaryValidations[e].getAttribute("octavalidate") : null;
                //get type
                const type = (ovPrimaryValidations[e].getAttribute("type")) ? ovPrimaryValidations[e].getAttribute("type") : null;
                //exit if attribute existts but id is null
                if (!id) {
                    throw new Error(`One or more fields in ${form_id} is missing an id [Identifier]`);
                }
                //["R", "required"], ["EMAIL", "email"], ["R", "radio"]
                validatePrimary[id] = (validatePrimary[id] === undefined) ? [attrVal, type] : [...validatePrimary[id], attrVal, type];
                //increment
                ++e;
            }
        }
        //collect minlength validations
        if (ovMinLengths) {
            let lv = 0;
            while (lv < ovMinLengths.length) {
                const val = Number(ovMinLengths[lv].getAttribute('minlength'));
                const id = ovMinLengths[lv].id;
                //exit if attribute existts but id is null
                if (!id) {
                    throw new Error(`One or more fields in ${form_id} is missing an id [Identifier]`);
                }
                validateAttr[id] = (validateAttr[id] === undefined) ? ['MINLENGTH:' + val] : [...validateAttr[id], 'MINLENGTH:' + val];
                ++lv;
            }
        }

        //collect all maxlength inputs
        if (ovMaxLengths) {
            let lv = 0;
            while (lv < ovMaxLengths.length) {
                const val = Number(ovMaxLengths[lv].getAttribute("maxlength"));
                const id = ovMaxLengths[lv].id;
                //exit if attribute existts but id is null
                if (!id) {
                    throw new Error(`One or more fields in ${form_id} is missing an id [Identifier]`);
                }
                validateAttr[id] = (validateAttr[id] === undefined) ? ['MAXLENGTH:' + val] : [...validateAttr[id], 'MAXLENGTH:' + val];
                ++lv;
            }
        }

        //collect all length inputs
        if (ovLengths) {
            let lv = 0;
            while (lv < ovLengths.length) {
                let val = Number(ovLengths[lv].getAttribute("length"));
                let id = ovLengths[lv].id;
                if (!id) {
                    throw new Error(`One or more fields in ${form_id} is missing an id [Identifier]`);
                }
                validateAttr[id] = (validateAttr[id] === undefined) ? ['LENGTH:' + val] : [...validateAttr[id], 'LENGTH:' + val];
                ++lv;
            }
        }

        //collect equalto
        if (ovEqualTo) {
            let eqv = 0;
            while (eqv < ovEqualTo.length) {
                const id = ovEqualTo[eqv].id;
                const val = ovEqualTo[eqv].getAttribute('equalto');
                if (!id) {
                    throw new Error(`One or more fields in ${form_id} is missing an id [Identifier]`);
                }
                validateAttr[id] = (validateAttr[id] === undefined) ? ['EQUALTO:' + val] : [...validateAttr[id], 'EQUALTO:' + val];
                ++eqv;
            }
        }

        //collect size
        if (ovSize) {
            let e = 0;
            while (e < ovSize.length) {
                //how to store size = 10mb, maxsize =20mb per input id
                const id = ovSize[e].id;
                const val = ovSize[e].getAttribute('size');
                if (!id) {
                    throw new Error(`One or more fields in ${form_id} is missing an id [Identifier]`);
                }
                validateAttr[id] = (validateAttr[id] === undefined) ? ['SIZE:' + val] : [...validateAttr[id], 'SIZE:' + val];
                ++e;
            }
        }

        //collect min-size
        if (ovMinSize) {
            let e = 0;
            while (e < ovMinSize.length) {
                let id = ovMinSize[e].id;
                let val = ovMinSize[e].getAttribute('minsize');
                if (!id) {
                    throw new Error(`One or more fields in ${form_id} is missing an id [Identifier]`);
                }
                validateAttr[id] = (validateAttr[id] === undefined) ? ['MINSIZE:' + val] : [...validateAttr[id], 'MINSIZE:' + val];
                ++e;
            }
        }

        //collect max-size
        if (ovMaxSize) {
            let e = 0;
            while (e < ovMaxSize.length) {
                let id = ovMaxSize[e].id;
                let val = ovMaxSize[e].getAttribute('maxsize');
                if (!id) {
                    throw new Error(`One or more fields in ${form_id} is missing an id [Identifier]`);
                }
                validateAttr[id] = (validateAttr[id] === undefined) ? ['MAXSIZE:' + val] : [...validateAttr[id], 'MAXSIZE:' + val];
                ++e;
            }
        }

        //collect size
        if (ovTotalSize) {
            let e = 0;
            while (e < ovTotalSize.length) {
                //how to store size = 10mb, maxsize =20mb per input id
                let id = ovTotalSize[e].id;
                let val = ovTotalSize[e].getAttribute('totalsize');
                if (!id) {
                    throw new Error(`One or more fields in ${form_id} is missing an id [Identifier]`);
                }
                validateAttr[id] = (validateAttr[id] === undefined) ? ['TOTALSIZE:' + val] : [...validateAttr[id], 'TOTALSIZE:' + val];
                ++e;
            }
        }

        //collect min-size
        if (ovTotalMinSize) {
            let e = 0;
            while (e < ovTotalMinSize.length) {
                let id = ovTotalMinSize[e].id;
                let val = ovTotalMinSize[e].getAttribute('totalminsize');
                if (!id) {
                    throw new Error(`One or more fields in ${form_id} is missing an id [Identifier]`);
                }
                validateAttr[id] = (validateAttr[id] === undefined) ? ['TOTALMINSIZE:' + val] : [...validateAttr[id], 'TOTALMINSIZE:' + val];
                ++e;
            }
        }

        //collect max-size
        if (ovTotalMaxSize) {
            let e = 0;
            while (e < ovTotalMaxSize.length) {
                let id = ovTotalMaxSize[e].id;
                let val = ovTotalMaxSize[e].getAttribute('totalmaxsize');
                if (!id) {
                    throw new Error(`One or more fields in ${form_id} is missing an id [Identifier]`);
                }
                validateAttr[id] = (validateAttr[id] === undefined) ? ['TOTALMAXSIZE:' + val] : [...validateAttr[id], 'TOTALMAXSIZE:' + val];
                ++e;
            }
        }

        //collect max-size
        if (ovAccept) {
            let e = 0;
            while (e < ovAccept.length) {
                let id = ovAccept[e].id;
                let val = ovAccept[e].getAttribute('accept');
                if (!id) {
                    throw new Error(`One or more fields in ${form_id} is missing an id [Identifier]`);
                }
                validateAttr[id] = (validateAttr[id] === undefined) ? ['ACCEPT:' + val] : [...validateAttr[id], 'ACCEPT:' + val];
                ++e;
            }
        }
    }(formID)); //end of build validation rules

    //store custom rules
    let customRules = [];
    //add single rule
    function customRule(rule_title, regExp, text) {
        return (customRules[rule_title] = [regExp, text]);
    };
    //add multiple rules
    function moreCustomRules(rules) {
        if (!isObject(rules)) throw new Error("The rules you provided must be a valid Object! Please refer to the README file.");

        let r = 0;

        while (r < Object.keys(rules).length) {
            const rule_title = Object.keys(rules)[r]; //get rule/index
            const regExp = rules[rule_title][0]; //get Regexpression
            const text = rules[rule_title][1].toString(); //get validation message

            if (rule_title && regExp && text)
                customRules[rule_title] = [regExp, text]
            else
                throw new Error(`Custom Validation rule at index [${r}] is Invalid!`);
            ++r;
        }
    };

    //form validation callback 
    function validateCallBack(success, error) {
        if (typeof success === "function") {
            cbSuccess = success;
        }
        if (typeof error === "function") {
            cbError = error;
        }
    };

    //main function to validate form
    function validate() {

        const form_id = formID;

        //check if form id exists in DOM
        if (!findElem(form_id)) throw new Error(`Form Input Element [${form_id}] does not exist in the Browser DOM`);
        //Begin validation and return result
        return (function validateForm() {
            if (validatePrimary !== null ||
                validateAttr !== null) {
                //loop through all form elements that needs validation
                let formInputs = document.querySelectorAll(`#${form_id} [octavalidate], [length], [maxlength], [minlength], [equalto], [maxsize], [minsize], [accept], [size], [totalsize], [totalminsize], [totalmaxsize]`);
                formInputs.forEach(input => {
                    //check if id exists within the element
                    if (input.id !== "") {
                        //errors is unique to the input id [was not initially implemented :)]
                        let formInputId = input.id;
                        //errors is unique to the input id
                        errors[formInputId] = 0;
                        continueValidation[formInputId] = 0;
                        nextValidation[formInputId] = 0;
                        /* strict mode */
                        //check if strict mode is enabled
                        if (config.strictMode === true) {
                            let index = formInputId;
                            let validationText;
                            let elem = (document.querySelector('#' + formInputId)) ? document.querySelector('#' + formInputId) : null;

                            if (elem === null) {
                                throw new Error(`The Form Input Element with the ID [${formInputId}] is nowhere to be found`);
                            }
                            //set strict words
                            let strictWords = config.strictWords;
                            if (elem.type != "file" && elem.type != "checkbox" && elem.type != "radio") {
                                //remove whitespace
                                elem.value = elem.value.trim();
                            }
                            let elemHasStrictWords = () => {
                                const res = strictWords.filter(s => { return elem.value.match(new RegExp(`${'(' + s + ')'}`, 'i')) });
                                if (res !== undefined && res.length !== 0) {
                                    return true;
                                }
                                return false;
                            };
                            if ((elem.value !== "") && elemHasStrictWords()) {
                                //I totally forgot that objects are passed by reference :(
                                errors[formInputId]++;
                                validationText = (elem.getAttribute('ov-strict:msg')) ? elem.getAttribute('ov-strict:msg').toString() : "This value is not allowed";
                                ovRemoveSuccess(index);
                                ovNewError(index, validationText);
                                if (elem.addEventListener) {
                                    elem.addEventListener("change",
                                        function () {
                                            if (this.value && elemHasStrictWords()) {
                                                errors[formInputId]++;
                                                ovRemoveSuccess(index);
                                                ovNewError(index, validationText);
                                            } else {
                                                errors[formInputId]--;
                                                ovRemoveError(index);
                                                ovNewSuccess(index);
                                            }
                                        });
                                } else if (elem.attachEvent) {
                                    elem.attachEvent("change", function () {
                                        if (this.value && elemHasStrictWords()) {
                                            errors[formInputId]++;
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                        } else {
                                            errors[formInputId]--;
                                            ovRemoveError(index);
                                            ovNewSuccess(index);
                                        }
                                    });
                                }
                            } else {
                                nextValidation[formInputId]++;
                            }
                            if (errors[formInputId] === 0) {
                                nextValidation[formInputId]++;
                            }
                        } else {
                            nextValidation[formInputId]++;
                        }

                        //primary validation rules
                        if (validatePrimary[formInputId] !== undefined) {
                            if (nextValidation[formInputId]) {
                                let index = formInputId;
                                let type = validatePrimary[index][1];
                                //reset vcounters
                                continueValidation[formInputId] = 0;
                                nextValidation[formInputId] = 0;
                                //use this for event listener
                                let validationInfo;
                                let validationText;

                                let elem = (document.querySelector('#' + index)) ?
                                    document.querySelector('#' + index) : null;

                                if (elem === null) {
                                    throw new Error(`Input ID ${index} is missing`);
                                }

                                //create event listener
                                let eventAction = () => {
                                    if (type !== "radio" && type !== "checkbox") {
                                        if (elem.value) {
                                            if (eval(validationInfo) === false) {
                                                errors[formInputId]++;
                                                ovRemoveSuccess(index);
                                                ovNewError(index, validationText);
                                            } else {
                                                errors[formInputId]--;
                                                ovRemoveError(index);
                                                ovNewSuccess(index);
                                            }
                                        } else {
                                            ovRemoveError(index);
                                            ovNewSuccess(index);
                                        }
                                    } else {
                                        if (eval(validationInfo) === false) {
                                            errors[formInputId]++;
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                        } else {
                                            errors[formInputId]--;
                                            ovRemoveError(index);
                                            ovNewSuccess(index);
                                        }
                                    }
                                    validateForm();
                                }
                                //loop through validations
                                validatePrimary[index][0].split(',').forEach(item => {
                                    //required
                                    if (item === 'R' || (elem.getAttribute('required') !== null)) {
                                        if (type == "checkbox" || type == "radio") {
                                            if (elem.checked === false) {
                                                errors[formInputId]++;
                                                validationInfo = "elem.checked";
                                                validationText = (elem.getAttribute("ov-required:msg")) ? elem.getAttribute("ov-required:msg").toString() : 'This checkbox is required';
                                                ovRemoveSuccess(index);
                                                ovNewError(index, validationText);
                                                if (elem.addEventListener) {
                                                    elem.addEventListener("change", eventAction);
                                                } else if (elem.attachEvent) {
                                                    elem.attachEvent("change", eventAction);
                                                }
                                                continueValidation[formInputId] = 0;
                                            } else {
                                                ovRemoveError(index);
                                                continueValidation[formInputId]++;
                                            }//required check box or radio validation
                                        } else if (type == "file") {
                                            if (elem.files.length === 0) {
                                                errors[formInputId]++;
                                                validationInfo = "elem.files.length";
                                                validationText = (elem.getAttribute("ov-required:msg")) ? elem.getAttribute("ov-required:msg").toString() : 'Please select a valid file';
                                                ovRemoveSuccess(index);
                                                ovNewError(index, validationText);
                                                if (elem.addEventListener) {
                                                    elem.addEventListener("change", eventAction);
                                                } else if (elem.attachEvent) {
                                                    elem.attachEvent("change", eventAction);
                                                }
                                                continueValidation[formInputId] = 0;
                                            } else {
                                                ovRemoveError(index);
                                                continueValidation[formInputId]++;
                                            }//required file validation
                                        } else {
                                            if (!elem.value || elem.value.trim() == "") {
                                                errors[formInputId]++;
                                                validationText = (elem.getAttribute('ov-required:msg')) ? elem.getAttribute('ov-required:msg').toString() : "This field is required";
                                                ovRemoveSuccess(index);
                                                ovNewError(index, validationText);
                                                if (elem.addEventListener) {
                                                    elem.addEventListener("change", function () {
                                                        if (this.value.trim() == "") {
                                                            errors[formInputId]++;
                                                            ovRemoveSuccess(index);
                                                            ovNewError(index, validationText);
                                                        } else {
                                                            errors[formInputId]--;
                                                            ovRemoveError(index);
                                                            ovNewSuccess(index);
                                                        }
                                                        validateForm();
                                                    });
                                                } else if (elem.attachEvent) {
                                                    elem.attachEvent("change", function () {
                                                        //make it inline
                                                        if (this.value.trim() == "") {
                                                            errors[formInputId]++;
                                                            ovRemoveSuccess(index);
                                                            ovNewError(index, validationText);
                                                        } else {
                                                            errors[formInputId]--;
                                                            ovRemoveError(index);
                                                            ovNewSuccess(index);
                                                        }
                                                        validateForm();
                                                    });
                                                }
                                            } else { continueValidation[formInputId]++; }
                                        }
                                    } else {
                                        continueValidation[formInputId]++;
                                    }//required

                                    //handle custom rules
                                    if (elem.value && (Object.keys(customRules).length !== 0) && continueValidation[formInputId]) {
                                        //loop through custom validation rule
                                        if (customRules[item] !== undefined) {
                                            let pattern = customRules[item][0];
                                            let errText = customRules[item][1];
                                            let regExp = new RegExp(pattern);
                                            if (regExp.test(elem.value) === false) {
                                                errors[formInputId]++;
                                                validationInfo = `${regExp.test(elem.value) === false}`;
                                                validationText = errText.toString();
                                                ovRemoveSuccess(index);
                                                ovNewError(index, errText);
                                                if (elem.addEventListener) {
                                                    elem.addEventListener("change", eventAction);
                                                } else if (elem.attachEvent) {
                                                    elem.attachEvent("change", eventAction);
                                                }
                                                continueValidation[formInputId] = 0;
                                            } else { continueValidation[formInputId]++; }
                                        } else {
                                            continueValidation[formInputId]++;
                                        }
                                    } else {
                                        continueValidation[formInputId]++;
                                    }//end of custom validaton rules

                                    if (elem.value && continueValidation[formInputId] && (item === 'EMAIL' || type == 'email')) {
                                        if (octaValidations.ValidateEmail(elem.value) === false) {
                                            continueValidation[formInputId] = 0;
                                            errors[formInputId]++;
                                            validationInfo = `${octaValidations.ValidateEmail(elem.value) === false}`;
                                            validationText = (elem.getAttribute('ov-email:msg')) ? elem.getAttribute('ov-email:msg').toString() : "Please provide a valid email address";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            if (elem.addEventListener) {
                                                elem.addEventListener("change", eventAction);
                                            } else if (elem.attachEvent) {
                                                elem.attachEvent("change", eventAction);
                                            }
                                        } else {
                                            continueValidation[formInputId]++;
                                        }
                                    } else {
                                        continueValidation[formInputId]++;
                                    }//email

                                    if (elem.value && continueValidation[formInputId] && item === 'ALPHA_ONLY') {
                                        if (!octaValidations.ValidateAlpha_Only(elem.value)) {
                                            errors[formInputId]++;
                                            validationInfo = "octaValidations.ValidateAlpha_Only(elem.value)";
                                            validationText = (elem.getAttribute('ov-alpha-only:msg:')) ? elem.getAttribute('ov-alpha-only:msg:').toString() : "Please enter only Alphabets!";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            if (elem.addEventListener) {
                                                elem.addEventListener("change", eventAction);
                                            } else if (elem.attachEvent) {
                                                elem.attachEvent("change", eventAction);
                                            }
                                            continueValidation[formInputId] = 0;
                                        } else { continueValidation[formInputId]++; }
                                    } else {
                                        continueValidation[formInputId]++;
                                    }//ALPHABETS + SPACES

                                    if (elem.value && continueValidation[formInputId] && item === 'ALPHA_SPACES') {
                                        if (!octaValidations.ValidateAlpha_Spaces(elem.value)) {
                                            errors[formInputId]++;
                                            validationInfo = "octaValidations.ValidateAlpha_Spaces(elem.value)";
                                            validationText = (elem.getAttribute('ov-alpha-spaces:msg')) ? elem.getAttribute('ov-alpha-spaces:msg').toString() : "Please enter only Alphabets or spaces!";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            if (elem.addEventListener) {
                                                elem.addEventListener("change", eventAction);
                                            } else if (elem.attachEvent) {
                                                elem.attachEvent("change", eventAction);
                                            }

                                            continueValidation[formInputId] = 0;
                                        } else { continueValidation[formInputId]++; }
                                    } else {
                                        continueValidation[formInputId]++;
                                    }//ALPHABETS + SPACES

                                    if (elem.value && continueValidation[formInputId] && item === 'ALPHA_NUMERIC') {
                                        if (!octaValidations.ValidateAlpha_Numeric(elem.value)) {
                                            errors[formInputId]++;
                                            validationInfo = "octaValidations.ValidateAlpha_Numeric(elem.value)";
                                            validationText = (elem.getAttribute('ov-alpha-numeric:msg')) ? elem.getAttribute('ov-alpha-numeric:msg').toString() : "Please enter only Alphabets or Numbers!";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            if (elem.addEventListener) {
                                                elem.addEventListener("change", eventAction);
                                            } else if (elem.attachEvent) {
                                                elem.attachEvent("change", eventAction);
                                            }

                                            continueValidation[formInputId] = 0;
                                        } else { continueValidation[formInputId]++; }
                                    } else {
                                        continueValidation[formInputId]++;
                                    }//ALPHABETS + NUMBERS

                                    if (elem.value && continueValidation[formInputId] && item === 'LOWER_ALPHA') {
                                        if (!octaValidations.ValidateLower_Alpha(elem.value)) {
                                            errors[formInputId]++;
                                            validationInfo = "octaValidations.ValidateLower_Alpha(elem.value)";
                                            validationText = (elem.getAttribute('ov-lower-alpha:msg')) ? elem.getAttribute('ov-lower-alpha:msg').toString() : "Only letters in lowercase are supported!";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            if (elem.addEventListener) {
                                                elem.addEventListener("change", eventAction);
                                            } else if (elem.attachEvent) {
                                                elem.attachEvent("change", eventAction);
                                            }
                                            continueValidation[formInputId] = 0;
                                        } else { continueValidation[formInputId]++; }
                                    } else {
                                        continueValidation[formInputId]++;
                                    }//Lowercase letters

                                    if (elem.value && continueValidation[formInputId] && item === 'UPPER_ALPHA') {
                                        if (!octaValidations.ValidateUpper_Alpha(elem.value)) {
                                            errors[formInputId]++;
                                            validationInfo = "octaValidations.ValidateUpper_Alpha(elem.value)";
                                            validationText = (elem.getAttribute('ov-upper-alpha:msg')) ? elem.getAttribute('ov-upper-alpha:msg').toString() : "Only letters in uppercase are supported!";
                                            ovRemoveSuccess(index);
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            if (elem.addEventListener) {
                                                elem.addEventListener("change", eventAction);
                                            } else if (elem.attachEvent) {
                                                elem.attachEvent("change", eventAction);
                                            }

                                            continueValidation[formInputId] = 0;
                                        } else { continueValidation[formInputId]++; }
                                    } else {
                                        continueValidation[formInputId]++;
                                    }//Uppercase letters

                                    if (elem.value && continueValidation[formInputId] && item === 'PWD') {
                                        if (!octaValidations.ValidatePWD(elem.value)) {
                                            errors[formInputId]++;
                                            validationInfo = "octaValidations.ValidatePWD(elem.value)";
                                            validationText = (elem.getAttribute('ov-pwd:msg')) ? elem.getAttribute('ov-pwd:msg').toString() : "Password Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            if (elem.addEventListener) {
                                                elem.addEventListener("change", eventAction);
                                            } else if (elem.attachEvent) {
                                                elem.attachEvent("change", eventAction);
                                            }

                                            continueValidation[formInputId] = 0;
                                        } else { continueValidation[formInputId]++; }
                                    } else {
                                        continueValidation[formInputId]++;
                                    }//Uppercase letters

                                    if (elem.value && continueValidation[formInputId] && (item === 'DIGITS' || type == 'number')) {
                                        if (isNaN(elem.value)) {
                                            errors[formInputId]++;
                                            validationInfo = "!isNaN(elem.value)";
                                            validationText = (elem.getAttribute('ov-digits:msg')) ?
                                                elem.getAttribute('ov-digits:msg').toString() :
                                                "Please provide a valid Number!";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            if (elem.addEventListener) {
                                                elem.addEventListener("change", eventAction);
                                            } else if (elem.attachEvent) {
                                                elem.attachEvent("change", eventAction);
                                            }

                                            continueValidation[formInputId] = 0;
                                        } else { continueValidation[formInputId]++; }
                                    } else {
                                        continueValidation[formInputId]++;
                                    }//Numbers

                                    if (elem.value && continueValidation[formInputId] && (item === 'URL' || type == 'url')) {
                                        if (!octaValidations.ValidateUrl(elem.value)) {
                                            errors[formInputId]++;
                                            validationInfo = "octaValidations.ValidateUrl(elem.value)";
                                            validationText = (elem.getAttribute('ov-url:msg')) ? elem.getAttribute('ov-url:msg').toString() : "Please provide a valid URL that begins with http or https!";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            if (elem.addEventListener) {
                                                elem.addEventListener("change", eventAction);
                                            } else if (elem.attachEvent) {
                                                elem.attachEvent("change", eventAction);
                                            }

                                            continueValidation[formInputId] = 0;
                                        } else { continueValidation[formInputId]++; }
                                    } else {
                                        continueValidation[formInputId]++;
                                    }//URL

                                    if (elem.value && continueValidation[formInputId] && item === 'URL_QP') {
                                        if (!octaValidations.ValidateUrl_QP(elem.value)) {
                                            errors[formInputId]++;
                                            validationInfo = "octaValidations.ValidateUrl_QP(elem.value)";
                                            validationText = (elem.getAttribute('ov-url-qp:msg')) ? elem.getAttribute('ov-url-qp:msg').toString() : "Please provide a valid URL with a query parameter.";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            if (elem.addEventListener) {
                                                elem.addEventListener("change", eventAction);
                                            } else if (elem.attachEvent) {
                                                elem.attachEvent("change", eventAction);
                                            }

                                            continueValidation[formInputId] = 0;
                                        } else { continueValidation[formInputId]++; }
                                    } else {
                                        continueValidation[formInputId]++;
                                    }//URL with query params

                                    if (elem.value && continueValidation[formInputId] && item === 'DATE_MDY') {
                                        if (!octaValidations.ValidateDate_MDY(elem.value)) {
                                            errors[formInputId]++;
                                            validationInfo = "octaValidations.ValidateDate_MDY(elem.value)";
                                            validationText = (elem.getAttribute('ov-date-mdy:msg')) ? elem.getAttribute('ov-date-mdy:msg').toString() : "Please provide a date with the format mm/dd/yyyy.";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            if (elem.addEventListener) {
                                                elem.addEventListener("change", eventAction);
                                            } else if (elem.attachEvent) {
                                                elem.attachEvent("change", eventAction);
                                            }

                                            continueValidation[formInputId] = 0;
                                        } else { continueValidation[formInputId]++; }
                                    } else {
                                        continueValidation[formInputId]++;
                                    }//date mm/dd/yyyy

                                    if (elem.value && continueValidation[formInputId] && item === 'USERNAME') {
                                        if (!octaValidations.ValidateUserName(elem.value)) {
                                            errors[formInputId]++;
                                            validationInfo = "octaValidations.ValidateUserName(elem.value)";
                                            validationText = (elem.getAttribute('ov-username:msg')) ? elem.getAttribute('ov-username:msg').toString() : "Your username should contain alphanumeric characters only.";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            if (elem.addEventListener) {
                                                elem.addEventListener("change", eventAction);
                                            } else if (elem.attachEvent) {
                                                elem.attachEvent("change", eventAction);
                                            }
                                            continueValidation[formInputId] = 0;
                                        } else { continueValidation[formInputId]++; }
                                    } else {
                                        continueValidation[formInputId]++;
                                    }//username

                                    if (elem.value && continueValidation[formInputId] && item === 'TEXT') {
                                        if (!octaValidations.ValidateTEXT(elem.value)) {
                                            errors[formInputId]++;
                                            validationInfo = "octaValidations.ValidateTEXT(elem.value)";
                                            validationText = (elem.getAttribute('ov-text:msg')) ?
                                                elem.getAttribute('ov-text:msg').toString() :
                                                "This field contains invalid characters.";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            if (elem.addEventListener) {
                                                elem.addEventListener("change", eventAction);
                                            } else if (elem.attachEvent) {
                                                elem.attachEvent("change", eventAction);
                                            }
                                            continueValidation[formInputId] = 0;
                                        } else { continueValidation[formInputId]++; }
                                    } else {
                                        continueValidation[formInputId]++;
                                    }//text validation
                                }) //end of foreach loop on validations
                            }
                            //do next validation if this input element has no primary validation errors
                            if (errors[formInputId] === 0) {
                                nextValidation[formInputId]++;
                            }
                        } else {
                            nextValidation[formInputId]++;
                        }//end of if id exists

                        //Attribute validations
                        if (validateAttr[formInputId] !== undefined) {
                            if (nextValidation[formInputId]) {
                                let index = formInputId;
                                //reset vcounters
                                continueValidation[formInputId] = 0;
                                nextValidation[formInputId] = 0;
                                //use this for event listener
                                let validationInfo;
                                let validationText;

                                let elem = (document.querySelector('#' + index)) ? document.querySelector('#' + index) : null;
                                if (elem === null) {
                                    throw new Error(`Input ID ${index} is missing`);
                                };
                                let attributesEventAction = () => {
                                    if (elem.value) {
                                        if (eval(validationInfo) === false) {
                                            errors[formInputId]++;
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                        } else {
                                            errors[formInputId]--;
                                            ovRemoveError(index);
                                            ovNewSuccess(index);
                                        }
                                    } else {
                                        ovRemoveError(index);
                                        ovNewSuccess(index);
                                    }
                                    validateForm();
                                };
                                //['MINSIZE:2MB', 'MAXSIZE:5MB']
                                validateAttr[formInputId].forEach(f => {
                                    if (f.split(':')[0] === 'ACCEPT') {
                                        //get and convert to lowercase
                                        const requiredFileExts = f.split(':')[1].replaceAll(' ', '').split(',').map(m => {
                                            return (m.toLowerCase());
                                        });
                                        if (elem.files !== null && elem.files.length !== 0) {
                                            Object.entries(elem.files).forEach(ef => {
                                                //consider using mime type + accept attribute to check for uploaded files ?
                                                if (!(requiredFileExts.includes(ef[1].name.toLowerCase().substring(ef[1].name.toLowerCase().lastIndexOf("."))))) {
                                                    errors[formInputId]++;
                                                    validationInfo = `${!(requiredFileExts.includes(ef[1].name.toLowerCase().substring(ef[1].name.toLowerCase().lastIndexOf("."))))}`;
                                                    validationText = (elem.getAttribute("ov-accept:msg")) ? (elem.getAttribute("ov-accept:msg")) : "File type is not supported";
                                                    ovRemoveSuccess(index);
                                                    ovNewError(index, validationText);
                                                    if (elem.addEventListener) {
                                                        elem.addEventListener("change", attributesEventAction);
                                                    } else if (elem.attachEvent) {
                                                        elem.attachEvent("change", attributesEventAction);
                                                    }
                                                    continueValidation[formInputId] = 0;
                                                } else {
                                                    continueValidation[formInputId]++;
                                                }
                                            })
                                        }
                                    } else if (f.split(':')[0] === 'SIZE') {
                                        const requiredSize = sizeInBytes(f.split(':')[1]);
                                        if (elem.files !== null && elem.files.length !== 0) {
                                            Object.entries(elem.files).forEach(ef => {
                                                if (ef[1].size !== requiredSize) {
                                                    errors[formInputId]++;
                                                    validationInfo = `${ef[1].size !== requiredSize}`;
                                                    validationText = (elem.getAttribute("ov-size:msg")) ? (elem.getAttribute("ov-size:msg")) : "File size must be exactly " + f.split(':')[1].replace(' ', '').toUpperCase();
                                                    ovRemoveSuccess(index);
                                                    ovNewError(index, validationText);
                                                    if (elem.addEventListener) {
                                                        elem.addEventListener("change", attributesEventAction);
                                                    } else if (elem.attachEvent) {
                                                        elem.attachEvent("change", attributesEventAction);
                                                    }
                                                    continueValidation[formInputId] = 0;
                                                } else {
                                                    continueValidation[formInputId]++;
                                                }
                                            })
                                        }

                                    } else if (f.split(':')[0] === 'MINSIZE') {
                                        const requiredSize = sizeInBytes(f.split(':')[1]);
                                        if (elem.files !== null && elem.files.length !== 0) {
                                            Object.entries(elem.files).forEach(ef => {
                                                if (!(ef[1].size >= requiredSize)) {
                                                    errors[formInputId]++;
                                                    validationInfo = `${!(ef[1].size >= requiredSize)}`;
                                                    validationText = (elem.getAttribute("ov-minsize:msg")) ? (elem.getAttribute("ov-minsize:msg")) : "File size must be equal to or greater than " + f.split(':')[1].replace(' ', '').toUpperCase();
                                                    ovRemoveSuccess(index);
                                                    ovNewError(index, validationText);
                                                    if (elem.addEventListener) {
                                                        elem.addEventListener("change", attributesEventAction);
                                                    } else if (elem.attachEvent) {
                                                        elem.attachEvent("change", attributesEventAction);
                                                    }
                                                    continueValidation[formInputId] = 0;
                                                } else {
                                                    continueValidation[formInputId]++;
                                                }
                                            })
                                        }

                                    } else if (f.split(':')[0] === 'MAXSIZE') {
                                        const requiredSize = sizeInBytes(f.split(':')[1]);
                                        if (elem.files !== null && elem.files.length !== 0) {
                                            Object.entries(elem.files).forEach(ef => {
                                                if (!(ef[1].size <= requiredSize)) {
                                                    errors[formInputId]++;
                                                    validationInfo = `${!(ef[1].size <= requiredSize)}`;
                                                    validationText = (elem.getAttribute("ov-minsize:msg")) ? (elem.getAttribute("ov-minsize:msg")) : "File size must be equal to or less than " + f.split(':')[1].replace(' ', '').toUpperCase();
                                                    ovRemoveSuccess(index);
                                                    ovNewError(index, validationText);
                                                    if (elem.addEventListener) {
                                                        elem.addEventListener("change", attributesEventAction);
                                                    } else if (elem.attachEvent) {
                                                        elem.attachEvent("change", attributesEventAction);
                                                    }
                                                    continueValidation[formInputId] = 0;
                                                } else {
                                                    continueValidation[formInputId]++;
                                                }
                                            })
                                        }

                                    } else if (f.split(':')[0] === 'TOTALSIZE') {
                                        const requiredSize = sizeInBytes(f.split(':')[1]);
                                        if (elem.files !== null && elem.files.length !== 0) {
                                            let uploadedSize = 0;
                                            Object.entries(elem.files).forEach(ef => {
                                                uploadedSize += ef[1].size;
                                            })
                                            if (uploadedSize !== requiredSize) {
                                                errors[formInputId]++;
                                                validationInfo = `${(uploadedSize !== requiredSize)}`;
                                                validationText = (elem.getAttribute("ov-totalsize:msg")) ? (elem.getAttribute("ov-totalsize:msg")) : "Total File size must be equal to " + f.split(':')[1].replace(' ', '').toUpperCase();
                                                ovRemoveSuccess(index);
                                                ovNewError(index, validationText);
                                                if (elem.addEventListener) {
                                                    elem.addEventListener("change", attributesEventAction);
                                                } else if (elem.attachEvent) {
                                                    elem.attachEvent("change", attributesEventAction);
                                                }
                                                continueValidation[formInputId] = 0;
                                            } else {
                                                continueValidation[formInputId]++;
                                            }
                                        }
                                    } else if (f.split(':')[0] === 'TOTALMINSIZE') {
                                        const requiredSize = sizeInBytes(f.split(':')[1]);

                                        if (elem.files !== null && elem.files.length !== 0) {
                                            let uploadedSize = 0;
                                            Object.entries(elem.files).forEach(ef => {
                                                uploadedSize += ef[1].size;
                                            })
                                            if (!(uploadedSize >= requiredSize)) {
                                                errors[formInputId]++;
                                                validationInfo = `${!(uploadedSize >= requiredSize)}`;
                                                validationText = (elem.getAttribute("ov-totalminsize:msg")) ? (elem.getAttribute("ov-totalminsize:msg")) : "Total File size must be equal to or greater than " + f.split(':')[1].replace(' ', '').toUpperCase();
                                                ovRemoveSuccess(index);
                                                ovNewError(index, validationText);
                                                if (elem.addEventListener) {
                                                    elem.addEventListener("change", attributesEventAction);
                                                } else if (elem.attachEvent) {
                                                    elem.attachEvent("change", attributesEventAction);
                                                }
                                                continueValidation[formInputId] = 0;
                                            } else {
                                                continueValidation[formInputId]++;
                                            }
                                        }

                                    } else if (f.split(':')[0] === 'TOTALMAXSIZE') {
                                        const requiredSize = sizeInBytes(f.split(':')[1]);
                                        if (elem.files !== null && elem.files.length !== 0) {
                                            let uploadedSize = 0;
                                            Object.entries(elem.files).forEach(ef => {
                                                uploadedSize += ef[1].size;
                                            })
                                            if (!(uploadedSize <= requiredSize)) {
                                                errors[formInputId]++;
                                                validationInfo = `${!(uploadedSize <= requiredSize)}`;
                                                validationText = (elem.getAttribute("ov-totalminsize:msg")) ? (elem.getAttribute("ov-totalminsize:msg")) : "Total File size must be equal to or less than " + f.split(':')[1].replace(' ', '').toUpperCase();
                                                ovRemoveSuccess(index);
                                                ovNewError(index, validationText);
                                                if (elem.addEventListener) {
                                                    elem.addEventListener("change", attributesEventAction);
                                                } else if (elem.attachEvent) {
                                                    elem.attachEvent("change", attributesEventAction);
                                                }
                                                continueValidation[formInputId] = 0;
                                            } else {
                                                continueValidation[formInputId]++;
                                            }
                                        }

                                    } else if (f.split(':')[0] === 'MINLENGTH') {
                                        if (!(elem.value.length >= Number(f.split(':')[1]))) {
                                            errors[formInputId]++;
                                            validationInfo = `${!(elem.value.length >= Number(f.split(':')[1]))}`;
                                            validationText = (elem.getAttribute("ov-minlength:msg")) ? (elem.getAttribute("ov-minlength:msg")) : "Please provide " + f.split(':')[1] + " or more characters";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            if (elem.addEventListener) {
                                                elem.addEventListener("change", attributesEventAction);
                                            } else if (elem.attachEvent) {
                                                elem.attachEvent("change", attributesEventAction);
                                            }
                                            continueValidation[formInputId] = 0;
                                        } else {
                                            continueValidation[formInputId]++;
                                        }
                                    } else if (f.split(':')[0] === 'MAXLENGTH') {
                                        if (!(elem.value.length <= Number(f.split(':')[1]))) {
                                            errors[formInputId]++;
                                            validationInfo = `${!(elem.value.length <= Number(f.split(':')[1]))}`;
                                            validationText = (elem.getAttribute("ov-maxlength:msg")) ? (elem.getAttribute("ov-maxlength:msg")) : "Please provide " + f.split(':')[1] + " characters or less.";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            if (elem.addEventListener) {
                                                elem.addEventListener("change", attributesEventAction);
                                            } else if (elem.attachEvent) {
                                                elem.attachEvent("change", attributesEventAction);
                                            }

                                            continueValidation[formInputId] = 0;
                                        } else {
                                            continueValidation[formInputId]++;
                                        }
                                    } else if (f.split(':')[0] === 'LENGTH') {
                                        if (elem.value.length !== Number(f.split(':')[1])) {
                                            errors[formInputId]++;
                                            validationInfo = `${elem.value.length !== Number(f.split(':')[1])}`;
                                            validationText = (elem.getAttribute("ov-length:msg")) ? (elem.getAttribute("ov-length:msg")) : "Please provide exactly " + f.split(':')[1] + " characters";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            if (elem.addEventListener) {
                                                elem.addEventListener("change", attributesEventAction);
                                            } else if (elem.attachEvent) {
                                                elem.attachEvent("change", attributesEventAction);
                                            }

                                            continueValidation[formInputId] = 0;
                                        } else {
                                            continueValidation[formInputId]++;
                                        }
                                    } else if (f.split(':')[0] === 'EQUALTO') {
                                        EqualToElem = document.querySelector('#' + f.split(':')[1]);
                                        validationText = (elem.getAttribute('ov-equalto:msg')) ? elem.getAttribute('ov-equalto:msg').toString() : 'Both values do not match';
                                        if (EqualToElem.value.trim() !== "" &&
                                            (elem.value !== EqualToElem.value)) {
                                            errors[formInputId]++;
                                            validationInfo = "elem.value === EqualToElem.value";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            if (elem.addEventListener) {
                                                elem.addEventListener("change", attributesEventAction);
                                            } else if (elem.attachEvent) {
                                                elem.attachEvent("change", attributesEventAction);
                                            }
                                            continueValidation[formInputId] = 0;
                                        } else {
                                            ovRemoveError(index);
                                        }
                                    }
                                })
                            }
                        } else {
                            //do nothing :);
                        }//end of if id exists
                    }//end of check if id is provided
                }); //end of foreach loop
                //console.log(errors);
            }//end of checkif validations exist
            if (Object.keys(errors).length !== 0) {
                let res = 0;
                Object.entries(errors).forEach(e => {
                    if (Number(e[1]) !== 0) {
                        res += 1;
                    }

                });
                if (res === 0) {
                    if (cbSuccess !== null) {
                        (function () {
                            cbSuccess();
                        }());
                    }
                    return true;
                } else {
                    //check if error callback is defined
                    if (cbError !== null) {
                        (function () {
                            cbError();
                        }());
                    }
                    return false;
                }
            } else {
                return false;
            }
        }());
    };

    ////---------------

    ////---------------

    /* make methods unwritable */
    //Users cannot use the console to rewrite core methods
    Object.defineProperties(this, {
        'validate': {
            value: validate,
            writable: false
        },
        'customRule': {
            value: customRule,
            writable: false
        },
        'moreCustomRules': {
            value: moreCustomRules,
            writable: false
        },
        'validateCallBack': {
            value: validateCallBack,
            writable: false
        }
    });
    //Set form id for public eyes
    this.form = () => { return (formID) };
    //version Number
    this.version = () => { return (versionNumber) };
    //validation status
    this.status = () => {
        let res = 0;
        Object.entries(errors).forEach(e => {
            if (Number(e[1]) !== 0) {
                res += 1;
            }
        })
        return res;
    };

    ////---------------
}