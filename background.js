let notificationInterval;

const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20e3);
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ 'checkboxState': {} });

  startNotifications()

});

chrome.runtime.onStartup.addListener(() => {
  startNotifications()
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCheckboxState') {
    chrome.storage.sync.get('checkboxState', (data) => {
      sendResponse(data.checkboxState || {});
    });
    return true;
  } else if (request.action === 'setCheckboxState') {
    chrome.storage.sync.set({ 'checkboxState': request.checkboxState });
  }
});



function startNotifications() {
  notificationInterval = setInterval(makeAPICall, 60000); // 60 seconds interval
}


function makeAPICall() {


  fetch(
    "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard"
  )
    .then((response) => response.json())
    .then((apiData) => {

      chrome.storage.sync.get('checkboxState', function (checkboxData) {

        let storedCheckboxState = checkboxData.checkboxState || {};

        for(let gameNumber = 0; gameNumber < apiData.events.length; gameNumber++) {
          const gameData = apiData.events[gameNumber].competitions[0]

          const team1 = gameData.competitors[0].team
          const team1ID = team1.abbreviation

          const team2 = gameData.competitors[1].team
          const team2ID = team2.abbreviation

          if(storedCheckboxState[team1ID] == true || storedCheckboxState[team2ID] == true) {

            chrome.storage.sync.get('notifiedTeamsState', function(notifiedTeamsData) {

              let notifiedTeams = notifiedTeamsData.notifiedTeamsState || {}

              if((notifiedTeams[team1ID] == false || notifiedTeams[team1ID] == undefined) 
              && (notifiedTeams[team2ID] == false || notifiedTeams[team2ID] == undefined)) {

                chrome.storage.sync.get("timeState", function (timeRemainingData) {

                  let timeRemaining = timeRemainingData.timeState || {}

                  let clockMax

                  if(timeRemaining['value'] == undefined) {
                    clockMax = 360
                  }
                  else {
                    clockMax = parseInt(timeRemaining['value']) * 60
                  }

                  if (
                    gameData.status.type.completed == false &&
                    gameData.status.period == 4 &&
                    gameData.status.clock <= clockMax
                  ) {
                    const team1Score = gameData.competitors[0].score;

                    const team2Score = gameData.competitors[1].score;

                    let diff = Math.abs(
                      parseInt(team1Score) - parseInt(team2Score)
                    );

                    chrome.storage.sync.get("diffState", function (diffData) {

                      let scoreDiff = diffData.diffState || {}

                      let diffMax

                      if(scoreDiff['value'] == undefined) {
                        diffMax = 10
                      }
                      else {
                        diffMax = parseInt(scoreDiff['value'])
                      }

                      if (diff <= diffMax) {
                        const notificationOptions = {
                          type: "basic",
                          iconUrl: "nba-icon.png",
                          title: gameData.status.type.detail,
                          message:
                            team1.displayName +
                            " " +
                            team1Score +
                            " : " +
                            team2.displayName +
                            " " +
                            team2Score,
                        };

                        chrome.notifications.create("", notificationOptions);

                        notifiedTeams[team1ID] = true;
                        notifiedTeams[team2ID] = true;
                        chrome.storage.sync.set({
                          notifiedTeamsState: notifiedTeams,
                        });
                      }
                    });

                  }
                });

              }

            })
          }

          if(gameData.status.type.completed == true) {
            chrome.storage.sync.get('notifiedTeamsState', function(notifiedTeamsData) {

              let notifiedTeams = notifiedTeamsData.notifiedTeamsState || {}

              notifiedTeams[team1ID] = false
              notifiedTeams[team2ID] = false
              chrome.storage.sync.set({ notifiedTeamsState: notifiedTeams });
            })
          }
        }
    
      });
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

// Optional: Stop notifications when the extension is unloaded
chrome.runtime.onSuspend.addListener(() => {
  clearInterval(notificationInterval);
});