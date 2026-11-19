"use strict";

const { ffmpeg, files } = require("./binaries.json");
const { target, binaryPath } = require("./paths.js");

const supported = Object.hasOwn(files, target);

/** Absolute path to the ffmpeg executable, or null on an unsupported platform.
 *  The file is missing when the install skipped the download. */
exports.ffmpegPath = supported ? binaryPath("ffmpeg") : null;
/** Absolute path to the ffprobe executable, or null on an unsupported platform.
 *  The file is missing when the install skipped the download. */
exports.ffprobePath = supported ? binaryPath("ffprobe") : null;
/** The FFmpeg release the executables were built from. */
exports.version = ffmpeg;
