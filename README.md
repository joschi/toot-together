<p align="center">
  <img src="assets/logo.png" width="150" alt="Toot together logo" /></a>
</p>

<h1 align="center">Toot, together! 🐘</h1>

<p align="center">
  <a href="https://action-badges.now.sh" rel="nofollow"><img alt="Build Status" src="https://github.com/joschi/toot-together/workflows/Test/badge.svg"></a>
  <a href="https://github.com/joschi/toot-together/blob/80c8aab34382347120e22501c2e44f30a7a62174/package.json#L8" rel="nofollow"><img alt="Coverage" src="https://img.shields.io/badge/coverage-100%25-green.svg"></a>
</p>

For Open Source or event maintainers that share a project Mastodon account, `toot-together` is a GitHub Action that utilizes text files to publish toots from a GitHub repository. Rather than posting your toots directly, GitHub’s pull request review process encourages more collaboration, Mastodon activity and editorial contributions by enabling everyone to submit toot drafts to a project.

<p align="center">
  <img src="assets/demo.gif" alt="Screencast demonstrating toot-together" />
</p>

`toot-together` is based on the amazing work of the [`twitter-together`](https://github.com/gr2m/twitter-together) project. ❤️

<!-- toc -->

- [Try it](#try-it)
- [Setup](#setup)
- [Contribute](#contribute)
- [How it works](#how-it-works)
  - [The `push` event](#the-push-event)
  - [The `pull_request` event](#the-pull_request-event)
- [Motivation](#motivation)
- [License](#license)

<!-- tocstop -->

## Try it

You can submit a toot to this repository to see the magic happen. Please follow the instructions at [toots/README.md](toots/README.md) and mention your own Mastodon username in the toot. This repository has been set up to send toots via [https://social.tchncs.de/@commit2toot](https://social.tchncs.de/@commit2toot).

## Setup

1. [Create a Mastodon app](docs/01-create-mastodon-app.md) for your shared Mastodon account and store the credentials as `MASTODON_ACCESS_TOKEN` in your repository’s secrets settings.
2. [Create a `.github/workflows/toot-together.yml` file](docs/02-create-toot-together-workflow.md) with the content below. Make sure to replace `'master'` if you changed your repository's default branch.

   ```yml
   on: [push, pull_request]
   name: Toot, together!
   jobs:
     preview:
       name: Preview
       runs-on: ubuntu-latest
       if: github.event_name == 'pull_request'
       steps:
         - uses: joschi/toot-together@v1.x
           env:
             GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
     toot:
       name: Toot
       runs-on: ubuntu-latest
       if: github.event_name == 'push' && github.ref == 'refs/heads/master'
       steps:
         - name: checkout master
           uses: actions/checkout@v2
         - name: Toot
           uses: joschi/toot-together@v1.x
           with:
             visibility: "unlisted"
           env:
             GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
             # URL to the instance hosting your Mastodon account
             MASTODON_URL: https://www.mastodon.example/
             MASTODON_ACCESS_TOKEN: ${{ secrets.MASTODON_ACCESS_TOKEN }}
   ```

3. After creating or updating `.github/workflows/toot-together.yml` in your repository’s default branch, a pull request will be created with further instructions.

Happy collaborative tooting! 🐘

## Contribute

All contributions welcome!

Especially if you try `toot-together` for the first time, I’d love to hear if you ran into any trouble. I greatly appreciate any documentation improvements to make things more clear, I am not a native English speaker myself.

See [CONTRIBUTING.md](CONTRIBUTING.md) for more information on how to contribute. You can also [just say thanks](https://github.com/joschi/toot-together/issues/new?labels=feature&template=04_thanks.md) 😊

## Thanks to all contributors 💐

Thanks goes to these wonderful people ([emoji key](https://github.com/all-contributors/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table><tr><td align="center"><a href="https://jasonet.co"><img src="https://avatars1.githubusercontent.com/u/10660468?v=4" width="100px;" alt="Jason Etcovitch"/><br /><sub><b>Jason Etcovitch</b></sub></a><br /><a href="#design-JasonEtco" title="Design">🎨</a> <a href="https://github.com/joschi/toot-together/commits?author=JasonEtco" title="Documentation">📖</a> <a href="https://github.com/joschi/toot-together/commits?author=JasonEtco" title="Code">💻</a></td><td align="center"><a href="http://erons.me"><img src="https://avatars0.githubusercontent.com/u/37238033?v=4" width="100px;" alt="Erons"/><br /><sub><b>Erons</b></sub></a><br /><a href="https://github.com/joschi/toot-together/commits?author=Eronmmer" title="Documentation">📖</a></td></tr></table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## How it works

`toot-together` is using two workflows

1. `push` event to publish new toots
2. `pull_request` event to validate and preview new toots

### The `push` event

When triggered by the `push` event, the script looks for added `*.toot` files in the `toots/` folder or subfolders. If there are any, a toot for each added `*.toot` file is published.

If there is no `toots/` subfolder, the script opens a pull request creating the folder with further instructions.

### The `pull_request` event

For the `pull_request` event, the script handles only `opened` and `synchronize` actions. It looks for new `*.toot` files in the `toots/` folder or subfolders. If there are any, the length of each toot is validated. If one is too long, a failed check run with an explanation is created. If all toots are valid, a check run with a preview of all toots is created.

## Motivation

I think we can make Open Source more inclusive to people with more diverse interests by making it easier to contribute other things than code and documentation. I see a particularly big opportunity to be more welcoming towards editorial contributions by creating tools using GitHub’s Actions, Apps and custom user interfaces backed by GitHub’s REST & GraphQL APIs.

I’ve plenty more ideas that I’d like to build out. Please ping me on Mastodon if you’d like to chat: [@joschi@mastodon.social](https://mastodon.social/@joschi).

## License

[MIT](LICENSE)
