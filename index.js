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
const matchAll = require("match-all");
const rest_1 = require("@octokit/rest");
async function extractJiraKeysFromCommit() {
    try {
        const regex = /((([A-Z]+)|([0-9]+))+-\d+)/g;
        const isPullRequest = core.getInput('is-pull-request') == 'true';
        const payload = github.context.payload;
        const token = process.env['GITHUB_TOKEN'];
        const octokit = new rest_1.Octokit({
            auth: token,
        });
        if (isPullRequest) {
            let resultArr = [];
            const owner = payload?.repository?.owner.login || '';
            const repo = payload?.repository?.name || '';
            const prNum = payload.number;
            console.log(owner, repo, prNum);
            const { data } = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/commits', {
                owner,
                repo,
                pull_number: prNum,
                per_page: 100
            });
            console.log(data.map((commit) => commit.commit.message));
            data.forEach((item) => {
                const commit = item.commit;
                const matches = matchAll(commit.message, regex).toArray();
                matches.forEach((match) => {
                    if (resultArr.find((element) => element == match)) {
                    }
                    else {
                        resultArr.push(match);
                    }
                });
            });
            const result = resultArr.join(',');
            core.setOutput("jira-keys", result);
        }
    }
    catch (error) {
        core.setFailed(error);
    }
}
(async function () {
    await extractJiraKeysFromCommit();
})();
exports.default = extractJiraKeysFromCommit;
