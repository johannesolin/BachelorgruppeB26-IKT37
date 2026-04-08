import nextJest from "next/jest";

const createJestConfig = nextJest({
  // Oppgir banen til Next.js-appen  for å laste inn next.config.js og .env-filer i testmiljøet.
  dir: "./",
});

// Legg til eventuelle tilpassede Jest-konfigurasjoner her.
const config = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
};

// Legg til eventuelle tilpassede Jest-konfigurasjoner her, og bruk createJestConfig for å lage den endelige konfigurasjonen.
export default createJestConfig(config);
