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

var $body = $(document.body);

$body.on('input', 'input', function () {
  var $form = $(this).closest('form');

  if (this.checkValidity()) {
    // If the user typed anything valid, let's start showing success/error
    // colours/messages from now on.
    this.classList.add('dirty');
    if ($form[0].checkValidity()) {
      console.log('Form is now valid, enabling submit button');
      this.blur();
      $form.find('button[type=submit]').removeAttr('disabled').trigger('focus');
    }
  } else if (!$form[0].checkValidity() && !$form.find('button[type=submit]')[0].hasAttribute('disabled')) {
    console.log('Form is invalid, disabling submit button');
    $form.find('button[type=submit]').attr('disabled', '');
  }
  this.classList.toggle('hasValue', !!this.value);
}).on('blur', 'input', function () {
  this.classList.add('dirty');
  this.classList.toggle('hasValue', !!this.value);
});

})();
