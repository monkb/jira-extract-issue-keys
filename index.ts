import * as core from '@actions/core';
import * as github from '@actions/github';
const matchAll = require("match-all");
import {Octokit} from "@octokit/rest";

async function extractJiraKeysFromCommit() {
    try {
        const regex = /((([A-Z]+)|([0-9]+))+-\d+)/g;
        const isPullRequest = core.getInput('is-pull-request') == 'true';
        const payload = github.context.payload;

        const token = process.env['GITHUB_TOKEN'];

        const octokit = new Octokit({
            auth: token,
        });

        if (isPullRequest) {
            let resultArr: any = [];

            const owner = payload?.repository?.owner.login || '';
            const repo = payload?.repository?.name || '';
            const prNum = payload.number;

            console.log(owner, repo, prNum);

            const {data} = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/commits', {
                owner ,
                repo,
                pull_number: prNum,
                per_page : 100
            })

            console.log(data.map((commit: any) => commit.commit.message));

            data.forEach((item: any) => {
                const commit = item.commit;
                const matches: any = matchAll(commit.message, regex).toArray();
                matches.forEach((match: any) => {
                    if (resultArr.find((element: any) => element == match)) {
                    } else {
                        resultArr.push(match);
                    }
                });

            });

            const result = resultArr.join(',');
            core.setOutput("jira-keys", result);
        }
    } catch (error : any) {
        core.setFailed(error);
    }
}

(async function () {
    await extractJiraKeysFromCommit();
})();

export default extractJiraKeysFromCommit
