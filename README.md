# <img align="center" src="https://octagon-simon.github.io/octaValidate/img/ov-success.png" width="25px"> octaValidate V1.1.4 

This library helps to validate your HTML forms using validation rules, sophisticated regular expressions and form input attributes.

We have included a **[demo.html](https://octagon-simon.github.io/octaValidate/demo.html)** file which you can open to see how this library really works.

## DOCUMENTATION

Visit the [DOCUMENTATION](https://octagon-simon.github.io/projects/octavalidate/) to learn more about this GREAT Library!

## INSTALL

### CDN
Place this script before the <code>&lt;/head&gt;</code> tag.
```html
<script src="https://unpkg.com/octavalidate@1.1.4/native/validate.js"></script>
```

### NPM

Visit this [Link to the Documentation](https://octagon-simon.github.io/projects/octavalidate/octavalidate-with-npm.html) to learn how to install this Library with NPM.

### LOCAL

- Download and import the latest release to your project.
- In your project, create a script tag and link the file **validate.js**.
- Place the script before the <code>&lt;/head&gt;</code> tag.
```html
<script src="octaValidate/src/validate.js"></script>
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
> Make sure that all input elements have a **unique identifier**. If you fail to attach an **id** to the input element, any validation rule applied to the element will be ignored.

Now you need to create a new instance of the function and pass in the **form id** as the first argument, and any configurationoptions as the second argument.

Then begin validation on that particular form by invoking the **validate()** method.

> It is recommended to invoke the **validate()** method when the form is submitted.

The return type of the **validate()** method is **Boolean**.

- **true** means that there are no validation errors

- **false** means that there are validation errors

```javascript
//create new instance of the function
const formVal  = new octaValidate('form_register');
//listen for submit event
document.querySelector('#form_register').addEventListener('submit', function(e){
    e.preventDefault();
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

Here are the inbuilt validation rules.

- R - A value is required.
- ALPHA_ONLY - The value must be letters only! (lower-case or upper-case).
- LOWER_ALPHA - The value must be lower-case letters only.
- UPPER_ALPHA - The value must be upper-case letters only.
- ALPHA_SPACES - The value must contain letters or Spaces only!
- ALPHA_NUMERIC - The value must contain letters and numbers.
- DATE_MDY - The value must be a valid date with the format mm/dd/yyyy.
- DIGITS - The value must be valid digits or numbers. 
- PWD - The value must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters. 
- EMAIL - The value must be a valid Email Address.
- URL - The value must be a valid URL
- URL_QP - The value must be a valid URL and may contain Query parameters.
- USERNAME - The value may contain letters, numbers, a hyphen or an underscore.
- TEXT - The value may contain any of these special Characters (. , / () [] & ! '' "" : ; ?)
- CHECK - The checkbox or a radio element is required.

Didn't see the rule you're looking for? Don't worry!

With **octaValidate**, you have the power to define your custom validation rule and it will be processed as if it were an inbuilt rule.
  
## CUSTOM VALIDATION RULES

In some cases where you need to define a custom validation rule, use the method below.

```javascript
//syntax for custom rule
formVal.customRule(RULE_TITLE, REG_EXP, ERROR_TEXT);
```
Here's a custom validation rule to validate an email address.

```javascript
//custom email validation
const rule_title = "EML";
const reg_exp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const err_txt = "Please povide a valid Email Address";
//create new instance of the function
const formVal = new octaValidate('form_register');
//define the custom rule
formVal.customRule(rule_title, reg_exp, err_txt);
```

Then on your Input Element, provide the validation rule **[ EML ]**.

```html
<input type="email" id="inp_email" octavalidate="EML">
```
> Note that: All Validation rules are **case-sensitive!**

## MORE CUSTOM RULES

What if you want to define more validation rules?

All you need to do is to create an object with your validation rule, regular expression and error text separated by a comma, then invoke the method **moreCustomRules()**.

```javascript
//EMAIL AND URL VALIDATION RULES
var rules = {
    "EML": [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "A Valid email address is required"],
    "URI": [/^((?:http:\/\/)|(?:https:\/\/))(www.)?((?:[a-zA-Z0-9]+\.[a-z]{3})|(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1(?::\d+)?))([\/a-zA-Z0-9\.]*)$/i, "Please provide a valid URL"]
};

//create new instance of the function
const formVal  = new octaValidate('form_register');
//define more custom rules
formVal.moreCustomRules(rules);
```
> Note that: You do not need to pass in your **regular expression** as a string! This is because the *JavaScript engine* natively recognizes *regular expressions*.

## CUSTOM ERROR MESSAGE

We've added an extra attribute that will enable you to provide your custom error message incase a validation fails.

The table below shows the validation rule and the attribute that you can use to change its error message.

| Validation Rule | Description| Validation Text Attribute| 
|-----------------|------------|-------------------------|
| R               |Required    | ov-required:msg         |
| EMAIL           |EMAIL       | ov-email:msg         |
| ALPHA_ONLY      |Alphabets Only| ov-alpha-only:msg |
| ALPHA_SPACES    |Alphabets and Spaces| ov-alpha-spaces:msg|
| ALPHA_NUMERIC   |Alphabets with Numbers| ov-alpha-numeric:msg|
| LOWER ALPHA     |Lowercase letters | ov-lower-alpha:msg|
| UPPER_ALPHA     |Uppercase letters | ov-upper-alpha:msg|
| PWD             |Password          | ov-pwd:msg|
| DIGITS          |Digits            | ov-digits:msg |
| URL             |URL               | ov-url:msg |
| URL_QP          |URL with Query Parameters| ov-url-qp:msg |   
| DATE_MDY        |Date in the format MM/DD/YYYY| ov-date-mdy:msg|
| USERNAME        |Username          | ov-username:msg |
| TEXT            |General Text      | ov-text:msg |

Here's how to use the custom validation text

```html
<input type="text" octavalidate="R,USERNAME" ov-required:msg="Your username is required" ov-username:msg="Username should contain letters or numbers" name="username" id="inp_uname">
```
> With the latest release, you can now validate a CHECKBOX, RADIO ELEMENT or a FILE INPUT ELEMENT using the **R** validation rule to mark the field as **required**, and you may provide a custom message using the **ov-required:msg** attribute.

## ATTRIBUTES VALIDATION

Currently we have 3 types of attribute validation:

- length validation
- EqualTo validation
- File validation
  
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
### FILE VALIDATION

You can validate: **accept, size, minsize, maxsize, totalsize, totalminsize and totalmaxsize** by providing it as an attribute to the file input element.

- accept - Use this attribute to list out the file types allowed for upload
- size (2mb) `single` - This means that the file provided must be 2mb in size
- minsize (5mb) `single` - This means that the file provided must be up to 5mb or more.
- maxsize (5mb) `single` - This means that the file provided must be 5mb or less.
- totalsize (2mb) `multiple` - This means that all files provided must have a size equal to 2mb.
- totalminsize (5mb) `multiple` - This means that all files provided must have a size that is up to 5mb or more.
- totalmaxsize (5mb) `multiple` - This means that all files provided must have a size that is 5mb or less.

> `multiple` means that the file upload type must have a multiple attribute to support more than one file.

Please refer to the [documentation](https://octagon-simon.github.io/projects/octavalidate/file.html) to learn more about validating a file input element with octavalidate.

## API METHODS

### STATUS

You can invoke the **status()** method anytime to check the number of validation errors on the form.

```javascript
//Your validation instance
const formVal = new octaValidate('form_register');
//check validation errors
formVal.status();
```

### CALLBACKS

You can now define a function that will execute if there are validation errors or a function that will execute if there are no validation errors.

To define a callback, invoke this method and pass in your function as an argument.

```javascript
//create new instance of the function
const formVal = new octaValidate('form_register');
//success callback
let successCB = function(){
    alert("No validation error");
}
//error callback
let errorCB = function(){
    alert(formVal.status()+" validation error(s)")
}
//invoke the method
formVal.validateCallBack(successCB, errorCB);
```
If there are no validation errors, **successCB** will be executed but if there are validation errors, the **errorCB** will be executed.

> Note: This callback feature will only work if validation has started on the form. Make sure to start validation on the form by invoking the **validate()** method. 

## CONFIGURATION

We have 3 configuration options:

- successBorder: <code>Boolean</code>
  
  This option sets a green border on the input element if its validation is successful. Default value is **false**.
- strictMode: <code>Boolean</code>
  
  This option removes extra white space from the start and at the end of a form input and also prevents the user from providing reserved keywords as values. Default value is **false**.
- strictWords: <code>Array</code>
  
   This option alows you to provide words that users are not supposed to submit. For eg ["null", "error", "false"]. In order to use this option, you must set **strictMode** to **true**.

> From Version 1.1.4 upwards, any value provided by the user that matches any of the strict words, will be flagged as "not allowed".

To use any of these options, provide it as an object and pass it as the second argument when creating an instance of octaValidate.

```javascript
//my function instance
const formVal = new octaValidate('form_register', {successBorder : true, strictMode : true, strictWords : ["error", "false", "invalid"]});
```

## REFERENCE METHODS
After creating a new instance of the function, the methods below becomes available for use.

```javascript
//create instance of the function
const formVal = new octaValidate('form_register');
```

- **validate()**
  
  Invoke this method to begin validation
- **status()** 
  
  Invoke this method to see the number of validation errors on a form
- **form()** 
  
  This method returns the form ID.
- **customRule(RULE_TITLE, REG_EXP, ERROR_TEXT)**
  
   Invoke this method to define your custom validation rule.
- **moreCustomRules(RULES)**
  
    Invoke this method to define more custom validation rules.
- **version()**
  
  Invoke this method to retrieve the library's version number.
- **validateCallBack(success_callback, error_callback)**

    Invoke this method, providing your success callback or error callback as arguments. The success callback will execute when there are no validation errors and the error callback will execute when there are validation errors
  

## LEARN MORE
Need a detailed explanation on how to use this library? 
[Read the article on Medium](https://blog.bitsrc.io/client-side-form-validation-using-octavalidate-javascript-b150f2d14e99)

## DEMO

- Open **[demo.html](https://octagon-simon.github.io/octaValidate/demo.html)** (also included in the folder) and submit the form.
  
## SCREENSHOTS

<div align="center">
    <img src="https://octagon-simon.github.io/octaValidate/img/form-error.png" width="200px">
    <img src="https://octagon-simon.github.io/octaValidate/img/form-success.png" width="200px">
    <img src="https://octagon-simon.github.io/octaValidate/img/contact-page.png" width="200px">
    <img src="https://octagon-simon.github.io/octaValidate/img/file-1.png" width="200px">
    <img src="https://octagon-simon.github.io/octaValidate/img/file-2.png" width="200px">
    <img src="https://octagon-simon.github.io/octaValidate/img/strict-1.png" width="200px">
</div>

## Author

[Simon Ugorji](https://twitter.com/ugorji_simon)

## Support Me

[Donate with PayPal](https://www.paypal.com/donate/?hosted_button_id=ZYK9PQ8UFRTA4)

[Buy me a coffee](https://buymeacoffee.com/simon.ugorji)

## Contributors

[Simon Ugorji](https://twitter.com/ugorji_simon)
