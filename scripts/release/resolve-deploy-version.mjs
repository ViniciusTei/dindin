import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

function readPackageVersion() {
  const packageJson = JSON.parse(
    readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
  );

  if (
    !packageJson ||
    typeof packageJson !== "object" ||
    typeof packageJson.version !== "string" ||
    packageJson.version.trim() === ""
  ) {
    throw new Error('Could not resolve package.json version.');
  }

  return packageJson.version.trim();
}

function readGitCommitSha() {
  return execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: new URL("../..", import.meta.url),
    encoding: "utf8",
  }).trim();
}

function resolveCommitSha(explicitSha) {
  const candidates = [
    explicitSha,
    process.env.GITHUB_SHA,
    process.env.GITEA_SHA,
    process.env.CI_COMMIT_SHA,
    readGitCommitSha(),
  ];

  const sha = candidates.find(
    (candidate) => typeof candidate === "string" && candidate.trim() !== "",
  );

  if (!sha) {
    throw new Error("Could not resolve the deploy commit SHA.");
  }

  const normalizedSha = sha.trim();

  if (!/^[0-9a-f]{7,40}$/i.test(normalizedSha)) {
    throw new Error(`Invalid commit SHA "${normalizedSha}".`);
  }

  return normalizedSha.toLowerCase();
}

export function resolveDeployMetadata(explicitSha) {
  const packageVersion = readPackageVersion();
  const commitSha = resolveCommitSha(explicitSha);
  const shortSha = commitSha.slice(0, 7);

  return {
    commitSha,
    version: `${packageVersion}+${shortSha}`,
  };
}

function resolveOutputField(argv) {
  return argv.find((argument) => argument === "--sha" || argument === "--version");
}

const isMainModule =
  typeof process.argv[1] === "string" &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  try {
    const outputField = resolveOutputField(process.argv.slice(2));
    const explicitSha = process.argv
      .slice(2)
      .find((argument) => !argument.startsWith("--"));
    const deployMetadata = resolveDeployMetadata(explicitSha);

    if (outputField === "--sha") {
      process.stdout.write(`${deployMetadata.commitSha}\n`);
    } else {
      process.stdout.write(`${deployMetadata.version}\n`);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown deploy metadata error.";

    process.stderr.write(`${message}\n`);
    process.exit(1);
  }
}
