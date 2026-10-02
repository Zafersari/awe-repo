/*import { state } from "../state.js";
import { evidenceMentionsPerson } from "../utils.js";
import { navigateTo } from "../router.js";
import { renderEvidenceList } from "./evidence.js";

export function switchPeopleTab(tab) {
  state.currentPeopleTab = tab;
  var peoplePanel = document.getElementById("peoplePanel");
  var locationsPanel = document.getElementById("locationsPanel");
  var peopleTabBtn = document.getElementById("tabPeopleBtn");
  var locationsTabBtn = document.getElementById("tabLocationsBtn");

  if (tab === "people") {
    peoplePanel.classList.remove("hidden");
    locationsPanel.classList.add("hidden");
    peopleTabBtn.classList.add("active");
    locationsTabBtn.classList.remove("active");
  } else {
    peoplePanel.classList.add("hidden");
    locationsPanel.classList.remove("hidden");
    peopleTabBtn.classList.remove("active");
    locationsTabBtn.classList.add("active");
  }
}

export function countEvidenceForPerson(person) {
  var count = 0;
  for (var i = 0; i < state.allEvidence.length; i++) {
    if (evidenceMentionsPerson(state.allEvidence[i], person)) count++;
  }
  return count;
}

export function renderPeople() {
  var container = document.getElementById("peoplePanel");
  var html = "";
  for (var i = 0; i < state.allPeople.length; i++) {
    var person = state.allPeople[i];
    var count = countEvidenceForPerson(person);

    html += '<div class="person-card">';
    html += '<div class="person-card-header">';
    html +=
      '<img class="person-avatar" src="' +
      person.avatar +
      '" alt="Portrait of ' +
      person.name +
      '">';
    html +=
      "<div><h3>" +
      person.name +
      '</h3><div class="person-role">' +
      person.role +
      "</div></div>";
    html += "</div>";
    html += "<p><strong>Speciality:</strong> " + person.speciality + "</p>";
    html += "<ul>";
    for (var r = 0; r < person.responsibilities.length; r++) {
      html += "<li>" + person.responsibilities[r] + "</li>";
    }
    html += "</ul>";
    html +=
      '<div class="person-statement">&ldquo;' +
      person.statement +
      "&rdquo;</div>";
    html +=
      "<p>" +
      count +
      " related evidence item" +
      (count === 1 ? "" : "s") +
      " &mdash; ";
    html +=
      '<button type="button" class="evidence-count-link" data-person-id="' +
      person.id +
      '">view</button></p>';
    html += "</div>";
  }
  container.innerHTML = html;

  var links = container.querySelectorAll(".evidence-count-link");
  for (var l = 0; l < links.length; l++) {
    links[l].addEventListener("click", function (e) {
      var personId = e.target.getAttribute("data-person-id");
      document.getElementById("filterPerson").value = personId;
      navigateTo("evidence");
      setTimeout(function () {
        renderEvidenceList();
      }, 0);
    });
  }
}

export function renderLocations() {
  var container = document.getElementById("locationsPanel");
  var html = "";
  for (var i = 0; i < state.allLocations.length; i++) {
    var loc = state.allLocations[i];
    html += '<div class="location-card">';
    html += "<h3>" + loc.id + " &mdash; " + loc.name + "</h3>";
    html += "<p>" + loc.description + "</p>";
    html += "<p><strong>Contains:</strong></p><ul>";
    for (var c = 0; c < loc.contains.length; c++) {
      html += "<li>" + loc.contains[c] + "</li>";
    }
    html += "</ul></div>";
  }
  container.innerHTML = html;
}*/

import { state } from "../state";
import { Person } from "../models";
import { evidenceMentionsPerson } from "../utils";
import { navigateTo } from "../router";
import { renderEvidenceList } from "./evidence";

// Declare that the tab parameter is a string
export function switchPeopleTab(tab: string): void {
  state.currentPeopleTab = tab;

  // Assert (with !) that the HTML elements definitely exist
  const peoplePanel = document.getElementById("peoplePanel")!;
  const locationsPanel = document.getElementById("locationsPanel")!;
  const peopleTabBtn = document.getElementById("tabPeopleBtn")!;
  const locationsTabBtn = document.getElementById("tabLocationsBtn")!;

  if (tab === "people") {
    peoplePanel.classList.remove("hidden");
    locationsPanel.classList.add("hidden");
    peopleTabBtn.classList.add("active");
    locationsTabBtn.classList.remove("active");
  } else {
    peoplePanel.classList.add("hidden");
    locationsPanel.classList.remove("hidden");
    peopleTabBtn.classList.remove("active");
    locationsTabBtn.classList.add("active");
  }
}

// Added the Person type to the parameter and number as the return type
export function countEvidenceForPerson(person: Person): number {
  let count = 0;
  for (let i = 0; i < state.allEvidence.length; i++) {
    if (evidenceMentionsPerson(state.allEvidence[i], person)) count++;
  }
  return count;
}

export function renderPeople(): void {
  const container = document.getElementById("peoplePanel");
  if (!container) return;

  let html = "";
  for (let i = 0; i < state.allPeople.length; i++) {
    const person = state.allPeople[i];
    const count = countEvidenceForPerson(person);

    html += '<div class="person-card">';
    html += '<div class="person-card-header">';
    html +=
      '<img class="person-avatar" src="' +
      person.avatar +
      '" alt="Portrait of ' +
      person.name +
      '">';
    html +=
      "<div><h3>" +
      person.name +
      '</h3><div class="person-role">' +
      person.role +
      "</div></div>";
    html += "</div>";

    html += "<p><strong>Speciality:</strong> " + person.speciality + "</p>";
    html += "<ul>";
    const responsibilities = person.responsibilities;
    for (let r = 0; r < responsibilities.length; r++) {
      html += "<li>" + responsibilities[r] + "</li>";
    }
    html += "</ul>";
    html +=
      '<div class="person-statement">&ldquo;' +
      person.statement +
      "&rdquo;</div>";
    html +=
      "<p>" +
      count +
      " related evidence item" +
      (count === 1 ? "" : "s") +
      " &mdash; ";
    html +=
      '<button type="button" class="evidence-count-link" data-person-id="' +
      person.id +
      '">view</button></p>';
    html += "</div>";
  }
  container.innerHTML = html;

  const links = container.querySelectorAll<HTMLElement>(".evidence-count-link");
  for (let l = 0; l < links.length; l++) {
    links[l].addEventListener("click", function (e: Event) {
      // Treat the event target as an HTMLElement
      const target = e.target as HTMLElement;
      const personId = target.getAttribute("data-person-id");

      const filterPersonSelect = document.getElementById(
        "filterPerson",
      ) as HTMLSelectElement;
      if (filterPersonSelect && personId) {
        filterPersonSelect.value = personId;
      }

      navigateTo("evidence");
      setTimeout(function () {
        renderEvidenceList();
      }, 0);
    });
  }
}

export function renderLocations(): void {
  const container = document.getElementById("locationsPanel");
  if (!container) return;

  let html = "";
  for (let i = 0; i < state.allLocations.length; i++) {
    const loc = state.allLocations[i];

    html += '<div class="location-card">';
    html += "<h3>" + loc.id + " &mdash; " + loc.name + "</h3>";
    html += "<p>" + loc.description + "</p>";
    html += "<p><strong>Contains:</strong></p><ul>";

    const containsList = loc.contains;
    for (let c = 0; c < containsList.length; c++) {
      html += "<li>" + containsList[c] + "</li>";
    }
    html += "</ul></div>";
  }
  container.innerHTML = html;
}
