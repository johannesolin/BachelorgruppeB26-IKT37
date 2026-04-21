import type { Config } from 'jest';
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Oppgir banen til Next.js-appen  for å laste inn next.config.js og .env-filer i testmiljøet.
  dir: "./",
});

// Legg til eventuelle tilpassede Jest-konfigurasjoner her.
const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],  
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

// Legg til eventuelle tilpassede Jest-konfigurasjoner her, og bruk createJestConfig for å lage den endelige konfigurasjonen.
export default createJestConfig(config);
