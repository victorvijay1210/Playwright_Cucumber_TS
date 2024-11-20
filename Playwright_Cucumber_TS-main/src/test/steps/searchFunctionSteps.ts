import { Given, When, Then, setWorldConstructor, setDefaultTimeout } from "@cucumber/cucumber";
import SearchPage from "../../pages/searchPage";
import { fixture } from "../../hooks/pageFixture";

class CustomWorld {
  searchTerm: string;
  uiResults: string[];
  apiResults: string[];

  constructor() {
    this.searchTerm = null;
    this.uiResults = null;
    this.apiResults = null;
  }

  setSearchTerm(term: string) {
    this.searchTerm = term;
  }

  setUIResults(results: string[]) {
    this.uiResults = results;
  }

  setAPIResults(results: string[]) {
    this.apiResults = results;
  }


}

setWorldConstructor(CustomWorld);

let searchPage: SearchPage;
setDefaultTimeout(100000)

Given('the application is loaded successfully', async function () {
  searchPage = new SearchPage(fixture.page);
  await searchPage.navigateToLoginPage();
  fixture.logger.info("Application loaded successfully");
});

Given('user search for {string}', async function (searchTerm) {
  this.setSearchTerm(searchTerm);
  searchPage = new SearchPage(fixture.page);
  await searchPage.search(this.searchTerm);
  fixture.logger.info(`Search term set to: ${this.searchTerm}`);
});

Given('user clicks on {string} Dropdown', async function (dropdownName) {
  searchPage = new SearchPage(fixture.page);
  await searchPage.clickSkillDropDown(dropdownName);
  fixture.logger.info(`Clicked on ${dropdownName} Dropdown`);
});

When('user search for {string} in Skill Dropdown', async function (searchTerm) {
  this.setSearchTerm(searchTerm);
  searchPage = new SearchPage(fixture.page);
  await searchPage.skillSearch(this.searchTerm);
  fixture.logger.info(`Searching for: ${this.searchTerm} in Skill Dropdown`);
});

Then('user sees results matching the search term in the UI', async function () {
  searchPage = new SearchPage(fixture.page);
  await searchPage.verifyUISearchResult(this.searchTerm);
  fixture.logger.info(`UI results fetched`);
});

Then('user fetch search results from the API', async function () {
  searchPage = new SearchPage(fixture.page);
  await searchPage.fetchAPISearchResult();
  fixture.logger.info(`API results fetched`);
});

Then('the UI results should match the API results', async function () {
  searchPage = new SearchPage(fixture.page);
  await searchPage.verifyUIResultsMatchAPIResults();
  fixture.logger.info('UI results match API results');
});

Then('user should see a {string} message', async function (searchTerm) {
  this.setSearchTerm(searchTerm);
  searchPage = new SearchPage(fixture.page);
  await searchPage.verifyNonExistentTermSearchResults(this.searchTerm);
  fixture.logger.info('No result found for search term');

});