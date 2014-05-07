(function () {

if (!window.location.origin) {
  // For IE lol
  window.location.origin = window.location.protocol + '//' + window.location.host;
}

if (!window.performance) {
  // Polyfill `performance.now` for Safari/PhantomJS WebKit.
  // (And don't even bother with `Date.now` because IE.)
  window.performance = {
    now: function() {
      return +new Date();
    }
  };
}

window.start_time = window.performance.now();

/* Python-ish string formatting:
 * >>> format('{0}', ['zzz'])
 * "zzz"
 * >>> format('{0}{1}', 1, 2)
 * "12"
 * >>> format('{x}', {x: 1})
 * "1"
 */

var RE_FORMAT = /\{([^}]+)\}/g;

function format(s, args) {
  if (!s) {
    throw 'Format string is empty!';
  }
  if (!args) {
    return;
  }
  if (!(args instanceof Array || args instanceof Object)) {
    args = Array.prototype.slice.call(arguments, 1);
  }
  return s.replace(RE_FORMAT, function (_, match) {
    return args[match];
  });
}

function template(s) {
  if (!s) {
    throw 'Template string is empty!';
  }
  return function (args) {
    return format(s, args);
  };
}


function formatPhone(digits) {
  // Returns a formatted phone number, like so: 248 555 1212.
  digits = (digits || '').replace(/\D/g, '');
  if (digits.length === 11 && digits[0] === '1') {
    digits = digits.substr(1);
  }
  if (digits.length === 10) {
    return digits.substr(0, 3) + ' ' +
           digits.substr(3, 3) + ' ' +
           digits.substr(6, 9);
  }
  return digits;
}


function checkCodeValidity(code, successCB, errorCB) {
  // TODO: Contact API to confirm that the confirmation code is correct.
  setTimeout(function () {
    if (code === '12345') {
      successCB(code);
    } else {
      errorCB(code);
    }
  }, 500);
}


var $body = $(document.body);
var $loginForm = $('.login-form');
var $confirmForm = $('.confirm-form');

function checkFormValidity($form) {
  // Toggle submit button to be disabled/enabled
  // and focus on submit button if valid.
  if ($form[0].checkValidity()) {
    console.log('Form is now valid, enabling submit button');
    //this.blur();
    $form.find('button[type=submit]').removeAttr('disabled').trigger('focus');
  } else if (!$form.find('button[type=submit]')[0].hasAttribute('disabled')) {
    console.log('Form is invalid, disabling submit button');
    $form.find('button[type=submit]').attr('disabled', '');
  }
}

$body.on('input', 'input[name=phone]', function () {
  if (this.checkValidity()) {
    // If the user typed anything valid, let's start showing success/error
    // colours/messages from now on.
    this.classList.add('dirty');
  }
  this.classList.toggle('hasValue', !!this.value);
  checkFormValidity($(this).closest('form'));
}).on('blur', 'input', function () {
  this.classList.add('dirty');
  this.classList.toggle('hasValue', this.value);
}).on('submit', '.login-form', function (e) {
  e.preventDefault();
  localStorage.signedUp = '1';
  localStorage.phone = $(this).find('input[name=phone]').val();
  showConfirm();
}).on('submit', '.confirm-form', function () {
  // TODO: Check validity against server.
}).on('click', '.confirm-form .back', function () {
  showSignup();
}).on('input', 'input[name=code]', function () {
  var input = this;
  var $form = $(input).closest('form');

  function done() {
    input.classList.add('dirty');
    checkFormValidity($form);
  }

  if (input.value.length === 5) {
    checkCodeValidity(input.value, function () {
      console.log('Confirmation code was correct');
      input.setCustomValidity('');
      done();
    }, function () {
      console.log('Confirmation code was incorrect');
      input.setCustomValidity('Confirmation code was invalid');
      done();
    });
  } else if (input.value.length > 5) {
    done();
  }

  input.classList.toggle('hasValue', this.value);
});

function showConfirm(init) {
  hideSignup();
  if (!$confirmForm.length) {
    $body.prepend($('#template-confirm-form').html());
    $confirmForm = $('.confirm-form');
  }
  $confirmForm.addClass('show');
  var $phone = $confirmForm.find('legend .tel');
  $phone.text(format($phone.text(), {phone: formatPhone(localStorage.phone)}));
}

function hideConfirm(init) {
  delete localStorage.signedUp;
  delete localStorage.phone;
  $confirmForm.removeClass('show');
}

function showSignup(init) {
  hideConfirm();
  $loginForm.addClass('show');
}

function hideSignup(init) {
  $loginForm.removeClass('show');
}

if (localStorage.signedUp) {
  showConfirm(true);
} else {
  showSignup(true);
}

})();
