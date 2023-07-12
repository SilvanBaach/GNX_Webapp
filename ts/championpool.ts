
function buildMainChampionpoolTable() {
    var table = document.querySelector('.main-chp-container') as HTMLDivElement;
    var tableBody = document.createElement('tbody');

    const numRows = 6;
    const numColumns = 6;

    // Create the grid container
    const gridContainer = document.createElement("div");
    gridContainer.className = "grid-container";

    // Create rows and columns
    for (let row = 0; row < numRows; row++) {
        const gridRow = document.createElement("div");
        gridRow.className = "grid-row";

        for (let col = 0; col < numColumns; col++) {
            const gridColumn = document.createElement("div");
            gridColumn.className = "grid-column";

            // Add text content based on row and column position
            if (row === 0 && col < numColumns - 1) {
                gridColumn.textContent = `Main ${col + 1}`;
            } else if (row < numRows - 1 && col === numColumns - 1) {
                gridColumn.textContent = `Holder${row}`;
            }

            gridRow.appendChild(gridColumn);
        }

        gridContainer.appendChild(gridRow);
    }

    // Append the grid container to the table body
    tableBody.appendChild(gridContainer);

    // Append the table body to the table
    table.appendChild(tableBody);
}

function buildChampionpoolHeader(headerElement: string, playerArray: string[]): void {
    const header = document.querySelector(headerElement) as HTMLDivElement;
    const playerNames = ['', 'Top', 'Jungle', 'Mid', 'ADC', 'Support'];

    //TODO: Use the playerArray to build the header

    // Create the header

    header.innerHTML = playerNames.map(day => {
        const headerClass = "grid-header";
        return (
            `<div class="grid-item ${headerClass}">
        <div class="header-content-container">
          <p>${day}</p>
        </div>
      </div>`
        );
    }).join("");
}

function buildChampionpoolContainer(containerElement: string, playerArray: string[]): void {
    const container = document.querySelector(containerElement) as HTMLDivElement;
    const playerNames = ['Main X', 'Top', 'Jungle', 'Mid', 'ADC', 'Support'];
    for (let i = 0; i < 5; i++) {
        const headerClass = "row-container";
        const htmlContent = playerNames.map(day => {
            return `
        <div class="grid-item ${headerClass}">
          <div class="header-content-container">
            <p>${day}</p>
          </div>
        </div>
      `;
        }).join("");

        container.innerHTML += htmlContent;
    }
}



