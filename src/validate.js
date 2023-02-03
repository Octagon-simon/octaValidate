/**
 * OctaValidate main JS V1.3.2
 * author: Simon Ugorji
 * Last Edit : 4th February 2023
 */

(function () {
    //global Styling
    if (!document.querySelector('#octavalidate-global-style')) {
        const ovStyle = document.createElement("style");
        ovStyle.id = "octavalidate-global-style";
        ovStyle.innerHTML = `
        .octavalidate-inp-error:not([type="checkbox"], [type="file"], [type="radio"]){
        border-color: #e43f5a !important;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right calc(0.375em + 0.1875rem) center;
    background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
    } 
    .octavalidate-inp-success:not([type="checkbox"], [type="file"], [type="radio"]){
        border-color: #4caf50 !important;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%23198754' d='M2.3 6.73L.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right calc(0.375em + 0.1875rem) center;
    background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
    }
    .octavalidate-txt-error{
        display:block;
        color : #d10745;
        font-size: 1rem;
        margin: 5px 0px 0px 0px;
    }`;
        document.head.appendChild(ovStyle);
    }
}());

/**
     * Use this Library to validate your HTML forms before submission.
     * The snippet below shows how you can create a **validation instance** for the form in order to prepare it for validation.
     * 
     * ```js
     * const myForm = new octaValidate('form_ID', userConfig)
     * ``` 
     * 
     * @param form_ID The **ID** of the form you are trying to validate
     * 
     * @param userConfig The **configuration options** to apply to the validation Instance
     * 
     * @returns Object
     * 
 */
function octaValidate(form_ID, userConfig = {
    errorElem : {},
    strictMode : false,
    strictWords : []
}) {
    ////---------------

    /** STORAGE AREA **/
    //store validation counters
    let errors = {}, continueValidation = {}, nextValidation = {};
    //store primary validations
    const validatePrimary = {};
    //store Attribute validations [length,minlength,etc]
    const validateAttr = {};
    //success callback
    let cbSuccess = null;
    //error callback
    let cbError = null;
    //set form id (not publicly shown)
    const formID = form_ID;
    //store config
    const config = {
        strictMode: false,
        strictWords: ["undefined"],
        errorElem : {}
    };
    //version number
    const versionNumber = "1.3.2";

    ////---------------

    /** REFERENCE FUNCTIONS **/
    const isObject = (obj) => {
        return (Object.prototype.toString.call(obj) === '[object Object]');
    };
    const isArray = (ary) => {
        //never used right? Don't worry, Leave am like that :)
        return (Object.prototype.toString.call(ary) === '[object Array]');
    };
    const findElem = (id) => {
        return (document.querySelector('#' + id) !== null);
    };

    //function to replace eval() according to reviews from socket.io
    //this function evaluates a string as an anonymous function
    const runExp = (exp) => Function('return ' + exp)()

    ////---------------

    /** PARAMETERS CHECK **/
    //check if form id is present
    if (typeof form_ID === "undefined"){
        ovDoError("A valid Form Id must be passed as the first Argument during initialization");
    }
        
    //check if userConfig exists and is passed as an object
    if (typeof userConfig !== "undefined" && !isObject(userConfig))
        ovDoError("Configuration options must be passed as a valid object");
    //store configuration
    if (typeof userConfig !== "undefined") {
        if (userConfig.errorElem !== undefined && isObject(userConfig.errorElem) && Object.keys(userConfig.errorElem).length) {
            config.errorElem = userConfig.errorElem
        }
        if (userConfig.strictMode !== undefined) {
            (userConfig.strictMode == true || userConfig.strictMode == false) ? config.strictMode = userConfig.strictMode : null;
        }
        if (userConfig.strictWords !== undefined && userConfig.strictMode !== undefined) {
            if (userConfig.strictMode && userConfig.strictWords.length !== 0) {
                //merge both arrays but remove duplicates
                config.strictWords = [... new Set([...config.strictWords, ...userConfig.strictWords])]
                //admin, undefined, null, NaN
            }
        }
    }

    ////---------------

    //insert error
    const ovNewError = (inputID, error) => {
        //remove previous error
        ovRemoveError(inputID);
        //create error element
        const g = document.createElement("p");
        g.setAttribute("id", "octavalidate_" + inputID);
        g.setAttribute("class", "octavalidate-txt-error");
        g.innerText = error;

        //find element and check if classlist contains an invalid field error
        const f = document.querySelector('#' + formID + " #" + inputID);
        if (!f.classList.contains('octavalidate-inp-error')) {
            f.classList.add("octavalidate-inp-error");
        }
        //check if user provided a custom element to append error after
        if(isObject(config.errorElem) && typeof config.errorElem[inputID] !== "undefined"){
            //element to append error after
            const elem = document.querySelector('#' + formID + " #" + config.errorElem[inputID]);
            //append only if the element exists
            if(elem){
                elem.after(g)
            }else{
                //append error element after the input
                f.parentNode.appendChild(g, f);
            }
        }else{
            //append error element after the input
            f.parentNode.appendChild(g, f);
        }
        
    };
    //remove error
    const ovRemoveError = (inputID) => {
        //remove error text
        let errorElem = (document.querySelector('#octavalidate_' + inputID)) ?
            document.querySelector('#octavalidate_' + inputID) : null;
        let inputElem = (document.querySelector('#' + inputID)) ?
            document.querySelector('#' + inputID) : null;
        //remove classlist
        if (inputElem !== null) {
            (inputElem.classList.contains('octavalidate-inp-error')) ?
                inputElem.classList.remove('octavalidate-inp-error') : null;
        } else {
            ovDoError(`Input ID ${inputID} is missing!`);
        }
        if (errorElem !== null) {
            errorElem.remove();
        }
    };
    //insert success
    const ovNewSuccess = (inputID) => {
        //remove previous error
        ovRemoveSuccess(inputID);
        //set class of input error
        const f = document.querySelector('#' + inputID);
        if (!f.classList.contains('octavalidate-inp-success')) {
            f.classList.add("octavalidate-inp-success");
        }
    };
    //remove success
    const ovRemoveSuccess = (inputID) => {
        let inputElem = (document.querySelector('#' + inputID)) ?
            document.querySelector('#' + inputID) : null;
        //remove classlist
        if (inputElem !== null) {
            (inputElem.classList.contains('octavalidate-inp-success')) ?
                inputElem.classList.remove('octavalidate-inp-success') : null;
        } else {
            ovDoError(`Input ID ${inputID} is missing!`);
        }
    };
    //create event listener for required and strictMode
    //this block helps to attach event listener once to the element
    const attachedEventListeners = {}
    const ovNewEvent = (elem, theEvent) => {
        //check if event listener is not attached already
        //check the function name first
        //In JS everything is an object so we can retrieve fxn name from theEvent.name

        //so check if event listener is unattached or the one attached does not include theEvent.name
        if (typeof attachedEventListeners[elem.id] == "undefined" || !attachedEventListeners[elem.id].includes(theEvent.name)) {
            if (elem.addEventListener) {
                elem.addEventListener("change", theEvent);
            } else if (elem.attachEvent) {
                elem.attachEvent("change", theEvent);
            }
        }
        //event listener has been attached
        attachedEventListeners[elem.id] = (typeof attachedEventListeners[elem.id] !== "undefined") ? [...new Set([...attachedEventListeners[elem.id], theEvent.name])] : [theEvent.name];
    }
    //throw an error / exception
    const ovDoError = function (err) {
        if (!findElem('octavalidate-exception')) {
            const errEl = document.createElement('p');
            errEl.id = "octavalidate-exception";
            errEl.setAttribute('class', 'octavalidate-txt-error');
            errEl.style.textAlign = "center";
            errEl.innerText = "An Exception has occured. Please open the browser's console to preview & debug.";
            //append element only when the form id exists in the DOM
            document.getElementById(formID)?.firstElementChild.before(errEl);
        }
        //throw error
        throw new Error(err);
    }
    //convert size
    const sizeInBytes = (size) => {
        const prevSize = size;
        //convert to lowercase
        size = size.toLowerCase().replaceAll(' ', '');
        //check size
        if (/[0-9]+(bytes|kb|mb|gb|tb|pb)+$/i.test(size) === false) {
            ovDoError(`The size ${prevSize} you provided is Invalid. Please check for typos or make sure that you are providing a size from bytes up to Petabytes`);
        }
        //get the number
        const sizeNum = Number(size.split('').map(sn => { return ((!(isNaN(sn)) ? sn : '')) }).join(''));
        //get the digital storage extension
        const sizeExt = (() => {
            const res = size.split('').map(s => { return (isNaN(s)) }).indexOf(true);
            return ((res !== -1) ? size.substring(res) : "");
        })();
        /**
         * 1KB = 1024 bytes 
         * 1PB = 1024 bytes ^ 5 [I stopped here. Add yours]
         */
        switch (sizeExt) {
            case "bytes":
                return (Number(sizeNum));
            case "kb":
                return (Number(sizeNum * 1024));
            case "mb":
                return (Number(sizeNum * 1024 * 1024));
            case "gb":
                return (Number(sizeNum * 1024 * 1024 * 1024));
            case "tb":
                return (Number(sizeNum * 1024 * 1024 * 1024 * 1024));
            case "pb":
                return (Number(sizeNum * 1024 * 1024 * 1024 * 1024 * 1024));
            default:
                return (0);
        }
    };

    /** CORE VALIDATION LIBRARY**/
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

    //build & store rules
    (function (form_id) {
        //get all rules from the octavalidate attribute
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
        //get files
        const ovFiles = document.querySelectorAll(`#${form_id} [files]`);
        //get minfiles
        const ovMinFiles = document.querySelectorAll(`#${form_id} [minfiles]`);
        //get maxfiles
        const ovMaxFiles = document.querySelectorAll(`#${form_id} [maxfiles]`);
        //get accept
        const ovAccept = document.querySelectorAll(`#${form_id} [accept]`);
        //get accept Mime
        const ovAcceptMime = document.querySelectorAll(`#${form_id} [accept-mime]`);
        //get range
        const ovRange = document.querySelectorAll(`#${form_id} [range]`);

        //collect validations in [octavalidate] attribute
        if (ovPrimaryValidations) {
            let e = 0;
            while (e < ovPrimaryValidations.length) {
                //get id
                const id = ovPrimaryValidations[e].id;
                //get attr
                const attrVal = (ovPrimaryValidations[e].getAttribute("octavalidate")) ? ovPrimaryValidations[e].getAttribute("octavalidate") : ovDoError('Validation rules must be entered within the "octavalidate" attribute and each rule must be separated by a comma.');
                //get type
                const type = (ovPrimaryValidations[e].getAttribute("type")) ? ovPrimaryValidations[e].getAttribute("type") : null;
                //exit if attribute existts but id is null
                if (!id) {
                    ovDoError(`A field with the [octavalidate] attribute in ${form_id} does not have an id [Identifier] attached to it.`);
                }
                //["R", "required"], ["EMAIL", "email"], ["R", "radio"]
                validatePrimary[id] = (validatePrimary[id] === undefined) ? [attrVal, type] : [...validatePrimary[id], attrVal, type];
                //increment
                ++e;
            }
        }
        //collect minlength validations
        if (ovMinLengths) {
            let e = 0;
            while (e < ovMinLengths.length) {
                const val = (ovMinLengths[e].getAttribute('minlength')) ? Number(ovMinLengths[e].getAttribute('minlength')) : ovDoError('You must provide a value for the "minlength" attribute');
                const id = ovMinLengths[e].id;
                //exit if attribute existts but id is null
                if (!id) {
                    ovDoError(`A field with the [minlength] attribute in ${form_id} does not have an id [Identifier] attached to it.`);
                }
                validateAttr[id] = (validateAttr[id] === undefined) ? ['MINLENGTH:' + val] : [...validateAttr[id], 'MINLENGTH:' + val];
                ++e;
            }
        }
        //collect all maxlength inputs
        if (ovMaxLengths) {
            let e = 0;
            while (e < ovMaxLengths.length) {
                const val = (ovMaxLengths[e].getAttribute("maxlength")) ? Number(ovMaxLengths[e].getAttribute("maxlength")) : ovDoError('You must provide a value for the "maxlength" attribute');;
                const id = ovMaxLengths[e].id;
                //exit if attribute existts but id is null
                if (!id) {
                    ovDoError(`A field with the [maxlength] attribute in ${form_id} does not have an id [Identifier] attached to it.`);
                }
                validateAttr[id] = (validateAttr[id] === undefined) ? ['MAXLENGTH:' + val] : [...validateAttr[id], 'MAXLENGTH:' + val];
                ++e;
            }
        }
        //collect all length inputs
        if (ovLengths) {
            let e = 0;
            while (e < ovLengths.length) {
                let val = (ovLengths[e].getAttribute("length")) ? Number(ovLengths[e].getAttribute("length")) : ovDoError('You must provide a value for the "length" attribute');;
                let id = ovLengths[e].id;
                if (!id) {
                    ovDoError(`A field with the [length] attribute in ${form_id} does not have an id [Identifier] attached to it.`);
                }
                validateAttr[id] = (validateAttr[id] === undefined) ? ['LENGTH:' + val] : [...validateAttr[id], 'LENGTH:' + val];
                ++e;
            }
        }
        //collect equalto
        if (ovEqualTo) {
            let e = 0;
            while (e < ovEqualTo.length) {
                const id = ovEqualTo[e].id;
                const val = (ovEqualTo[e].getAttribute('equalto')) ? ovEqualTo[e].getAttribute('equalto') : ovDoError('You must provide a form input ID on the "equalto" attribute');
                if (!id) {
                    ovDoError(`A field with the [equalto] attribute in ${form_id} does not have an id [Identifier] attached to it.`);
                }
                if (ovEqualTo[e].type === "file")
                    ovDoError(`In order to use the "equalto" attribute, this form input ${id} must not be of type "file"`);

                validateAttr[id] = (validateAttr[id] === undefined) ? ['EQUALTO:' + val] : [...validateAttr[id], 'EQUALTO:' + val];
                ++e;
            }
        }
        //collect size for file upload
        if (ovSize) {
            let e = 0;
            while (e < ovSize.length) {
                const id = ovSize[e].id;
                const val = (ovSize[e].getAttribute('size')) ? ovSize[e].getAttribute('size') : ovDoError('You must provide a valid digital storage on the "size" attribute');
                if (!id) {
                    ovDoError(`A field with the [size] attribute in ${form_id} does not have an id [Identifier] attached to it.`);
                }
                //check if type is file
                if (ovSize[e].type !== "file")
                    ovDoError(`In order to use the "size" attribute, this form input ${id} must be of type "file"`);
                validateAttr[id] = (validateAttr[id] === undefined) ? ['SIZE:' + val] : [...validateAttr[id], 'SIZE:' + val];
                ++e;
            }
        }
        //collect min-size for file upload
        if (ovMinSize) {
            let e = 0;
            while (e < ovMinSize.length) {
                let id = ovMinSize[e].id;
                let val = (ovMinSize[e].getAttribute('minsize')) ? ovMinSize[e].getAttribute('minsize') : ovDoError('You must provide a valid digital storage on the "minsize" attribute');
                if (!id) {
                    ovDoError(`A field with the [minsize] attribute in ${form_id} does not have an id [Identifier] attached to it.`);
                }
                //check if type is file
                if (ovMinSize[e].type !== "file")
                    ovDoError(`In order to use the "minsize" attribute, this form input ${id} must be of type "file"`);
                validateAttr[id] = (validateAttr[id] === undefined) ? ['MINSIZE:' + val] : [...validateAttr[id], 'MINSIZE:' + val];
                ++e;
            }
        }
        //collect max-size for file upload
        if (ovMaxSize) {
            let e = 0;
            while (e < ovMaxSize.length) {
                let id = ovMaxSize[e].id;
                let val = (ovMaxSize[e].getAttribute('maxsize')) ? ovMaxSize[e].getAttribute('maxsize') : ovDoError('You must provide a valid digital storage on the "maxsize" attribute');
                if (!id) {
                    ovDoError(`A field with the [maxsize] attribute in ${form_id} does not have an id [Identifier] attached to it.`);
                }
                //check if type is file
                if (ovMaxSize[e].type !== "file")
                    ovDoError(`In order to use the "maxsize" attribute, this form input ${id} must be of type "file"`);
                validateAttr[id] = (validateAttr[id] === undefined) ? ['MAXSIZE:' + val] : [...validateAttr[id], 'MAXSIZE:' + val];
                ++e;
            }
        }
        //collect total files allowed for upload
        if (ovFiles) {
            let e = 0;
            while (e < ovFiles.length) {
                let id = ovFiles[e].id;
                let val = (ovFiles[e].getAttribute('files')) ? Number(ovFiles[e].getAttribute('files')) : ovDoError('You must provide the number of files to be selected on the "files" attribute');
                if (!id) {
                    ovDoError(`A field with the [files] attribute in ${form_id} does not have an id [Identifier] attached to it.`);
                }
                //check if multiple attribute is present
                if (!(ovFiles[e].multiple))
                    ovDoError(`In order to use the "files" attribute, this form input ${id} must have the attribute "multiple"`);
                //check if type is file
                if (ovFiles[e].type !== "file")
                    ovDoError(`In order to use the "files" attribute, this form input ${id} must be of type "file"`);
                validateAttr[id] = (validateAttr[id] === undefined) ? ['FILES:' + val] : [...validateAttr[id], 'FILES:' + val];
                ++e;
            }
        }
        //collect minimum files allowed for upload
        if (ovMinFiles) {
            let e = 0;
            while (e < ovMinFiles.length) {
                let id = ovMinFiles[e].id;
                let val = (ovMinFiles[e].getAttribute('minfiles')) ? Number(ovMinFiles[e].getAttribute('minfiles')) : ovDoError('You must provide the minimum files to be selected on the "minfiles" attribute');
                if (!id) {
                    ovDoError(`A field with the [minfiles] attribute in ${form_id} does not have an id [Identifier] attached to it.`);
                }
                //check if multiple attribute is present
                if (!(ovMinFiles[e].multiple))
                    ovDoError(`In order to use the "minfiles" attribute, this form input ${id} must have the attribute "multiple"`);
                //check if type is file
                if (ovMinFiles[e].type !== "file")
                    ovDoError(`In order to use the "minfiles" attribute, this form input ${id} must be of type "file"`);
                validateAttr[id] = (validateAttr[id] === undefined) ? ['MINFILES:' + val] : [...validateAttr[id], 'MINFILES:' + val];
                ++e;
            }
        }
        //collect maximum files allowed for upload
        if (ovMaxFiles) {
            let e = 0;
            while (e < ovMaxFiles.length) {
                let id = ovMaxFiles[e].id;
                let val = (ovMaxFiles[e].getAttribute('maxfiles')) ? Number(ovMaxFiles[e].getAttribute('maxfiles')) : ovDoError('You must provide the maximum files to be selected on the "maxfiles" attribute');
                if (!id) {
                    ovDoError(`A field with the [maxfiles] attribute in ${form_id} does not have an id [Identifier] attached to it.`);
                }
                //check if multiple attribute is present
                if (!(ovMaxFiles[e].multiple))
                    ovDoError(`In order to use the "maxfiles" attribute, this form input ${id} must have the attribute "multiple"`);
                //check if type is file
                if (ovMaxFiles[e].type !== "file")
                    ovDoError(`In order to use the "maxfiles" attribute, this form input ${id} must be of type "file"`);
                validateAttr[id] = (validateAttr[id] === undefined) ? ['MAXFILES:' + val] : [...validateAttr[id], 'MAXFILES:' + val];
                ++e;
            }
        }
        //collect accepted file extensions
        if (ovAccept) {
            let e = 0;
            while (e < ovAccept.length) {
                let id = ovAccept[e].id;
                let val = (ovAccept[e].getAttribute('accept')) ? ovAccept[e].getAttribute('accept') : ovDoError('You must provide the file extensions to be matched against on the "accept" attribute');
                if (!id) {
                    ovDoError(`A field with the [accept] attribute in ${form_id} does not have an id [Identifier] attached to it.`);
                }
                //check if type is file
                if (ovAccept[e].type !== "file")
                    ovDoError(`In order to use the "accept" attribute, this form input ${id} must be of type "file"`);
                validateAttr[id] = (validateAttr[id] === undefined) ? ['ACCEPT:' + val] : [...validateAttr[id], 'ACCEPT:' + val];
                ++e;
            }
        }
        //collect accepted file MIME types
        if (ovAcceptMime) {
            let e = 0;
            while (e < ovAcceptMime.length) {
                let id = ovAcceptMime[e].id;
                let val = (ovAcceptMime[e].getAttribute('accept-mime')) ? ovAcceptMime[e].getAttribute('accept-mime') : ovDoError('You must provide the file MIME types to be matched against on the "accept-mime" attribute');
                if (!id) {
                    ovDoError(`A field with the [accept-mime] attribute in ${form_id} does not have an id [Identifier] attached to it.`);
                }
                //check if type is file
                if (ovAcceptMime[e].type !== "file")
                    ovDoError(`In order to use the "accept-mime" attribute, this form input ${id} must be of type "file"`);
                validateAttr[id] = (validateAttr[id] === undefined) ? ['ACCEPT-MIME:' + val] : [...validateAttr[id], 'ACCEPT-MIME:' + val];
                ++e;
            }
        }
        //collect accepted file MIME types
        if (ovRange) {
            let e = 0;
            while (e < ovRange.length) {
                let id = ovRange[e].id;
                let val = (ovRange[e].getAttribute('range')) ? ovRange[e].getAttribute('range') : ovDoError('You must provide a range of numbers to validate');
                if (!id) {
                    ovDoError(`A field with the [range] attribute does not have an id [Identifier] attached to it.`);
                }
                //check if type is number
                if (ovRange[e].type !== "number")
                    ovDoError(`In order to use the "range" attribute, this form input [${id}] must be of type "number"`);
                validateAttr[id] = (validateAttr[id] === undefined) ? ['RANGE:' + val] : [...validateAttr[id], 'RANGE:' + val];
                ++e;
            }
        }
    }(formID)); //end of build validation rules

    //store custom rules
    let customRules = [];
    //add single rule
    /**
     * Use this method to build a single custom rule for your form
     * 
     * ```js
     * const myForm = new octaValidate('my_form')
     * myForm.customRule('PASS', /12345/, "Password must be 12345")
     * ``` 
     * 
    * @param rule_title The TITLE for your validation rule. This title must not be an inbuilt validation rule!
     * 
     * @param regExp The regular expression for your validation rule. It must not be a string. The JavaScript engine natively recognizes regular expressions
     * 
     * @param text The error message to display when validation fails
     * 
     * @returns Boolean
     * 
     */
    function customRule(rule_title, regExp, text) {
        //store rule
        customRules[rule_title] = [regExp, text];
        return (customRules[rule_title] !== undefined ? true : false);
    };
    /**
     * Use this method to build multiple custom rules for your form
     * 
    * @param rules This must be an object with your validation rule, regular expression and error text separated by a comma [Please refer to the readme file]
     * 
     * @returns Boolean
     */
    function moreCustomRules(rules) {
        if (!isObject(rules)) ovDoError("The rules provided must be a valid Object! Please refer to the documentation");

        let r = 0;

        while (r < Object.keys(rules).length) {
            const rule_title = Object.keys(rules)[r]; //get rule title / index
            const regExp = rules[rule_title][0]; //get RegExp
            const text = rules[rule_title][1].toString(); //get error text

            if (rule_title && regExp && text)
                customRules[rule_title] = [regExp, text]
            else
                ovDoError(`Custom Validation rule at index [${r}] is Invalid!`);
            ++r;
        }
        return (customRules[rule_title] !== undefined ? true : false);
    };

    /**
     * Use this method to add callback functions that will execute when a validation test fails or when validation tests are passed
     * 
    * @param success This callback will execute when validation tests are passed [Please refer to the readme file]
     * @param error This callback will execute when a validation test fails [Please refer to the readme file]
     * 
     * @returns void
     */
    function validateCallBack(success, error) {
        if (typeof success === "function") {
            cbSuccess = success;
        }
        if (typeof error === "function") {
            cbError = error;
        }
    };

    /**
     * Invoke this method when the form is submitted to begin validation on the form
     * 
     * ```js
     * const myForm = new octaValidate('my_form')
     * myForm.validate()
     * ```
     * @returns Boolean
     */
    function validate() {

        const form_id = formID;
        //check if form id exists in DOM
        if (!findElem(form_id)) ovDoError(`A form with this ID [${form_id}] does not exist in the DOM`);
        //Begin validation and return result
        return (function validateForm() {
            if (validatePrimary !== null ||
                validateAttr !== null) {
                //loop through all form elements that needs validation
                let formInputs = document.querySelectorAll(`#${form_id} [octavalidate], [length], [maxlength], [minlength], [equalto], [size], [maxsize], [minsize], [accept], [accept-mime], [files], [minfiles], [maxfiles], [range]`);
                formInputs.forEach(input => {
                    //check if id exists within the element
                    if (input.id !== "") {
                        //errors is unique on the input id [was not initially implemented :)]
                        let formInputId = input.id;
                        //errors is unique on the input id
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
                                ovDoError(`The Form Input Element with the ID [${formInputId}] is nowhere to be found`);
                            }
                            //set strict words
                            let strictWords = config.strictWords;
                            if (elem.type !== "file" && elem.type !== "checkbox" && elem.type !== "radio" && elem.tagName != "SELECT") {
                                //remove whitespace
                                elem.value = elem.value.trim();
                            }
                            //handle strict words
                            const checkStrictWords = (value) => {
                                const res = strictWords.filter(s => { return value.match(new RegExp(`${'(' + s + ')'}`, 'i')) })
                                return res
                            }

                            if ((elem.value !== "") && (checkStrictWords(elem.value).length !== 0) && elem.type !== "file" && elem.type !== "checkbox" && elem.type !== "radio") {
                                errors[formInputId]++;
                                validationText = (elem.getAttribute('ov-strict-msg')) ? elem.getAttribute('ov-strict-msg').toString() : `Please remove or replace '${checkStrictWords(elem.value).join(', ')}'`;
                                ovRemoveSuccess(index);
                                ovNewError(index, validationText);
                                if (elem.addEventListener) {
                                    elem.addEventListener("change",
                                        function () {
                                            if (this.value && (checkStrictWords(this.value).length !== 0)) {
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
                                        if (this.value && (checkStrictWords(this.value).length !== 0)) {
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
                                    ovDoError(`Input ID ${index} is missing`);
                                }

                                //create event listener
                                let eventAction = function () {
                                    if (runExp(validationInfo) === false) {
                                        errors[formInputId]++;
                                        ovRemoveSuccess(index);
                                        ovNewError(index, validationText);
                                    } else {
                                        errors[formInputId]--;
                                        ovRemoveError(index);
                                        ovNewSuccess(index);
                                    }
                                    validateForm();
                                }
                                //loop through validations
                                validatePrimary[index][0].split(',').forEach(item => {
                                    //required
                                    if (item === 'R' || (elem.getAttribute('required') !== null)) {
                                        if (type == "checkbox" || type == "radio") {
                                            if (!elem.checked) {
                                                errors[formInputId]++;
                                                validationInfo = `${!elem.checked}`;
                                                validationText = (elem.getAttribute("ov-required-msg")) ? elem.getAttribute("ov-required-msg").toString() : 'This checkbox is required';
                                                ovRemoveSuccess(index);
                                                ovNewError(index, validationText);
                                                ovNewEvent(elem, eventAction)
                                                continueValidation[formInputId] = 0;
                                            } else {
                                                ovRemoveError(index);
                                                continueValidation[formInputId]++;
                                            }//required check box or radio validation
                                        } else if (type == "file") {
                                            if (elem.files.length === 0) {
                                                errors[formInputId]++;
                                                validationInfo = `${elem.files.length}`;
                                                validationText = (elem.getAttribute("ov-required-msg")) ? elem.getAttribute("ov-required-msg").toString() : 'Please select a valid file';
                                                ovRemoveSuccess(index);
                                                ovNewError(index, validationText);
                                                ovNewEvent(elem, eventAction)
                                                continueValidation[formInputId] = 0;
                                            } else {
                                                ovRemoveError(index);
                                                continueValidation[formInputId]++;
                                            }//required file validation
                                        } else {
                                            if (elem.value.trim() == "") {
                                                errors[formInputId]++;
                                                //or !!elem.value.trim()
                                                validationInfo = `${elem.value.length}`
                                                validationText = (elem.getAttribute('ov-required-msg')) ? elem.getAttribute('ov-required-msg').toString() : "This field is required";
                                                ovRemoveSuccess(index);
                                                ovNewError(index, validationText);
                                                ovNewEvent(elem, eventAction)
                                            } else { continueValidation[formInputId]++;}
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
                                                ovNewEvent(elem, eventAction)
                                                continueValidation[formInputId] = 0;
                                            } else { continueValidation[formInputId]++; }
                                        } else {
                                            continueValidation[formInputId]++;
                                        }
                                    } else {
                                        continueValidation[formInputId]++;
                                    }//end of custom validaton rules

                                    if (elem.value && continueValidation[formInputId] && (item === 'EMAIL' || type == 'email')) {
                                        if (!octaValidations.ValidateEmail(elem.value)) {
                                            continueValidation[formInputId] = 0;
                                            errors[formInputId]++;
                                            validationInfo = `${!octaValidations.ValidateEmail(elem.value)}`;
                                            validationText = (elem.getAttribute('ov-email-msg')) ? elem.getAttribute('ov-email-msg').toString() : "Please provide a valid email address";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            ovNewEvent(elem, eventAction)
                                        } else {
                                            continueValidation[formInputId]++;
                                        }
                                    } else {
                                        continueValidation[formInputId]++;
                                    }//email

                                    if (elem.value && continueValidation[formInputId] && item === 'ALPHA_ONLY') {
                                        if (!octaValidations.ValidateAlpha_Only(elem.value)) {
                                            errors[formInputId]++;
                                            validationInfo = `${!octaValidations.ValidateAlpha_Only(elem.value)}`;
                                            validationText = (elem.getAttribute('ov-alpha-only-msg:')) ? elem.getAttribute('ov-alpha-only-msg:').toString() : "Please enter only Letters!";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            ovNewEvent(elem, eventAction)
                                            continueValidation[formInputId] = 0;
                                        } else { continueValidation[formInputId]++; }
                                    } else {
                                        continueValidation[formInputId]++;
                                    }//ALPHABETS + SPACES

                                    if (elem.value && continueValidation[formInputId] && item === 'ALPHA_SPACES') {
                                        if (!octaValidations.ValidateAlpha_Spaces(elem.value)) {
                                            errors[formInputId]++;
                                            validationInfo = `${!octaValidations.ValidateAlpha_Spaces(elem.value)}`;
                                            validationText = (elem.getAttribute('ov-alpha-spaces-msg')) ? elem.getAttribute('ov-alpha-spaces-msg').toString() : "Please enter only Letters or spaces!";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            ovNewEvent(elem, eventAction)
                                            continueValidation[formInputId] = 0;
                                        } else { continueValidation[formInputId]++; }
                                    } else {
                                        continueValidation[formInputId]++;
                                    }//ALPHABETS + SPACES

                                    if (elem.value && continueValidation[formInputId] && item === 'ALPHA_NUMERIC') {
                                        if (!octaValidations.ValidateAlpha_Numeric(elem.value)) {
                                            errors[formInputId]++;
                                            validationInfo = `${!octaValidations.ValidateAlpha_Numeric(elem.value)}`;
                                            validationText = (elem.getAttribute('ov-alpha-numeric-msg')) ? elem.getAttribute('ov-alpha-numeric-msg').toString() : "Please enter only Letters or Numbers!";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            ovNewEvent(elem, eventAction)
                                            continueValidation[formInputId] = 0;
                                        } else { continueValidation[formInputId]++; }
                                    } else {
                                        continueValidation[formInputId]++;
                                    }//ALPHABETS + NUMBERS

                                    if (elem.value && continueValidation[formInputId] && item === 'LOWER_ALPHA') {
                                        if (!octaValidations.ValidateLower_Alpha(elem.value)) {
                                            errors[formInputId]++;
                                            validationInfo = `${!octaValidations.ValidateLower_Alpha(elem.value)}`;
                                            validationText = (elem.getAttribute('ov-lower-alpha-msg')) ? elem.getAttribute('ov-lower-alpha-msg').toString() : "Only letters in lowercase are allowed!";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            ovNewEvent(elem, eventAction)
                                            continueValidation[formInputId] = 0;
                                        } else { continueValidation[formInputId]++; }
                                    } else {
                                        continueValidation[formInputId]++;
                                    }//Lowercase letters

                                    if (elem.value && continueValidation[formInputId] && item === 'UPPER_ALPHA') {
                                        if (!octaValidations.ValidateUpper_Alpha(elem.value)) {
                                            errors[formInputId]++;
                                            validationInfo = `${!octaValidations.ValidateUpper_Alpha(elem.value)}`;
                                            validationText = (elem.getAttribute('ov-upper-alpha-msg')) ? elem.getAttribute('ov-upper-alpha-msg').toString() : "Only letters in uppercase are allowed!";
                                            ovRemoveSuccess(index);
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            ovNewEvent(elem, eventAction)
                                            continueValidation[formInputId] = 0;
                                        } else { continueValidation[formInputId]++; }
                                    } else {
                                        continueValidation[formInputId]++;
                                    }//Uppercase letters

                                    if (elem.value && continueValidation[formInputId] && item === 'PWD') {
                                        if (!octaValidations.ValidatePWD(elem.value)) {
                                            errors[formInputId]++;
                                            validationInfo = `${!octaValidations.ValidatePWD(elem.value)}`;
                                            validationText = (elem.getAttribute('ov-pwd-msg')) ? elem.getAttribute('ov-pwd-msg').toString() : "Password Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            ovNewEvent(elem, eventAction)
                                            continueValidation[formInputId] = 0;
                                        } else { continueValidation[formInputId]++; }
                                    } else {
                                        continueValidation[formInputId]++;
                                    }//Uppercase letters

                                    if (elem.value && continueValidation[formInputId] && (item === 'DIGITS' || type == 'number')) {
                                        if (isNaN(elem.value)) {
                                            errors[formInputId]++;
                                            validationInfo = `${!isNaN(elem.value)}`;
                                            validationText = (elem.getAttribute('ov-digits-msg')) ?
                                                elem.getAttribute('ov-digits-msg').toString() :
                                                "Please provide a valid Number";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            ovNewEvent(elem, eventAction);
                                            continueValidation[formInputId] = 0;
                                        } else { continueValidation[formInputId]++; }
                                    } else {
                                        continueValidation[formInputId]++;
                                    }//Numbers

                                    if (elem.value && continueValidation[formInputId] && (item === 'URL' || type == 'url')) {
                                        if (!octaValidations.ValidateUrl(elem.value)) {
                                            errors[formInputId]++;
                                            validationInfo = `${!octaValidations.ValidateUrl(elem.value)}`;
                                            validationText = (elem.getAttribute('ov-url-msg')) ? elem.getAttribute('ov-url-msg').toString() : "Please provide a valid URL that begins with http or https!";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            ovNewEvent(elem, eventAction);
                                            continueValidation[formInputId] = 0;
                                        } else { continueValidation[formInputId]++; }
                                    } else {
                                        continueValidation[formInputId]++;
                                    }//URL

                                    if (elem.value && continueValidation[formInputId] && item === 'URL_QP') {
                                        if (!octaValidations.ValidateUrl_QP(elem.value)) {
                                            errors[formInputId]++;
                                            validationInfo = `${!octaValidations.ValidateUrl_QP(elem.value)}`;
                                            validationText = (elem.getAttribute('ov-url-qp-msg')) ? elem.getAttribute('ov-url-qp-msg').toString() : "Please provide a valid URL with a query parameter.";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            ovNewEvent(elem, eventAction);
                                            continueValidation[formInputId] = 0;
                                        } else { continueValidation[formInputId]++; }
                                    } else {
                                        continueValidation[formInputId]++;
                                    }//URL with query params

                                    if (elem.value && continueValidation[formInputId] && item === 'DATE_MDY') {
                                        if (!octaValidations.ValidateDate_MDY(elem.value)) {
                                            errors[formInputId]++;
                                            validationInfo = `${!octaValidations.ValidateDate_MDY(elem.value)}`;
                                            validationText = (elem.getAttribute('ov-date-mdy-msg')) ? elem.getAttribute('ov-date-mdy-msg').toString() : "Please provide a date with the format mm/dd/yyyy.";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            ovNewEvent(elem, eventAction);
                                            continueValidation[formInputId] = 0;
                                        } else { continueValidation[formInputId]++; }
                                    } else {
                                        continueValidation[formInputId]++;
                                    }//date mm/dd/yyyy

                                    if (elem.value && continueValidation[formInputId] && item === 'USERNAME') {
                                        if (!octaValidations.ValidateUserName(elem.value)) {
                                            errors[formInputId]++;
                                            validationInfo = `${!octaValidations.ValidateUserName(elem.value)}`;
                                            validationText = (elem.getAttribute('ov-username-msg')) ? elem.getAttribute('ov-username-msg').toString() : "Your username should contain alphanumeric characters only.";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            ovNewEvent(elem, eventAction);
                                            continueValidation[formInputId] = 0;
                                        } else { continueValidation[formInputId]++; }
                                    } else {
                                        continueValidation[formInputId]++;
                                    }//username

                                    if (elem.value && continueValidation[formInputId] && item === 'TEXT') {
                                        if (!octaValidations.ValidateTEXT(elem.value)) {
                                            errors[formInputId]++;
                                            validationInfo = `${!octaValidations.ValidateTEXT(elem.value)}`;
                                            validationText = (elem.getAttribute('ov-text-msg')) ?
                                                elem.getAttribute('ov-text-msg').toString() :
                                                "This field contains invalid characters.";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            ovNewEvent(elem, eventAction)
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
                                //get element type
                                let type = elem.type;
                                //get multiple attribute (true or false)
                                let isMultiple = elem.multiple;
                                if (elem === null) {
                                    ovDoError(`Input ID ${index} is missing`);
                                };
                                let attributesEventAction = () => {
                                    if (elem.value) {
                                        if (runExp(validationInfo) === false) {
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
                                    /*
                                    * Regular Expressions
                                    *
                                    * mime type [image/jpeg] /.\/+[^*]/
                                    * mime type with wildcard [image/*] /.\/\*{1}/
                                    * file extension /\.{1}./
                                    **/
                                    if (f.split(':')[0] === 'ACCEPT' && type == 'file') {
                                        //get and convert to lowercase
                                        const requiredFileExts = f.split(':')[1].replaceAll(' ', '').split(',').map(m => {
                                            return (m.toLowerCase());
                                        });
                                        if (elem.files !== null && elem.files.length !== 0 && requiredFileExts.length !== 0) {
                                            //loop through selected files
                                            for (let ef of elem.files) {
                                                //get file extension from name and check if it is allowed
                                                if (!(requiredFileExts.includes(ef.name.toLowerCase().substring(ef.name.toLowerCase().lastIndexOf("."))))) {
                                                    errors[formInputId]++;
                                                    validationInfo = `${!(requiredFileExts.includes(ef.name.toLowerCase().substring(ef.name.toLowerCase().lastIndexOf("."))))}`;
                                                    validationText = (elem.getAttribute("ov-accept-msg")) ? (elem.getAttribute("ov-accept-msg")) : "File type is not supported";
                                                    ovRemoveSuccess(index);
                                                    ovNewError(index, validationText);
                                                    ovNewEvent(elem, attributesEventAction)
                                                    continueValidation[formInputId] = 0;
                                                } else {
                                                    continueValidation[formInputId]++;
                                                }
                                            }
                                        }
                                    } else if (f.split(':')[0] === 'ACCEPT-MIME' && type == 'file') {
                                        //get and convert to lowercase
                                        const requiredFileMime = f.split(':')[1].replaceAll(' ', '').split(',').map(m => {
                                            return (m.toLowerCase());
                                        });
                                        if (elem.files !== null && elem.files.length !== 0 && requiredFileMime.length !== 0) {
                                            //loop through selected files
                                            for (let ef of elem.files) {
                                                //check if required mimes includes the file type & wildcard
                                                if (!(requiredFileMime.includes(ef.type)) && !(requiredFileMime.includes(ef.type.split(ef.type.substr(ef.type.indexOf('/')))[0] + "/*"))) {
                                                    errors[formInputId]++;
                                                    validationInfo = `${!(requiredFileMime.includes(ef.type)) && !(requiredFileMime.includes(ef.type.split(ef.type.substr(ef.type.indexOf('/')))[0] + "/*"))}`;
                                                    validationText = (elem.getAttribute("ov-accept-mime-msg")) ? (elem.getAttribute("ov-accept-mime-msg")) : "File type is not supported";
                                                    ovRemoveSuccess(index);
                                                    ovNewError(index, validationText);
                                                    ovNewEvent(elem, attributesEventAction)
                                                } else {
                                                    continueValidation[formInputId] = 0;
                                                }
                                            }
                                        }
                                    } else if (f.split(':')[0] === 'SIZE' && type == 'file' && !isMultiple) {
                                        const requiredSize = sizeInBytes(f.split(':')[1]);
                                        if (elem.files !== null && elem.files.length !== 0) {
                                            Object.entries(elem.files).forEach(ef => {
                                                if (ef[1].size !== requiredSize) {
                                                    errors[formInputId]++;
                                                    validationInfo = `${ef[1].size !== requiredSize}`;
                                                    validationText = (elem.getAttribute("ov-size-msg")) ? (elem.getAttribute("ov-size-msg")) : "File size must be exactly " + f.split(':')[1].replace(' ', '').toUpperCase();
                                                    ovRemoveSuccess(index);
                                                    ovNewError(index, validationText);
                                                    ovNewEvent(elem, attributesEventAction)
                                                    continueValidation[formInputId] = 0;
                                                } else {
                                                    continueValidation[formInputId]++;
                                                }
                                            })
                                        }

                                    } else if (f.split(':')[0] === 'MINSIZE' && type == 'file' && !isMultiple) {
                                        const requiredSize = sizeInBytes(f.split(':')[1]);
                                        if (elem.files !== null && elem.files.length !== 0) {
                                            Object.entries(elem.files).forEach(ef => {
                                                if (!(ef[1].size >= requiredSize)) {
                                                    errors[formInputId]++;
                                                    validationInfo = `${!(ef[1].size >= requiredSize)}`;
                                                    validationText = (elem.getAttribute("ov-minsize-msg")) ? (elem.getAttribute("ov-minsize-msg")) : "File size must be equal to or greater than " + f.split(':')[1].replace(' ', '').toUpperCase();
                                                    ovRemoveSuccess(index);
                                                    ovNewError(index, validationText);
                                                    ovNewEvent(elem, attributesEventAction)
                                                    continueValidation[formInputId] = 0;
                                                } else {
                                                    continueValidation[formInputId]++;
                                                }
                                            })
                                        }

                                    } else if (f.split(':')[0] === 'MAXSIZE' && type == 'file' && !isMultiple) {
                                        const requiredSize = sizeInBytes(f.split(':')[1]);
                                        if (elem.files !== null && elem.files.length !== 0) {
                                            Object.entries(elem.files).forEach(ef => {
                                                if (!(ef[1].size <= requiredSize)) {
                                                    errors[formInputId]++;
                                                    validationInfo = `${!(ef[1].size <= requiredSize)}`;
                                                    validationText = (elem.getAttribute("ov-minsize-msg")) ? (elem.getAttribute("ov-minsize-msg")) : "File size must be equal to or less than " + f.split(':')[1].replace(' ', '').toUpperCase();
                                                    ovRemoveSuccess(index);
                                                    ovNewError(index, validationText);
                                                    ovNewEvent(elem, attributesEventAction)
                                                    continueValidation[formInputId] = 0;
                                                } else {
                                                    continueValidation[formInputId]++;
                                                }
                                            })
                                        }

                                    } else if (f.split(':')[0] === 'SIZE' && type == 'file' && isMultiple) {
                                        const requiredSize = sizeInBytes(f.split(':')[1]);
                                        if (elem.files !== null && elem.files.length !== 0) {
                                            let uploadedSize = 0;
                                            for (let ef of elem.files) {
                                                uploadedSize += ef.size;
                                            }
                                            if (uploadedSize !== requiredSize) {
                                                errors[formInputId]++;
                                                validationInfo = `${(uploadedSize !== requiredSize)}`;
                                                validationText = (elem.getAttribute("ov-totalsize-msg")) ? (elem.getAttribute("ov-totalsize-msg")) : "Please select files that is equal to " + f.split(':')[1].replace(' ', '').toUpperCase();
                                                ovRemoveSuccess(index);
                                                ovNewError(index, validationText);
                                                ovNewEvent(elem, attributesEventAction)
                                                continueValidation[formInputId] = 0;
                                            } else {
                                                continueValidation[formInputId]++;
                                            }
                                        }
                                    } else if (f.split(':')[0] === 'MINSIZE' && type == 'file' && isMultiple) {
                                        const requiredSize = sizeInBytes(f.split(':')[1]);
                                        if (elem.files !== null && elem.files.length !== 0) {
                                            let uploadedSize = 0;
                                            for (let ef of elem.files) {
                                                uploadedSize += ef.size;
                                            }
                                            if (!(uploadedSize >= requiredSize)) {
                                                errors[formInputId]++;
                                                validationInfo = `${!(uploadedSize >= requiredSize)}`;
                                                validationText = (elem.getAttribute("ov-totalminsize-msg")) ? (elem.getAttribute("ov-totalminsize-msg")) : "Please select files that is more than or equal to " + f.split(':')[1].replace(' ', '').toUpperCase();
                                                ovRemoveSuccess(index);
                                                ovNewError(index, validationText);
                                                ovNewEvent(elem, attributesEventAction)
                                                continueValidation[formInputId] = 0;
                                            } else {
                                                continueValidation[formInputId]++;
                                            }
                                        }
                                    } else if (f.split(':')[0] === 'MAXSIZE' && type == 'file' && isMultiple) {
                                        const requiredSize = sizeInBytes(f.split(':')[1]);
                                        if (elem.files !== null && elem.files.length !== 0) {
                                            let uploadedSize = 0;
                                            for (let ef of elem.files) {
                                                uploadedSize += ef.size;
                                            }
                                            if (!(uploadedSize <= requiredSize)) {
                                                errors[formInputId]++;
                                                validationInfo = `${!(uploadedSize <= requiredSize)}`;
                                                validationText = (elem.getAttribute("ov-totalminsize-msg")) ? (elem.getAttribute("ov-totalminsize-msg")) : "Please select files that is less than or equal to " + f.split(':')[1].replace(' ', '').toUpperCase();
                                                ovRemoveSuccess(index);
                                                ovNewError(index, validationText);
                                                ovNewEvent(elem, attributesEventAction)
                                                continueValidation[formInputId] = 0;
                                            } else {
                                                continueValidation[formInputId]++;
                                            }
                                        }

                                    } else if (f.split(':')[0] === 'FILES' && type == 'file' && isMultiple) {
                                        const requiredNum = Number(f.split(':')[1]);
                                        if (elem.files !== null && elem.files.length !== 0) {
                                            if (elem.files.length !== requiredNum) {
                                                errors[formInputId]++;
                                                validationInfo = `${(elem.files.length !== requiredNum)}`;
                                                validationText = (elem.getAttribute("ov-files-msg")) ? (elem.getAttribute("ov-files-msg")) : "Please select " + f.split(':')[1].replace(' ', '') + " files";
                                                ovRemoveSuccess(index);
                                                ovNewError(index, validationText);
                                                ovNewEvent(elem, attributesEventAction)
                                                continueValidation[formInputId] = 0;
                                            } else {
                                                continueValidation[formInputId]++;
                                            }
                                        }
                                    } else if (f.split(':')[0] === 'MINFILES' && type == 'file' && isMultiple) {
                                        const requiredNum = Number(f.split(':')[1]);
                                        if (elem.files !== null && elem.files.length !== 0) {
                                            if (!(elem.files.length >= requiredNum)) {
                                                errors[formInputId]++;
                                                validationInfo = `${!(elem.files.length >= requiredNum)}`;
                                                validationText = (elem.getAttribute("ov-minfiles-msg")) ? (elem.getAttribute("ov-minfiles-msg")) : "Please select " + f.split(':')[1].replace(' ', '') + " files or more";
                                                ovRemoveSuccess(index);
                                                ovNewError(index, validationText);
                                                ovNewEvent(elem, attributesEventAction)
                                                continueValidation[formInputId] = 0;
                                            } else {
                                                continueValidation[formInputId]++;
                                            }
                                        }
                                    } else if (f.split(':')[0] === 'MAXFILES' && type == 'file' && isMultiple) {
                                        const requiredNum = Number(f.split(':')[1]);
                                        if (elem.files !== null && elem.files.length !== 0) {
                                            if (!(elem.files.length <= requiredNum)) {
                                                errors[formInputId]++;
                                                validationInfo = `${!(elem.files.length <= requiredNum)}`;
                                                validationText = (elem.getAttribute("ov-maxfiles-msg")) ? (elem.getAttribute("ov-maxfiles-msg")) : "Please select " + f.split(':')[1].replace(' ', '') + " files or less";
                                                ovRemoveSuccess(index);
                                                ovNewError(index, validationText);
                                                ovNewEvent(elem, attributesEventAction)
                                                continueValidation[formInputId] = 0;
                                            } else {
                                                continueValidation[formInputId]++;
                                            }
                                        }
                                    } else if (f.split(':')[0] === 'MINLENGTH') {
                                        if (elem.value.trim() !== "" && !(elem.value.length >= Number(f.split(':')[1]))) {
                                            errors[formInputId]++;
                                            validationInfo = `${!(elem.value.length >= Number(f.split(':')[1]))}`;
                                            validationText = (elem.getAttribute("ov-minlength-msg")) ? (elem.getAttribute("ov-minlength-msg")) : "Please provide " + f.split(':')[1] + " or more characters";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            ovNewEvent(elem, attributesEventAction)
                                            continueValidation[formInputId] = 0;
                                        } else {
                                            continueValidation[formInputId]++;
                                        }
                                    } else if (f.split(':')[0] === 'MAXLENGTH') {
                                        if (elem.value.trim() !== "" && !(elem.value.length <= Number(f.split(':')[1]))) {
                                            errors[formInputId]++;
                                            validationInfo = `${!(elem.value.length <= Number(f.split(':')[1]))}`;
                                            validationText = (elem.getAttribute("ov-maxlength-msg")) ? (elem.getAttribute("ov-maxlength-msg")) : "Please provide " + f.split(':')[1] + " characters or less.";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            ovNewEvent(elem, attributesEventAction)
                                            continueValidation[formInputId] = 0;
                                        } else {
                                            continueValidation[formInputId]++;
                                        }
                                    } else if (f.split(':')[0] === 'LENGTH') {
                                        if (elem.value.trim() !== "" && elem.value.length !== Number(f.split(':')[1])) {
                                            errors[formInputId]++;
                                            validationInfo = `${elem.value.length !== Number(f.split(':')[1])}`;
                                            validationText = (elem.getAttribute("ov-length-msg")) ? (elem.getAttribute("ov-length-msg")) : "Please provide exactly " + f.split(':')[1] + " characters";
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            ovNewEvent(elem, attributesEventAction)
                                            continueValidation[formInputId] = 0;
                                        } else {
                                            continueValidation[formInputId]++;
                                            elem.removeEventListener('change',attributesEventAction)
                                        }
                                    } else if (f.split(':')[0] === 'EQUALTO') {
                                        let EqualToElem = document.querySelector('#' + f.split(':')[1]);
                                        validationText = (elem.getAttribute('ov-equalto-msg')) ? elem.getAttribute('ov-equalto-msg').toString() : 'Both values do not match';
                                        if (EqualToElem.value.trim() !== "" &&
                                            (elem.value !== EqualToElem.value)) {
                                            errors[formInputId]++;
                                            validationInfo = `${(EqualToElem.value.trim() !== "" &&
                                                (elem.value !== EqualToElem.value))}`;
                                            ovRemoveSuccess(index);
                                            ovNewError(index, validationText);
                                            ovNewEvent(elem, attributesEventAction)
                                            continueValidation[formInputId] = 0;
                                        } else {
                                            ovRemoveError(index);
                                        }
                                    } else if (f.split(':')[0] === 'RANGE' && type == "number") {
                                        const range =  f.split(':')[1].replaceAll(' ','').split('-');
                                        const min = Number(range[0]);
                                        const max = Number(range[1]);
                                        
                                        validationText = (elem.getAttribute('ov-range-msg')) ? elem.getAttribute('ov-range-msg').toString() : `Number must be within the range of ${f.split(':')[1]}`;

                                        if (elem.value.trim() !== "" && ( (Number(elem.value) < min) || Number(elem.value) > max)) {
                                            errors[formInputId]++;
                                            validationInfo = `${elem.value.trim() !== "" && ( (Number(elem.value) < min) || Number(elem.value) > max)}`;
                                            ovRemoveSuccess(index);
                                            // consuming too much memory because of the action of event listeners
                                            // ovNewError(index, validationText);
                                            // if (elem.addEventListener) {
                                            //     elem.addEventListener("change", attributesEventAction);
                                            // } else if (elem.attachEvent) {
                                            //     elem.attachEvent("change", attributesEventAction);
                                            // }
                                            ovNewError(index, validationText);
                                            ovNewEvent(elem, attributesEventAction)
                                            continueValidation[formInputId] = 0;
                                        } else {
                                            errors[formInputId]--;
                                            ovNewSuccess(index);
                                            ovRemoveError(index);
                                        }
                                    }
                                })
                            }
                        }
                    }//end of check if id is provided
                }); //end of foreach loop
                //console.log(errors);
            }//end of checkif validations exist
            if (Object.keys(errors).length !== 0) {
                let res = 0;
                for (let key in errors) {
                    res += Number(errors[key])
                }
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
    /**
     * This method returns the form id attached to the instance
     * 
     * @returns String
     */
    this.form = () => { return (formID) };
    /**
     * This method returns the library's version number
     * 
     * @returns String
     */
    this.version = () => { return (versionNumber) };
    /**
     * This method returns the number of errors on the form
     * 
     * @returns Number
     */
    this.status = () => {
        let res = 0;
        Object.entries(errors).forEach(e => {
            if (Number(e[1]) !== 0) {
                res += 1;
            }
        })
        return res;
    };
    /**
     * This method is useful if you use thesame library for server-side form validation. Invoke this method and pass in the error object to append errors into the form
     * 
     */
    this.showBackendErrors = function (errorsObj = undefined) {
        if (typeof errorsObj == "undefined" || !isObject(errorsObj) || Object.keys(errorsObj).length === 0)
            ovDoError(
                "A Valid Object must be passed as an argument to the [showBackendErrors] method if you want to display server-side Form Errors.")
        //assign form id
        const form_id = Object.keys(errorsObj)[0];
        if (!findElem(form_id))
            ovDoError(`A form with this id [${form_id}] does not Exist`)
        //remove errors is present
        this.removeBackendErrors(form_id);
        //loop through error object
        Object.entries(errorsObj[form_id]).forEach(eo => {
            const inputName = (eo[0] !== undefined) ? eo[0] : null;
            const errorText = (eo[1] !== undefined) ? eo[1] : null;
            if (inputName && errorText) {
                //check if this error is for 2 form inputs
                if (inputName.match(/:/)) {
                    inputName.split(':').forEach(inp => {
                        //loop through all form inputs
                        document.querySelectorAll('#' + form_id + ' [name]').forEach(ie => {
                            if (ie.name === inp) {
                                //remove success class
                                ie.classList.remove('octavalidate-inp-success');
                                //add error class
                                if (!ie.classList.contains('octavalidate-inp-error')) {
                                    ie.classList.add("octavalidate-inp-error");
                                }
                                //create error text
                                const g = document.createElement("p");
                                //check if id exists on element
                                if (ie.id) {
                                    g.setAttribute("id", "octavalidate_" + ie.id);
                                } else {
                                    //use input name if id does not exist
                                    g.setAttribute("id", "octavalidate_" + inp);
                                }
                                g.setAttribute("class", "octavalidate-txt-error");
                                g.innerText = errorText;
                                //insert after
                                ie.after(g);
                                //Listen to change in input value, then remove the error
                                if (ie.addEventListener) {
                                    ie.addEventListener("change", function () {
                                        if (this.value.trim() !== "") {
                                            this.classList.remove("octavalidate-inp-error");
                                            //if error text element exists
                                            if (g) {
                                                g.remove()
                                            }
                                        }
                                    }, { once: true });
                                } else if (elem.attachEvent) {
                                    ie.attachEvent("change", function () {
                                        if (this.value.trim() !== "") {
                                            this.classList.remove("octavalidate-inp-error");
                                            //if error text element exists
                                            if (g) {
                                                g.remove()
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    })
                } else {
                    //loop through all form inputs
                    document.querySelectorAll('#' + form_id + ' [name]').forEach(ie => {
                        if (ie.name === inputName) {
                            //remove success class
                            ie.classList.remove('octavalidate-inp-success');
                            //add error class
                            if (!ie.classList.contains('octavalidate-inp-error')) {
                                ie.classList.add("octavalidate-inp-error");
                            }
                            //create error text
                            const g = document.createElement("p");
                            if (ie.id) {
                                g.setAttribute("id", "octavalidate_" + ie.id);
                            } else {
                                g.setAttribute("id", "octavalidate_" + inputName);
                            }
                            g.setAttribute("class", "octavalidate-txt-error");
                            g.innerText = errorText;
                            //insert after
                            ie.after(g);
                            //Listen to change in input value, then remove the error
                            if (ie.addEventListener) {
                                ie.addEventListener("change", function () {
                                    if (this.value.trim() !== "") {
                                        this.classList.remove("octavalidate-inp-error");
                                        //if error text element exists
                                        if (g) {
                                            g.remove()
                                        }
                                    }
                                }, { once: true });
                            } else if (elem.attachEvent) {
                                ie.attachEvent("change", function () {
                                    if (this.value.trim() !== "") {
                                        this.classList.remove("octavalidate-inp-error");
                                        //if error text element exists
                                        if (g) {
                                            g.remove()
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    };
    /**
     * This method is useful if you use thesame library for server-side form validation. Invoke this method to remove any form errors that might have been appended by the `showBackendErrors()` method
     * 
     * @returns nothing
     */
    this.removeBackendErrors = function (form_id = formID) {
        if (!findElem(form_id))
            ovDoError(`A form with this id [${form_id}] does not Exist`);
        const formChildren = document.querySelector('#' + form_id).children;
        let ind = 0;
        if (formChildren) {
            while (ind < formChildren.length) {
                //p tag
                const pTag = formChildren[ind].querySelector('p');
                //input tag
                const inputTag = formChildren[ind].querySelector('input');
                //textarea
                const textTag = formChildren[ind].querySelector('textarea');
                if (pTag && pTag.classList.contains('octavalidate-txt-error')) {
                    pTag.remove();
                }
                if (inputTag && inputTag.classList.contains('octavalidate-inp-error')) {
                    inputTag.classList.remove('octavalidate-inp-error');
                    inputTag.classList.add('octavalidate-inp-success');
                }
                if (textTag && textTag.classList.contains('octavalidate-inp-error')) {
                    textTag.classList.remove('octavalidate-inp-error');
                    textTag.classList.add('octavalidate-inp-success');
                }
                ind++;
            }
        }
    }
    ////---------------
}