
const request = require('supertest');

const { formatDate,
    getMondayOfWeek,
    getDataFromDay,
    getSundayOfCurrentWeek,
    getDateFromDay,
    getXDayOfWeek,
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

  describe('getDataFromDay()', () => {
    it('should return correct innerHTML for a day with state 0', () => {
      const date = '2023-05-12';
      const username = 'UserA';
      const teamData = [
        {date: 1683842400, username: 'UserA', state: 0, from: '09:00', until: '12:00'}
      ];
      const expectedHTML =
          '<i class="ri-check-fill icon icon-green"></i>' +
          '<p class="info-text">09:00 - 12:00</p>';

      const innerHTML = getDataFromDay(date, username, teamData);
      expect(innerHTML).toBe(expectedHTML);
    });

    it('should return correct innerHTML for a day with state 1', () => {
      const date = '2023-05-12';
      const username = 'UserA';
      const teamData = [
        {date: 1683842400, username: 'UserA', state: 1}
      ];
      const expectedHTML =
          '<i class="ri-check-fill icon icon-green"></i>' +
          '<p class="info-text">Open</p>';

      const innerHTML = getDataFromDay(date, username, teamData);
      expect(innerHTML).toBe(expectedHTML);
    });

    it('should return correct innerHTML for a day with state 2', () => {
      const date = '2023-05-12';
      const username = 'UserA';
      const teamData = [
        {date: 1683842400, username: 'UserA', state: 2}
      ];
      const expectedHTML =
          '<i class="ri-close-line icon icon-red"></i>' +
          '<p class="info-text">Absent</p>';

      const innerHTML = getDataFromDay(date, username, teamData);
      expect(innerHTML).toBe(expectedHTML);
    });

    it('should return correct innerHTML for a day with state 3 and comment', () => {
      const date = '2023-05-12';
      const username = 'UserA';
      const teamData = [
        {date: 1683842400, username: 'UserA', state: 3, comment: 'Working remotely'}
      ];
      const expectedHTML =
          '<i class="ri-question-mark icon icon-orange"></i>' +
          '<p class="info-text">Comment: Working remotely</p>';

      const innerHTML = getDataFromDay(date, username, teamData);
      expect(innerHTML).toBe(expectedHTML);
    });

    it('should return correct innerHTML for a day with state 3 and no comment', () => {
      const date = '2023-05-12';
      const username = 'UserA';
      const teamData = [
        {date: 1683842400, username: 'UserA', state: 3}
      ];
      const expectedHTML =
          '<i class="ri-question-mark icon icon-orange"></i>' +
          '<p class="info-text">Unsure</p>';

      const innerHTML = getDataFromDay(date, username, teamData);
      expect(innerHTML).toBe(expectedHTML);
    });
  });
});

describe('formatDate()', () => {
  it('should format a date object correctly', () => {
    const date = new Date('2023-05-12');
    const formattedDate = formatDate(date);
    expect(formattedDate).toBe('12.05.2023');
  });

  it('should handle single-digit day and month correctly', () => {
    const date = new Date('2023-02-03');
    const formattedDate = formatDate(date);
    expect(formattedDate).toBe('03.02.2023');
  });

  it('should format a date object from a leap year correctly', () => {
    const date = new Date('2024-02-29');
    const formattedDate = formatDate(date);
    expect(formattedDate).toBe('29.02.2024');
  });
});

describe('getSundayOfCurrentWeek()', () => {
  it('should return the correct Sunday of the week for the given date', () => {
    const sundayDate = getSundayOfCurrentWeek('2023-05-12');
    expect(sundayDate.toISOString().slice(0, 10)).toBe('2023-05-14');
  });

  it('should return the correct Sunday when the given date is already a Sunday', () => {
    const sundayDate = getSundayOfCurrentWeek('2023-05-14');
    expect(sundayDate.toISOString().slice(0, 10)).toBe('2023-05-14');
  });

  it('should return the correct Sunday when the given date is a Monday', () => {
    const sundayDate = getSundayOfCurrentWeek('2023-05-15');
    expect(sundayDate.toISOString().slice(0, 10)).toBe('2023-05-21');
  });
});

describe('getXDayOfWeek()', () => {
  it('should return the correct date for the given day offset in the week of the given date', () => {
    const date = getXDayOfWeek('2023-05-12', 2); // Friday (offset of 2 from Monday)
    expect(date.toISOString().slice(0, 10)).toBe('2023-05-10');
  });

  it('should return the correct date when the given offset is 0 (Monday)', () => {
    const date = getXDayOfWeek('2023-05-12', 0); // Monday
    expect(date.toISOString().slice(0, 10)).toBe('2023-05-08');
  });

  it('should return the correct date when the given offset is negative (Wednesday)', () => {
    const date = getXDayOfWeek('2023-05-12', -2); // Wednesday
    expect(date.toISOString().slice(0, 10)).toBe('2023-05-06');
  });

});

describe('getDateFromDay()', () => {
  it('should return the correct date for Monday in the current week', () => {
    const date = getDateFromDay('2023-05-12', 'Monday');
    expect(date).toBe('08.05.2023');
  });

  it('should return the correct date for Wednesday in the current week', () => {
    const date = getDateFromDay('2023-05-12', 'Wednesday');
    expect(date).toBe('10.05.2023');
  });

  it('should return an empty string when the dayOfWeek parameter is empty', () => {
    const date = getDateFromDay('2023-05-12', '');
    expect(date).toBe('');
  });

});