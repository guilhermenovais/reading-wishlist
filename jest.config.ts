import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/tests/unit"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        diagnostics: {
          ignoreDiagnostics: [5011],
        },
      },
    ],
  },
};

export default config;
