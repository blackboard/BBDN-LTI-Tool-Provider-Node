/**
 * Created by cthomas on 4/11/16.
 */

var controllerModule = angular.module('controllers', []);

function getResultService(tcProfile) {
  var service = _.find(tcProfile.service_offered, function (d) {
    console.log('format ' + d.format);
    return d.format === 'application/vnd.ims.lis.v2.Result+json';
  });
  if (!service) {
    console.log("no service found");
    return null;
  }
  return service;
}

controllerModule.controller('LaunchEndpointController', function ($scope, $http, $rootScope, configService) {
  $http.get('/launchendpointactivity').success(function (data) {
    $scope.body = data.launchendpointactivity;
  });

  $scope.result = 1.0;

  var resultUrl = getResultService(data.toolProxy).endpoint;

  $scope.returnResult = function () {
    $http.put(resultUrl, createResult($scope.body.resource_link_id, $scope.result, 'comment'));

  }

});

function createResult(id, score, comment) {
  return {
    "@context": "http://purl.imsglobal.org/ctx/lis/v2/Result",
    "@type": "Result",
    "@id": "http://server.example.com/resources/Result/22220",
    "resultScore": score,
    "comment": comment
  };
}

controllerModule.controller('RegistrationController', function ($scope, $rootScope, $http, $sce, configService) {

  $http.get('/registrationactivity').success(function (activity) {
    $scope.activity = activity;
    var launch_return_url = activity ? activity.get_tc_profile.launch_presentation_return_url : 'unknown';
    $scope.returnUrl = $sce.trustAsResourceUrl(launch_return_url + '&status=' + activity.status + '&tool_proxy_guid=mytoolguid');
  });

});