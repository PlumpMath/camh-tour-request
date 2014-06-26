'use strict';

angular.module('tourApp')
  .factory('REST', function ($http) {

    var REST = {
      getAllRequests: function(cb) {
        $http({
          method: 'GET',
          url: '/api/tour-request/request/all',
        }).
        success(cb);
      },
      getRequest: function(data, cb) {
        $http({
          method: 'GET',
          url: '/api/tour-request/request/' + data,
        }).
        success(cb);
      },
      getExhibitionIndex: function(cb) {
        $http({
          method: 'GET',
          url: '/api/tour-request/exhibition/index',
        }).
        success(cb);
      },
      getRequestIndex: function(nid, cb) {
        $http({
          method: 'POST',
          data: {
            nid: nid,
          },
          url: '/api/tour-request/request/index',
        }).
        success(cb);
      },
      addTourRequest: function(data, cb) {
        $http({
          method: 'POST',
          data: data,
          url: '/api/tour-request/request/add',
        }).
        success(cb);
      },
      setTourRequest: function(data, cb) {
        $http({
          method: 'POST',
          data: data,
          url: '/api/tour-request/request/set',
        }).
        success(cb);
      },
      removeTourRequest: function(data, cb) {
        $http({
          method: 'POST',
          data: { id: data },
          url: '/api/tour-request/request/remove',
        }).
        success(cb);
      },
    };

    // Public API here
    return {
      chargeCard: function (data, cb) {
        REST.chargeCard(data, cb);
      },
      viewCharges: function (data, cb) {
        REST.viewCharges(data, cb);
      },
      getExhibitionIndex: function (cb) {
        REST.getExhibitionIndex(cb);
      },
      getRequestIndex: function (nid, cb) {
        REST.getRequestIndex(nid, cb);
      },
      addTourRequest: function (data, cb) {
        REST.addTourRequest(data, cb);
      },
      setTourRequest: function (data, cb) {
        REST.setTourRequest(data, cb);
      },
      removeTourRequest: function (data, cb) {
        REST.removeTourRequest(data, cb);
      },
      getAllRequests: function (cb) {
        REST.getAllRequests(cb);
      },
      getRequest: function (data, cb) {
        REST.getRequest(data, cb);
      },
        
    };
  });
