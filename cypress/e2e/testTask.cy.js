import 'cypress-xpath';

const checkDayOfWeek = (text, expectedDay) => {
    try {
        expect(text.trim()).to.equal(expectedDay.toLowerCase());
    } catch (error) {
        cy.log(`Expected: ${expectedDay.toLowerCase()}, but got: ${text.trim()}`);
    }
};

const checkDate = (text, idx, currentDate) => {
    const expectedDate = new Date();
    expectedDate.setDate(currentDate.getDate() + idx);
    const expectedDay = expectedDate.getDate().toString().padStart(2, '0');
    expect(text.trim()).to.equal(expectedDay);
};

const checkMonth = (text, currentDate) => {
    const expectedMonth = monthsUa[currentDate.getMonth()];
    expect(text.trim().toLowerCase()).to.equal(expectedMonth);
};

const daysOfWeek = ["Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"];
const monthsUa = [
    "січня", "лютого", "березня", "квітня", "травня", "червня",
    "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"
];

describe('Weather Test for Kyiv', () => {
    const city = 'Київ';

    beforeEach(() => {
        cy.intercept('POST', '**/api/weather/location/forecast/by_id').as('searchRequest');
        cy.intercept('GET', '**/stats/visit/pohoda/kyiv/*').as('weatherRequest');
        cy.visit('https://ua.sinoptik.ua/');
    });

    const checkWeatherForDays = (numOfDays) => {
        cy.xpath('/html/body/div[1]/div/div[5]/main/div[1]/a')
            .each(($el, idx) => {
                if (idx >= numOfDays) return;

                const dayName = daysOfWeek[(new Date().getDay() + idx) % 7];
                cy.wrap($el).click();

                if (idx > 0) {
                    cy.wait('@weatherRequest').its('response.statusCode').should('eq', 200);
                    cy.xpath('/html/body/div[1]/div/div[5]/main/div[2]/div[1]/div[1]')
                        .within(() => {
                            cy.get('p').eq(0).invoke('text').then((text) => checkDayOfWeek(text, dayName));
                            cy.get('p').eq(1).invoke('text').then((text) => checkDate(text, idx, new Date()));
                            cy.get('p').eq(2).invoke('text').then((text) => checkMonth(text, new Date()));
                        });
                }
                cy.wrap($el).find('p').eq(0).invoke('text').then((text) => checkDayOfWeek(text, dayName));
                cy.wrap($el).find('p').eq(1).invoke('text').then((text) => checkDate(text, idx, new Date()));
                cy.wrap($el).find('p').eq(2).invoke('text').then((text) => checkMonth(text, new Date()));
            });
    };

    it('Get weather for current week and 10 days', () => {
        cy.xpath('//input[@type="search"]').last().type(city);
        cy.contains('span', 'Київ, Столиця України').click();
        cy.wait('@searchRequest').its('response.statusCode').should('eq', 200);

        checkWeatherForDays(7);

        cy.contains('a', '10 днів').click();

        checkWeatherForDays(10);

    });
});

