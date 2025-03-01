import * as core from "@actions/core";
import * as github from "@actions/github";
import { Octokit } from "@octokit/rest";
import * as _ from "lodash";

type CommitResponse = {
  commit: {
    message: string;
  };
};

async function getAllCommits(
  octokit: Octokit,
  { owner, repo, pr }: { owner: string; repo: string; pr: number },
  page: number
): Promise<CommitResponse[]> {
  const list = await octokit
    .request("GET /repos/{owner}/{repo}/pulls/{pull_number}/commits", {
      owner,
      repo,
      pull_number: pr,
      page,
      per_page: 100,
    })
    .catch(() => {
      return { data: [] };
    });

  if (list.data.length === 0) return [];

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

    // const octokit = new Octokit({
    //   auth: token,
    // });

    if (isPullRequest) {
      const owner = payload?.repository?.owner.login || "";
      const repo = payload?.repository?.name || "";
      const prNum = payload.number;

      core.setOutput("jira-aa", `${owner} ${repo} ${prNum}`);

      core.debug(`${owner} ${repo} ${prNum}`);

      // const commits = await getAllCommits(
      //   octokit,
      //   { owner, repo, pr: prNum },
      //   1
      // );

      // const result = _.uniq(
      //   commits
      //     .map(({ commit }) => {
      //       return (commit.message.match(regex) || []).filter((match) => match);
      //     })
      //     .flat()
      // ).join(",");
      const result = "";

      core.setOutput(
        "jira-keys",
        result === "" ? `${owner} ${repo} ${prNum}` : result
      );
    }
  } catch (error: any) {
    core.debug(error.message);
    core.setFailed(error);
  }
}

(async function run() {
  core.setCommandEcho(true);
  core.debug("hello world");
  await extractJiraKeysFromCommit();
})();

export default extractJiraKeysFromCommit;
