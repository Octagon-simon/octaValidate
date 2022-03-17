# octaValidate V1.0.2

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
        //validation failed
        //tell user this form contains errors.
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

> If you need to, You may specify multiple rules on an input element with the attribute **octavalidate** and with an **ID** attached to it, by seperating each of the rules with a *comma*.

## Advanced
In some cases where you need your custom validation rule implemented on a form input, you may use our global function to add yours.

```
<script>

/* syntax

addOVCustomRules(Title, RegExp, Validation_text);

*/


//custom email validation ( example )

var title = "EML";
var reg_exp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
var text = "Please povide a valid Email Address";

addOVCustomRules(title, reg_exp, text);

</script>
```
Then on your Input Element,
```
<form>

    <input type="email" id="inp_email" octavalidate="EML">

</form>
```
> All rule titles, are **case-sensitive!**. So if you provide a custom validation rule, you must use that exact rule title in your form input.

### MORE CUSTOM RULES

What if you wish to have more custom rules?

Create an object with your rules declaration inside it, ( following the syntax below ), then call the function **addMoreOVCustomRules** and pass the object as a parameter.

```
/* syntax

var rules = {
    "Title" : [reg_exp, "validation_text"]
}
addMoreOVCustomRules(rules);
*/

//example
var rules = {
    "EML": [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Valid email is required"],
    "URI": [/^((?:http:\/\/)|(?:https:\/\/))(www.)?((?:[a-zA-Z0-9]+\.[a-z]{3})|(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1(?::\d+)?))([\/a-zA-Z0-9\.]*)$/i, "Please provide a valid URL"]
};

//build rules
addMoreOVCustomRules(rules);
```
> Note that : You do not need to pass in your regular expression as a string! This is because *JavaScript* natively recognizes *regular expressions*.


## What's New in V1.0.2?

- We have added validation support for input lengths. 

This means that you can use octaValidate to validate: **maxlength, minlength and length**

- maxlength(5) - Value must be up to 5 characters or less
- minlength(5) - Value must be up to 5 characters or more
- length(5) - Value must be equal to 5 characters

```
<input type="text" id="inp_maxlength" maxlength="5">

<input type="text" id="inp_minlength" minlength="5">

<input type="text" id="inp_length" length="5">

```
- You may use octaValidate on multiple forms present on a particular page without having them conflict with each other (issue Form Conflicts #1)

- We replaced the inbuilt email regular expression because it doesn't validate up to 37 characters. (issue octavalidate freezes form page #2)

- Error Class is now toggled properly and will not clear the input classList. 

```

## DEMO

- Download **octaValidate** and extract to a folder.
- Open **demo.html** on a browser, then try to submit the form.
  
## Author

[Simon Ugorji](https://fb.com/ugorji.simon.7)

## Contributors

[Simon Ugorji](https://fb.com/ugorji.simon.7)