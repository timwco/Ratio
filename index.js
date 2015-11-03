;(function () {

  var token;
  var weekend;
  var ghAPI = 'https://api.github.com/repos/';
  var regex = /Assignment (.*)/i;
  var pointsAvailable = 0;
  var student_points = [];

  function checkComplete(len) {
    if (student_points.length >= len) {
      
      // Remap Object & Add a percentage
      student_points.forEach( function (sp) {
        sp.percentageComplete = Math.floor((sp.points / pointsAvailable) * 100) + '%';
      });
      console.log(student_points);

    }
  }

  function getJSON(url, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        var resp = JSON.parse(xhr.responseText);
        cb(resp);
      }
    }
    xhr.send();
  }

  function loadOpenRatio(repo, owner) {

    // Get All users
    var user_url = ghAPI+owner+'/'+repo+'/assignees';
    if (token) { user_url = user_url + "?access_token=" + token; }
    getJSON(user_url, function (users) {

      // Get the count of assignments
      // Generate an array of all of the assignments
      // FIX ME - just being lazy. Need a user to get assignment count.
      // FIX ME - there has to be a better way
      var issue_url = ghAPI+owner+'/'+repo+'/issues?state=all&assignee='+users[0].login;
      if (token) { issue_url = issue_url + "&access_token=" + token; }
      getJSON(issue_url, function (issues) {
        var assignmentCount = [];
        for (var i = 1; i <= issues.length; i++) {
          assignmentCount.push(i);
        }

        // Get total points available
        assignmentCount.forEach( function (a) {
          if (weekend.indexOf(a) >= 0){
            pointsAvailable += 4;
          } else {
            pointsAvailable += 1;
          }
        });

        // Get all closed issues by user
        users.forEach( function (user) {
          
          var params = 'state=closed&labels=complete&assignee='+user.login;
          var user_issues_url = ghAPI+owner+'/'+repo+'/issues?'+params;
          if (token) { user_issues_url = user_issues_url + "&access_token=" + token; }

          getJSON(user_issues_url, function (user_issues) {

            // Check which assignment it is (regex)
            var user_assignments_complete = [];
            if(user_issues.length > 0) {
              user_issues.forEach(function (issue) {
                var assignment = issue.title.match(regex);
                user_assignments_complete.push(Number(assignment[1]));
              });
            }


            // Calculate their points & percentage
            // Build an array of students, with name & points            
            var yourPoints = 0;
            user_assignments_complete.forEach( function (a) {
              if (weekend.indexOf(a) >= 0){
                yourPoints += 4;
              } else {
                yourPoints += 1;
              }
            });

            student_points.push({
              student: user.login,
              points: yourPoints
            });


            // Method to check for complete
            checkComplete(users.length);

          });
        });



      });
    });
  }

  function run() {
    var matches, repo, owner;

    matches = window.location.pathname.match(/^\/(.+)\/(.+)\/issues/);

    if (matches) {
      owner = matches[1];
      repo = matches[2];

      loadOpenRatio(repo, owner);
    }
  }

  chrome.storage.sync.get(['token', 'weekend'], function(items) {
    token = items.token;
    if (items.weekend) {
      var arr = items.weekend.split(',');
      weekend = arr.map( function (a) {
        return Number(a);
      });
    }
    run();
  });
  

}());