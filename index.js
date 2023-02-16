"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const rest_1 = require("@octokit/rest");
const _ = __importStar(require("lodash"));
async function getAllCommits(octokit, { owner, repo, pr }, page) {
    const list = await octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}/commits", {
        owner,
        repo,
        pull_number: pr,
        page,
        per_page: 100,
    });
    if (list.data.length === 0)
        return [];
    return [
        ...list.data,
        ...(await getAllCommits(octokit, { owner, repo, pr }, page + 1)),
    ];
}
async function extractJiraKeysFromCommit() {
    try {
        const regex = /((([A-Za-z]+)|([0-9]+))+-\d+)/g;
        const isPullRequest = core.getInput("is-pull-request") === "true";
        const { payload } = github.context;
        const token = process.env.GITHUB_TOKEN;
        const octokit = new rest_1.Octokit({
            auth: token,
        });
        if (isPullRequest) {
            const owner = payload?.repository?.owner.login || "";
            const repo = payload?.repository?.name || "";
            const prNum = payload.number;
            const commits = await getAllCommits(octokit, { owner, repo, pr: prNum }, 1);
            const result = _.uniq(commits
                .map(({ commit }) => {
                return (commit.message.match(regex) || []).filter((match) => match);
            })
                .flat()).join(",");
            core.setOutput("jira-keys", result);
        }
    }
    catch (error) {
        core.setFailed(error);
    }
}
(async function run() {
    await extractJiraKeysFromCommit();
})();
exports.default = extractJiraKeysFromCommit;
