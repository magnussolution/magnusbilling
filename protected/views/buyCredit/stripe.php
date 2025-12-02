<style>
  body {
    font-family: Arial, sans-serif;
    background: #f7f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    margin: 0;
  }

  .container {
    background: #fff;
    padding: 40px 30px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
    max-width: 400px;
  }

  .checkmark {
    font-size: 60px;
    color: #27ae60;
    margin-bottom: 20px;
  }

  h1 {
    color: #2c3e50;
    margin-bottom: 10px;
  }

  p {
    color: #555;
    font-size: 16px;
  }

  a {
    display: inline-block;
    margin-top: 20px;
    text-decoration: none;
    background: #27ae60;
    color: #fff;
    padding: 10px 20px;
    border-radius: 5px;
    transition: background 0.3s;
  }

  .error-icon {
    font-size: 60px;
    color: #e74c3c;
    margin-bottom: 20px;
  }

  a:hover {
    background: #219150;
  }
</style>

<?php if (isset($result)): ?>

  <?php if ($result == 'success'): ?>
    <div class="container">
      <div class="checkmark">✔</div>
      <h1> <?php echo Yii::t('zii', 'Payment Successful') ?> </h1>
      <p><?php echo Yii::t('zii', 'Your credits have been added successfully.') ?> </p>
      <a href="../../"><?php echo Yii::t('zii', 'Back') ?> </a>
    </div>
  <?php elseif ($result == 'error'): ?>
    <div class="container">
      <div class="error-icon">✖</div>
      <h1><?php echo Yii::t('zii', 'Payment Failed') ?></h1>
      <p><?php echo Yii::t('zii', 'The transaction was canceled or could not be completed.') ?></p>
      <a href="../../"><?php echo Yii::t('zii', 'Try Again') ?></a>
    </div>
  <?php endif; ?>
  <?php exit; ?>
<?php endif; ?>
<script src="https://js.stripe.com/v3/"></script>


<script>
  window.onload = function() {
    fetch('../createCheckoutSessionStripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'amount=<?php echo  number_format($_GET['amount'], 2) ?>'
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(session) {
        return Stripe('<?php echo $modelMethodPay->client_id ?>').redirectToCheckout({
          sessionId: session.id
        });
      })
      .then(function(result) {
        if (result.error) {
          alert(result.error.message);
        }
      })
      .catch(error => {
        console.error('Stripe Checkout error:', error);
      });
  };
</script>