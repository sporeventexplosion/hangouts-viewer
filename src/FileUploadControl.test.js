import React from 'react';
import ReactDOM from 'react-dom';
import FileUploadControl, { bytesToSizeString, roundedTo } from './FileUploadControl';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<FileUploadControl />, div);
});

test('roundedTo rounds up at 0.5', () => {
  // Positive numbers
  expect(roundedTo(2.499, 1)).toBe('2');
  expect(roundedTo(2.5, 1)).toBe('3');
  expect(roundedTo(67254.99, 4)).toBe('6.725e+4');
  expect(roundedTo(67255, 4)).toBe('6.726e+4');

  expect(roundedTo(0.8854, 3)).toBe('0.885')
  expect(roundedTo(24.55, 3)).toBe('24.6')

  // Zero
  expect(roundedTo(0, 6)).toBe('0.00000');
  expect(roundedTo(-0, 6)).toBe('0.00000');

  // Negative numbers
  expect(roundedTo(-2.501, 1)).toBe('-3');
  expect(roundedTo(-2.5, 1)).toBe('-2');
  expect(roundedTo(-67255.01, 4)).toBe('-6.726e+4');
  expect(roundedTo(-67255, 4)).toBe('-6.725e+4');
})

test('bytesToSizeString behaves correctly below 1024 bytes', () => {
  expect(bytesToSizeString(0)).toBe('0 B');
  expect(bytesToSizeString(1)).toBe('1 B');
  expect(bytesToSizeString(10)).toBe('10 B');
  expect(bytesToSizeString(100)).toBe('100 B');
  expect(bytesToSizeString(1023)).toBe('1023 B');
});

test('bytesToSizeString returns correct scales', () => {
  expect(bytesToSizeString(1024)).toBe('1.00 KB');
  expect(bytesToSizeString(1024 ** 2)).toBe('1.00 MB');
  expect(bytesToSizeString(1024 ** 3)).toBe('1.00 GB');
  expect(bytesToSizeString(1024 ** 4)).toBe('1.00 TB');
  expect(bytesToSizeString(1024 ** 5)).toBe('1.00 PB');
  expect(bytesToSizeString(1024 ** 6)).toBe('1.00 EB');
  expect(bytesToSizeString(1024 ** 7)).toBe('1.00 ZB');
  expect(bytesToSizeString(1024 ** 8)).toBe('1.00 YB');
  expect(bytesToSizeString(1024 ** 9)).toBe('1024 YB');
  expect(bytesToSizeString(1024 ** 10)).toBe('1048576 YB');
});

test('bytesToSizeString rounds correctly', () => {
  expect(bytesToSizeString(10234)).toBe('9.99 KB');
  expect(bytesToSizeString(10235)).toBe('10.0 KB');
  expect(bytesToSizeString(102348)).toBe('99.9 KB');
  expect(bytesToSizeString(102349)).toBe('100 KB');
  expect(bytesToSizeString(1023487)).toBe('999 KB');
  expect(bytesToSizeString(1023488)).toBe('1000 KB');
  expect(bytesToSizeString(1048063)).toBe('1023 KB');
  expect(bytesToSizeString(1048064)).toBe('1.00 MB');
  expect(bytesToSizeString(1024 ** 9 - 1024 ** 8 / 2)).toBe('1024 YB');
});

test('bytesToSizeString rounds down the number of bytes', () => {
  expect(bytesToSizeString(0.1)).toBe('0 B');
});

test('bytesToSizeString throws for negative values or NaN', () => {
  expect(() => bytesToSizeString(-1)).toThrow(RangeError);
  expect(() => bytesToSizeString(-0.1)).toThrow(RangeError);
  expect(() => bytesToSizeString(NaN)).toThrow(RangeError);
})
