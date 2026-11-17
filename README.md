# ffmpeg-binaries

ffmpeg and ffprobe executables for the [zabuton](https://github.com/zabuton-app) apps, mirrored from upstream builds.

The apps bundle ffmpeg and ffprobe. This repository keeps a copy of the upstream executables in its GitHub releases, so that an install does not depend on an upstream download staying available, and records where each one came from. Nothing is compiled here.

## Use

Each [release](https://github.com/zabuton-app/ffmpeg-binaries/releases) carries the package as a tarball, `zabuton-app-ffmpeg-binaries-<version>.tgz`. Add its URL as a dependency:

```json
{
  "dependencies": {
    "@zabuton-app/ffmpeg-binaries": "https://github.com/zabuton-app/ffmpeg-binaries/releases/download/v<version>/zabuton-app-ffmpeg-binaries-<version>.tgz"
  }
}
```

npm records the tarball's integrity in the lockfile. npm 12 needs two more settings in the app, because it refuses URL dependencies and install scripts by default:

- `allow-remote=root` in the app's `.npmrc`.
- The same URL as a key in `allowScripts` in the app's `package.json`, set to `true`.

A `github:` dependency is not used because npm 12 refuses git dependencies as well.

```js
import { ffmpegPath, ffprobePath } from "@zabuton-app/ffmpeg-binaries";
```

The install script downloads the two executables for one platform from the release that matches the package version, checks each against the SHA-256 in [binaries.json](binaries.json), and writes them to `bin/`. It needs Node.js 22 or later and no other tool. The install fails when a download or a checksum fails.

The platform is `npm_config_platform` and `npm_config_arch` when they are set, and the running platform otherwise. On a platform that has no binaries, the install prints a warning and both paths are `null`.

## Platforms and sources

| Platform | Source | Minimum system |
| --- | --- | --- |
| `darwin-arm64`, `darwin-x64` | [ffmpeg.martin-riedl.de](https://ffmpeg.martin-riedl.de/) | macOS 12 |
| `linux-x64`, `linux-arm64` | [BtbN/FFmpeg-Builds](https://github.com/BtbN/FFmpeg-Builds), `gpl` variant of the release branch | glibc 2.28 |
| `win32-x64` | [GyanD/codexffmpeg](https://github.com/GyanD/codexffmpeg), essentials build | not checked |

[sources.json](sources.json) lists the exact archive URL and its SHA-256 for every executable. The current FFmpeg version is in the `ffmpeg` field of that file. BtbN builds the tip of the release branch, so the Linux executables can be a few fixes past that version; the archive name says which commit (for example `n9.0.2-39-g7adfbe40dc`).

Only builds without nonfree parts can be mirrored: `ffmpeg -L` on a nonfree build says it is not legally redistributable. `npm run mirror` refuses one.

## Update the binaries

1. Edit `sources.json`: the `ffmpeg` version, and the `url`, `sha256` and `member` of every entry. Take each SHA-256 from the checksum the upstream publishes, not from your own download. For BtbN, use a dated `autobuild-*` release rather than `latest`; the last build of each month is kept for two years.
2. Run `npm run mirror`. It needs `7z` and `tar` on `PATH`. It downloads the archives, checks them, and rewrites `binaries.json`.
3. Raise `version` in `package.json`, commit, and push the tag `v<version>`.

The [release workflow](.github/workflows/release.yml) then builds the assets again from `sources.json` and publishes them. It stops without publishing when its result differs from the committed `binaries.json`.

In each app, change the URL in both `dependencies` and `allowScripts` to the new release and run `npm install` to update the lockfile.

## License

The scripts in this repository are released under the [MIT License](LICENSE).

The executables in the releases are GPL builds of FFmpeg and are licensed under the [GNU General Public License, version 3](https://www.gnu.org/licenses/gpl-3.0.html) or later. They are redistributed unmodified. The corresponding source is the [FFmpeg source](https://ffmpeg.org/download.html) of the version named in `sources.json` (for Linux, the FFmpeg commit named in the archive), together with the libraries each upstream build lists on the pages linked above.
