/**
 * You can generate and display popups using this js file.
 *
 * You need a div with a corresponding id in your html file.
 *
 */
class Popup {

    /**
     * Constructor for the popup class
     * @param popupContainerID the id of the div in which the popup should be displayed
     */
    constructor(popupContainerID) {
        this.popupContainer = $('#' + popupContainerID);
        this.popupContainerID = popupContainerID;
        this.addCloseEvent();
    }

    /**
     * Setups a simple popup with an input field
     * @param imgSrc which image should be displayed
     * @param title the title of the popup
     * @param buttonText the text of the button
     * @param buttonID the id of the button
     * @param inputID the id of the input field
     */
    displayInputPopup(imgSrc, title, buttonText, buttonID, inputID) {
        this.popupContainer.empty();

        const newHTML = `<img src="${imgSrc}" class="popup-img"/>` +
            `<div class="popup-flexbox">` +
            `<h2>${title}</h2>` +
            `<input type="text" id="${inputID}" class="input-field"/>` +
            `<button type="button" id="${buttonID}" class="default green ok-btn">${buttonText}</button>` +
            `</div>`;
        this.popupContainer.append(newHTML);
    }

    /**
     * Setups a simple popup with a custom inner html
     * @param imgSrc which image should be displayed
     * @param title the title of the popup
     * @param buttonText the text of the button
     * @param buttonID the id of the button
     * @param inputHTML the html that should be displayed
     */
    displayInputPopupCustom(imgSrc, title, buttonText, buttonID, inputHTML) {
        this.popupContainer.empty();

        const newHTML = `<img src="${imgSrc}" class="popup-img"/>` +
            `<div class="popup-flexbox">` +
            `<h2>${title}</h2>` +
            inputHTML +
            `<button type="button" id="${buttonID}" class="default green ok-btn">${buttonText}</button>` +
            `</div>`;
        this.popupContainer.append(newHTML);
    }

    /**
     * Setups a simple popup with a dropdown
     * @param imgSrc which image should be displayed
     * @param title the title of the popup
     * @param buttonText the text of the button
     * @param buttonID the id of the button
     * @param dropdownID the id of the dropdown
     * @param dropdownOptions the options of the dropdown
     */
    displayDropdownPopup(imgSrc, title, buttonText, buttonID, dropdownID, dropdownOptions) {
        this.popupContainer.empty();

        const newHTML = `<img src="${imgSrc}" class="popup-img"/>` +
            `<div class="popup-flexbox">` +
            `<h2>${title}</h2>` +
            `<select id="${dropdownID}" class="input-field"/>` +
            `<button type="button" id="${buttonID}" class="default green ok-btn">${buttonText}</button>` +
            `</div>`;
        this.popupContainer.append(newHTML);

        const dropdown = $(`#${dropdownID}`);
        dropdownOptions.forEach(option => {
            dropdown.append(`<option value="${option.value}">${option.label}</option>`);
        });
    }

    /**
     * Setups a simple yes no popup
     * @param imgSrc the image that should be displayed
     * @param title the title of the popup
     * @param text the text of the popup
     * @param buttonText1 the text of the first button
     * @param buttonText2 the text of the second button
     * @param buttonID1 the id of the first button
     * @param buttonID2 the id of the second button
     */
    displayYesNoPopup(imgSrc, title, text, buttonText1, buttonText2, buttonID1, buttonID2) {
        this.popupContainer.empty();

        const newHTML = `<img src="${imgSrc}" class="popup-img"/>` +
            `<div class="popup-flexbox">` +
            `<h2 style="margin-bottom: 10px">${title}</h2>` +
            `<p>${text}</p>` +
            `<div class="button-container">` +
            `<button type="button" id="${buttonID1}" class="default green ok-btn">${buttonText1}</button>` +
            `<button type="button" id="${buttonID2}" class="default red ok-btn">${buttonText2}</button>` +
            `</div>` +
            `</div>`;
        this.popupContainer.append(newHTML);
    }

    /**
     * Closes the popup
     */
    close() {
        if (this.popupContainer.hasClass('open-popup')) {
            this.popupContainer.removeClass('open-popup');
        }
    }

    /**
     * Opens the popup
     * @param e the event that triggered the opening of the popup
     */
    open(e) {
        console.log(this.popupContainer)
        this.popupContainer.addClass('open-popup');
        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * Adds a close event to the popup when the user clicks outside the popup
     */
    addCloseEvent() {
        const self = this;
        $(document).click(function(event) {
            if (!$(event.target).closest("#" + self.popupContainerID).length && self.popupContainer.hasClass('open-popup') && !$(event.target).is('.input-field')) {
                self.close();
            }
        });
    }


}