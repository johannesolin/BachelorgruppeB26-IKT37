import "@testing-library/jest-dom";

// kode for å undertrykke console.error ved testing for rydigere output fra testing, da console.error kun brukes til logging og ikke feil håndtering.
jest.spyOn(console, 'error').mockImplementation(() => {});
