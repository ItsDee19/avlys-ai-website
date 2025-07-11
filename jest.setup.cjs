require('whatwg-fetch');
require('@testing-library/jest-dom');

// Fix for TextEncoder/TextDecoder not being available in test environment
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder; 