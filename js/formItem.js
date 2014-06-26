'use strict';

angular.module('tourApp')
  .directive('formItem', ['$compile', '$http', '$templateCache', function($compile, $http, $templateCache, $rootScope) {
      var rootScope = $rootScope;
      var getTemplate = function(contentType) {
        var templateLoader,
        baseUrl = '/sites/all/modules/custom/tour_request/views/',
        templateMap = {
          text: 'form-item-text.html',
          radios: 'form-item-radios.html',
          select: 'form-item-select.html',
        };
        var templateUrl = baseUrl + templateMap[contentType];
        templateLoader = $http.get(templateUrl, {cache: $templateCache});
        return templateLoader;
      };
      return {
        restrict: 'A',
        scope: {
          item: '=',
          change: '&',
        },
        link: function postLink(scope, element, attrs) {
          scope.valid = "";
          scope.$on('form.validate', function() {
            if (scope.item.required != false && (scope.item.inputValue == '' || scope.item.inputValue == undefined)) {
              scope.valid = "has-error";
            }
            else {
              scope.valid = "";
            }
          });
          scope.$watch('item.inputValue', function(newValue) {
            scope.change({});
          });
          var loader = getTemplate(scope.item.type);
          var promise = loader.success(function(html) {
            element.html(html);
          }).then(function (response) {
            // console.log('selecting radio');
            scope.selected = {};
            if (scope.item.type == 'radios' || scope.item.type == 'select') {
              for (var i in scope.item.values) {
                var value = scope.item.values[i];
                if (value == scope.item.placeholder) {
                  scope.selected[value] = true;
                  scope.item.inputValue = value;
                }
                else {
                  scope.selected[value] = false;
                }
              }
            }
            $compile(element.contents())(scope);
          });
        }
      };
    }]);
