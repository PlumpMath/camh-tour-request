'use strict';

angular.module('tourApp')
  .controller('RequestIndexCtrl', function ($scope, $rootScope, REST, $location, $timeout, $route) {
    $scope.$location = $location;
    REST.getAllRequests(function(result) {
      $scope.loaded = true;
      if (result.status == 'success') {
        $scope.requests = [];
        _.each(result.data, function(r) {
          var t = {};
          r.datetime = parseInt(r.datetime);
          t.datetime = r.datetime;
          r.workshop = (r.workshop == 1) ? "yes" : "no";
          r.time = moment(parseInt(t.datetime), 'X').format('h') + ':00 ' + moment(parseInt(t.datetime), 'X').format('a');
          var dateMoment = moment(parseInt(t.datetime), 'X');
          var dateNow = new Date().getTime();
          console.log(dateNow/1000);
          if (r.datetime < dateNow/1000) {
            console.log('old!');
            r.old = true;
          }
          r.date = dateMoment.format("MMMM Do YYYY");
          if (r.admin != 1) {
            $scope.requests.push(r);
          }
        });
      }
      console.log(result);
    });
});
angular.module('tourApp')
  .controller('ViewRequestCtrl', function ($scope, $rootScope, REST, $location, $timeout, $route) {
    $scope.$location = $location; 
    var id = $route.current.pathParams.id;
    console.log(id);
    REST.getRequest(id, function(result) {
      if (result.status == 'success') {
        var t = {};
        t.datetime = result.data.datetime;
        $scope.r = result.data;
        $scope.r.time = moment(parseInt(t.datetime), 'X').format('h') + ':00 ' + moment(parseInt(t.datetime), 'X').format('a');
        var dateMoment = moment(parseInt(t.datetime), 'X');
        $scope.r.date = dateMoment.format("MMMM Do YYYY");
        if ($scope.r.misc_info.paymentInfo.paymentOption == 4) {
          $scope.payment_info = 'Free tour requested';
          $scope.paymentNotes = $scope.r.misc_info.paymentInfo.paymentInfo;
        }
        else if ($scope.r.misc_info.paymentInfo.paymentOption == 3) {
          $scope.payment_info = 'Paying with check.';
        }
        else {
          $scope.payment_info = 'Paid $' + $scope.r.payment.amount/100 + ' by credit card.';
          
        }
      }
      console.log(result);
    });
    $scope.delete = function() {
      if (window.confirm("Do you really want to delete this request? It is unrecoverable.")) {
        REST.removeTourRequest($scope.r.id,
          function(result) {
            alert('Tour request deleted');
            $location.path('requests/index');
          });
      }
    }
    $scope.submit = function() {
      REST.setTourRequest({
        id: parseInt($scope.r.id),
        misc: $scope.r.misc_info
      },
      function(result) {
        if (result.status == 'success') {
          alert('Saved.');
          console.log(result);
        }
      });
    }
});

angular.module('tourApp')
  .controller('MainCtrl', function ($scope, $rootScope, REST, $location, $timeout, $route) {
    $scope.noWorkshop = {};
    $scope.isMonday = false;
    $scope.$location = $location; 
    var admin;
    if ($route.current.$$route.templateUrl.search(/requests/) != -1) {
      admin = true;
    }
    var currentExhibit = {
      title:'Loading . . . '
    };
    var exhibitions = [];
    REST.getExhibitionIndex(function(index) {
      $scope.loaded = true;
      _.each(index, function(exhibit) {
        if (exhibit.tours_available != 0) {
          exhibitions.push(exhibit);
        }
      });
      $scope.dateChange();
      console.log(exhibitions)
    });
    $scope.ccValid = "";
    $scope.disabled = false;  
    var states = $rootScope.states;
    $scope.form = {};
    $scope.form.date = moment();
    $scope.form.groupNotes = '';
    $scope.form.total = '0';
    $scope.form.numberGroup = '0';
    $scope.form.creditCard = {
      number: '',
      month: '',
      year: '',
      cvv: '',
    };
    $scope.form.paymentOption = '1';
    $scope.form.misc = {};
    $scope.form.visit = [
      {
        type: 'select',
        name: 'Choose Exhibition',
        values: [
          'Loading . . . ',
        ],
        placeholder: 'Loading . . . ',
        help: '',
      },
    ];
    $scope.form.personal = [
      {
        type: 'text',
        name: 'Contact Name',
        placeholder: '',
        help: '',
      },
      {
        type: 'text',
        name: 'Email',
        placeholder: '',
        help: '',
      },
      {
        type: 'text',
        name: 'Street Address',
        placeholder: '',
        help: '',
      },
      {
        type: 'text',
        name: 'City',
        placeholder: '',
        help: '',
      },
      {
        type: 'select',
        name: 'State',
        values: states,
        placeholder: 'TEXAS',
      },
      {
        type: 'text',
        name: 'Zipcode',
        placeholder: '',
        help: '',
      },
      {
        type: 'text',
        name: 'Telephone',
        placeholder: '',
        help: '',
      },
      {
        type: 'text',
        name: 'School/Organization',
        placeholder: '',
        help: '',
      },
      {
        type: 'text',
        name: 'School District',
        placeholder: '',
        help: '',
      },
      {
        type: 'text',
        name: 'Ages or Grades',
        placeholder: '',
        help: '',
      },
    ];
    $scope.loadingTimes = true;
    var resetTimes = function() {
      $scope.noWorkshop = {};
      if (!admin) {
        $scope.form.times = [
          '9:00 am',
          '10:00 am',
          '11:00 am',
          '12:00 pm',
          '1:00 pm',
          '2:00 pm',
          '3:00 pm',
          '4:00 pm',
          '5:00 pm',
        ];
      }
      else {
        $scope.form.times = [
          {
            value: '9:00 am',
          },
          {
            value: '10:00 am',
          },
          {
            value: '11:00 am',
          },
          {
            value: '12:00 pm',
          },
          {
            value: '1:00 pm',
          },
          {
            value: '2:00 pm',
          },
          {
            value: '3:00 pm',
          },
          {
            value: '4:00 pm',
          },
          {
            value: '5:00 pm',
          },
        ];
        _.each($scope.form.times, function(time) {
          time.checked = true;
          time.changed = false;
        });
        $scope.form.wtimes = angular.copy($scope.form.times);
      }
    }
    $scope.$watch('form.workshop', function() {
      calculateTotal($scope.form.numberGroup);
    });
    $scope.$watch('form.numberGroup', function(val) {
      calculateTotal(val);
    });
    var calculateTotal = function(val) {
      if (isNaN(parseInt(val))) {
        $scope.total = 0;
        $scope.deposit = 0;
      }
      else {
        var total = 0;
        if (val != undefined) {
          if ($scope.form.workshop) {
            total = val*4;
          }
          else {
            total = val*3;
          }
          $scope.total = total;
          $scope.deposit = Math.ceil(total/2);
        }
      }
    }
    $scope.$watch('form.timeInput', function(val) {
    });

    $scope.dateChange = function() {
      var selectedTime = moment($scope.form.date).format("X");
      var day = moment($scope.form.date).format('dddd');
      if (day == 'Monday') {
        $scope.isMonday = true;
      }
      else {
        $scope.isMonday = false;
        var saved = false;
        $scope.form.visit[0].values = ['Loading . . . '];
        $scope.form.visit[0].inputValue = 'Loading . . . ';
        $scope.form.visit[0].placeholder = 'Loading . . . ';
        _.each(exhibitions, function(exhibit) {
          if (exhibit.dateStart < selectedTime && exhibit.dateEnd > selectedTime) {
            $scope.form.visit[0].values.push(exhibit.title);
            if (exhibit.title == currentExhibit.title) {
              saved = true;
            }
          }
        });
        if ($scope.form.visit[0].values.length != 1) {
          $scope.form.visit[0].values = $scope.form.visit[0].values.slice(1);
          $scope.form.visit[0].inputValue = $scope.form.visit[0].values[0];
          $scope.form.visit[0].placeholder = $scope.form.visit[0].values[0];
        }
        else if (exhibitions != null) {
          $scope.form.visit[0].values = ['None available']
          $scope.form.visit[0].inputValue = 'None available';
          $scope.form.visit[0].placeholder = 'None available';
        }
        if (saved) {
          $scope.form.visit[0].inputValue = currentExhibit.title;
        }
        checkTimes();
      }
    };
    var checkTimes = function() {
      console.log('Checking times');
      $scope.loadingTimes = true;
      var val = $scope.form.visit[0].inputValue;
      var selectedTime = moment($scope.form.date).format("X");
      // console.log($scope.form.timeInput);
      // console.log();
      _.each(exhibitions, function(exhibit) {
        if ($scope.form.visit[0].inputValue == exhibit.title) {
          $scope.workshopNotes = exhibit.workshop_description;
          currentExhibit = exhibit;
          if (!admin && exhibit.age_restricted_tour == 1) {
            $scope.form.visit[0].help = '<a class="help-link" target="_blank" href="/node/' + exhibit.nid + '">View Exhibition Details</a> <BR><div class="age-restricted">(This Exhibition is Age-Restricted: ' + exhibit.age_restriction_note + ')</div>';
          }
          else if (!admin) {
            $scope.form.visit[0].help = '<a class="help-link" target="_blank" href="/node/' + exhibit.nid + '">View Exhibition Details</a>';
          }
          REST.getRequestIndex(exhibit.nid, function(index) {
            resetTimes();
            if (index.data.length != 0) {
              _.each(index.data, function(t) {
                var time = moment(parseInt(t.datetime), 'X').format('h') + ':00 ' + moment(parseInt(t.datetime), 'X').format('a');
                var dateMoment = moment(parseInt(t.datetime), 'X');
                if (dateMoment.format("MMMM Do YYYY") == moment($scope.form.date).format("MMMM Do YYYY")) {
                  if (!admin) {
                    $scope.form.times = _.reject($scope.form.times, function(item, key) {
                      if (item == time) {
                        if (t.admin == 1 && t.workshop == 1) {
                          $scope.noWorkshop[time] = true;
                          return false;
                        } 
                        return true;
                      }
                    });
                  }
                  else {
                    _.each($scope.form.times, function(item, key) {
                      if (item.value == time) {
                        console.log(t);
                        if (t.admin == 0) {
                          $scope.form.times[key].checked = false;
                          $scope.form.wtimes[key].checked = false;
                          $scope.form.times[key].link = "<a href='http://staging.camh.org/admin/tour-request/#/requests/" + t.id + "'>(Reserved: " + t.contact_name + " of " + t.organization_name + ")</a>";
                          if (t.workshop == 1) {
                            $scope.form.wtimes[key].workshop = '(Reserved)';
                          }
                        }
                        else {
                          $scope.form.wtimes[key].checked = false;
                          $scope.form.wtimes[key].id = t.id;
                          item.id = t.id;
                          if (t.workshop != 1) {
                            $scope.form.times[key].checked = false;
                            $scope.form.times[key].link = "<a href='http://staging.camh.org/admin/tour-request/#/requests/" + t.id + "'>(Excluded)</a>";
                          }
                        }
                      }
                    });
                  }
                }
              });
            }
            else {
            }
            $scope.loadingTimes = false;
          });
        }
      });
    }
    $scope.adminTimeChanged = function(key) {
      if ($scope.form.times[key].changed == true) {
        $scope.form.times[key].changed = false;
      }
      else {
        $scope.form.times[key].changed = true;
      }
      if ($scope.form.times[key].checked == false) {
        $scope.form.wtimes[key].checked = false;
      }
    }
    $scope.adminWTimeChanged = function(key) {
      if ($scope.form.wtimes[key].changed == true) {
        $scope.form.wtimes[key].changed = false;
      }
      else {
        $scope.form.wtimes[key].changed = true;
      }
      if ($scope.form.wtimes[key].checked == true) {
        $scope.form.times[key].checked = true;
      }
    }
    $scope.$watch('form.visit[0].inputValue', function(val) {
      checkTimes();
    });

    $scope.validate = function() {
      var results = { 
        cc: {},
        personal: {},
      };
      var valid = true;
      if ($scope.form.timeInput == undefined) {
        valid = false;
        alert('Please select a time for your tour request');
      }
      _.each($scope.form.personal, function(field) {
        results['personal'][field.name] = field.inputValue;
        if ((field.inputValue == '' || field.inputValue == undefined) && field.required == undefined) {
          valid = false;
        }
      });
      if ($scope.form.paymentOption != '3' && $scope.form.paymentOption != '4') {
        _.each($scope.form.creditCard, function(value, key) {
          var tempValid = true;
          results['cc'][key] = value;
          if (value == undefined || value == '') {
            tempValid = false;
            $scope.ccValid = "has-error";
          }
          if (tempValid == false) {
            valid = false;
          } 
          else {
            $scope.ccValid = "";
          }
        });
      }
      $rootScope.$broadcast('form.validate', function() {
      });
      if (valid) {
        if (!validateEmail(results.personal['Email'])) {
          alert('Please enter a valid email address.');
        }
        else {
          $scope.submit();
        }
      }
      else {
        alert('Please enter all required fields above.');
      }
      function validateEmail(email) { 
          var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return re.test(email);
      } 
    }
    $scope.adminSubmit = function(form) {
      _.each($scope.form.wtimes, function(item, key) {
        if (item.changed && item.checked != false) {
          REST.removeTourRequest(item.id, function(result) {
            console.log(result);
            checkTimes();
            // $route.reload();
          });
        }
        if (item.changed && item.checked == false && $scope.form.times[key].checked == true) {
          var dateTime = moment($scope.form.date).format("MMMM Do YYYY") + ' ' + moment(item.value, 'h:mm a').format('h:mm a');
          var data = {
            datetime: moment(dateTime, "MMMM Do YYYY h:mm a").format('X'),
            nid: currentExhibit.nid,
            amount: 0,
            admin: 1,
            workshop: 1,
          };
          REST.addTourRequest(data, function(result) {
            console.log(result);
            checkTimes();
            // $route.reload();
          });
        }
      });
      _.each($scope.form.times, function(item, key) {
        console.log(key);
        console.log(item);
        if (item.changed && item.checked != false) {
          REST.removeTourRequest(item.id, function(result) {
            console.log(result);
            checkTimes();
            // $route.reload();
          });
        }
        if (item.changed && item.checked == false) {
          console.log(item);
          var dateTime = moment($scope.form.date).format("MMMM Do YYYY") + ' ' + moment(item.value, 'h:mm a').format('h:mm a');
          var data = {
            datetime: moment(dateTime, "MMMM Do YYYY h:mm a").format('X'),
            nid: currentExhibit.nid,
            amount: 0,
            admin: 1,
          };
          REST.addTourRequest(data, function(result) {
            console.log(result);
            checkTimes();
            // $route.reload();
          });
        }
      });
    }
    $scope.submit = function(form) {
      var results = { 
        visit: {},
        cc: {},
        personal: {},
      };
      _.each($scope.form.personal, function(field) {
        results['personal'][field.name] = field.inputValue;
      });
      results['personal']['Group Notes'] = $scope.form.groupNotes;
      _.each($scope.form.creditCard, function(value, key) {
        results['cc'][key] = value;
      });
      _.each($scope.form.misc, function(value, key) {
        results['misc'][key] = value;
      });
      results.visit = {
        exhibition: $scope.form.visit[0].inputValue,
        date: moment($scope.form.date).format("MMMM Do YYYY"),
        time: $scope.form.timeInput,
        workshop: $scope.form.workshop,
        requestInfo: $scope.form.requestInfo,
      }
      results.paymentInfo = {
        paymentOption: $scope.form.paymentOption,
        paymentInfo: $scope.form.paymentInfo,
      }
      var data = results;
      var amount = 0;
      switch ($scope.form.paymentOption) {
        case '1': 
          amount = $scope.total;
          break;
        case '2': 
          amount = $scope.deposit;
          break;
        default: 
          amount = 0;
          break;
      }
      if (amount != 0) {
      var yesNo = confirm('Do you want to charge $' + amount + '?');
      }
      else {
      var yesNo = confirm('Do you want to schedule a tour?');
      }
      if (yesNo) {
        var dateTime = moment($scope.form.date).format("MMMM Do YYYY") + ' ' + moment($scope.form.timeInput, 'h:mm a').format('h:mm a');
        var data = {
          datetime: moment(dateTime, "MMMM Do YYYY h:mm a").format('X'),
          nid: currentExhibit.nid,
          organization_name: results['personal']['School/Organization'],
          contact_name: results['personal']['Contact Name'],
          workshop: $scope.form.workshop,
          telephone: results['personal']['Telephone'],
          email: results['personal']['Email'],
          results: results,
          amount: amount,
          admin: 0,
        };
        if (amount != 0) {
          $scope.disabled = true;
          Stripe.setPublishableKey('pk_xeLP8FD0w0O9iHMBm7dkqEzilL6Yf');
          Stripe.card.createToken(
            {
              number: results['cc']['number'],
              cvc: results['cc']['cvv'],
              exp_month: results['cc']['month'],
              exp_year: results['cc']['year'],
            }, 
            function(status, response) {
              if (status == 200) {
                data.stripe = response;
                delete data.cc;
                delete data.results.cc;
                REST.addTourRequest(data, function(result) {
                  console.log(result);
                  window.location = 'http://staging.camh.org/tour-request-thank-you';
                  $scope.disabled = false;
                });
              }
              else {
                alert('Please check your information and try again. (' + response.error.code + ' -- ' + response.error.message + ')');
                $scope.$apply(function() {
                  $scope.disabled = false;
                });
              }
            }
          );
        }
        else {
          REST.addTourRequest(data, function(result) {
            console.log(result);
            window.location = 'http://staging.camh.org/tour-request-thank-you';
            $scope.disabled = false;
          });
        }
      }
      else {
        // Testing
      }
    };
  });

