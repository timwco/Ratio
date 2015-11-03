;(function () {

  var token;
  var weekend;
  var ghAPI = 'https://api.github.com/repos/';

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
    if (token) { user_url = user_url + "&access_token=" + token; }

    getJSON(user_url, function (users) {

      console.log(users);


      // Get the count of assignments
      // Generate an array of all of the assignments
      var issue_url = ghAPI+owner+'/'+repo+'/issues?state=all&assignee='+users[0].login;
      if (token) { issue_url = issue_url + "&access_token=" + token; }

      getJSON(issue_url, function (issues) {
        var assignmentCount = [];
        for (var i = 1; i <= issues.length; i++) {
          assignmentCount.push(i);
        }
        console.log(assignmentCount);

        // Get total points available
        var pointsAvailable = 0;
        assignmentCount.forEach( function (a) {
          if (weekend.indexOf(a) >= 0){
            pointsAvailable += 4;
          } else {
            pointsAvailable += 1;
          }
        });
        console.log(pointsAvailable);


      });
    });


    
    // Get a list of each student's issues open
    // Do some math

    // getJSON(url, function(issues){

    //   console.log(issues);

    //   var issuesByUser = [];
    //   issues.forEach(function(issue){
    //     var user = issue.assignee.login;
    //     if (!(user in issuesByUser)) {
    //       issuesByUser[user] = 0;
    //     }
    //     issuesByUser[user]++;
    //   });
    //   console.log(issuesByUser);

    //   var users = Object.keys(issuesByUser).sort(function(a, b){
    //     if (issuesByUser[a] > issuesByUser[b]) {
    //       return 1;
    //     } else if (issuesByUser[a] < issuesByUser[b]) {
    //       return -1;
    //     }
    //     return 0;
    //   }).reverse();
    //   console.log(users);

    //   users.forEach(function(user){
    //     var $item, $count, $user, openState, openIssuesCount = issuesByUser[user];

    //     // Get user's actual name
    //     var user_url = 'https://api.github.com/users/'+user;
    //     if (token) {
    //       user_url = user_url + "?access_token=" + token;
    //     }

    //     getJSON(user_url, function (usrObj) {

    //       // console.log(usrObj);

    //     });

    //   });
    // });
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
    token   = items.token;
    weekend = items.weekend;
    console.log(items);
    run();
  });
  

}());