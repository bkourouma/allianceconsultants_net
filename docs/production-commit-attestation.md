# Production commit attestation

GitHub Actions passes its full `GITHUB_SHA` as the Docker build argument `APP_COMMIT_SHA`.
The production image build rejects a missing or malformed SHA (40 lowercase hex characters).
Next.js writes `x-commit-sha` into its compiled routing configuration before the standalone artifact
is copied to the runner. A runtime environment value cannot relabel an already built artifact.
The final image also carries `org.opencontainers.image.revision`.

The deploy workflow pulls the SHA-tagged image and tags that exact local image as `latest`,
which the existing compose configuration already selects. Deployments are serialized within this repository.
The final verification checks the running image ID, its OCI revision, and exact HTTP `x-commit-sha`
values on local and public `/`. Missing, duplicate or different headers fail the run.
Requests use GET, a cache-busting query and bounded retries, without following redirects.
Existing site identity checks and security headers remain in place. Nginx needs no synthetic header.

For a manual image build, explicitly pass `--build-arg APP_COMMIT_SHA=<full source commit>`.
An older image that predates attestation will not pass the new check. A rollback should select its
own SHA-tagged image and verify that SHA; changing a runtime variable is insufficient.
Local development without a valid SHA does not emit this header.
