/// <reference types="node" />
/**
 * Manages audio playback in the application.
 */
export class AudioManager {
    ipc: IPC;
    /**
     * Loads an audio file.
     * @param {string} path - The path to the audio file.
     * @param {string} name - The name of the audio file.
     * @returns {Promise<void>} - A Promise that resolves when the audio file is loaded.
     */
    _loadAudio(path: string, name: string): Promise<void>;
    /**
     * Plays an audio track.
     * @param {string} name - The name of the audio track to play.
     * @param {number} volume - The volume of the audio track (1-100).
     * @param {boolean} loop - Whether to loop the audio track.
     * @param {number} rate - The playback rate of the audio track.
     * @returns {Promise<number>} - A Promise that resolves with the ID of the playing track.
     */
    play(name: string, volume: number, loop: boolean, rate: number): Promise<number>;
    /**
     * Pauses a playing audio track.
     * @param {number} id - The ID of the track to pause.
     * @returns {Promise<void>} - A Promise that resolves when the track is paused.
     */
    pause(id: number): Promise<void>;
    /**
     * Resumes a paused audio track.
     * @param {number} id - The ID of the track to resume.
     * @returns {Promise<void>} - A Promise that resolves when the track is resumed.
     */
    resume(id: number): Promise<void>;
    /**
     * Stops a playing audio track.
     * @param {number} id - The ID of the track to stop.
     * @returns {Promise<void>} - A Promise that resolves when the track is stopped.
     */
    stop(id: number): Promise<void>;
}
declare class IPC {
    messages: {};
    worker: Worker;
    send(type: any, params: any): Promise<any>;
}
import { Worker } from "node:worker_threads";
export {};
