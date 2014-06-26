<?php

function tour_request_admin_page()
{
	drupal_add_js(drupal_get_path('module', 'tour_request').'/js/tour-request-form.js');
	drupal_add_js(drupal_get_path('module', 'tour_request').'/js/angular.js');
	drupal_add_js(drupal_get_path('module', 'tour_request').'/js/bootstrap.js');
	drupal_add_js(drupal_get_path('module', 'tour_request').'/js/underscore.js');
	drupal_add_js(drupal_get_path('module', 'tour_request').'/js/angular-resource.js');
	drupal_add_js(drupal_get_path('module', 'tour_request').'/js/angular-cookies.js');
	drupal_add_js(drupal_get_path('module', 'tour_request').'/js/angular-sanitize.js');
	drupal_add_js(drupal_get_path('module', 'tour_request').'/js/app.js');
	drupal_add_js(drupal_get_path('module', 'tour_request').'/js/controllers.js');
	drupal_add_js(drupal_get_path('module', 'tour_request').'/js/formItem.js');
	drupal_add_js(drupal_get_path('module', 'tour_request').'/js/REST.js');
	drupal_add_js(drupal_get_path('module', 'tour_request').'/js/moment.min.js');
	drupal_add_js(drupal_get_path('module', 'tour_request').'/bootstrap-custom/ui-bootstrap-custom-0.10.0.js');
	drupal_add_js(drupal_get_path('module', 'tour_request').'/bootstrap-custom/ui-bootstrap-custom-tpls-0.10.0.js');
	drupal_add_css(drupal_get_path('module', 'tour_request').'/css/bootstrap.css');
	return "<div ng-app='tourApp' ng-controller='AppCtrl'><div ng-view=''></div></div>";
}
function tour_request_page()
{
	drupal_add_js(drupal_get_path('module', 'tour_request').'/js/tour-request-form.js');
	drupal_add_js(drupal_get_path('module', 'tour_request').'/js/angular.js');
	drupal_add_js(drupal_get_path('module', 'tour_request').'/js/bootstrap.js');
	drupal_add_js(drupal_get_path('module', 'tour_request').'/js/underscore.js');
	drupal_add_js(drupal_get_path('module', 'tour_request').'/js/angular-resource.js');
	drupal_add_js(drupal_get_path('module', 'tour_request').'/js/angular-cookies.js');
	drupal_add_js(drupal_get_path('module', 'tour_request').'/js/angular-sanitize.js');
	drupal_add_js(drupal_get_path('module', 'tour_request').'/js/app.js');
	drupal_add_js(drupal_get_path('module', 'tour_request').'/js/controllers.js');
	drupal_add_js(drupal_get_path('module', 'tour_request').'/js/formItem.js');
	drupal_add_js(drupal_get_path('module', 'tour_request').'/js/REST.js');
	drupal_add_js(drupal_get_path('module', 'tour_request').'/js/moment.min.js');
	drupal_add_js(drupal_get_path('module', 'tour_request').'/bootstrap-custom/ui-bootstrap-custom-0.10.0.js');
	drupal_add_js(drupal_get_path('module', 'tour_request').'/bootstrap-custom/ui-bootstrap-custom-tpls-0.10.0.js');
	drupal_add_css(drupal_get_path('module', 'tour_request').'/css/bootstrap.css');
	return "<h1>Schedule a Group Tour</h1><div ng-app='tourApp' ng-controller='AppCtrl'><div ng-view=''></div></div>";
}

function tr_json($data) {
  drupal_set_header('Content-Type: application/json');
  print(json_encode($data));
  module_invoke_all('exit');
}

function tour_request_random_number() {
  tr_json(array('number' => rand(0,100)));
}

function tour_request_random_numbers() {
  $range = $_POST['range'] ? $_POST['range'] : 10;

  $data = array();
  for($i = 0; $i < $range; $i++) {
    $data[$i] = rand(0,100);
  }
  tr_json(array('numbers' => $data));
}

function tour_request_request_all() {
  $data = array();
  $result = db_query("SELECT * FROM t_request");
  while ($obj = db_fetch_object ($result)) {
    $obj->misc_info = unserialize($obj->misc_info);
    $data[] = $obj;
  }
  tr_json(array('status' => 'success', 'data' => $data));
}
function tour_request_request_csv() {
  header("Cache-Control: public");
  header("Content-Type: application/octet-stream");
  header("Cache-Control: no-store, no-cache, must-revalidate");
  header("Cache-Control: post-check=0, pre-check=0");
  header("Content-Disposition: attachment; filename=\"tour-requests.csv\";" );
  header("Content-Transfer-Encoding: binary");
  $csv = '';
  $data = array();
  $exclude_fields = array(
    'payment',
    'misc_info',
    'admin',
    'datetime',
    'id',
    'exhibition_id',
  );
  $result = db_query("SELECT * FROM t_request");
  while ($obj = db_fetch_object ($result)) {
    $obj->misc_info = unserialize($obj->misc_info);
    $data[] = $obj;
  }
  $fields = '';
  foreach ($data[0] as $key => $value) {
    if (!in_array($key, $exclude_fields)) {
      $fields = $fields . $key . ',';
    }
    if ($key == 'misc_info') {
      foreach($value as $key_misc => $value_misc) {
        if ($key_misc != 'cc' && $key_misc != 'visit') {
          foreach($value_misc as $more_key => $more_value) {
            $fields .= $more_key . ',';
          }
        }
      }
    }
  }
  $fields = "date,time,exhibition," . $fields;
  $fields = substr($fields, 0, -1) . "\n";
  $csv .= $fields;
  foreach ($data as $k => $request) {
    // Go through all tour requests
    $out = '';
    $admin = 0;
    $out = $request->misc_info->visit->date . ',' . $request->misc_info->visit->time . ',' . str_replace(',', '', $request->misc_info->visit->exhibition) . ',';
    foreach($request as $key => $value) {
      // Tour Request Data
      if (!in_array($key, $exclude_fields)) {
        $value = str_replace(',','', $value);
        $out .= $value . ',';
      }
      if ($key == 'admin' && $value == 1) {
        $admin = 1;
      }
      if ($key == 'misc_info') {
        foreach($value as $key_misc => $value_misc) {
          if ($key_misc != 'cc' && $key_misc != 'visit') {
            foreach($value_misc as $more_key => $more_value) {
              if ($more_key == 'paymentOption') {
                switch ($more_value) {
                  case '1': 
                    $more_value = 'Paid in full';
                    break;
                  case '2': 
                    $more_value = 'Paid deposit';
                    break;
                  case '3': 
                    $more_value = 'Paid by check';
                    break;
                  case '4': 
                    $more_value = 'Requested free tour';
                    break;
                }
              }
              $more_value = str_replace(',','', $more_value);
              $out .= $more_value . ',';
            }
          }
        }
      }
    }
    if ($admin != 1) {
      $out = substr($out, 0, -1) . "\n";
      $csv .= $out;
    }
  }

  //tr_json(array('status' => 'success', 'data' => $fields));
  print($csv);
  exit();
  // $out = fopen('php://output', 'w');
  // fputcsv($out, array('this','is some', 'csv "stuff", you know.'));
  // fclose($out);
  // return $out;
}
function tour_request_request_get($id) {
  require_once("stripe/lib/Stripe.php");
  $data = array();
  $result = db_query("SELECT * FROM t_request WHERE id = '%d'", $id);
  while ($obj = db_fetch_object ($result)) {
    $data[] = $obj;
  }
  if (count(data) == 1) {
    $request = $data[0];
    $request->misc_info = unserialize($request->misc_info);
    $charge = json_decode(unserialize($request->payment));
    $request->payment = $charge;
  }
  tr_json(array('status' => 'success', 'data' => $request));
}
function tour_request_exhibition_index() {
  $data = array();
  $result = db_query("SELECT nid FROM node WHERE type = '%s' AND status = 1", 'exhibition');
  $nids = array();
  while ($obj = db_fetch_object ($result)) {
    $node = node_load($obj->nid);
    $node_data = array(
      'dateStart' => strtotime($node->field_on_view_dates[0]['value']),
      'dateEnd' => strtotime($node->field_on_view_dates[0]['value2']),
      'nid' => $node->nid,
      'title' => $node->title,
      'description' => $node->field_short_description[0]['value'],
      'age_restricted_tour' => $node->field_age_restricted_tour[0]['value'],
      'age_restriction_note' => $node->field_age_restriction_note[0]['value'],
      'workshop_description' => $node->field_workshop_description[0]['value'],
      'tours_available' => $node->field_tours_available[0]['value'],
    ); 
    if ($node_data['dateEnd'] > time()) {
      $data[] = $node_data; 
    }
  }
  tr_json($data);
}

function tour_request_request_index() {
  $postdata = file_get_contents("php://input");
  $request = json_decode($postdata);
  $nid = $request->nid;
  $data = array();
  $result = db_query("SELECT * FROM t_request WHERE exhibition_id = %s", (int) $nid);
  while ($obj = db_fetch_object ($result)) {
    $data[] = $obj;
  }
  $return = array(
    'data' => $data,
    'status' => 'success',
  );
  tr_json($return);
}

function tour_request_request_remove() {
  $postdata = file_get_contents("php://input");
  $request = json_decode($postdata);
  $id = $request->id;
  $result = db_query('DELETE FROM t_request WHERE id = %d', $id);
  tr_json(array('status' => 'success', 'data' => $result));
}

function tour_request_request_set() {
  $postdata = file_get_contents("php://input");
  $request = json_decode($postdata);

  // Check to see if request already exists.
  $id = $request->id;
  $misc = $request->misc;
  $data = array(
    'misc_info' => serialize($misc), 
    'id' => $id
  );
  $result = drupal_write_record('t_request', $data, 'id');
  tr_json(array(
    'status' => 'success',
    'data' => $result,
  ));
}

function tour_request_request_add() {
  $postdata = file_get_contents("php://input");
  $request = json_decode($postdata);

  // Check to see if request already exists.
  $nid = $request->nid;
  $data = array();
  $result = db_query("SELECT * FROM t_request WHERE exhibition_id = %s AND datetime = %s", array((int) $nid, (int) $request->datetime));
  while ($obj = db_fetch_object ($result)) {
    $data[] = $obj;
  }
  if (count($data)) {
    if ($data[0]->workshop == 1 && $data[0]->admin == 1) {
      $id = $data[0]->id;
      $update = true;
    }
    else {
      tr_json(array('status' => 'error', 'message' => 'The chosen request date and time has already been booked'));
      exit(1);
    }
  }

  // Charge card
  $token = $request->stripe->id;
  $amount = $request->amount; 
  if (is_numeric($amount)) {
    if ($amount != 0) {
      require_once("stripe/lib/Stripe.php");
      if (1 == 1) {
        // Testing
        $secret_key = '' // Wouldn't you like to know? ;)
        $publishable_key = ''; // Better replace this ...
      }
      else {
        // Live
      }
      Stripe::setApiKey($secret_key);
      // Create the charge on Stripe's servers - this will charge the user's card
      try {
        $fullname = $request->contact_name;
        $charge = Stripe_Charge::create(array(
          "amount" => $amount * 100, // amount in cents, again
          "currency" => "usd",
          "card" => $token,
          "description" => $fullname,
        ));
      } catch(Stripe_CardError $e) {
        $body = $e->getJsonBody();
        $error = $body['error'];
        tr_json(array(
          'status' => 'error',
          'data' => $error['message'],
        ));
        exit();
      }
    }

    // Send email receipts
    if ($request->admin != 1) {
      $to = $request->email;
      $subject = "You have made a tour request";
      $message = "<p>You have made a tour request</p>";
      $message = $message . "\n\n<h2>Tour Request Information</h2>\n\n";
      foreach ($request->results->visit as $key => $value) {
        $message = $message . "<p><strong>" . $key . ":</strong> " . $value . "</p>\n";
      }
      $message = $message . "\n\n<h2>Personal Information</h2>\n\n";
      foreach ($request->results->personal as $key => $value) {
        $message = $message . "<p><strong>" . $key . ":</strong> " . $value . "</p>\n";
      }
      $message = $message . "\n\n<h2>Payment Information</h2>\n\n";
      if ($amount != 0) {
        if ($request->results->paymentInfo->paymentOption == 2) {
        $message .= "<p>You have made a deposit, and will need to pay the remainder of your balance within two weeks of your requested tour date.</p>";
        }
        $message .= "<p>You have paid $" . $amount . ".</p>";
      }
      else if ($request->results->paymentInfo->paymentOption == 3) {
        $message .= "<p>You have chosen to pay by check.</p>";
      }
      else {
        $message .= "<p>You have requested a free tour.</p>";
        $message .= "<p>Explanation: " . $request->results->paymentInfo->paymentInfo . ".";
      }
      $from = "admin@camh.org";
      $headers = "From:" . $from;
      drupal_mail('cah', 'tour-request', $to, language_default(), $message, $from);
      $message = "Copy of tour request sent to " . $to . ":\n\n" . $message;
      $to = "nate@501creative.com";
      $subject = "A tour request has been made";
      drupal_mail('cah', 'tour-request', $to, language_default(), $message, $from);
    }

    // Save request to database
    $data = array(
      'exhibition_id' => $request->nid,
      'datetime' => $request->datetime,
      'workshop' => $request->workshop,
      'telephone' => $request->telephone,
      'email' => $request->email,
      'admin' => $request->admin,
      'organization_name' => $request->organization_name,
      'contact_name' => $request->contact_name,
      'misc_info' => serialize($request->results),
      'payment' => serialize($charge),
    ); 
    if ($update) {
      $data['id'] = $id;
      $data['workshop'] = 0;
      $log = drupal_write_record('t_request', $data, 'id');
    }
    else {
      $log = drupal_write_record('t_request', $data);
    }
    if ($amount != 0) {
      tr_json(array('status' => 'success', 'data' => json_decode($charge)));
    }
    else {
      tr_json(array('status' => 'success'));
    }
  }
  else {
    tr_json(array('status' => 500, 'error' => 'Please enter a valid amount'));
  }
}

function tour_request_form()
{
	$form['hours'] = array(
		'#type' => 'textarea',
		'#title' => t('Hours'),
		'#default_value' => variable_get('cah_sidebar_hours', ''),
		'#required' => true,
	);
	$form['directions'] = array(
		'#type' => 'textfield',
		'#title' => t('Directions Link'),
		'#default_value' => variable_get('cah_sidebar_directions', ''),
		'#required' => true,
	);
	$form['donate'] = array(
		'#type' => 'textfield',
		'#title' => t('Donate Link'),
		'#default_value' => variable_get('cah_sidebar_donate', ''),
		'#required' => true,
	);
	$form['submit'] = array(
		'#type' => 'submit',
		'#value' => t('Submit'),
	);
	return $form;
}

function tour_request_form_submit($form, &$form_state)
{
	drupal_set_message(t('submitted'));
}
