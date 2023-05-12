
const request = require('supertest');

const { formatDate,
    getMondayOfWeek,
    editDay,
    getUsers,
    saveDay,
    buildNextTrainingTable,
} = require('../js/clientJS/teamCalendar.js');


describe('Calendar Functions', () => {
  describe('formatDate()', () => {
    it('should return the formatted date', () => {
      const formattedDate = formatDate(new Date('2023-05-12'));
      expect(formattedDate).toBe('12.05.2023');
    });
  });

  describe('getMondayOfWeek()', () => {
    it('should return the Monday of the week', () => {
      mondayOfWeek = getMondayOfWeek('2023-05-12');
      // convert mondayOfWeek to UTC string to compare
      mondayOfWeek = new Date(mondayOfWeek).toUTCString();
      expect(mondayOfWeek).toBe(new Date('2023-05-08').toUTCString());
    });
  });

  // Add more test cases for the remaining functions

});
