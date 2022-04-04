# octaValidate V1.0.3

This Script allows you to easily validate your forms on the client-side.

Before you can use this script, you need to have the files **validate_lib.js**, and **validate.js** ( present in the src directory ).

We have included a **demo** file ( demo.html ). You can open this file on your browser to see how octaValidate really works.

## How to Install

- Download and extract the folder **octaValidate** to your project.
- On the page where you wish to make use of it, open a script tag and link the file **validate.js** with an attribute of **type = module**.

```
<!doctype html>
<html>

<script src="octaValidate/src/validate.js" type="module"> </script>

</html>
```
> If you do not specify the attribute **type = module**, the script will fail to load!

## How to Use
Assuming you have imported or installed the script on your page, create a form tag with input elements and set the attribute **octavalidate** on the form input that you want to validate based on your rule.
```
<form id="form_register">

    <input id="inp_email" name="email" type="email" octavalidate="R,EMAIL">

    <input id="inp_age" name="age" type="number" octavalidate="R,DIGITS">

    <button type="submit">submit</button>

</form>
```
> Make sure that all input elements with the attribute **octavalidate** have an id attached to them. If you fail to provide an ID to the input element, we will skip any validation rule that you might have applied to that element.

Now you need to check if the validations passed successfully, before you process the submitted data.

The return type of our function is **Boolean**.

**true** means that all validations passed successfully

**false** means that one or more validations failed.

Call the function and pass the **form id** as a parameter. This will enable us to validate that particular form.

```
<script>
var formEl = document.querySelector('#form_register');

formEl.addEventListener('submit', function(){
    //run function and check return value

    if( octaValidate('form_register') )
    { 
        //validation successful

        //process form data here

    } else {
        //validation failed
        //tell user this form contains errors.
    }

})
</script>
```
You can also use **this** keyword to refer to the form. But make sure that the form has an **ID** attached to it.

```
<script>
var formEl = document.querySelector('#form_register');

formEl.addEventListener('submit', function(){
    //run function and check return value

    if( octaValidate(this) )
    { 
        //validation successful

        //process form data here

    } else {
        //notify user that form validation failed.
    }

})
</script>
```

## RULES

Here's a list of inbuilt or default validation rules.

- R - Form field is required.
- ALPHA_ONLY - Value must be alphabets only (lower-case or upper-case).
- LOWER_ALPHA - Value must be lower-case alphabets only.
- UPPER_ALPHA - Value must be upper-case alphabets only.
- ALPHA_SPACES - Value must contain alphabets or Spaces only!
- ALPHA_NUMERIC - Value may contain alphabets or numbers alphanumeric.
- DATE_MDY - Value must be a valid date with the format mm/dd/yyyy.
- DIGITS - Value must be valid numbers. 
- PWD - Value must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters. 
- EMAIL - Value must be a valid Email Address.
- URL - Value must be a valid URL without a Query parameter
- URL_QP - Value must be a valid URL and may contain Query parameters.
- USERNAME - Value may contain alphabets, numbers, a hyphen or an underscore.
- TEXT - This rule validates general text input. Characters supported includes (. , / () [] & ! '' "" : ; ?)
- CHECK - This rule validates a checkbox or a radio element.
  
## Advanced
In some cases where you need your custom validation rule implemented on a form input, you may use our global function to add yours.

```
<script>

/* 
 syntax

addOVCustomRules(TITLE, REGEXP, VALIDATION_MESSAGE);

*/


//custom email validation

var title = "EML";
var reg_exp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
var text = "Please povide a valid Email Address";

addOVCustomRules(title, reg_exp, text);

</script>
```
Then on your Input Element,
```
<input type="email" id="inp_email" octavalidate="EML">
```
> All rule titles, are **case-sensitive!**. So if you provide a custom validation rule, you must use that exact rule title in your form input.

### MORE CUSTOM RULES

What if you wish to use more custom rules?

All you need to do is to create an object with your rule declarations inside it, ( following the syntax below ), then call the function **addMoreOVCustomRules** and pass the object as a parameter.

```
/* syntax

var rules = {
    "RULE_TITLE" : [REG_EXP, "VALIDATION_MESSAGE"]
}

//build your validation rules
addMoreOVCustomRules(rules);

*/

//example
var rules = {
    "EML": [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "A Valid email is required"],
    "URI": [/^((?:http:\/\/)|(?:https:\/\/))(www.)?((?:[a-zA-Z0-9]+\.[a-z]{3})|(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1(?::\d+)?))([\/a-zA-Z0-9\.]*)$/i, "Please provide a valid URL"]
};

//build rules
addMoreOVCustomRules(rules);
```
> Note that : You do not need to pass in your regular expression as a string! This is because *JavaScript* natively recognizes *regular expressions*.

## What's New In v1.0.3?

- We added support for Custom Validation Messages
### Custom Validation Messages
We've added an extra attribute that will enable you to provide your custom validation messages incase a validation fails.
> If you don't provide a custom validation message, the default will be used!

| Validation Rule | Description| Validation Message Attribute| 
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
| # EQUAL TO #    | Values must be thesame | ov-equalto:msg |

> The **equal to** validation needs to be present in the Input element as an attribute on its own.

### Example

```
<input type="text" octavalidate="R,USERNAME" ov-required:msg="Your username is required" ov-username:msg="Username should contain letters or numbers" name="username" id="inp_uname">
```
- We added validation support for checkboxes
  
You can now validate your checkboxes using the **CHECK** validation rule only. Note that the **R** (required rule) cannot be used to validate a checkbox. 

### Example

```
<input type="checkbox" id="inp_terms" octavalidate="CHECK" ov-check:msg="You have to accept the terms and conditions">I accept the terms and conditions
```
- You can now check if two inputs contain the same values, using the attribute **equalto** on the input element, with a value containing the ID of the other input element to check against.

### Example

```
<input type="password" id="inp_pwd1" octavalidate="R,PWD" ov-required:msg="Your Password is required">

<!--check if both values match -->
<input type="password" id="inp_pwd2" equalto="inp_pwd1" ov-equalto:msg="Both passwords do not match">
```
- We fixed a bug in v1.0.2 [Issue #3](https://github.com/Octagon-simon/octaValidate/issues/3)
  
  We noticed that the validation rules provided on a particular element will only be processed if the Required Rule ( R ) is present. 

  This Bug has been fixed. 
  
- We added a feature to process validation rules when the element contains a value. This however will not work on the Required Rule ( R ).

## DEMO

- Download **octaValidate** and extract to a folder.
- Open **[demo.html](https://octagon-simon.github.io/octaValidate/demo.html)** on a browser, then try to submit the form.
  
## Author

[Simon Ugorji](https://fb.com/ugorji.simon.7)

## Contributors

[Simon Ugorji](https://fb.com/ugorji.simon.7)