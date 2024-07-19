import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Setup Axios Mock Adapter
const mock = new MockAdapter(axios);

// Mock the endpoints
mock.onGet('https://front-end-kata.brighthr.workers.dev/api/absences').reply(200, [
  { id: 1, startDate: '2021-08-01', endDate: '2021-08-10', employee: { id: 1, firstName: 'John', lastName: 'Doe' }, approved: true, absenceType: 'Holiday' },
  { id: 2, startDate: '2021-09-15', endDate: '2021-09-20', employee: { id: 2, firstName: 'Jane', lastName: 'Smith' }, approved: false, absenceType: 'Sick' }
]);

mock.onGet('https://front-end-kata.brighthr.workers.dev/api/conflict/1').reply(200, { conflict: true });
mock.onGet('https://front-end-kata.brighthr.workers.dev/api/conflict/2').reply(200, { conflict: false });
