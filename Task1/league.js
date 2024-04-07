

document.addEventListener('DOMContentLoaded', async function () {
    loadData();
    setInterval(() => {
        loadData();
    }, 5000);

});

async function loadData() {
    const timestamp = Date.now();
    const dataResponse = await fetch('league.json?' + timestamp);
    const schemaResponse = await fetch('leagueschema.json');

    // Parse responses as JSON
    const data = await dataResponse.json();
    const schema = await schemaResponse.json();

    const valid = validateObject(data, schema);

    if (!valid) {
        console.error('Data does not match schema.');
        return;
    }

    // If data is valid, populate the HTML table
    const leagueData = data.topScorers;// Add more months if available
    populateTable(data);

}

function validateObject(obj, sch) {
    // Check if object is null or undefined
    if (obj === null || obj === undefined) {
        console.error("4", obj)
        return false;
    }


    // Check if object is an array
    if (sch.type === 'array' && Array.isArray(obj)) {
        // Validate each item in the array recursively
        for (const item of obj) {
            if (!validateObject(item, sch.items)) {
                console.error("3", sch)
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
                    console.error("1")
                    return false;
                }

                // Validate properties recursively
                if (!validateObject(propertyValue, propertySchema)) {
                    console.error("2", key)
                    return false;
                }
            }
        }
        return true;
    }
    console.error("5", sch, obj)
    return false; // Invalid type
}
function populateTable(tableData){
    console.log(tableData)
    if(document.getElementById('leagueData')){
        populateLeagueTable(tableData.scoresFixtures)
    }else if(document.getElementById('topScoresData')){
        populateTopTable(tableData.topScorers)
    }
}

function populateTopTable(leagueData) {
    const tableBody = document.getElementById('topScoresData');
    tableBody.innerHTML = ""
    leagueData.sort((a, b) => {
        return b.Goals - a.Goals;
    });
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

function populateLeagueTable(leagueData) { //leagueData
    console.log(leagueData)
    const tableBody = document.getElementById('leagueData');
    tableBody.innerHTML = ""
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
