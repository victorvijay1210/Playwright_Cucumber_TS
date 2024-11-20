import { expect, Page } from "@playwright/test";
import PlaywrightWrapper from "../helper/wrapper/PlaywrightWrappers";


let titlesArray: Promise<string>[] = [];
let uiResult: boolean;
export default class SearchPage {

    private base: PlaywrightWrapper;
    constructor(private page: Page) {
        this.base = new PlaywrightWrapper(page);
    }

    private Elements = {
        loginButton: "//a[normalize-space()='Log In']",
        searchButton: "//button[@aria-label='Search']",
        searchBar: "Search input",
        allResults: "All Results",
        skillSearchBar: "Type to Search",
        searchResults: ".css-c5zt4b a",
        negativeSearchResult: "[class='chakra-heading css-1hsf0v9']",
    }


    public async navigateToLoginPage() {
        await this.base.goto(process.env.BASEURL);
        await expect(this.page.locator(this.Elements.loginButton)).toBeVisible();
    }

    public async search(searchWord: string) {
        await this.page.locator(this.Elements.searchButton).click()
        await this.page.getByRole('searchbox', { name: this.Elements.searchBar }).fill(searchWord);
        await this.page.getByRole('searchbox', { name: this.Elements.searchBar }).press('Enter');
    }

    public async clickSkillDropDown(dropDown: string) {
        await this.page.getByRole('button', { name: dropDown, exact: true }).click();

    }

    public async skillSearch(searchWord: string) {
        const skillTextBox = this.page.getByRole('region', { name: 'Skill', exact: true }).getByRole('combobox')
        await skillTextBox.click({ delay: 3000 });
        await skillTextBox.fill(searchWord);
        const searchAPIResult = this.page.waitForResponse('https://api.udacity.com/api/unified-catalog/search')
        await skillTextBox.press('Enter');
        const searchAPIResultResponse = await searchAPIResult;
        const searchAPIResultData = await searchAPIResultResponse.json();
        titlesArray = [];
        for (let i = 0; i < searchAPIResultData.searchResult.hits.length; i++) {
            let titles = await searchAPIResultData.searchResult.hits[i].title;
            titlesArray.push(titles);

        }
    }
    public async verifyUISearchResult(searchWord: string): Promise<boolean> {
        const searchResult = this.page.locator(this.Elements.searchResults);
        await searchResult.first().waitFor({ state: 'visible' });
        const resultsText = await searchResult.allInnerTexts();
        uiResult = resultsText.every(text => text.includes(searchWord));
        return uiResult;
    }




    public async fetchAPISearchResult(): Promise<string[]> {
        const resolvedTitlesArray = await Promise.all(titlesArray);
        return resolvedTitlesArray;
    }

    public async verifyUIResultsMatchAPIResults() {
        await expect(this.page.locator(this.Elements.searchResults)).toHaveText(await this.fetchAPISearchResult());
        expect(uiResult, "UI Search Results are not matching with search terms").toBeTruthy();
    }

    public async verifyNonExistentTermSearchResults(searchWord: string) {
        await expect(this.page.getByText(searchWord, { exact: true })).toBeVisible({ timeout: 20000 });
    }
}
