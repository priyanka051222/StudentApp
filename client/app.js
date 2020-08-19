const myApp = angular
  .module("myApp", ["ngRoute"])
  .config([
    "$routeProvider",
    "$locationProvider",
    function ($routeProvider, $locationProvider) {
      $routeProvider
        .when("/login", {
          templateUrl: "./login.html",
          controller: "loginController",
        })
        .when("/register", {
          templateUrl: "register.html",
          controller: "RegisterController",
        })
        .when("/forgotPassword", {
          templateUrl: "forgotpassword.html",
          controller: "forgotController",
        })
        .when("/home", {
          templateUrl: "home.html",
          controller: "homeController",
        })
        .otherwise({
          redirectTo: "/login",
        });

      //    $locationProvider.html5Mode(true); //Remove the '#' from URL.
    },
  ])
  .controller("loginController", [
    "$scope",
    "$location",
    "Auth",
    "$http",
    "UserProfile",
    function ($scope, $location, Auth, $http, UserProfile) {
      //page.setPage("Login", "login-layout");
      $scope.user = {};
      $scope.invalidLogin = false;
      $scope.showLogin = false;
      $scope.toggleLogin = function () {
        $scope.showLogin =  !$scope.showLogin;
      }
      $scope.getAllRec = function () {
        $http({ method: "GET", url: "/db/readRecords" }).then(
          function (data, status) {
            $scope.dataset = data.data;
          },
          function (data, status) {
            $scope.dataset = data.data || "Request failed ";
          }
        );
      };
      $scope.getAllRec();

      UserProfile.then(function (userProfile) {
        return userProfile.$refresh();
      });

      $scope.loginUser = function () {
        var username = $scope.user.name;
        var password = $scope.user.password;
        if (username && password) {
          Auth.signIn($scope.user).then(function (response) {
            if (response.data.anonymous) {
              $scope.invalidLogin = true;
            } else {
              window.localStorage.setItem("token", response.data.token);

              UserProfile.then(function (userProfile) {
                return userProfile.$refresh();
              }).then(function (userProfile) {
                if (!userProfile.anonymous) {
                  $location.path("/home");
                }
              });
            }
            // UserProfile is refreshed, redirect user somewhere
          });
        } else {
          $scope.message = "Error";
          $scope.messagecolor = "alert alert-danger";
        }
      };
    },
  ])
  .directive("dynamicModel", [
    "$compile",
    function ($compile) {
      return {
        link: function (scope, element, attrs) {
          scope.$watch(attrs.dynamicModel, function (dynamicModel) {
            if (attrs.ngModel == dynamicModel || !dynamicModel) return;

            element.attr("ng-model", dynamicModel);
            if (dynamicModel == "") {
              element.removeAttr("ng-model");
            }

            // Unbind all previous event handlers, this is
            // necessary to remove previously linked models.
            element.unbind();
            $compile(element)(scope);
          });
        },
      };
    },
  ])
  .controller("homeController", [
    "$scope",
    "$http",
    "UserProfile",
    "$location",
    function ($scope, $http, UserProfile, $location) {
      $scope.val1 = "This is temp Val";
      $scope.Answers = {};
      $scope.Filters = {};
      $scope.UpdatedRecord = {};
      $scope.updateRecord = false;

      UserProfile.then(function (userProfile) {
        return userProfile.$refresh();
      }).then(function (userProfile) {
        if (userProfile.anonymous) {
          $location.path("/login");
        }
        $scope.userProfile = userProfile;
        $scope.getAllRec();
      });

      $scope.getAllRec = function () {
        $http({ method: "GET", url: "/db/getColumns" }).then(function (
          data,
          status
        ) {
          $scope.columns = data.data[0].columnnames.split(", ");
          $http({ method: "GET", url: "/db/readRecords" }).then(
            function (data, status) {
              $scope.dataset = data.data;
            },
            function (data, status) {
              $scope.dataset = data.data || "Request failed ";
            }
          );
        });
      };

      $scope.logout = function () {
        window.localStorage.clear();
        $location.path("/login");
        UserProfile.then(function (userProfile) {
          return userProfile.$refresh();
        });
      };

      $scope.addColumn = function () {
        $http({
          method: "GET",
          url:
            "/db/addColumn?columns=" +
            $scope.columns.join(", ") +
            "&column=" +
            $scope.column,
        }).then(function (data, status) {
          $scope.getAllRec();
        });
      };

      $scope.getModelName = function (column) {
        return column;
      };

      function jsonToQueryString(json) {
        return (
          "?" +
          Object.keys(json)
            .map(function (key) {
              return (
                encodeURIComponent(key) + "=" + encodeURIComponent(json[key])
              );
            })
            .join("&")
        );
      }
      $scope.addRecord = function () {
        const params = jsonToQueryString($scope.Answers);
        $http({
          method: "GET",
          url: "/db/addRecord" + params,
        }).then(function () {
          alert("Record Added");
          $scope.getAllRec();
        });
      };

      $scope.updRecord = function (recId) {
        $scope.updateRecord = !$scope.updateRecord;
        if(!$scope.updateRecord) {
          const params = jsonToQueryString($scope.UpdatedRecord);
          $http({
            method: "GET",
            url: "/db/updateRecord" + params+'&id='+recId,
          }).then(function () {
            alert('Record updated');
          });
        }
      }
      $scope.delRecord = function (recId) {
        console.log(recId);
        if (confirm("Are you sure you want to delete this record ? ")) {
          $http({ method: "GET", url: "/db/delRecord?id=" + recId }).then(
            function (data, status) {
              $scope.getAllRec();
            }
          );
        }
      };
    },
  ]);

angular.module("myApp").factory("page", function ($rootScope) {
  var page = {};
  var user = {};
  page.setPage = function (title, bodyClass) {
    $rootScope.pageTitle = title;
    $rootScope.bodylayout = bodyClass;
  };
  page.setUser = function (user) {
    $rootScope.user = user;
  };
  return page;
});

myApp.factory("Access", [
  "$q",
  "UserProfile",
  function ($q, UserProfile) {
    var Access = {
      OK: 200,

      // "we don't know who you are, so we can't say if you're authorized to access
      // this resource or not yet, please sign in first"
      UNAUTHORIZED: 401,

      // "we know who you are, and your profile does not allow you to access this resource"
      FORBIDDEN: 403,

      hasRole: function (role) {
        return UserProfile.then(function (userProfile) {
          if (userProfile.$hasRole(role)) {
            return $q.resolve(Access.OK);
          } else if (userProfile.$isAnonymous()) {
            return $q.reject(Access.UNAUTHORIZED);
          } else {
            return $q.reject(Access.FORBIDDEN);
          }
        });
      },

      hasAnyRole: function (roles) {
        return UserProfile.then(function (userProfile) {
          if (userProfile.$hasAnyRole(roles)) {
            return $q.resolve(Access.OK);
          } else if (userProfile.$isAnonymous()) {
            return $q.reject(Access.UNAUTHORIZED);
          } else {
            return $q.reject(Access.FORBIDDEN);
          }
        });
      },

      isAnonymous: function () {
        return UserProfile.then(function (userProfile) {
          if (userProfile.$isAnonymous()) {
            return $q.resolve(Access.OK);
          } else {
            return $q.reject(Access.FORBIDDEN);
          }
        });
      },

      isAuthenticated: function () {
        return UserProfile.then(function (userProfile) {
          if (userProfile.$isAuthenticated()) {
            return $q.resolve(Access.OK);
          } else {
            return $q.reject(Access.UNAUTHORIZED);
          }
        });
      },
    };

    return Access;
  },
]);
myApp.service("Auth", [
  "$http",
  function ($http) {
    this.signIn = function (credentials) {
      return $http.post("db/login", credentials);
    };
    this.getProfile = function () {
      return $http.get(
        "/db/token?token=" + window.localStorage.getItem("token")
      );
    };
  },
]);
myApp.factory("UserProfile", [
  "Auth",
  function (Auth) {
    var userProfile = {};

    var clearUserProfile = function () {
      for (var prop in userProfile) {
        if (userProfile.hasOwnProperty(prop)) {
          delete userProfile[prop];
        }
      }
    };

    var fetchUserProfile = function () {
      return Auth.getProfile().then(function (response) {
        clearUserProfile();
        return angular.extend(userProfile, response.data, {
          $refresh: fetchUserProfile,

          $hasRole: function (role) {
            return userProfile.roles.indexOf(role) >= 0;
          },

          $hasAnyRole: function (roles) {
            return !!userProfile.roles.filter(function (role) {
              return roles.indexOf(role) >= 0;
            }).length;
          },

          $isAnonymous: function () {
            return userProfile.anonymous;
          },

          $isAuthenticated: function () {
            return !userProfile.anonymous;
          },
        });
      });
    };

    return fetchUserProfile();
  },
]);

myApp.run([
  "$rootScope",
  "Access",
  "$location",
  "$log",
  function ($rootScope, Access, $location, $log) {
    $rootScope.$on("$routeChangeError", function (
      event,
      current,
      previous,
      rejection
    ) {
      switch (rejection) {
        case Access.UNAUTHORIZED:
          $location.path("/signin");
          break;

        case Access.FORBIDDEN:
          $location.path("/forbidden");
          break;

        default:
          $log.warn("$stateChangeError event catched");
          break;
      }
    });
  },
]);
