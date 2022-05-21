# octaValidate V1.1.0

![Logo](https://octagon-simon.github.io/octaValidate/ov-success.png)

This Tiny Script helps to validate your HTML forms using validation rules, sophisticated regular expressions and form input attributes.

We have included a **demo** file ( demo.html ) which you can view on your browser to see how this script really works.

## How to Install

- Download and import the latest release to your project.
- In your project, create a script tag and link the file **validate.js**.

```html
<script src="octaValidate/src/validate.js"> </script>
```

## How to Use

Create a form tag with input elements and set the attribute **octavalidate** with a list of validation rules on the form input(s) that you want to validate.
```html
<form id="form_register">

    <input id="inp_email" name="email" type="email" octavalidate="R,EMAIL">

    <input id="inp_age" name="age" type="number" octavalidate="R,DIGITS">

    <button type="submit">submit</button>

</form>
```
> Make sure that all input elements have a unique identifier. If you fail to attach an id to the input element, any validation rule applied to the element will be ignored.

Now you need to create a new instance of this function and pass in the **form id** as the first argument.

Then begin validation on that particular form by invoking the **validate()** method.

> It is recommended to invoke the **validate()** method when the form is submitted.

The return type of the **validate()** method is **Boolean**.

- **true** means that there are no validation errors

- **false** means that there are validation errors

```javascript
//create new instance of the function
let formVal  = new octaValidate('form_register');
//listen for submit event
document.querySelector('#form_register').addEventListener('submit', 
function(){
    //invoke the method
    if(formVal.validate() === true)
    { 
        //validation successful, process form data here
    } else {
        //validation failed
    }
})
```

## VALIDATION RULES

Here are the default validation rules.

- R - A value is required.
- ALPHA_ONLY - The value must be letters only! (lower-case or upper-case).
- LOWER_ALPHA - The value must be lower-case letters only.
- UPPER_ALPHA - The value must be upper-case letters only.
- ALPHA_SPACES - The value must contain letters or Spaces only!
- ALPHA_NUMERIC - The value must contain letters and numbers.
- DATE_MDY - The value must be a valid date with the format mm/dd/yyyy.
- DIGITS - The value must be valid digits. 
- PWD - The value must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters. 
- EMAIL - The value must be a valid Email Address.
- URL - The value must be a valid URL
- URL_QP - The value must be a valid URL and may contain Query parameters.
- USERNAME - The value may contain letters, numbers, a hyphen or an underscore.
- TEXT - The value may contain any of these special Characters (. , / () [] & ! '' "" : ; ?)
- CHECK - The checkbox or a radio element is required.

Didn't see the rule you're looking for? Don't worry!

With **octaValidate**, you have the power to define your custom validation rule and it will be processed as if it were a default rule.
  
## CUSTOM VALIDATION RULES

In some cases where you need to define your custom validation rule, use the method below.

```javascript
//syntax for custom rule
formVal.customRule(RULE_TITLE, REG_EXP, ERROR_TEXT);
```
Here's a custom Email validation rule

```javascript

//custom email validation
const rule_title = "EML";
const reg_exp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const err_txt = "Please povide a valid Email Address";
//create new instance of the function
let formVal  = new octaValidate('form_register');
//define a custom rule
formVal.customRule(rule_title, reg_exp, err_txt);
```

Then in your Input Element, provide the validation rule **[EML]**.

```html
<input type="email" id="inp_email" octavalidate="EML">
```
> Note that: All Validation rules are **case-sensitive!**

## MORE CUSTOM RULES

What if you want to define more validation rules?

All you need to do is to create an object with your validation rule, regular expression and error text, then invoke the method **moreCustomRules()**.

```javascript
//EMAIL AND URL VALIDATION RULES
var rules = {
    "EML": [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "A Valid email address is required"],
    "URI": [/^((?:http:\/\/)|(?:https:\/\/))(www.)?((?:[a-zA-Z0-9]+\.[a-z]{3})|(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1(?::\d+)?))([\/a-zA-Z0-9\.]*)$/i, "Please provide a valid URL"]
};

//create new instance of the function
let formVal  = new octaValidate('form_register');
//define more custom rules
formVal.moreCustomRules(rules);
```
> Note that: You do not need to pass in your **regular expression** as a string! This is because *JavaScript* natively recognizes *regular expressions*.

## CUSTOM ERROR MESSAGE

We've added an extra attribute that will enable you to provide your custom error message incase a validation fails.

The table below shows the validation rule and the attribute that you can use to change its error message.

| Validation Rule | Description| Validation Text Attribute| 
|-----------------|------------|-------------------------|
| R               |Required    | ov-required:msg         |
| EMAIL           |EMAIL       | ov-email:msg         |
| ALPHA_ONLY      |Alphabets Only| ov-alpha-only:msg |
| ALPHA_SPACES    |Alphabets with Spaces| ov-alpha-spaces:msg|
| ALPHA_NUMERIC   |Alphabets with Numbers| ov-alpha-numeric:msg|
| LOWER ALPHA     |Lowercase letters | ov-lower-alpha:msg|
| UPPER_ALPHA     |Uppercase letters | ov-upper-alpha:msg|
| PWD             |Password          | ov-pwd:msg|
| DIGITS          |Digits            | ov-digits:msg |
| URL             |URL               | ov-url:msg |
| URL_QP          |URL with Query Parameters| ov-url-qp:msg |   
| DATE_MDY        |Date in the format MM/DD/YYYY| ov-date-mdy:msg|
| USERNAME        |Username          | ov-username:msg |
| TEXT            |General Text      | ov-text:msg
| CHECK           |Checkbox (incluing radio elements) | ov-check:msg |
| equalto    | Values must be thesame | ov-equalto:msg |


Here's how to use the custom validation text

```html
<input type="text" octavalidate="R,USERNAME" ov-required:msg="Your username is required" ov-username:msg="Username should contain letters or numbers" name="username" id="inp_uname">
```

## ATTRIBUTES VALIDATION

Currently we have 2 types of attribute validation:

- length validation
- EqualTo validation
  
### LENGTH VALIDATION

You can validate: **maxlength, minlength and length** by providing it as an attribute to the form input.

- maxlength (5) - This means that value must be 5 characters or less.
- minlength (5) - This means that value must be up to 5 characters or more.
- length (5) - This means that value must be equal to 5 characters.

```html
<input type="text" id="inp_maxlength" maxlength="5">

<input type="text" id="inp_minlength" minlength="5">

<input type="text" id="inp_length" length="5">

```

### EQUALTO VALIDATION

You can check if two inputs contain the same values, using the attribute **equalto** on the input element, with a value containing the ID of the other input element to check against.

```html
<input type="password" id="inp_pwd1" octavalidate="R,PWD" ov-required:msg="Your Password is required">
<!--check if both values match -->
<input type="password" id="inp_pwd2" equalto="inp_pwd1" ov-equalto:msg="Both passwords do not match">
```

## CHECKBOX OR RADIO VALIDATION
  
You can validate a checkbox or readio element using the **CHECK** validation rule.

```html
<!--checkbox element -->
<input type="checkbox" id="inp_terms" octavalidate="CHECK" ov-check:msg="You have to accept the terms and conditions"> I accept the terms and conditions
<!--radio element -->
<input type="radio" id="inp_terms" octavalidate="CHECK" ov-check:msg="You have to accept the terms and conditions"> I accept the terms and conditions

```
## STATUS

You can invoke the **status()** method anytime to check the number of validation errors on the form.

```javascript
//check validation errors
formVal.status();
```

## CALLBACKS

You can now define a function that will execute if there are validation errors or a function that will execute if there are no validation errors.

To define a callback, invoke this method and pass in your function as an argument.

```javascript
//create new instance of the function
let formVal  = new octaValidate('form_register');

let successCB = function(){
    alert("No validation errors");
}
let errorCB = function(){
    alert(formVal.status()+" validation error(s)")
}
//invoke the method
formVal.validateCallBack(successCB, errorCB);
```
If there are no validation errors, the successCB will be executed but if there are validation errors, the errorCB will be executed.

> Note: This callback feature will only work if validation has started on the form. Make sure to start validating the form using the **validate()** method. 

## CONFIGURATION

We have provided 2 configuration options;

- successBorder : This option sets a green border on the input element if its validation is successful. Default value is **false**.
- strictMode : This option removes extra white space from the start and at the end of a form input and also prevents the user from providing reserved keywords as values. Default value is **false**.

To modify these options, provide it as the second argument when creating an instance of octaValidate.

```javascript
let formVal = new octaValidation('form_register', {successBorder : true, strictMode : true});
```

## REFERENCE METHODS
After you've created a new instance of the function, the methods below becomes available for use.

```javascript
//create instance of the function
let formVal = new octaValidate('form_register');
```

- validate(): Invoke this method to begin validation
- status(): Invoke this method to see the number of validation errors on a form
- customRule(RULE_TITLE, REG_EXP, ERROR_TEXT): Invoke this method to define your custom validation rule.
- moreCustomRules(RULES): Invoke this method to define more custom validation rules.
- version(): Invoke this method to retrieve version info.
- validateCallBack(success_callback, error_callback): Invoke this method, providing your success callback or error callback as arguments.
  
The success callback will execute when there are no validation errors and the error callback will execute when there are validation errors

## READ THE ARTICLE

[Read the article on Medium](https://blog.bitsrc.io/client-side-form-validation-using-octavalidate-javascript-b150f2d14e99)

## DEMO

- Download **octaValidate** and import it to your project.
- Open **[demo.html](https://octagon-simon.github.io/octaValidate/demo.html)** on a browser, then submit the form.
  
## Author

[Simon Ugorji](https://twitter.com/ugorji_simon)

## Contributors

[Simon Ugorji](https://twitter.com/ugorji_simon)