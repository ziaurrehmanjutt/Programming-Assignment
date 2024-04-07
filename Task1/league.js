// Execute code when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', async function () {
    // Load data initially
    loadData();
    // Set interval to reload data every 5 seconds
    setInterval(loadData, 5000);
});

// Asynchronously load data from JSON files
async function loadData() {
    // Add timestamp to avoid caching
    const timestamp = Date.now();
    // Fetch data from 'league.json'
    const dataResponse = await fetch('league.json?' + timestamp);
    // Fetch schema from 'leagueschema.json'
    const schemaResponse = await fetch('leagueschema.json');

    // Parse responses as JSON
    const data = await dataResponse.json();
    const schema = await schemaResponse.json();

    // Validate data against schema
    const valid = validateObject(data, schema);

    // If data is not valid, log an error and return
    if (!valid) {
        console.error('Data does not match schema.');
        return;
    }

    // If data is valid, populate the HTML table
    populateTable(data);
}

// Validate object against schema
function validateObject(obj, sch) {
    // Check if object is null or undefined
    if (obj === null || obj === undefined) {
        console.error("Object is null or undefined.");
        return false;
    }

    // Check if object is an array
    if (sch.type === 'array' && Array.isArray(obj)) {
        // Validate each item in the array recursively
        for (const item of obj) {
            if (!validateObject(item, sch.items)) {
                console.error("Array item validation failed.");
                return false;
            }
        }
        return true;
    }

    // Check if object is a primitive type
    if (typeof obj === sch.type) {
        // If object is of type 'object', validate its properties recursively
        if (sch.type === 'object') {
            for (const key in sch.properties) {
                const propertySchema = sch.properties[key];
                const propertyValue = obj[key];
                // Check if required properties are present
                if (propertySchema.required && propertyValue === undefined) {
                    console.error("Required property is missing.");
                    return false;
                }

                // Validate properties recursively
                if (!validateObject(propertyValue, propertySchema)) {
                    console.error("Property validation failed:", key);
                    return false;
                }
            }
        }
        return true;
    }
    console.error("Invalid type: Type of "+typeof obj+" Dose not match with Required type "+sch.typ);
    return false; // Invalid type
}

// Populate table based on tableData
function populateTable(tableData) {
    // Check which table to populate based on HTML element ID
    if (document.getElementById('leagueData')) {
        // Populate league table
        populateLeagueTable(tableData.scoresFixtures);
    } else if (document.getElementById('topScoresData')) {
        // Populate top scorers table
        populateTopTable(tableData.topScorers);
    }
}

// Populate top scorers table
function populateTopTable(leagueData) {
    const tableBody = document.getElementById('topScoresData');
    tableBody.innerHTML = "";
    // Sort data based on goals scored
    leagueData.sort((a, b) => b.Goals - a.Goals);
    // Populate table rows
    leagueData.forEach(fixture => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${fixture.Rank}</td>
            <td>${fixture.Name}</td>
            <td>${fixture.Club}</td>
            <td>${fixture.Goals}</td>
            <td>${fixture.Assists}</td>
            <td>${fixture.Played}</td>
            <td>${fixture['Goals per 90']}</td>
            <td>${fixture['Mins per Goal']}</td>
            <td>${fixture['Total Shots']}</td>
            <td>${fixture['Goal Conversion']}</td>
            <td>${fixture['Shot Accuracy']}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Populate league table
function populateLeagueTable(leagueData) {
    const tableBody = document.getElementById('leagueData');
    tableBody.innerHTML = "";
    // Populate table rows
    leagueData.forEach(fixture => {
        fixture.matches.forEach(element => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${fixture.date}</td>
                <td>${element.homeTeam}</td>
                <td>${element.homeScore}</td>
                <td>${element.awayTeam}</td>
                <td>${element.awayScore}</td>
                <td>${element.result}</td>
            `;
            tableBody.appendChild(row);
        });
    });
}
