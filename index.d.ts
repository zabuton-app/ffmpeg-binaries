/** Absolute path to the ffmpeg executable, or null on an unsupported platform.
 *  The file is missing when the install skipped the download. */
export const ffmpegPath: string | null;
/** Absolute path to the ffprobe executable, or null on an unsupported platform.
 *  The file is missing when the install skipped the download. */
export const ffprobePath: string | null;
/** The FFmpeg release the executables were built from. */
export const version: string;
