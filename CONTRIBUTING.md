# Contributing

First off, thank you for considering contributing to Suitest JS API.

When contributing to this repository, please first discuss the change you wish to make via GitHub issue
with the owners of the repository.

Please note we have a [code of conduct][]. Follow it in all your interactions with the project.

## 1. How do I start contributing?

If you've noticed a bug, have a question or a suggestion, [search the issue tracker][] to see
if someone has already create a ticket. If not, go ahead and [make one][new issue].

## 2. Fork & create a branch

If this is something you think you can fix, then [fork Suitest JS API][] and
create a branch with a descriptive name.

We use `hotfix/[issue-id]-[issue-title]` convention for small changes. For example:

```sh
hotfix/123-fix-assertion-error-wording
``` 

## 3. Work on the issue

Check out your fork, switch to the newly created branch and start fixing the issue.

Here are the steps to get you started:

* Make sure you have [NodeJS][] of v10 or higher installed.
* Open your CLI in project's dir and run `npm i`.
* Run `npm run test-watch` to enable TDD.
* Make sure to run `npm run lint` before making commit.

> **Heads up!** In order to make unit tests pass, you should remove (or temporary rename)
> all `.suitestrc` files starting from project's dir and up the folder structure, as
> well as in your home folder. We will updated our unit tests to account for that,
> but for now you'll have to use this workaround.

## 4. Prepare the pull request

After you're done coding, commit and push your changes to your fork. In GitHub, [create a pull request][]
to our repository's `master` branch.

There are some automated checks set-up for all pull requests, as well as a code review process.
The following conditions must be met before any pull request can be merged to Suitest JS API:
* There are no merge conflicts in the pull request.
* Build on CircleCI passes. We run eslint, unit tests and check test coverage (must be >95%) there.
* All CodeClimate checks pass. CodeClimate checks how test coverage and code maintainability
  of the project would change if we would merge the pull requests. Both test coverage and
  code maintainability must not decrease after pull request merge.
* At least 2 members of Suitest Core team approved the pull request.

[code of conduct]: https://github.com/SuitestAutomation/suitest-js-api/blob/master/CODE_OF_CONDUCT.md
[search the issue tracker]: https://github.com/SuitestAutomation/suitest-js-api/issues?q=something
[new issue]: https://github.com/SuitestAutomation/suitest-js-api/new
[fork Suitest JS API]: https://help.github.com/articles/fork-a-repo
[NodeJS]: https://nodejs.org/
[create a pull request]: https://help.github.com/articles/creating-a-pull-request
