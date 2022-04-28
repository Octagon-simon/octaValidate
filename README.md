# octaValidate V1.0.4

This Tiny Script allows you to easily validate your forms on the client-side using sphisticated regular expressions and inbuilt validation rules.

Before you can use this script, you need to have the files **validate_lib.js**, and **validate.js** ( which are present in the src directory ).

We have included a **demo** file ( demo.html ) which you can open on your browser to see how octaValidate really works.

## How to Install

- Download and extract the latest release to your project.
- In your project, create a script tag and link the file **validate.js** with an attribute of **type = module**.

```html
<!doctype html>
<html>

<script src="octaValidate/src/validate.js" type="module"> </script>

</html>
```
> If you do not specify the attribute **type = module**, the script will fail to load!

## How to Use
We assume you have imported the script in your project, create a form tag with input elements and set the attribute **octavalidate** on the form input that you want to validate.
```html
<form id="form_register">

    <input id="inp_email" name="email" type="email" octavalidate="R,EMAIL">

    <input id="inp_age" name="age" type="number" octavalidate="R,DIGITS">

    <button type="submit">submit</button>

</form>
```
> Make sure that all input elements with the attribute **octavalidate** have an id attached to them. If you fail to attach an ID to the input element, we will skip any validation rule applied to that particular element.

Now you need to check if the validations passed successfully, before you process the submitted data.

The return type of the function is **Boolean**.

**true** means that all validations passed successfully

**false** means that one or more validations failed.

Call the function **octaValiate** and pass the **form id** as a parameter. This will enable us to validate that particular form.

```javascript
<script>
const formEl = document.querySelector('#form_register');

formEl.addEventListener('submit', function(){
    //run function and check return value
    if( octaValidate('form_register') )
    { 
        //validation successful
        //process form data here

    } else {
        //validation failed
        //notify user that form validation failed.
    }

})
</script>
```
You can also use **this** keyword to refer to the form. But make sure that the form has an **ID** attached to it.

```javascript
<script>
const formEl = document.querySelector('#form_register');

formEl.addEventListener('submit', function(){
    //run function and check return value

    if( octaValidate(this.id) )
    { 
        //validation successful
        //process form data here

    } else {
        //validation failed
        //notify user that form validation failed.
    }

})
</script>
```

## RULES

Here's a list of inbuilt validation rules.

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
  
## CUSTOM VALIDATION RULES
In some cases where you need to use custom validation rules, use the function below to build your rules.

```javascript
<script>

/*
addOVCustomRules(RULE_TITLE, REG_EXP, VALIDATION_MESSAGE);
*/


//custom email validation

const title = "EML";
const reg_exp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const msg = "Please povide a valid Email Address";

addOVCustomRules(title, reg_exp, msg);

</script>
```
Then in your Input Element, provide the rule title.
```html
<input type="email" id="inp_email" octavalidate="EML">
```
> All rule titles, are **case-sensitive!**

## MORE CUSTOM RULES

What if you wish to build more rules?

All you need to do is to create an object with your rule declarations inside of it, ( following the syntax below ), then call the function **addMoreOVCustomRules** and pass the object as a parameter.

```javascript
/*
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
> Note that: You do not need to pass in your **regular expression** as a string! This is because *JavaScript* natively recognizes *regular expressions*.

## CUSTOM VALIDATION TEXT

We've added an extra attribute that will enable you to provide your custom validation text incase a validation fails.
> This feature works for **inbuilt validation rules only**.

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

### Example
Here's how to use the custom validation text
```html
<input type="text" octavalidate="R,USERNAME" ov-required:msg="Your username is required" ov-username:msg="Username should contain letters or numbers" name="username" id="inp_uname">
```
### MaxLength, MinLength and Length

You can validate: **maxlength, minlength and length.**

- maxlength (5) - This means that value must be 5 characters or less
- minlength (5) - This means that value must be up to 5 characters or more
- length (5) - This means that value must be equal to 5 characters

```html
<input type="text" id="inp_maxlength" maxlength="5">

<input type="text" id="inp_minlength" minlength="5">

<input type="text" id="inp_length" length="5">

```

### Equal To

You can check if two inputs contain the same values, using the attribute **equalto** on the input element, with a value containing the ID of the other input element to check against.

### Example

```html
<input type="password" id="inp_pwd1" octavalidate="R,PWD" ov-required:msg="Your Password is required">

<!--check if both values match -->
<input type="password" id="inp_pwd2" equalto="inp_pwd1" ov-equalto:msg="Both passwords do not match">
```

### Checkbox
  
You can validate your checkboxes using the **CHECK** validation rule only. Note that the **R** (required rule) cannot be used to validate a checkbox. 

### Example

```html
<input type="checkbox" id="inp_terms" octavalidate="CHECK" ov-check:msg="You have to accept the terms and conditions">I accept the terms and conditions
```

## CHANGELOG

- We fixed a bug in v1.0.3 [Issue #4](https://github.com/Octagon-simon/octaValidate/issues/4)
- We changed the event listener to listen for change event instead of focusout
- We fixed the regular expression for validating usernames

## DEMO

- Download **octaValidate** and extract to your project.
- Open **[demo.html](https://octagon-simon.github.io/octaValidate/demo.html)** on a browser, then try to submit the form.
  
## Author

[Simon Ugorji](https://fb.com/ugorji.simon.7)

## Contributors

[Simon Ugorji](https://fb.com/ugorji.simon.7)