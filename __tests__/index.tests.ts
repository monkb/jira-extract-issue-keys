import * as github from "@actions/github";
import * as core from "@actions/core";
import { WebhookPayload } from "@actions/github/lib/interfaces";
import nock from "nock";
import extractJiraKeysFromCommit from "../index";

beforeEach(() => {
  jest.resetModules();
  process.env.GITHUB_TOKEN = "";
  github.context.payload = {
    repository: {
      owner: {
        login: "",
      },
      name: "",
    },
    number: 1,
    commits: [],
  } as WebhookPayload;
});

afterAll(() => {
  expect(nock.pendingMocks()).toEqual([]);
  nock.isDone();
  nock.cleanAll();
});

describe("debug action debug messages", () => {
  it("isPullRequest is true", async () => {
    const tokenNumber = jest
      .spyOn(core, "getInput")
      .mockImplementation((name: string): string => {
        if (name === "is-pull-request") return "true";
        return "";
      });

    await extractJiraKeysFromCommit();

    expect(tokenNumber.mock.results.length === 4);
    expect(tokenNumber.mock.results[0].value).toMatch("true");
  });
});
