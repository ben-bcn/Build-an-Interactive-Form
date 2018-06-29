document.addEventListener('DOMContentLoaded', () => {

  const form        = document.getElementById('register');
  const nameField   = form.querySelector('#name');
  const emailField  = form.querySelector('#mail');
  const hiddenFields= document.querySelectorAll('.hidden');
  const titleField  = form.querySelector("#title");
  const otherField  = form.querySelector("#other-title");
  const designField = form.querySelector("#design");
  const colorDiv    = form.querySelector("#colors-js-puns");
  const colorField  = form.querySelector("#color");
  const activityWrap  = form.querySelector('.activities');
  const paymentfield  = form.querySelector("#payment");
  const activities  = document.querySelectorAll('.activities [type="checkbox"]');
  const costTotal   = document.createElement('div');
  let currentPrice = 0;

  costTotal.innerHTML = "Total Cost $<span>0</span>";
  activityWrap.appendChild(costTotal);

  // hide payment fields, except credit card
  const paymentDivs   = document.querySelectorAll('.pay-options');
  const creditDiv     = document.getElementById('credit-card');
  const paypalDiv     = document.getElementById('paypal');
  const bitcoinDiv    = document.getElementById('bitcoin');

  // start off by hiding the payment divs
  function hidePaymentDivs (elems){
    for( i = 0; i < elems.length; i++){
      elems[i].style.display = "none";
    };
  }

  // on page load we then show and select credit card payment as default
  function selectCredit() {
    paymentfield.value  = 'creditcard';
    creditDiv.style.display = 'block';
  }
  /*
    The next two functions could be merged into one using a 3rd
    arguement but I chose to keep them seperate for readability
  */

  // function for disabling relevant checkboxes
  function disableCheckboxes(checkboxGroup,elementName){
    for( i = 0; i < checkboxGroup.length; i++){
      const attrName  = checkboxGroup[i].getAttribute("name");
      // Check to ensure we don't disable the box we just checked
      if(attrName != elementName){
        checkboxGroup[i].disabled = true;
      }
    }
  }

  // function for re-enabling relvant checkboxes
  function enableCheckboxes(checkboxGroup,elementName){
    for( i = 0; i < checkboxGroup.length; i++){
        const attrName  = checkboxGroup[i].getAttribute("name");
        if(attrName != elementName){
          checkboxGroup[i].disabled = false;
        }
    }
  }

  // Form validation functions
  function highlightField(element){

    const elemVal       = element.value;
    // replace the space for ananlysis of credit card fields
    const cardVals      = elemVal.replace(/\s+/g, '');
    const inputLength   = cardVals.length;
    const elemName      = element.getAttribute('name');


    if(inputLength < 1){
      styleErr(element,"Required field.");
    } else {
      // We've passed the empty field check, now lets check specific field requirements
      if(elemName === "user_email" && validateEmail(elemVal) === false){
        // We have an invalid email address!
        styleErr(element,"Please enter a valid email address.");
      } else if (elemName === "user_cc-num" && (inputLength < 13 || inputLength > 16 || isNaN(cardVals))) {
        // Credit card is less than 13 or more than 16 chars, also ensure it's a number
        // rege replace handles spaces
        styleErr(element,"Please enter a valid credit card number.");
      } else if (elemName === "user_zip" && (inputLength !== 5 || isNaN(cardVals))) {
        // Zip is not 5 chars
        styleErr(element,"Enter valid Zip.");
      } else if (elemName === "user_cvv" && (inputLength !== 3 || isNaN(cardVals))) {
        // CVV is not 3 chars
        styleErr(element,"Enter valid CVV.");
      }
    }
  }

  function validateEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
  }

  // Function for styling and placing the error message next to the relevant element
  function styleErr(element,msg){
    element.className   = "red-border";
    const errMsg        = document.createElement('span');
    errMsg.className    = "errMsg";
    errMsg.textContent  = msg;
    element.after(errMsg);
  }

  // remove all error messages from the page, mainly for when a second check is in process
  // and we don't want to duplicate error messages
  function resetErrorMsgs(){
    const errors = form.querySelectorAll('.errMsg');

    for(i=0; i < errors.length; i++){
      errors[i].previousSibling.classList.remove("red-border");
      errors[i].remove();
    }

  }

  // Set focus on the first field when page loads
  nameField.focus();

  // Hide the job role field by default
  for( i = 0; i < hiddenFields.length; i++){
    hiddenFields[i].style.display = "none";
  }

  // when the title field changes hide/show the 'other' fieldset
  titleField.addEventListener('change', (e) => {
    // hide the field as default, or if it were visible but should no longer be shown
    otherField.style.display = "none";
    const value = e.target.value;
    if(value === 'other'){
      // if 'other' is selected then we need to see the field
      otherField.style.display = "block";
    }
  });

  // Control the displau of colors based on the design select element
  designField.addEventListener('change', (e) => {
    // display the field
    colorDiv.style.display = "block";
    const value = e.target.value;
    const heart = document.querySelectorAll('.heart');
    const puns  = document.querySelectorAll('.puns');

    // function for hiding <option> tags from the color <select> list
    // based on the selection made in the design field
    function hideShow(elements,value){
      for( i = 0; i < elements.length; i++){
        elements[i].style.display = value;
        // deselect all options
        elements[0].selected = false;
        // Ensure the top visible option is set to selected
        if(value === 'block'){
          elements[0].selected = true;
        }
      }
    }

    // read the design selection then hide/show relevant color fields
    if(value.indexOf('puns') >= 0){
      hideShow(heart,"none");
      hideShow(puns,"block");
    } else if(value.indexOf('heart') >= 0){
      hideShow(heart,"block");
      hideShow(puns,"none");
    } else {
      // No select was made so re-hide the color field
      colorDiv.style.display = "none";
    }

  });

  // Form submission event, mainly for validation
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    resetErrorMsgs();

    // get remaining field
    const cardField   = form.querySelector('#cc-num');
    const zipField    = form.querySelector('#zip');
    const cvvField    = form.querySelector('#cvv');

    // array of fields to check
    const mandatoryFields = ['name','email','checkbox','credit'];
    let errors  = 0;

    // validate handling for different fields
    const validate  = {
      name      : () => {
        highlightField(nameField);
      },
      email     : () => {
        highlightField(emailField);
      },
      checkbox  : () => {
        // coun the number of checked boxes
        const countChecks = document.querySelectorAll('.activities [type="checkbox"]:checked');

        if(countChecks.length < 1){
          const errMsg        = document.createElement('span');
          errMsg.className    = "errMsg no-arrow";
          errMsg.textContent  = "You must select at least one activity.";
          document.querySelectorAll('legend')[2].after(errMsg);
        }
      },
      credit    : () => {
        const paymentOpt    = paymentfield.value;
        // only validate these fields if credit card is the selected payment option
        if(paymentOpt === "creditcard"){
          highlightField(cardField);
          highlightField(zipField);
          highlightField(cvvField);
        }
      }
    };

    // Loop through mandatory fields and validate
    for(i=0; i < mandatoryFields.length; i++){
      const field = mandatoryFields[i];
      validate[field]();
    };

  });

  // handler for activity checkbox selections
  for( i = 0; i < activities.length; i++){
    let list = activities;
    const price = activityWrap.querySelector('div span');

    function updatePrice(increase,amount){
      currentPrice = (increase) ? currentPrice + amount : currentPrice- amount;
      price.textContent = currentPrice;
    }

    // Add listener for changes on the checkboxes
    activities[i].addEventListener('change', (e) => {

        const activityClass   = e.target.className;
        // used to handle the state of the changed checkbox
        const checkedState    = e.target.checked;
        const attrName        = e.target.getAttribute("name");

        if(attrName === "all"){
          if(checkedState) {
            updatePrice(true,200);
          } else {
            updatePrice(false,200);
          }
        } else {
          const classSiblings = document.querySelectorAll('.'+activityClass);
          if(checkedState) {
            disableCheckboxes(classSiblings,attrName);
            updatePrice(true,100);
          } else {
            enableCheckboxes(classSiblings,attrName);
            updatePrice(false,100);
          }
        }

    });
  }

  //handler for payment options
  paymentfield.addEventListener('change', (e) => {
    const paymentOpt    = e.target.value;

    hidePaymentDivs(paymentDivs);

    const paymentActions  = {
      creditcard  : () => {
        creditDiv.style.display   = 'block';
      },
      paypal    : () => {
        paypalDiv.style.display   = 'block';
      },
      bitcoin    : () => {
        bitcoinDiv.style.display   = 'block';
      },
      select_method : () => {
        // default to credit card
        selectCredit();
      }
    };

    // display correct fields based on selection
    paymentActions[paymentOpt]();

  });

  // realtime error handling when the field loses focus
  emailField.addEventListener('blur',(e) => {
    resetErrorMsgs();
    highlightField(e.target);
  })

  hidePaymentDivs(paymentDivs);
  selectCredit();

});
