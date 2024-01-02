import teams from "./teams.js";

let str = "";

teams.forEach(function (team) {
  str +=
    "<div class='checkbox-container'>" +
    "<label class='checkbox-label'><input class='custom-checkbox' type='checkbox' value='" +
    team.abbreviation +
    "'>" +
    team.teamName +
    "</label>" +
    "</div>";
});

document.getElementById("checkboxes").innerHTML = str;

document.addEventListener("DOMContentLoaded", function () {
  let checkboxes = document.querySelectorAll(
    '#checkboxes input[type="checkbox"]'
  );

  // Load saved checkbox state from storage
  chrome.storage.sync.get("checkboxState", function (data) {
    let checkboxState = data.checkboxState || {};

    checkboxes.forEach(function (checkbox) {
      checkbox.checked = checkboxState[checkbox.value];
      checkbox.addEventListener("change", saveCheckboxState);
    });
  });

  // Function to save checkbox state in storage
  function saveCheckboxState() {
    let checkboxState = {};

    checkboxes.forEach(function (checkbox) {
      checkboxState[checkbox.value] = checkbox.checked;
    });
  
    chrome.storage.sync.set({ checkboxState: checkboxState });
  }


  const timeSlider = document.getElementById("time-slider");
  const timeSliderValue = document.getElementById("time-value");

  chrome.storage.sync.get("timeState", function(data) {
    let timeState = data.timeState || {}

    if(timeState['value'] != undefined) {
      timeSlider.value = timeState['value']
      timeSliderValue.textContent = timeState['value']
    }
    else {
      timeSlider.value = 6
      timeSliderValue.textContent = 6
    }

    timeSlider.addEventListener("change", saveTimeState)
  })

  function saveTimeState() {
    let timeState = {}
    timeState['value'] = timeSlider.value
    chrome.storage.sync.set({ timeState: timeState})
  }

  // Function to update value
  const updateTimeSliderValue = () => {
    timeSliderValue.textContent = timeSlider.value;
  };

  // Event listener for slider change
  timeSlider.addEventListener("input", updateTimeSliderValue);

  // Initial display of slider value
  updateTimeSliderValue();



  const diffSlider = document.getElementById("diff-slider");
  const diffSliderValue = document.getElementById("diff-value");

  chrome.storage.sync.get("diffState", function(data) {
    let diffState = data.diffState || {}

    if(diffState['value'] != undefined) {
      diffSlider.value = diffState['value']
      diffSliderValue.textContent = diffState['value']
    }
    else {
      diffSlider.value = 10
      diffSliderValue.textContent = 10
    }

    diffSlider.addEventListener("change", saveDiffState)
  })

  function saveDiffState() {
    let diffState = {}
    diffState['value'] = diffSlider.value
    chrome.storage.sync.set({ diffState: diffState})
  }

  // Function to update value
  const updateDiffSliderValue = () => {
    diffSliderValue.textContent = diffSlider.value;
  };

  // Event listener for slider change
  diffSlider.addEventListener("input", updateDiffSliderValue);

  // Initial display of slider value
  updateDiffSliderValue();
  
});


// Function to toggle dropdown visibility
function toggleDropdown() {
  let checkboxesDiv = document.getElementById("checkboxes");
  checkboxesDiv.classList.toggle("show");
}

// Function to close dropdown if clicked outside
function closeDropdown(event) {
  let dropdownButton = document.getElementById("dropdownButton");
  let checkboxesDiv = document.getElementById("checkboxes");

  if (
    !event.target.matches(".dropbtn") &&
    !event.target.closest(".dropdown-content")
  ) {
    if (checkboxesDiv.classList.contains("show")) {
      checkboxesDiv.classList.remove("show");
    }
  }
}

// Event listeners
document
  .getElementById("dropdownButton")
  .addEventListener("click", toggleDropdown);
window.addEventListener("click", closeDropdown);

