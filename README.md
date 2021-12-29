# octaValidate

This Script allows you to easily validate your forms on the client-side.

Before you can use this script, you need to have the files ( **validate_lib.js**, and **validate.js** ) in the same directory.

We have included a **test** file ( test.html ). You can open this file on your browser to see how octaValidate really works.

## How to Install

- Download and extract the folder **octaValidate** to your project.
- On the page where you wish to make use of it, open a script tag and link the file **validate.js** with an attribute of **type = module**.

```
<!doctype html>
<html>

<script src="octaValidate/validate.js" type="module"> </script>

</html>
```
> If you do not specify the attribute **type = module**, the script will fail to load!

## How to Use
Assuming you have imported or installed the script on your page, create a form tag with input elements and set the attribute **octaValidate** on the form input that you want us to validate based on your rule.
```
<form id="form_register">

    <input id="inp_email" name="email" type="email" octaValidate="R,EMAIL">

    <input id="inp_age" name="age" type="number" octaValidate="R,DIGITS">

    <button type="submit">submit</button>

</form>
```
> Make sure that all input elements with the attribute **octaValidate** have an id attached to them. If you fail to provide an ID to the input element, we will skip any validation rule that you might have applied to that element.

Now you need to check if the validations passed successfully, before you process the submitted data.

The return type of our function is **Boolean**.

**true** means that all validations passed successfully,and
**false** means that one or more validations failed.
```
<script>
var formEl = document.querySelector('#form_register');

formEl.addEventListener('submit', function(){
    //run function and check return value

    if( octaValidate() )
    { 
        //validation successful

        //process form data here

    } else {
        //validation failed
        alert("A form error has occured");
    }

})
</script>
```

## RULES

Here's a list of inbuilt or default validation rules.

- R - Form field is ( required ).
  
- ALPHA_SPACES - Value must contain alphabets and Spaces only!
- ALPHA_NUMBERS - Value may contain alphabets or numbers ( aplhanumeric ).
- DATE_MDY - Value must be a valid date with the format mm/dd/yyyy.
- DIGITS - Value must be valid digits. 
- EMAIL - Value must be a valid Email Address.
- URL - Value must be a valid URL without a Query parameter
- URL_QP - Value must be a valid URL and may contain Query parameters.
- USERNAME - Value may contain alphabets and or Numbers.
> You may specify multiple rules on an input element with the attribute **octaValidate** and with an **ID** attached to it, by seperating each of the rules with a *comma*.
> 
## Advanced
In some cases where you need your custom validation rule implemented on a form input, you may use our global function to add yours.
```
<script>

/* syntax

addOVCustomRules(Rule_title, RegExp, Validation_text);

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

    <input type="email" id="inp_email" octaValidate="EML">

</form>
```
>All rule titles, are **case-sensitive!**. So if you provide a custom validation rule, you must use that exact rule title in your form input.

### MORE CUSTOM RULES

What if you wish to have more than custom rules?

You may create an object with your rules declaration inside it, ( following the syntax below ), then call the function **addMoreOVCustomRules** and pass the object as a parameter.

```
/* syntax

var rules = {
    "Rule_title" : [reg_exp, "validation_text"]
}

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

## TEST
- Download **octaValidate** and extract to a folder.
- Open **test.html** on a browser, then try to submit the form.
  
## Author
[Simon Ugorji](https://fb.com/ugorji.simon.7)


## Contributors

[Simon Ugorji](https://fb.com/ugorji.simon.7)